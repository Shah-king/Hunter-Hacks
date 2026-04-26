"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Inbox,
  Loader2,
  MailWarning,
  ShieldCheck,
  Activity,
  Search,
  Copy,
} from "lucide-react"
import type { EmailWithAnalysis, User, AnalysisResult, RiskLevel } from "@/lib/types"
import { getStoredLanguage } from "@/app/components/LanguageSelect"
import { useT } from "@/app/components/useT"

const SAMPLE_MESSAGE =
  "Final notice: your tax case will be sent to federal court unless you pay today with gift cards."

function ProtectionStatus({ user, totalScanned }: { user: User; totalScanned: number }) {
  const [copied, setCopied] = useState(false)
  const { t } = useT()
  
  const rows = [
    [
      t("email_connected"), 
      user.forwarding_address ? t("ready") : "...", 
      CheckCircle2, 
      "text-emerald-600 bg-emerald-50"
    ],
    [
      t("monitoring_active"), 
      t("live"), 
      ShieldCheck, 
      "text-sky-600 bg-sky-50"
    ],
    [
      t("protection_on"), 
      totalScanned > 0 ? t("active") : t("ready"), 
      AlertTriangle, 
      "text-amber-700 bg-amber-50"
    ],
  ] as const

  async function copyForwardingAddress() {
    await navigator.clipboard.writeText(user.forwarding_address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <section className="soft-card rounded-[28px] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">{t("protection_status")}</h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            {totalScanned > 0 ? t("protection_active_desc") : "Waiting for your first email forwarding..."}
          </p>
        </div>
        <div className="relative">
          <div className="rounded-2xl bg-sky-50 p-3 text-sky-500 shadow-inner">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map(([label, value, Icon, tone], idx) => (
          <div key={idx} className="flex items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-3 border border-slate-100/50">
            <div className="flex items-center gap-3">
              <span className={`rounded-full p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-slate-700">{label}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 shadow-inner">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-500">{t("your_forwarding")}</p>
        <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm border border-sky-100 sm:flex-row sm:items-center sm:justify-between">
          <code className="break-all text-xs font-black text-slate-800">{user.forwarding_address}</code>
          <button
            type="button"
            onClick={copyForwardingAddress}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-[10px] font-black text-white transition hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-slate-200"
            aria-label="Copy forwarding address"
          >
            {copied ? <CheckCircle2 className="h-3 w-4" /> : <Copy className="h-3 w-4" />}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </div>
    </section>
  )
}

function ScamAlertCard({ message, analysis }: { message: string; analysis: AnalysisResult }) {
  const { t } = useT()
  const isScam = analysis.risk_level === "scam"
  const tone = isScam
    ? "text-rose-600"
    : analysis.risk_level === "suspicious"
    ? "text-amber-600"
    : "text-emerald-600"
  const bg = isScam
    ? "from-rose-100 to-pink-50"
    : analysis.risk_level === "suspicious"
    ? "from-amber-100 to-yellow-50"
    : "from-emerald-100 to-teal-50"
  const border = isScam ? "border-rose-100 shadow-rose-100/20" : analysis.risk_level === "suspicious" ? "border-amber-100 shadow-amber-100/20" : "border-emerald-100 shadow-emerald-100/20"
  const riskLabel = isScam ? t("risk_scam_label") : analysis.risk_level === "suspicious" ? t("risk_watch_label") : t("risk_safe_label")

  return (
    <section className={`soft-card rounded-[28px] p-6 shadow-xl border ${border} bg-white`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${tone}`}>{analysis.scam_type}</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {riskLabel} {t("risk_detected")}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 font-medium">{analysis.explanation}</p>
        </div>
        <div className={`rounded-3xl bg-gradient-to-br px-4 py-3 text-center border ${border} ${tone} ${bg} shadow-inner`}>
          <p className="text-3xl font-black">{analysis.final_score}%</p>
          <p className="text-[10px] font-black uppercase tracking-wider">{t("risk_score")}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-50 p-4 border border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{t("checked_message")}</p>
        <p className="mt-2 text-sm leading-7 text-slate-700 font-medium italic">&quot;{message || SAMPLE_MESSAGE}&quot;</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {analysis.actions.slice(0, 4).map((step) => (
          <div
            key={step}
            className="rounded-2xl bg-white p-4 text-xs font-black text-slate-700 shadow-sm border border-slate-100 flex items-center gap-3"
          >
            <div className={`h-2 w-2 rounded-full shrink-0 ${isScam ? "bg-rose-400" : "bg-sky-400"}`} />
            {step}
          </div>
        ))}
      </div>
    </section>
  )
}

const RISK_STYLES: Record<RiskLevel, {
  pill: string;
  dot: string;
  bg: string;
  border: string;
  text: string;
}> = {
  scam: {
    pill: "bg-rose-50 text-rose-600 border-rose-100",
    dot: "bg-rose-400",
    bg: "from-rose-50 to-white",
    border: "border-rose-100",
    text: "text-rose-600",
  },
  suspicious: {
    pill: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
    bg: "from-amber-50 to-white",
    border: "border-amber-100",
    text: "text-amber-700",
  },
  safe: {
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-400",
    bg: "from-emerald-50 to-white",
    border: "border-emerald-100",
    text: "text-emerald-700",
  },
}

function EmailCard({ item }: { item: EmailWithAnalysis }) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useT()
  const analysis = item.analysis
  const risk = analysis ? RISK_STYLES[analysis.risk_level] : null
  const riskLabel = analysis
    ? analysis.risk_level === "scam"
      ? t("risk_scam_label")
      : analysis.risk_level === "suspicious"
      ? t("risk_watch_label")
      : t("risk_safe_label")
    : null

  return (
    <article className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 ${
      risk ? risk.border : "border-slate-100"
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            risk ? risk.pill : "bg-slate-100 text-slate-400"
          }`}>
            {analysis?.risk_level === "scam" ? (
              <AlertTriangle className="h-6 w-6" />
            ) : analysis?.risk_level === "suspicious" ? (
              <MailWarning className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-black text-slate-900">{item.sender}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                • {new Date(item.received_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <h3 className="truncate text-base font-bold text-slate-700">{item.subject}</h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {risk && riskLabel && (
            <span className={`hidden rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider sm:block ${risk.pill}`}>
              {riskLabel}
            </span>
          )}
          {expanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-50 bg-slate-50/50 p-6">
          {analysis ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t("ai_analysis_label")}</h4>
                  <p className="mt-2 text-sm leading-7 text-slate-700 font-medium">
                    {analysis.explanation}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.red_flags.map((flag, idx) => (
                    <span key={idx} className="rounded-xl bg-white border border-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                      🚩 {flag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t("recommended_steps")}</h4>
                <div className="grid gap-2">
                  {analysis.actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                      <div className="h-2 w-2 rounded-full bg-sky-400" />
                      <span className="text-xs font-black text-slate-700">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
              <span className="ml-3 text-sm font-bold text-slate-500">{t("processing_analysis")}</span>
            </div>
          )}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("original_message")}</h4>
            <div className="mt-2 max-h-40 overflow-y-auto text-sm text-slate-600 leading-6 whitespace-pre-wrap font-medium">
              {item.body}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

type Stats = {
  total: number
  fraud: number
  suspicious: number
  alertsSent: number
  languages: string[]
}

type RiskFilter = "all" | RiskLevel

export default function DashboardContent() {
  const router = useRouter()
  const { t } = useT()
  const [user, setUser] = useState<User | null>(null)
  const [emails, setEmails] = useState<EmailWithAnalysis[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, fraud: 0, suspicious: 0, alertsSent: 0, languages: [] })
  const [filter, setFilter] = useState<RiskFilter>("all")
  const [loading, setLoading] = useState(true)

  // Analyze UI State
  const [message, setMessage] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

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
    setLoading(false)
  }, [router])

  useEffect(() => {
    let mounted = true
    async function init() {
      await fetchEmails()
    }
    void init()
    const interval = setInterval(() => {
      if (mounted) void fetchEmails()
    }, 5000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [fetchEmails])

  const analyze = useCallback(async (text?: string) => {
    const messageToAnalyze = text ?? message
    if (!messageToAnalyze.trim()) return
    setAnalyzing(true)
    setAnalysisResult(null)
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customMessage: messageToAnalyze,
          language: getStoredLanguage(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setAnalysisResult(data.analysis)
        fetchEmails()
      }
    } catch {
      // Handle error quietly
    } finally {
      setAnalyzing(false)
    }
  }, [message, fetchEmails])

  // Re-analyze when the user switches language in the header (only if there's a current result)
  useEffect(() => {
    function onLanguageChange() {
      if (analysisResult && message.trim()) {
        void analyze(message)
      }
    }
    window.addEventListener("tl-language-change", onLanguageChange)
    return () => window.removeEventListener("tl-language-change", onLanguageChange)
  }, [analysisResult, message, analyze])

  const filtered = filter === "all" ? emails : emails.filter((e) => e.analysis?.risk_level === filter)

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t("protection_dashboard")}</h1>
          <p className="mt-2 text-sm font-bold text-slate-500">{t("active_for")} {user?.email}</p>
        </div>
      </header>

      {/* Top Section: Quick Check & Status */}
      <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="soft-card rounded-[32px] p-6 border border-slate-100 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">{t("quick_check")}</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{t("quick_check_desc")}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-500 shadow-inner">
              <Search className="h-5 w-5" />
            </div>
          </div>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            placeholder={t("paste_placeholder")}
            className="mt-6 w-full resize-none rounded-[26px] border border-slate-200 bg-slate-50/50 p-5 text-sm leading-7 text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white font-medium"
          />
          <button
            type="button"
            onClick={() => void analyze()}
            disabled={analyzing || !message.trim()}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-[22px] bg-sky-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-sky-100 transition hover:-translate-y-0.5 hover:bg-sky-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {analyzing ? t("analyzing") : t("run_analysis")}
          </button>
        </div>

        {user && <ProtectionStatus user={user} totalScanned={stats.total} />}
      </section>

      {/* Result Section */}
      {analysisResult && (
        <section className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <ScamAlertCard message={message} analysis={analysisResult} />
        </section>
      )}

      {/* Stats Bar */}
      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("total_scanned"), value: stats.total, icon: Inbox, color: "text-slate-600 bg-slate-50" },
          { label: t("scams_caught"), value: stats.fraud, icon: AlertTriangle, color: "text-rose-600 bg-rose-50" },
          { label: t("alerts_sent"), value: stats.alertsSent, icon: Bell, color: "text-sky-600 bg-sky-50" },
          { label: t("languages"), value: stats.languages.length, icon: Activity, color: "text-emerald-600 bg-emerald-50" },
        ].map((stat) => (
          <div key={stat.label} className="soft-card rounded-3xl p-5 border border-slate-100 bg-white">
            <div className="flex items-center justify-between">
              <span className={`rounded-2xl p-2.5 ${stat.color} shadow-inner`}>
                <stat.icon className="h-5 w-5" />
              </span>
              <span className="text-2xl font-black text-slate-950">{stat.value}</span>
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Inbox Feed */}
      <div className="mt-10 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-slate-950 flex items-center gap-3">
              <div className="bg-sky-500 h-6 w-1.5 rounded-full" />
              {t("security_feed")}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("live_monitoring")}
            </div>
          </div>

          <div className="rounded-3xl border border-sky-100 bg-white p-1 shadow-sm flex items-center">
            {(["all", "scam", "suspicious"] as const).map((f) => {
              const filterLabel = f === "all" ? t("filter_all") : f === "scam" ? t("filter_scam") : t("filter_suspicious")
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                    filter === f ? "bg-slate-950 text-white shadow-md" : "text-slate-500 hover:text-slate-950"
                  }`}
                >
                  {filterLabel}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((item) => <EmailCard key={item.id} item={item} />)
          ) : (
            <div className="soft-card rounded-[32px] p-16 text-center border-2 border-dashed border-slate-200 bg-white/50">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[32px] bg-slate-50 text-slate-300 shadow-inner">
                <Inbox className="h-10 w-10" />
              </div>
              <h3 className="mt-8 text-xl font-black text-slate-950 tracking-tight">{t("feed_empty")}</h3>
              <p className="mt-3 text-sm font-bold text-slate-500 max-w-sm mx-auto leading-7">
                {t("feed_empty_desc")}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
