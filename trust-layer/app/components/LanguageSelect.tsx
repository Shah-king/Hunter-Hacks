"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, Check, ChevronDown } from "lucide-react"

const LANGUAGES = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "ko", label: "한국어", flag: "🇰🇷" },
  { value: "bn", label: "বাংলা", flag: "🇧🇩" },
  { value: "ht", label: "Kreyòl", flag: "🇭🇹" },
]

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  zh: "Chinese",
  fr: "French",
  ko: "Korean",
  bn: "Bengali",
  ht: "Haitian Creole",
}

export function getStoredLanguage(): string {
  if (typeof window === "undefined") return "en"
  return localStorage.getItem("tl-language") ?? "en"
}

export default function LanguageSelect() {
  const [lang, setLang] = useState(() => getStoredLanguage())
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(value: string) {
    setLang(value)
    setOpen(false)
    localStorage.setItem("tl-language", value)
    window.dispatchEvent(new CustomEvent("tl-language-change", { detail: value }))
  }

  const current = LANGUAGES.find((l) => l.value === lang) ?? LANGUAGES[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-slate-950"
      >
        <Globe className="h-3.5 w-3.5 text-slate-400" />
        <span>{current.label}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => handleSelect(l.value)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-slate-50 ${
                lang === l.value ? "bg-slate-50 text-sky-600" : "text-slate-700"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1 text-left">{l.label}</span>
              {lang === l.value && <Check className="h-4 w-4 text-sky-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
