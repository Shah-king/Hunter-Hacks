"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ShieldCheck, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleAuth(action: "login" | "signup", e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (action === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        // Because we aren't confirming email for hackathon speed, we can just log them in
        router.push("/")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push("/")
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3">
            <ShieldCheck className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome to TrustLayer</h2>
          <p className="text-sm text-gray-400">Sign in or create an account to continue</p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={(e) => handleAuth("login", e)}
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
            </button>
            <button
              onClick={(e) => handleAuth("signup", e)}
              disabled={loading}
              className="flex w-full justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
