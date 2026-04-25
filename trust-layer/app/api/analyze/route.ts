import { NextRequest, NextResponse } from "next/server"
import { openai, buildSystemPrompt } from "@/lib/openai"
import type { AnalysisResult, Channel, Language } from "@/lib/types"

export async function POST(req: NextRequest) {
  let body: { text?: string; channel?: Channel; language?: Language }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { text, channel = "sms", language = "en" } = body

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "text is required" }, { status: 400 })
  }

  if (text.length > 5000) {
    return NextResponse.json({ error: "text must be under 5000 characters" }, { status: 400 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        { role: "system", content: buildSystemPrompt(channel, language) },
        { role: "user", content: text.trim() },
      ],
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
    }

    const result: AnalysisResult = JSON.parse(raw)

    // Ensure required fields are present
    if (!result.risk_level || result.confidence === undefined) {
      return NextResponse.json({ error: "Invalid AI response structure" }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error("Analysis error:", err)
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 })
  }
}
