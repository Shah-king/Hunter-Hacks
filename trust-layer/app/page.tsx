"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
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

const DEMO_FORWARDING_ADDRESS = "demo@parse.trustlayer.store"

function ProtectionStatus() {
  const rows = [
    ["Email connected", "Ready", CheckCircle2, "text-emerald-600 bg-emerald-50"],
    ["Monitoring active", "Live", ShieldCheck, "text-sky-600 bg-sky-50"],
    ["1 suspicious message today", "Watch", AlertTriangle, "text-amber-700 bg-amber-50"],
  ] as const

  return (
    <section className="soft-card rounded-[28px] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">Protection Status</h2>
          <p className="mt-1 text-sm text-slate-500">Mock demo mode, no account required.</p>
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
          <code className="break-all text-sm font-black text-slate-800">{DEMO_FORWARDING_ADDRESS}</code>
          <Link href="/signup" className="shrink-0 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:-translate-y-0.5">
            Setup forwarding
          </Link>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Forward suspicious emails here during the demo and TrustLayer shows the analysis in the dashboard flow.
        </p>
      </div>
    </section>
  )
}

function ScamAlertCard({ message }: { message: string }) {
  return (
    <section className="soft-card rounded-[28px] border-rose-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">Scam Alert</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">High risk detected</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This message uses urgency, legal threats, and gift card payment. Real agencies do not ask for gift cards.
          </p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-rose-100 to-pink-50 px-4 py-3 text-center text-rose-600">
          <p className="text-3xl font-black">92%</p>
          <p className="text-xs font-black">confidence</p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Checked message</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">“{message || SAMPLE_MESSAGE}”</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {["Do not respond", "Do not click links", "Do not send money", "Ask someone you trust"].map((step) => (
          <div key={step} className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100">
            {step}
          </div>
        ))}
      </div>
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
  const [showResult, setShowResult] = useState(true)

  function analyze() {
    setAnalyzing(true)
    window.setTimeout(() => {
      setShowResult(true)
      setAnalyzing(false)
    }, 450)
  }

  function simulate() {
    setMessage(SAMPLE_MESSAGE)
    analyze()
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
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">no login needed</span>
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
              setShowResult(false)
            }}
            rows={7}
            placeholder="Paste a suspicious message here..."
            className="mt-5 w-full resize-none rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-sky-200 focus:bg-white"
          />
          <button
            type="button"
            onClick={analyze}
            disabled={analyzing || !message.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-sky-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {showResult ? (
          <ScamAlertCard message={message} />
        ) : (
          <div className="soft-card flex min-h-80 items-center justify-center rounded-[32px] p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-50 text-sky-500">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-950">Ready when you are</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Run the check to see a premium scam alert card.</p>
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
