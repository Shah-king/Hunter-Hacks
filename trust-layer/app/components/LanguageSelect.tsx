"use client"

import { useState, useEffect } from "react"

const LANGUAGES = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
  { value: "zh", label: "中文" },
  { value: "bn", label: "বাংলা" },
  { value: "ht", label: "Kreyol" },
]

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  zh: "Chinese",
  bn: "Bengali",
  ht: "Haitian Creole",
}

export function getStoredLanguage(): string {
  if (typeof window === "undefined") return "en"
  return localStorage.getItem("tl-language") ?? "en"
}

export default function LanguageSelect() {
  const [lang, setLang] = useState("en")

  useEffect(() => {
    const stored = getStoredLanguage()
    if (stored !== "en") {
      setTimeout(() => setLang(stored), 0)
    }
  }, [])

  function handleChange(value: string) {
    setLang(value)
    localStorage.setItem("tl-language", value)
    window.dispatchEvent(new CustomEvent("tl-language-change", { detail: value }))
  }

  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm outline-none transition hover:border-sky-200 focus:border-sky-300"
    >
      {LANGUAGES.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </select>
  )
}
