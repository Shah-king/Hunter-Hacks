import { NextRequest, NextResponse } from "next/server"
import { detectLanguageAndTranslate, scoreFraudWithAI, generateWarningEmail } from "@/lib/openai"
import { calculateRuleScore } from "@/lib/rules"

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  zh: "Chinese",
  bn: "Bengali",
  ht: "Haitian Creole",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text: string = body.text ?? ""
    const language: string = body.language ?? "en"

    if (!text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: "Message too long (max 5000 characters)" }, { status: 400 })
    }

    // Stage 0: Detect language + translate to English for analysis
    const lang = await detectLanguageAndTranslate(text)

    // Stage 1: Rule-based scoring
    const { score: ruleScore, hits: ruleHits } = calculateRuleScore(lang.english_text)

    // Stage 2: AI fraud scoring
    const aiResult = await scoreFraudWithAI(lang.english_text)

    // Stage 3: Aggregate scores
    const finalScore =
      ruleScore > 85 || aiResult.fraud_score > 85
        ? Math.max(ruleScore, aiResult.fraud_score)
        : Math.round(0.3 * ruleScore + 0.7 * aiResult.fraud_score)

    const riskLevel = finalScore > 70 ? "scam" : finalScore > 40 ? "suspicious" : "safe"

    // Stage 4: Generate explanation in the user's selected language
    const outputLanguage = LANGUAGE_NAMES[language] ?? "English"
    let explanation = aiResult.reasoning
    let actions: string[] = []

    if (riskLevel !== "safe") {
      explanation = await generateWarningEmail(
        text,
        aiResult.red_flags,
        finalScore,
        aiResult.reasoning,
        outputLanguage,
      )

      actions =
        riskLevel === "scam"
          ? [
              "Do not reply or click any links",
              "Block the sender immediately",
              "Report to FTC at reportfraud.ftc.gov",
              "If you shared personal info, contact your bank",
            ]
          : ["Be cautious before responding", "Verify the sender through official channels"]
    }

    return NextResponse.json({
      risk_level: riskLevel,
      confidence: finalScore,
      scam_type: aiResult.scam_type === "none" ? null : aiResult.scam_type,
      explanation,
      actions,
      red_flags: [...ruleHits, ...aiResult.red_flags].slice(0, 6),
      detected_language: lang.language_name,
      output_language: outputLanguage,
    })
  } catch (err) {
    console.error("[analyze]", err)
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 })
  }
}
