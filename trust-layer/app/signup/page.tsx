"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, CheckCircle2, Languages, Loader2, Mail, ShieldCheck } from "lucide-react"

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "es", label: "Spanish" },
  { code: "bn", label: "Bengali" },
  { code: "ht", label: "Haitian Creole" },
]

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [language, setLanguage] = useState("en")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ forwarding_address: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function signup() {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), language }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? "Signup failed")
      else setResult(data)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
          <ShieldCheck className="h-3.5 w-3.5" />
          Guided setup
        </div>
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Connect your inbox in minutes.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            TrustLayer gives every user a forwarding address. Forward suspicious mail there and the dashboard will score, explain, and alert in your preferred language.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Create address"],
            ["2", "Forward email"],
            ["3", "Get alerts"],
          ].map(([step, label]) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-semibold text-cyan-200">{step}</p>
              <p className="mt-2 text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {!result ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Email protection setup</h2>
              <p className="mt-1 text-sm text-slate-400">Use a real address so alerts can be routed back to you.</p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Your email address</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition focus:border-cyan-300/60 focus:bg-black/30 focus:outline-none"
                onKeyDown={(event) => event.key === "Enter" && signup()}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Languages className="h-3.5 w-3.5" />
                Alert language
              </div>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      language === item.code
                        ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100"
                        : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={signup}
              disabled={loading || !email.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? "Setting up..." : "Get forwarding address"}
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-emerald-300/25 bg-emerald-300/[0.06] p-5 shadow-2xl shadow-black/30 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-emerald-100">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-emerald-100">You are protected</h2>
              <p className="text-sm text-slate-400">Your forwarding address is ready.</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 px-4 py-4 font-mono text-sm text-cyan-100 break-all">
            {result.forwarding_address}
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Setup instructions</p>
            {[
              "Open Gmail or Outlook forwarding settings.",
              `Add this forwarding address: ${result.forwarding_address}`,
              "Confirm the provider verification email.",
              "Forward suspicious mail or create a filter.",
              "Return to the dashboard to watch TrustLayer analyze new emails.",
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-slate-300">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 text-xs font-bold text-cyan-100">
                  {index + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <Link href="/" className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
            Go to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </main>
  )
}
