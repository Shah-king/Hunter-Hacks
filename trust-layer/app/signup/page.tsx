"use client"

import { useState } from "react"

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文 (Chinese)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "ht", label: "Kreyòl (Haitian Creole)" },
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← Dashboard</a>
        <div className="w-px h-5 bg-gray-700" />
        <h1 className="text-lg font-bold">Connect Your Email</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12 w-full space-y-8">
        {!result ? (
          <>
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">🛡️</div>
              <h2 className="text-2xl font-bold">Get Protected</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                TrustLayer monitors your email for scams automatically.<br />
                We&apos;ll give you a forwarding address — add it as an auto-forward rule in Gmail or Outlook.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-2">Your Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && signup()}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-2">Alert Language</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        language === l.code
                          ? "border-purple-500 bg-purple-500/10 text-purple-300"
                          : "border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">{error}</p>}

              <button
                onClick={signup}
                disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all"
              >
                {loading ? "Setting up..." : "Get My Forwarding Address →"}
              </button>
            </div>
          </>
        ) : (
          <div className="bg-gray-900 border border-green-800 rounded-2xl p-8 space-y-6 text-center">
            <div className="text-5xl">✅</div>
            <div>
              <h2 className="text-xl font-bold text-green-400 mb-2">You&apos;re Protected!</h2>
              <p className="text-gray-400 text-sm">Your TrustLayer forwarding address:</p>
              <div className="mt-3 bg-gray-800 rounded-xl px-4 py-3 font-mono text-blue-300 text-sm break-all">
                {result.forwarding_address}
              </div>
            </div>
            <div className="text-left space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Setup Instructions</p>
              {[
                "Open Gmail → Settings → See all settings → Forwarding and POP/IMAP",
                `Click "Add a forwarding address" → Enter: ${result.forwarding_address}`,
                "Confirm the verification email from Google",
                "Set to forward all mail (or create a filter for suspicious emails)",
                "TrustLayer will now monitor every email you receive",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <a href="/" className="block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-center transition-all">
              Go to Dashboard →
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
