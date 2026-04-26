"use client"

import { useRouter } from "next/navigation"
import {
  ShieldCheck,
  Zap,
  Globe,
  Users,
  ArrowRight,
  MessageSquareWarning,
} from "lucide-react"

export default function LandingContent() {
  const router = useRouter()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 sm:py-24">
        <div className="mb-8 inline-flex items-center justify-center rounded-2xl bg-sky-100 p-4 text-sky-600 shadow-sm ring-1 ring-sky-200">
          <ShieldCheck className="h-12 w-12" />
        </div>
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
          Catch scams before they reach your family.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl font-medium">
          TrustLayer uses advanced AI to automatically detect, translate, and explain suspicious emails and messages in your native language.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <button
            onClick={() => router.push("/login")}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-base font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-slate-800 active:scale-95"
          >
            Get started for free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => router.push("/social")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-black text-slate-700 shadow-sm transition hover:-translate-y-1 hover:bg-slate-50 active:scale-95"
          >
            Explore community patterns
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-8 py-16 sm:grid-cols-3">
        {[
          {
            title: "Auto-Forwarding",
            desc: "Forward suspicious emails to your unique TrustLayer address. No passwords or inbox access needed.",
            icon: Zap,
            color: "text-amber-600 bg-amber-50",
          },
          {
            title: "AI Analysis",
            desc: "Our AI breaks down red flags, identifies the scam type, and suggests immediate safety steps.",
            icon: MessageSquareWarning,
            color: "text-rose-600 bg-rose-50",
          },
          {
            title: "Native Language",
            desc: "Get explanations and alerts in your native language, making protection accessible for everyone.",
            icon: Globe,
            color: "text-emerald-600 bg-emerald-50",
          },
        ].map((feature) => (
          <div key={feature.title} className="soft-card rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <span className={`inline-flex rounded-2xl p-3 mb-6 ${feature.color}`}>
              <feature.icon className="h-6 w-6" />
            </span>
            <h3 className="text-xl font-black text-slate-950">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 font-medium">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Community Proof */}
      <section className="mt-8 rounded-[28px] border border-pink-200/60 bg-[linear-gradient(135deg,#fff7ed,#fdf2f8,#eff6ff)] p-8 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-pink-500 shadow-sm">
              <Users className="h-3.5 w-3.5" />
              💬 Community powered
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Scam warnings people actually share.
            </h2>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">
              Turn one person&apos;s suspicious message into a warning that protects the whole community.
            </p>
            <button
              onClick={() => router.push("/social")}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-[0_8px_20px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95"
            >
              Explore TrustWall
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="ml-auto max-w-[290px] rounded-[18px] bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
              我妈差点信了这个 😭
            </div>
            <div className="max-w-[310px] rounded-[18px] bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
              Why is the IRS asking for gift cards 💀
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
