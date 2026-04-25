"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react"

const STORAGE_KEY = "trustlayer_demo_user"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("demo@trustlayer.app")
  const [password, setPassword] = useState("password")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const demoUser = {
      name: "Demo User",
      email: email.trim() || "demo@trustlayer.app",
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser))
    window.dispatchEvent(new Event("trustlayer-demo-auth"))
    router.push("/")
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl items-center justify-center px-4 py-12">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="px-2 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-sky-600 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            TrustLayer demo
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Scam protection that feels simple enough to trust.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 lg:text-lg">
            This mock login keeps the judge flow realistic without adding auth, databases, or extra setup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="soft-card rounded-[28px] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-pink-300 text-sm font-black text-white shadow-sm">
              TL
            </div>
            <div>
              <p className="text-sm font-black text-slate-950">TrustLayer</p>
              <p className="text-xs font-semibold text-slate-500">Demo-only access</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Demo login for scam protection</p>
          </div>

          <label className="mt-7 block">
            <span className="text-sm font-bold text-slate-700">Email</span>
            <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-sky-300">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </span>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Password</span>
            <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-sky-300">
              <LockKeyhole className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                placeholder="Enter anything"
                autoComplete="current-password"
              />
            </span>
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]"
          >
            Continue
          </button>

          <p className="mt-4 text-center text-xs font-semibold leading-5 text-slate-500">
            Demo only. No backend validation, no Supabase, no Clerk.
          </p>
        </form>
      </section>
    </main>
  )
}
