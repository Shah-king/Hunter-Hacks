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
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-sky-600 shadow-sm ring-1 ring-sky-100">
          <ShieldCheck className="h-3.5 w-3.5" />
          friendly setup
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Connect your inbox without the stress.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
            We give you a forwarding address. You forward suspicious mail. TrustLayer explains what is risky in plain language.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Create address"],
            ["2", "Forward mail"],
            ["3", "Feel safer"],
          ].map(([step, label]) => (
            <div key={step} className="social-card rounded-3xl p-4">
              <p className="text-3xl font-black text-sky-500">{step}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {!result ? (
        <section className="soft-card rounded-[34px] p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="rounded-3xl bg-sky-50 p-3 text-sky-500">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">Email protection setup</h2>
              <p className="mt-1 text-sm text-slate-500">Use a real address so alerts can be routed back to you.</p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Your email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner transition focus:border-sky-200 focus:bg-white focus:outline-none"
                onKeyDown={(event) => event.key === "Enter" && signup()}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                <Languages className="h-3.5 w-3.5" />
                Alert language
              </div>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code)}
                    className={`rounded-full border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
                      language === item.code
                        ? "border-sky-200 bg-sky-50 text-sky-600"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-3xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={signup}
              disabled={loading || !email.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-sky-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? "Setting up..." : "Get forwarding address"}
            </button>
          </div>
        </section>
      ) : (
        <section className="soft-card rounded-[34px] p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-emerald-50 p-3 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">You&apos;re protected</h2>
              <p className="text-sm text-slate-500">Your forwarding address is ready.</p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-slate-50 px-4 py-4 font-mono text-sm text-sky-700 break-all shadow-inner">
            {result.forwarding_address}
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Setup instructions</p>
            {[
              "Open Gmail or Outlook forwarding settings.",
              `Add this forwarding address: ${result.forwarding_address}`,
              "Confirm the provider verification email.",
              "Forward suspicious mail or create a filter.",
              "Return to the dashboard to watch TrustLayer analyze new emails.",
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-3xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-sky-600">
                  {index + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <Link href="/" className="mt-6 flex w-full items-center justify-center gap-2 rounded-[22px] bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-200 transition hover:-translate-y-0.5">
            Go to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </main>
  )
}
