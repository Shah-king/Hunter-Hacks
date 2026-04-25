import type { LanguageDetectionResult } from "@/lib/types"

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  zh: "Chinese",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ar: "Arabic",
  hi: "Hindi",
  bn: "Bengali",
  ht: "Haitian Creole",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  vi: "Vietnamese",
  tl: "Filipino",
  ur: "Urdu",
  fa: "Persian",
  tr: "Turkish",
  it: "Italian",
  pl: "Polish",
  uk: "Ukrainian",
  ro: "Romanian",
  sw: "Swahili",
  am: "Amharic",
  so: "Somali",
}

function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] ?? LANGUAGE_NAMES[code.split("-")[0]] ?? code.toUpperCase()
}

// Google Translate API v2 — detects source language and translates to English in one call.
// Falls back to OpenAI if GOOGLE_TRANSLATE_API_KEY is not set.
export async function detectAndTranslate(text: string): Promise<LanguageDetectionResult> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

  if (!apiKey) {
    // Fall back to OpenAI translation if no Google key configured
    const { detectLanguageAndTranslate } = await import("@/lib/openai")
    return detectLanguageAndTranslate(text)
  }

  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text.slice(0, 5000),
      target: "en",
      format: "text",
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Google Translate API ${res.status}: ${errBody}`)
  }

  const data = await res.json() as {
    data: { translations: Array<{ translatedText: string; detectedSourceLanguage?: string }> }
  }

  const translation = data.data?.translations?.[0]
  if (!translation) throw new Error("Unexpected Google Translate response shape")

  const detectedCode = translation.detectedSourceLanguage ?? "en"
  const isEnglish = detectedCode === "en"

  return {
    detected_language: detectedCode,
    language_name: getLanguageName(detectedCode),
    is_english: isEnglish,
    // If already English, use original text (avoids unnecessary re-encoding)
    english_text: isEnglish ? text : translation.translatedText,
  }
}
