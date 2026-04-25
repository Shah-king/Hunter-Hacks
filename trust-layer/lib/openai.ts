import OpenAI from "openai"
import type { LanguageDetectionResult, AIScoringResult } from "@/lib/types"

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function detectLanguageAndTranslate(emailBody: string): Promise<LanguageDetectionResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Detect the language of the following text. If it is not English, translate it to English.
Return JSON exactly:
{
  "detected_language": "<ISO 639-1 code, e.g. en, es, zh, bn, ht>",
  "language_name": "<human readable, e.g. English, Spanish, Chinese>",
  "is_english": <true or false>,
  "english_text": "<translated text, or original if already English>"
}`,
      },
      { role: "user", content: emailBody },
    ],
  })
  return JSON.parse(res.choices[0].message.content!) as LanguageDetectionResult
}

export async function scoreFraudWithAI(englishText: string): Promise<AIScoringResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a fraud detection system. Analyze the following email and score it for fraud/scam likelihood.

Scoring rubric (additive):
- Urgency/pressure tactics: +20
- Payment via unusual methods (gift cards, crypto, wire transfer): +30
- Authority impersonation (IRS, SSA, police, immigration): +25
- Threats (arrest, deportation, lawsuit): +20
- Suspicious links or spoofed domains: +20
- Too-good-to-be-true offers (lottery, easy money, remote job): +15
- Generic/impersonal greeting (Dear Customer, Dear User): +10

Return JSON exactly:
{
  "fraud_score": <0-100>,
  "scam_type": "<phishing|impersonation|job_scam|investment|romance|government|lottery|other|none>",
  "red_flags": ["<specific phrase or pattern found>", ...],
  "reasoning": "<one sentence why>"
}`,
      },
      { role: "user", content: englishText },
    ],
  })
  return JSON.parse(res.choices[0].message.content!) as AIScoringResult
}

export async function generateWarningEmail(
  originalText: string,
  redFlags: string[],
  fraudScore: number,
  reasoning: string,
  languageName: string,
): Promise<string> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a fraud protection assistant. Generate a clear, helpful warning email about a detected scam.
Write entirely in ${languageName}. Be helpful and calm — not alarming.
Include: what the scam is, why it's dangerous, and 3 specific action steps.
Keep it under 200 words. Plain text only, no HTML.`,
      },
      {
        role: "user",
        content: JSON.stringify({ original_email: originalText, red_flags: redFlags, fraud_score: fraudScore, reasoning }),
      },
    ],
  })
  return res.choices[0].message.content ?? ""
}
