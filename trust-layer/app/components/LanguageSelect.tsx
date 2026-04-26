"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"

const LANGUAGES = [
  { value: "en", short: "EN", label: "🇺🇸 English" },
  { value: "zh", short: "中文", label: "🇨🇳 中文" },
  { value: "es", short: "ES", label: "🇪🇸 Español" },
  { value: "bn", short: "বাংলা", label: "🇧🇩 বাংলা" },
  { value: "ht", short: "Kreyòl", label: "🇭🇹 Kreyòl" },
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
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const stored = getStoredLanguage()
    if (stored !== "en") {
      setTimeout(() => setLang(stored), 0)
    }
  }, [])

  function handleChange(value: string) {
    setLang(value)
    setOpen(false)
    localStorage.setItem("tl-language", value)
    window.dispatchEvent(new CustomEvent("tl-language-change", { detail: value }))
  }

  const currentLanguage = LANGUAGES.find((l) => l.value === lang) ?? LANGUAGES[0]

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Select language"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 active:scale-95"
      >
        🌐 {currentLanguage.short}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close language selector"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-[260px] rounded-2xl bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            {LANGUAGES.map((language) => {
              const selected = language.value === lang

              return (
                <button
                  key={language.value}
                  type="button"
                  onClick={() => handleChange(language.value)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${
                    selected ? "bg-[linear-gradient(135deg,#fce7f3,#e0f2fe)]" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1">{language.label}</span>
                  {selected ? <Check className="h-4 w-4 text-pink-500" /> : null}
                </button>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}
