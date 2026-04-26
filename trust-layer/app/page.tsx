"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Heart,
  Loader2,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react"
import FloatingActionButton from "./components/FloatingActionButton"
import { getStoredLanguage } from "./components/LanguageSelect"

type AnalyzeResult = {
  risk_level: "scam" | "suspicious" | "safe"
  confidence: number
  scam_type: string | null
  explanation: string
  actions: string[]
  red_flags: string[]
  detected_language: string
  output_language: string
}

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

const ACTIVITY = [
  { title: "IRS scam detected", level: "High", tone: "bg-rose-50 text-rose-600", icon: AlertTriangle },
  { title: "Phishing link flagged", level: "Medium", tone: "bg-amber-50 text-amber-700", icon: TriangleAlert },
  { title: "Job scam alert", level: "High", tone: "bg-rose-50 text-rose-600", icon: AlertTriangle },
]

const SAMPLE_MESSAGE =
  "Final notice: your tax case will be sent to federal court unless you pay today with gift cards."

const FORWARDING_ADDRESS = "demo@parse.trustlayer.store"

function ProtectionStatus() {
  const [copied, setCopied] = useState(false)
  const rows = [
    ["Email connected", "Ready", CheckCircle2, "text-emerald-600 bg-emerald-50"],
    ["Monitoring active", "Live", ShieldCheck, "text-sky-600 bg-sky-50"],
    ["1 suspicious message today", "Watch", AlertTriangle, "text-amber-700 bg-amber-50"],
  ] as const

  async function copyForwardingAddress() {
    await navigator.clipboard.writeText(FORWARDING_ADDRESS)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <section className="soft-card rounded-[28px] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">Protection Status</h2>
          <p className="mt-1 text-sm text-slate-500">Forwarding is active and monitoring incoming scam reports.</p>
        </div>
        <div className="rounded-2xl bg-sky-50 p-3 text-sky-500">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map(([label, value, Icon, tone]) => (
          <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`rounded-full p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-slate-700">{label}</span>
            </div>
            <span className="text-xs font-black text-slate-400">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-500">Forwarding address</p>
        <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <code className="break-all text-sm font-black text-slate-800">{FORWARDING_ADDRESS}</code>
          <button
            type="button"
            onClick={copyForwardingAddress}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:-translate-y-0.5"
            aria-label="Copy forwarding address"
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Forward suspicious emails here and TrustLayer will surface the analysis in the dashboard flow.
        </p>
      </div>
    </section>
  )
}

const RISK_CONFIG = {
  scam: { label: “Scam Detected”, color: “text-rose-500”, bg: “border-rose-100”, scoreBg: “from-rose-100 to-pink-50 text-rose-600” },
  suspicious: { label: “Suspicious Message”, color: “text-amber-600”, bg: “border-amber-100”, scoreBg: “from-amber-100 to-orange-50 text-amber-700” },
  safe: { label: “Looks Safe”, color: “text-emerald-600”, bg: “border-emerald-100”, scoreBg: “from-emerald-100 to-green-50 text-emerald-700” },
}

function ScamAlertCard({ result }: { result: AnalyzeResult }) {
  const cfg = RISK_CONFIG[result.risk_level]
  return (
    <section className={`soft-card rounded-[28px] p-5 ${cfg.bg}`}>
      <div className=”flex items-start justify-between gap-4”>
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.16em] ${cfg.color}`}>{cfg.label}</p>
          <h2 className=”mt-2 text-2xl font-black text-slate-950”>
            {result.scam_type ? result.scam_type.replace(/_/g, “ “) : cfg.label}
          </h2>
          {result.detected_language !== “English” && (
            <p className=”mt-1 text-xs text-slate-400”>Detected: {result.detected_language}</p>
          )}
        </div>
        <div className={`rounded-3xl bg-gradient-to-br px-4 py-3 text-center ${cfg.scoreBg}`}>
          <p className=”text-3xl font-black”>{result.confidence}%</p>
          <p className=”text-xs font-black”>confidence</p>
        </div>
      </div>

      {result.explanation && (
        <div className=”mt-5 rounded-3xl bg-slate-50 p-4”>
          <p className=”text-xs font-black uppercase tracking-[0.14em] text-slate-400”>
            Analysis · {result.output_language}
          </p>
          <p className=”mt-2 text-sm leading-6 text-slate-700”>{result.explanation}</p>
        </div>
      )}

      {result.red_flags.length > 0 && (
        <div className=”mt-4 flex flex-wrap gap-2”>
          {result.red_flags.map((flag) => (
            <span key={flag} className=”rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-500”>
              {flag}
            </span>
          ))}
        </div>
      )}

      {result.actions.length > 0 && (
        <div className=”mt-5 grid gap-3 sm:grid-cols-2”>
          {result.actions.map((step) => (
            <div key={step} className=”rounded-2xl bg-white p-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100”>
              {step}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function TrendingScamCard() {
  return (
    <article className="social-card overflow-hidden rounded-[32px]">
      <div className="bg-gradient-to-br from-pink-50 via-white to-sky-50 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-black text-rose-500 shadow-sm">
              🔥 Trending in your community
            </div>
            <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">Trending Scam Today</h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white shadow-sm">
              THIS IS A SCAM
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-rose-600 shadow-sm">
              Risk: {TRENDING_POST.risk}
            </span>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-300 to-sky-300 font-black text-white shadow-sm">
            {TRENDING_POST.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-slate-950">{TRENDING_POST.user}</p>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-500 shadow-sm">just now</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{TRENDING_POST.story}</p>

            <div className="mt-4 rounded-[26px] border border-rose-100 bg-white/85 p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-400">Scam message</p>
              <p className="mt-2 text-[15px] leading-7 text-slate-800">“{TRENDING_POST.message}”</p>
            </div>

            <p className="mt-3 rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
              {TRENDING_POST.reactionLine}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-white px-5 py-4 text-sm font-bold text-slate-500 sm:px-6">
        <span className="rounded-full bg-rose-50 px-3 py-2 text-xs font-black text-rose-500">{TRENDING_POST.tag}</span>
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
  )
}

function RecentActivity() {
  return (
    <section className="soft-card rounded-[28px] p-5">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-sky-500" />
        <h2 className="text-lg font-black text-slate-950">Recent Activity</h2>
      </div>
      <div className="mt-5 space-y-3">
        {ACTIVITY.map(({ title, level, tone, icon: Icon }) => (
          <div key={title} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`rounded-full p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm font-bold text-slate-700">{title}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>{level}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const [message, setMessage] = useState(SAMPLE_MESSAGE)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const currentMessage = useRef(message)
  currentMessage.current = message

  // Re-analyze when user switches language in the header selector
  useEffect(() => {
    function onLanguageChange() {
      if (result) void runAnalyze(currentMessage.current)
    }
    window.addEventListener("tl-language-change", onLanguageChange)
    return () => window.removeEventListener("tl-language-change", onLanguageChange)
  }, [result])

  async function runAnalyze(text: string) {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: getStoredLanguage() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Analysis failed")
      setResult(data as AnalyzeResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setAnalyzing(false)
    }
  }

  function simulate() {
    setMessage(SAMPLE_MESSAGE)
    void runAnalyze(SAMPLE_MESSAGE)
  }

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
            Paste a suspicious message, get a plain-language risk read, and share patterns with the people who need the warning most.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">multilingual support</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">community alerts</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">forwarding active</span>
          </div>
        </div>
        <ProtectionStatus />
      </section>

      <section id="analyze" className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="soft-card rounded-[32px] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">Quick Check</h2>
              <p className="mt-1 text-sm text-slate-500">Paste any text, email, DM, or call script.</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-500">
              <Search className="h-5 w-5" />
            </div>
          </div>
          <textarea
            value={message}
            onChange={(event) => {
              setMessage(event.target.value)
              setResult(null)
              setError(null)
            }}
            rows={7}
            placeholder="Paste a suspicious message here..."
            className="mt-5 w-full resize-none rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-sky-200 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => void runAnalyze(message)}
            disabled={analyzing || !message.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-sky-500 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>
          {error && (
            <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>
          )}
        </div>

        {result ? (
          <ScamAlertCard result={result} />
        ) : (
          <div className="soft-card flex min-h-80 items-center justify-center rounded-[32px] p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-50 text-sky-500">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-950">Ready when you are</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {analyzing ? "Analyzing your message..." : "Paste a message and click Analyze."}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <TrendingScamCard />
        <RecentActivity />
      </section>

      <FloatingActionButton onSimulate={simulate} />
    </main>
  )
}
