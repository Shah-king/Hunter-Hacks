import { randomUUID } from "crypto"
import { detectLanguageAndTranslate, scoreFraudWithAI, generateWarningEmail } from "@/lib/openai"
import { calculateRuleScore } from "@/lib/rules"
import { sendFraudAlert } from "@/lib/email-sender"
import { redactPII } from "@/lib/security"
import { store } from "@/lib/store"
import type { User, ProcessedEmail, AnalysisResult, RiskLevel } from "@/lib/types"

function aggregateScores(ruleScore: number, aiScore: number): { finalScore: number; riskLevel: RiskLevel } {
  // Override: if either score is very high, flag immediately
  if (ruleScore > 85 || aiScore > 85) {
    return { finalScore: Math.max(ruleScore, aiScore), riskLevel: "scam" }
  }
  const finalScore = Math.round(0.3 * ruleScore + 0.7 * aiScore)
  const riskLevel: RiskLevel = finalScore > 70 ? "scam" : finalScore > 40 ? "suspicious" : "safe"
  return { finalScore, riskLevel }
}

export async function runPipeline(params: {
  user: User
  sender: string
  subject: string
  body: string
}): Promise<{ email: ProcessedEmail; analysis: AnalysisResult }> {
  const { user, sender, subject, body: rawBody } = params

  // SECURITY: Redact PII (SSNs, Credit Cards) before sending to OpenAI or saving to DB
  const body = redactPII(rawBody)

  // Stage 0: Language detection + translation
  const lang = await detectLanguageAndTranslate(body)

  // Save the processed email
  const email: ProcessedEmail = {
    id: randomUUID(),
    user_id: user.id,
    sender,
    subject,
    body,
    detected_language: lang.detected_language,
    language_name: lang.language_name,
    english_text: lang.english_text,
    received_at: new Date().toISOString(),
  }
  store.saveEmail(email)

  // Stage 1: Rule-based scoring on english_text
  const { score: ruleScore, hits: ruleHits } = calculateRuleScore(lang.english_text)

  // Stage 2: AI fraud scoring
  const aiResult = await scoreFraudWithAI(lang.english_text)

  // Stage 3: Aggregate scores
  const { finalScore, riskLevel } = aggregateScores(ruleScore, aiResult.fraud_score)

  // Stage 4: Generate and send warning (only if scam or suspicious)
  let alertSent = false
  let explanation = aiResult.reasoning
  let actions: string[] = []

  if (riskLevel !== "safe") {
    const warning = await generateWarningEmail(
      body,
      aiResult.red_flags,
      finalScore,
      aiResult.reasoning,
      lang.language_name,
    )
    explanation = warning

    if (riskLevel === "scam") {
      actions = [
        "Do not reply to this email or click any links",
        "Block the sender immediately",
        "Report to FTC at reportfraud.ftc.gov",
        "If you shared personal info, contact your bank or credit bureau",
      ]
      alertSent = await sendFraudAlert({
        to: user.email,
        subject: `Scam Detected — ${aiResult.scam_type}`,
        warningText: warning,
        senderEmail: sender,
        fraudScore: finalScore,
      })
    } else {
      actions = ["Be cautious before responding", "Verify the sender's identity through official channels"]
    }
  }

  const analysis: AnalysisResult = {
    id: randomUUID(),
    email_id: email.id,
    rule_score: ruleScore,
    ai_score: aiResult.fraud_score,
    final_score: finalScore,
    risk_level: riskLevel,
    scam_type: aiResult.scam_type === "none" ? "No scam detected" : aiResult.scam_type,
    red_flags: [...ruleHits, ...aiResult.red_flags].slice(0, 6),
    explanation,
    actions,
    alert_sent: alertSent,
    analyzed_at: new Date().toISOString(),
  }
  store.saveResult(analysis)

  return { email, analysis }
}
