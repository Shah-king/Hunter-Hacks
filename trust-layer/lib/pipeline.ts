// ============================================================
// Pipeline Orchestrator — Runs Stage 0 → 4
// ============================================================

import { openai } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import { calculateRuleScore } from "@/lib/rules";
import { sendFraudAlert } from "@/lib/email-sender";
import type { PipelineResult, LanguageDetectionResult, AIScoreResult } from "@/lib/types";

// --- Stage 0: Language Detection + Translation ---
async function detectLanguage(text: string): Promise<LanguageDetectionResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Detect the language of the following text.
If it is not English, translate it to English.
Return JSON: {
  "detected_language": "language code (e.g. es, zh, bn, en)",
  "language_name": "human readable (e.g. Spanish, Chinese)",
  "is_english": true/false,
  "english_text": "translated or original text"
}`,
      },
      { role: "user", content: text },
    ],
  });

  return JSON.parse(response.choices[0]?.message?.content ?? "{}");
}

// --- Stage 2: AI Fraud Scoring ---
async function scoreFraud(englishText: string): Promise<AIScoreResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a fraud detection system. Analyze the following email and score it for fraud/scam likelihood.

Scoring rubric:
- Urgency/pressure tactics: +20
- Payment via unusual methods (gift cards, crypto, wire): +30
- Authority impersonation (IRS, SSA, police): +25
- Threats (arrest, deportation, lawsuit): +20
- Suspicious links or spoofed domains: +20
- Too-good-to-be-true offers: +15
- Generic/impersonal greeting: +10

Return JSON: {
  "fraud_score": <number 0-100>,
  "scam_type": "phishing|impersonation|job_scam|investment|romance|government|other|none",
  "red_flags": ["specific phrases or patterns found"],
  "reasoning": "one sentence why"
}`,
      },
      { role: "user", content: englishText },
    ],
  });

  return JSON.parse(response.choices[0]?.message?.content ?? "{}");
}

// --- Stage 3: Score Aggregation ---
function aggregateScores(ruleScore: number, aiScore: number): { finalScore: number; riskLevel: "scam" | "suspicious" | "safe" } {
  // Override: if either score is very high, it's fraud
  if (ruleScore > 85 || aiScore > 85) {
    return { finalScore: Math.max(ruleScore, aiScore), riskLevel: "scam" };
  }

  const finalScore = Math.round(0.3 * ruleScore + 0.7 * aiScore);

  let riskLevel: "scam" | "suspicious" | "safe";
  if (finalScore > 70) riskLevel = "scam";
  else if (finalScore > 40) riskLevel = "suspicious";
  else riskLevel = "safe";

  return { finalScore, riskLevel };
}

// --- Stage 4: Generate Warning ---
async function generateWarning(
  originalText: string,
  detectedLanguage: string,
  redFlags: string[],
  fraudScore: number,
  reasoning: string
): Promise<{ explanation: string; actions: string[] }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a fraud protection assistant. Generate a clear, helpful
warning about a detected scam. Write entirely in ${detectedLanguage}.
Include: what the scam is, why it's dangerous, and 3 specific action steps.
Keep it concise and non-alarming — helpful, not scary.

Return JSON: {
  "explanation": "2-3 sentence explanation in ${detectedLanguage}",
  "actions": ["action 1", "action 2", "action 3"]
}`,
      },
      {
        role: "user",
        content: JSON.stringify({ original_email: originalText, red_flags: redFlags, fraud_score: fraudScore, reasoning }),
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0]?.message?.content ?? "{}");
}

// --- Full Pipeline ---
export async function runPipeline(params: {
  userId: string;
  userEmail: string;
  from: string;
  subject: string;
  body: string;
}): Promise<PipelineResult> {
  const { userId, userEmail, from, subject, body } = params;

  // Stage 0: Language detection + translation
  const lang = await detectLanguage(body);

  // Stage 1: Rule-based scoring (on english text)
  const rules = calculateRuleScore(lang.english_text);

  // Stage 2: AI fraud scoring (on english text)
  const ai = await scoreFraud(lang.english_text);

  // Stage 3: Aggregate + threshold
  const { finalScore, riskLevel } = aggregateScores(rules.rule_score, ai.fraud_score);

  // Stage 4: Generate warning + send alert (only if fraud)
  let explanation: string | null = null;
  let actions: string[] | null = null;
  let alertSent = false;

  if (riskLevel === "scam") {
    const warning = await generateWarning(
      body,
      lang.language_name,
      ai.red_flags,
      ai.fraud_score,
      ai.reasoning
    );
    explanation = warning.explanation;
    actions = warning.actions;

    // Send alert email
    try {
      await sendFraudAlert({
        to: userEmail,
        subject: `⚠️ TrustLayer: Scam Detected — "${subject}"`,
        explanation: warning.explanation,
        actions: warning.actions,
        originalSubject: subject,
        originalSender: from,
      });
      alertSent = true;
    } catch (err) {
      console.error("Failed to send alert email:", err);
    }
  }

  // Save to database
  const emailInsert = await supabase
    .from("processed_emails")
    .insert({
      user_id: userId,
      sender: from,
      subject,
      body,
      detected_language: lang.detected_language,
      english_text: lang.english_text,
    })
    .select("id")
    .single();

  if (emailInsert.data) {
    await supabase.from("analysis_results").insert({
      email_id: emailInsert.data.id,
      rule_score: rules.rule_score,
      ai_score: ai.fraud_score,
      final_score: finalScore,
      risk_level: riskLevel,
      scam_type: ai.scam_type,
      red_flags: ai.red_flags,
      explanation,
      actions,
      alert_sent: alertSent,
    });
  }

  return {
    detected_language: lang.detected_language,
    language_name: lang.language_name,
    is_english: lang.is_english,
    english_text: lang.english_text,
    original_text: body,
    rule_score: rules.rule_score,
    matched_keywords: rules.matched_keywords,
    ai_score: ai.fraud_score,
    scam_type: ai.scam_type,
    red_flags: ai.red_flags,
    reasoning: ai.reasoning,
    final_score: finalScore,
    risk_level: riskLevel,
    explanation,
    actions,
    alert_sent: alertSent,
  };
}
