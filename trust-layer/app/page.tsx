"use client"

import { useState, useEffect, useCallback } from "react"
import type { ComponentType } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  Inbox,
  Loader2,
  MailWarning,
  Play,
  ShieldCheck,
} from "lucide-react"
import type { EmailWithAnalysis, RiskLevel, User } from "@/lib/types"

type Stats = {
  total: number
  fraud: number
  suspicious: number
  alertsSent: number
  languages: string[]
}

type RiskFilter = "all" | RiskLevel

const RISK_STYLES: Record<
  RiskLevel,
  {
    label: string
    badge: string
    border: string
    dot: string
    glow: string
    icon: ComponentType<{ className?: string }>
  }
> = {
  scam: {
    label: "Scam",
    badge: "bg-red-500/15 text-red-200 ring-1 ring-red-400/35",
    border: "border-red-400/40",
    dot: "bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.75)]",
    glow: "from-red-500/20",
    icon: MailWarning,
  },
  suspicious: {
    label: "Suspicious",
    badge: "bg-amber-400/15 text-amber-100 ring-1 ring-amber-300/35",
    border: "border-amber-300/35",
    dot: "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.55)]",
    glow: "from-amber-400/16",
    icon: AlertTriangle,
  },
  safe: {
    label: "Safe",
    badge: "bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/35",
    border: "border-emerald-300/30",
    dot: "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.45)]",
    glow: "from-emerald-400/14",
    icon: CheckCircle2,
  },
}

const SCENARIOS = [
  { id: "irs", label: "IRS Scam", detail: "Urgent government threat" },
  { id: "phishing", label: "Phishing", detail: "Credential theft link" },
  { id: "spanish", label: "Spanish Scam", detail: "Translated fraud alert" },
  { id: "job", label: "Job Fraud", detail: "Fake hiring offer" },
]

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string
  value: number | string
  tone: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.065]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <div className={`rounded-xl border border-white/10 p-2 ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  )
}

function EmailSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex animate-pulse items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-slate-700" />
              <div className="w-full max-w-md space-y-2">
                <div className="h-4 w-2/3 rounded bg-slate-800" />
                <div className="h-3 w-1/3 rounded bg-slate-800" />
              </div>
            </div>
            <div className="hidden h-7 w-24 rounded-full bg-slate-800 sm:block" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onSimulate }: { onSimulate: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.035] px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
        <Inbox className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-white">No emails processed yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        Run a sample through the pipeline to show judges how TrustLayer classifies messages, records the analysis, and updates the dashboard.
      </p>
      <button
        onClick={onSimulate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        <Play className="h-4 w-4" />
        Run first simulation
      </button>
    </div>
  )
}

function EmailCard({ item }: { item: EmailWithAnalysis }) {
  const [expanded, setExpanded] = useState(false)
  const analysis = item.analysis
  const risk = analysis ? RISK_STYLES[analysis.risk_level] : null
  const RiskIcon = risk?.icon

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-slate-950/70 shadow-2xl shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-900/80 ${
        risk ? risk.border : "border-white/10"
      }`}
    >
      {risk && <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${risk.glow} to-transparent opacity-80`} />}
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="relative grid w-full grid-cols-[1fr_auto] items-center gap-4 p-4 text-left sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${risk?.dot ?? "bg-slate-600"} ${analysis?.risk_level === "scam" ? "animate-pulse" : ""}`} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100 sm:text-base">{item.subject || "(no subject)"}</p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {item.sender} - {new Date(item.received_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {item.language_name && item.detected_language !== "en" && (
            <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-400 sm:inline-flex">
              {item.language_name}
            </span>
          )}
          {analysis && risk && RiskIcon && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${risk.badge}`}>
              <RiskIcon className="h-3.5 w-3.5" />
              {risk.label}
            </span>
          )}
          {analysis && <span className="hidden min-w-10 text-right text-sm font-bold text-white sm:inline">{analysis.final_score}</span>}
          {expanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </div>
      </button>

      {expanded && analysis && (
        <div className="relative border-t border-white/10 bg-black/20 px-4 py-5 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Rule Score", analysis.rule_score, "text-cyan-200"],
              ["AI Score", analysis.ai_score, "text-violet-200"],
              ["Final Score", analysis.final_score, "text-white"],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <p className={`text-2xl font-semibold ${color}`}>{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Analysis</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{analysis.explanation}</p>
              <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                {analysis.scam_type || "General fraud pattern"}
              </p>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recommended Actions</p>
              <ol className="mt-2 space-y-2">
                {analysis.actions.map((action, index) => (
                  <li key={action} className="flex items-start gap-2 text-sm leading-6 text-slate-300">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 text-xs font-bold text-cyan-200">
                      {index + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {analysis.red_flags.length > 0 && (
            <section className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Red Flags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.red_flags.map((flag) => (
                  <span key={flag} className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs text-red-100">
                    {flag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {analysis.alert_sent && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1.5 text-xs font-medium text-orange-100">
              <Bell className="h-3.5 w-3.5" />
              Alert email sent
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [emails, setEmails] = useState<EmailWithAnalysis[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, fraud: 0, suspicious: 0, alertsSent: 0, languages: [] })
  const [filter, setFilter] = useState<RiskFilter>("all")
  const [simulating, setSimulating] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [simScenario, setSimScenario] = useState("irs")
  const [lastSimResult, setLastSimResult] = useState<string | null>(null)

  const fetchEmails = useCallback(async () => {
    const res = await fetch("/api/emails")
    if (res.ok) {
      const data = await res.json()
      setEmails(data.emails)
      setStats(data.stats)
      if (data.user) {
        setUser(data.user)
      } else {
        router.push("/login")
      }
    } else {
      router.push("/login")
    }
    setInitialLoading(false)
  }, [router])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchEmails()
    }, 0)
    const interval = setInterval(fetchEmails, 4000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
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
        setLastSimResult(`Simulation complete - ${data.analysis.risk_level.toUpperCase()} score ${data.analysis.final_score}`)
        await fetchEmails()
      } else {
        setLastSimResult(data.error ?? "Simulation failed")
      }
    } catch {
      setLastSimResult("Network error")
    } finally {
      setSimulating(false)
    }
  }

  const filtered = filter === "all" ? emails : emails.filter((email) => email.analysis?.risk_level === filter)
  const caughtRate = stats.total > 0 ? Math.round(((stats.fraud + stats.suspicious) / stats.total) * 100) : 0

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.92))] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Live email defense dashboard
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Catch fraud before it reaches someone vulnerable.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              TrustLayer scans forwarded emails, explains the risk in plain language, and sends alerts when a scam needs immediate attention.
            </p>
            {user && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-slate-300">Your forwarding address:</p>
                <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-black/40 px-4 py-2">
                  <code className="text-sm text-cyan-300">{user.forwarding_address}</code>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      router.push("/login")
                    }}
                    className="text-xs text-slate-500 transition hover:text-white"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="grid min-w-56 grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <div>
              <p className="text-3xl font-semibold text-white">{caughtRate}%</p>
              <p className="text-xs text-slate-500">flag rate</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-cyan-200">{stats.languages.length || 1}</p>
              <p className="text-xs text-slate-500">languages</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Emails Scanned" value={stats.total} tone="bg-cyan-300/10 text-cyan-200" icon={Inbox} />
        <StatCard label="Scams Caught" value={stats.fraud} tone="bg-red-400/10 text-red-200" icon={MailWarning} />
        <StatCard label="Suspicious" value={stats.suspicious} tone="bg-amber-300/10 text-amber-100" icon={AlertTriangle} />
        <StatCard label="Alerts Sent" value={stats.alertsSent} tone="bg-violet-300/10 text-violet-100" icon={Bell} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.4fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Simulate Email</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">Run a prepared case through the full pipeline and refresh the feed.</p>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
              Live pipeline
            </span>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setSimScenario(scenario.id)}
                className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                  simScenario === scenario.id
                    ? "border-cyan-300/50 bg-cyan-300/10 text-white"
                    : "border-white/10 bg-black/15 text-slate-400 hover:border-white/20"
                }`}
              >
                <p className="text-sm font-semibold">{scenario.label}</p>
                <p className="mt-1 text-xs text-slate-500">{scenario.detail}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={simulate}
            disabled={simulating}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {simulating ? "Running pipeline..." : "Run Simulation"}
          </button>

          {lastSimResult && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
              {lastSimResult}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Processed Emails</h2>
              <p className="text-sm text-slate-500">{filtered.length} visible of {emails.length} total</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </span>
              {(["all", "scam", "suspicious", "safe"] as RiskFilter[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    filter === value
                      ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
                  }`}
                >
                  {value === "all" ? "All" : RISK_STYLES[value].label}
                </button>
              ))}
            </div>
          </div>

          {initialLoading ? (
            <EmailSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState onSimulate={simulate} />
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <EmailCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
