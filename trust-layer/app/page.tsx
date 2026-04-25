"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  Heart,
  Loader2,
  MessageCircle,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react"
import type { EmailWithAnalysis, RiskLevel } from "@/lib/types"
import FloatingActionButton from "./components/FloatingActionButton"

type Stats = {
  total: number
  fraud: number
  suspicious: number
  alertsSent: number
  languages: string[]
}

type RiskFilter = "all" | RiskLevel

const RISK_STYLE: Record<RiskLevel, { label: string; pill: string; dot: string; ring: string }> = {
  scam: {
    label: "Scam",
    pill: "bg-rose-50 text-rose-600 border-rose-100",
    dot: "bg-rose-400",
    ring: "ring-rose-100",
  },
  suspicious: {
    label: "Watch",
    pill: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
    ring: "ring-amber-100",
  },
  safe: {
    label: "Safe",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-400",
    ring: "ring-emerald-100",
  },
}

const SCENARIOS = [
  { id: "irs", label: "IRS", detail: "urgent tax threat" },
  { id: "phishing", label: "Bank", detail: "fake login link" },
  { id: "spanish", label: "Spanish", detail: "translated alert" },
  { id: "job", label: "Job", detail: "too-good offer" },
]

const TRENDING_POST = {
  user: "Maya from Queens",
  initials: "MQ",
  tag: "IRS Scam",
  risk: "High",
  story: "Almost had a heart attack reading this 😭 thought I was going to jail for taxes",
  message:
    "Final notice: your tax case will be sent to federal court unless you pay today with gift cards.",
  reactionLine: "Why is the IRS asking for Apple gift cards 💀",
  reactions: { hearts: 128, helpful: 74, warning: 39 },
}

function scoreTone(score: number) {
  if (score >= 70) return "from-rose-100 to-pink-50 text-rose-700"
  if (score >= 35) return "from-amber-100 to-yellow-50 text-amber-700"
  return "from-emerald-100 to-teal-50 text-emerald-700"
}

function EmailPreviewCard({ item }: { item: EmailWithAnalysis }) {
  const [expanded, setExpanded] = useState(false)
  const analysis = item.analysis
  const risk = analysis ? RISK_STYLE[analysis.risk_level] : null

  return (
    <article className={`social-card rounded-[28px] p-4 ${risk ? `ring-4 ${risk.ring}` : ""}`}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-pink-100 text-sm font-black text-slate-700">
            {item.sender.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-bold text-slate-900">{item.subject || "Untitled message"}</p>
              {risk && (
                <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${risk.pill}`}>
                  {risk.label}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-slate-500">{item.sender}</p>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {analysis && (
            <span className={`rounded-2xl bg-gradient-to-br px-3 py-2 text-sm font-black ${scoreTone(analysis.final_score)}`}>
              {analysis.final_score}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && analysis && (
        <div className="mt-4 rounded-3xl bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-700">{analysis.explanation}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.red_flags.map((flag) => (
              <span key={flag} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                {flag}
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {analysis.actions.slice(0, 3).map((action) => (
              <p key={action} className="rounded-2xl bg-white p-3 text-xs leading-5 text-slate-600 shadow-sm">
                {action}
              </p>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

function LoadingCards() {
  return (
    <div className="grid gap-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="social-card rounded-[28px] p-5">
          <div className="flex animate-pulse gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="h-3 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [emails, setEmails] = useState<EmailWithAnalysis[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, fraud: 0, suspicious: 0, alertsSent: 0, languages: [] })
  const [filter, setFilter] = useState<RiskFilter>("all")
  const [message, setMessage] = useState("")
  const [scenario, setScenario] = useState("irs")
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const fetchEmails = useCallback(async () => {
    const res = await fetch("/api/emails")
    if (res.ok) {
      const data = await res.json()
      setEmails(data.emails)
      setStats(data.stats)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => void fetchEmails(), 0)
    const interval = setInterval(fetchEmails, 4000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [fetchEmails])

  const runSimulation = useCallback(async () => {
    setAnalyzing(true)
    setLastResult(null)
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      })
      const data = await res.json()
      if (res.ok) {
        setLastResult(`${data.analysis.risk_level.toUpperCase()} detected with score ${data.analysis.final_score}`)
        await fetchEmails()
      } else {
        setLastResult(data.error ?? "Could not analyze right now")
      }
    } catch {
      setLastResult("Network error. Try again in a moment.")
    } finally {
      setAnalyzing(false)
    }
  }, [fetchEmails, scenario])

  const filteredEmails = useMemo(
    () => (filter === "all" ? emails : emails.filter((email) => email.analysis?.risk_level === filter)),
    [emails, filter]
  )

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-600 shadow-sm ring-1 ring-sky-100">
            <Sparkles className="h-3.5 w-3.5" />
            community-powered scam protection
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Catch scams before they reach someone vulnerable
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Paste a suspicious message, learn what feels off, and help your community spot the pattern before it spreads.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">calm explanations</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">multi-language help</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">social scam alerts</span>
          </div>
        </div>

        <div className="soft-card rounded-[34px] p-5">
          <div className="rounded-[28px] bg-gradient-to-br from-sky-100 via-white to-pink-100 p-5">
            <p className="text-sm font-black text-slate-900">Today&apos;s safety mood</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-3xl bg-white/85 p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-slate-950">{stats.total}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">scanned</p>
              </div>
              <div className="rounded-3xl bg-white/85 p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-rose-500">{stats.fraud}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">caught</p>
              </div>
              <div className="rounded-3xl bg-white/85 p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-emerald-500">{stats.alertsSent}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">alerts</p>
              </div>
            </div>
            <div className="mt-4 rounded-3xl bg-white/80 p-4 text-sm leading-6 text-slate-600 shadow-sm">
              TrustLayer stays gentle on the surface and serious under the hood.
            </div>
          </div>
        </div>
      </section>

      <section id="analyze" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="soft-card rounded-[34px] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-slate-950">Quick check</p>
              <p className="mt-1 text-sm text-slate-500">Paste anything suspicious. Demo analysis uses the live sample pipeline.</p>
            </div>
            <ShieldCheck className="h-6 w-6 text-sky-500" />
          </div>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={7}
            placeholder="Paste a text, email, DM, or job offer here..."
            className="mt-5 w-full resize-none rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-sky-200 focus:bg-white"
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {SCENARIOS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScenario(item.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition hover:-translate-y-0.5 active:scale-95 ${
                  scenario === item.id
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <p className="text-sm font-black">{item.label}</p>
                <p className="mt-1 text-xs">{item.detail}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={runSimulation}
            disabled={analyzing}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-sky-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {analyzing ? "Checking gently..." : "Analyze Message"}
          </button>

          {lastResult && (
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700">
              {lastResult}
            </p>
          )}
        </div>

        <article className="social-card overflow-hidden rounded-[34px] p-0">
          <div className="bg-gradient-to-br from-pink-50 via-white to-sky-50 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-black text-rose-500 shadow-sm">
                  🔥 Trending in your community
                </div>
                <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                  Trending Scam Today
                </h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white shadow-lg shadow-rose-100">
                  THIS IS A SCAM
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-rose-600 shadow-sm">
                  Risk: {TRENDING_POST.risk}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-300 to-sky-300 font-black text-white shadow-lg shadow-pink-100">
                {TRENDING_POST.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-slate-950">{TRENDING_POST.user}</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-500 shadow-sm">
                    just now
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {TRENDING_POST.story}
                </p>

                <div className="mt-4 rounded-[26px] border border-rose-100 bg-white/85 p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-400">
                    Scam message
                  </p>
                  <p className="mt-2 text-[15px] leading-7 text-slate-800">
                    “{TRENDING_POST.message}”
                  </p>
                </div>

                <p className="mt-3 rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                  {TRENDING_POST.reactionLine}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-white px-5 py-4 text-sm font-bold text-slate-500 sm:px-6">
            <span className="rounded-full bg-rose-50 px-3 py-2 text-xs font-black text-rose-500">
              {TRENDING_POST.tag}
            </span>
            <button type="button" className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-2 text-pink-500 transition hover:-translate-y-0.5">
              <Heart className="h-4 w-4" /> {TRENDING_POST.reactions.hearts}
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-2 text-sky-500 transition hover:-translate-y-0.5">
              <ThumbsUp className="h-4 w-4" /> {TRENDING_POST.reactions.helpful}
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 text-amber-600 transition hover:-translate-y-0.5">
              <TriangleAlert className="h-4 w-4" /> {TRENDING_POST.reactions.warning}
            </button>
            <Link href="/social" className="ml-auto rounded-full bg-slate-950 px-4 py-2 text-xs text-white transition hover:-translate-y-0.5">
              View More
            </Link>
          </div>
        </article>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Recent scans</h2>
            <p className="mt-1 text-sm text-slate-500">Soft dashboard, clear details when you need them.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "scam", "suspicious", "safe"] as RiskFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full border px-4 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
                  filter === value
                    ? "border-sky-200 bg-sky-50 text-sky-600"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {value === "all" ? "All" : RISK_STYLE[value].label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingCards />
        ) : filteredEmails.length > 0 ? (
          <div className="grid gap-4">
            {filteredEmails.map((email) => (
              <EmailPreviewCard key={email.id} item={email} />
            ))}
          </div>
        ) : (
          <div className="soft-card rounded-[34px] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-50 text-sky-500">
              <MessageCircle className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950">No scans yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Run a simulation above and a friendly analysis card will appear here.
            </p>
            <button
              type="button"
              onClick={runSimulation}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4" />
              Simulate first scan
            </button>
          </div>
        )}
      </section>

      <FloatingActionButton onSimulate={runSimulation} />
    </main>
  )
}
