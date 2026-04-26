"use client"

import { useState, useEffect } from "react"
import { translations, type LangCode, type TranslationKey } from "@/lib/i18n"

function isLangCode(value: string): value is LangCode {
  return value in translations
}

export function useT() {
  const [lang, setLang] = useState<LangCode>("en")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("tl-language") : null
    if (stored && isLangCode(stored)) setLang(stored)

    function onChange(e: Event) {
      const detail = (e as CustomEvent<string>).detail
      if (typeof detail === "string" && isLangCode(detail)) setLang(detail)
    }
    window.addEventListener("tl-language-change", onChange)
    return () => window.removeEventListener("tl-language-change", onChange)
  }, [])

  return {
    t: (key: TranslationKey): string => translations[lang][key] ?? translations.en[key],
    lang,
  }
}
