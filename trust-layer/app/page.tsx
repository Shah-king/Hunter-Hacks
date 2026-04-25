"use client"

import { useState } from "react"
import type { AnalysisResult, Channel, Language } from "@/lib/types"
import { LANGUAGES, EXAMPLE_MESSAGES } from "@/lib/constants"

const CHANNELS: { id: Channel; label: string; icon: string }[] = [
  { id: "sms", label: "SMS / Text", icon: "💬" },
  { id: "email", label: "Email", icon: "📧" },
  { id: "call", label: "Phone Call", icon: "📞" },
  { id: "social", label: "Social Media", icon: "📱" },
]

const RISK_CONFIG = {
  scam: {
    label: "SCAM",
    bg: "bg-red-600",
    border: "border-red-600",
    text: "text-red-600",
    light: "bg-red-50",
    pulse: "animate-pulse",
  },
  suspicious: {
    label: "SUSPICIOUS",
    bg: "bg-yellow-500",
    border: "border-yellow-500",
    text: "text-yellow-600",
    light: "bg-yellow-50",
    pulse: "",
  },
  safe: {
    label: "SAFE",
    bg: "bg-green-600",
    border: "border-green-600",
    text: "text-green-600",
    light: "bg-green-50",
    pulse: "",
  },
}

function highlightRedFlags(text: string, redFlags: string[]): React.ReactNode {
  if (!redFlags.length) return text

  // Extract the raw phrases from red flag strings (before " — ")
  const phrases = redFlags
    .map((f) => f.split(" — ")[0].replace(/['"]/g, "").trim())
    .filter((p) => p.length > 3)

  if (!phrases.length) return text

  const pattern = new RegExp(`(${phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi")
  const parts = text.split(pattern)

  return parts.map((part, i) =>
    pattern.test(part) ? (
      <mark key={i} className="bg-red-200 text-red-900 rounded px-0.5 font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export default function Home() {
  const [channel, setChannel] = useState<Channel>("sms")
  const [language, setLanguage] = useState<Language>("en")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, channel, language }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.")
      } else {
        setResult(data)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function loadExample() {
    setText(EXAMPLE_MESSAGES[channel])
    setResult(null)
    setError(null)
  }

  const risk = result ? RISK_CONFIG[result.risk_level] : null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TrustLayer</h1>
            <p className="text-xs text-gray-400">Real-time scam protection for immigrants & students</p>
          </div>
        </div>
        <a
          href="/trustwall"
          className="text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg"
        >
          🌐 TrustWall
        </a>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Channel tabs */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Select Channel</p>
          <div className="grid grid-cols-4 gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setChannel(c.id); setResult(null); setError(null) }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                  channel === c.id
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
                }`}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-xs">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language selector */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Output Language</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  language === l.code
                    ? "border-purple-500 bg-purple-500/10 text-purple-300"
                    : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Paste Suspicious Message</p>
            <button
              onClick={loadExample}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Load example →
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an SMS, email, call script, or social media message here..."
            rows={5}
            maxLength={5000}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-600">{text.length}/5000</span>
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={loading || !text.trim()}
          className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 active:scale-[0.99]"
        >
          {loading ? "Analyzing with AI..." : "Analyze Message"}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Results */}
        {result && risk && (
          <div className={`rounded-2xl border ${risk.border} bg-gray-900 overflow-hidden`}>
            {/* Risk header */}
            <div className={`${risk.bg} px-5 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${risk.pulse}`}>
                  {result.risk_level === "scam" ? "🚨" : result.risk_level === "suspicious" ? "⚠️" : "✅"}
                </span>
                <div>
                  <p className="font-bold text-lg tracking-wide">{risk.label}</p>
                  <p className="text-sm opacity-90">{result.scam_type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{result.confidence}%</p>
                <p className="text-xs opacity-80">confidence</p>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Highlighted original message */}
              {result.red_flags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Message Analysis</p>
                  <div className="bg-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap break-words">
                    {highlightRedFlags(text, result.red_flags)}
                  </div>
                </div>
              )}

              {/* Red flags */}
              {result.red_flags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Red Flags Detected</p>
                  <ul className="space-y-1.5">
                    {result.red_flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-400">
                        <span className="mt-0.5 shrink-0">⚑</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explanation */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Explanation</p>
                <p className="text-sm text-gray-200 leading-relaxed">{result.explanation}</p>
              </div>

              {/* Actions */}
              {result.actions.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">What To Do</p>
                  <ol className="space-y-2">
                    {result.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
