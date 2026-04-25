"use client"

import { useState, useEffect, useCallback } from "react"
import type { EmailWithAnalysis } from "@/lib/types"

type Stats = {
  total: number
  fraud: number
  suspicious: number
  alertsSent: number
  languages: string[]
}

type RiskFilter = "all" | "scam" | "suspicious" | "safe"

const RISK_STYLES = {
  scam: { badge: "bg-red-600 text-white", border: "border-red-600", dot: "bg-red-500" },
  suspicious: { badge: "bg-yellow-500 text-black", border: "border-yellow-500", dot: "bg-yellow-400" },
  safe: { badge: "bg-green-600 text-white", border: "border-green-700", dot: "bg-green-500" },
}

const SCENARIOS = [
  { id: "irs", label: "IRS Scam", icon: "🏛️" },
  { id: "phishing", label: "Phishing", icon: "🎣" },
  { id: "spanish", label: "Spanish Scam", icon: "🇪🇸" },
  { id: "job", label: "Job Fraud", icon: "💼" },
]

function EmailCard({ item }: { item: EmailWithAnalysis }) {
  const [expanded, setExpanded] = useState(false)
  const analysis = item.analysis
  const risk = analysis ? RISK_STYLES[analysis.risk_level] : null

  return (
    <div
      className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all cursor-pointer ${
        risk ? risk.border : "border-gray-800"
      } hover:opacity-90`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${risk?.dot ?? "bg-gray-600"} ${analysis?.risk_level === "scam" ? "animate-pulse" : ""}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-100 truncate">{item.subject || "(no subject)"}</p>
            <p className="text-xs text-gray-500 truncate">{item.sender} · {new Date(item.received_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {item.language_name && item.detected_language !== "en" && (
            <span className="text-xs text-gray-500 border border-gray-700 rounded-full px-2 py-0.5">{item.language_name}</span>
          )}
          {analysis && (
            <>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${risk?.badge}`}>
                {analysis.risk_level.toUpperCase()}
              </span>
              <span className="text-sm font-bold text-white w-8 text-right">{analysis.final_score}</span>
            </>
          )}
          {analysis?.alert_sent && (
            <span className="text-xs text-orange-400 border border-orange-800 bg-orange-950 rounded-full px-2 py-0.5">✉️ Alert sent</span>
          )}
          <span className="text-gray-600 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && analysis && (
        <div className="border-t border-gray-800 px-5 py-4 space-y-4 bg-gray-950">
          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-900 rounded-xl py-3">
              <p className="text-lg font-bold text-blue-400">{analysis.rule_score}</p>
              <p className="text-xs text-gray-500 mt-0.5">Rule Score</p>
            </div>
            <div className="bg-gray-900 rounded-xl py-3">
              <p className="text-lg font-bold text-purple-400">{analysis.ai_score}</p>
              <p className="text-xs text-gray-500 mt-0.5">AI Score</p>
            </div>
            <div className={`rounded-xl py-3 ${risk?.badge}`}>
              <p className="text-lg font-bold">{analysis.final_score}</p>
              <p className="text-xs mt-0.5 opacity-80">Final Score</p>
            </div>
          </div>

          {/* Scam type */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Scam Type</p>
            <p className="text-sm text-gray-200 font-medium">{analysis.scam_type}</p>
          </div>

          {/* Red flags */}
          {analysis.red_flags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Red Flags</p>
              <ul className="space-y-1">
                {analysis.red_flags.map((f, i) => (
                  <li key={i} className="text-xs text-red-400 flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">⚑</span><span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explanation */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Analysis</p>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis.explanation}</p>
          </div>

          {/* Actions */}
          {analysis.actions.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Recommended Actions</p>
              <ol className="space-y-1.5">
                {analysis.actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-200">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [emails, setEmails] = useState<EmailWithAnalysis[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, fraud: 0, suspicious: 0, alertsSent: 0, languages: [] })
  const [filter, setFilter] = useState<RiskFilter>("all")
  const [simulating, setSimulating] = useState(false)
  const [simScenario, setSimScenario] = useState("irs")
  const [lastSimResult, setLastSimResult] = useState<string | null>(null)

  const fetchEmails = useCallback(async () => {
    const res = await fetch("/api/emails")
    if (res.ok) {
      const data = await res.json()
      setEmails(data.emails)
      setStats(data.stats)
    }
  }, [])

  useEffect(() => {
    fetchEmails()
    const interval = setInterval(fetchEmails, 4000)
    return () => clearInterval(interval)
  }, [fetchEmails])

  async function simulate() {
    setSimulating(true)
    setLastSimResult(null)
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: simScenario }),
      })
      const data = await res.json()
      if (res.ok) {
        setLastSimResult(`✅ Simulation complete — ${data.analysis.risk_level.toUpperCase()} (score: ${data.analysis.final_score})`)
        await fetchEmails()
      } else {
        setLastSimResult(`❌ ${data.error}`)
      }
    } catch {
      setLastSimResult("❌ Network error")
    } finally {
      setSimulating(false)
    }
  }

  const filtered = filter === "all" ? emails : emails.filter((e) => e.analysis?.risk_level === filter)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Emails Scanned</p>
        </div>
        <div className="bg-red-950 border border-red-900 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.fraud}</p>
          <p className="text-xs text-red-500 mt-0.5">Scams Caught</p>
        </div>
        <div className="bg-yellow-950 border border-yellow-900 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.suspicious}</p>
          <p className="text-xs text-yellow-600 mt-0.5">Suspicious</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-orange-400">{stats.alertsSent}</p>
          <p className="text-xs text-gray-500 mt-0.5">Alerts Sent</p>
        </div>
      </div>

      {/* Simulate panel */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">⚡ Simulate Email</p>
            <p className="text-xs text-gray-500">Run a sample scam through the full pipeline</p>
          </div>
          <span className="text-xs text-green-400 border border-green-800 bg-green-950 rounded-full px-3 py-1">🟢 Live Pipeline</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSimScenario(s.id)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                simScenario === s.id
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              <span className="text-lg">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={simulate}
          disabled={simulating}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all"
        >
          {simulating ? "Running pipeline..." : "Run Simulation →"}
        </button>
        {lastSimResult && (
          <p className={`text-sm text-center ${lastSimResult.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
            {lastSimResult}
          </p>
        )}
      </div>

      {/* Filter + email feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            {filtered.length === 0 ? "No emails yet — run a simulation above" : `${filtered.length} email${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex gap-1.5">
            {(["all", "scam", "suspicious", "safe"] as RiskFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  filter === f
                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                    : "border-gray-700 text-gray-500 hover:border-gray-500"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((item) => (
            <EmailCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </main>
  )
}
