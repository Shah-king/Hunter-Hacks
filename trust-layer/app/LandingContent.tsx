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
import { useLanguage } from "@/lib/i18n"

export default function LandingContent() {
  const router = useRouter()
  const { t } = useLanguage()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 sm:py-24">
        <div className="mb-8 inline-flex items-center justify-center rounded-2xl bg-sky-100 p-4 text-sky-600 shadow-sm ring-1 ring-sky-200">
          <ShieldCheck className="h-12 w-12" />
        </div>
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
          {t("hero_headline")}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl font-medium">
          {t("hero_subtitle")}
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <button
            onClick={() => router.push("/login")}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-base font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-slate-800 active:scale-95"
          >
            {t("get_started")}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => router.push("/social")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-black text-slate-700 shadow-sm transition hover:-translate-y-1 hover:bg-slate-50 active:scale-95"
          >
            {t("explore_community")}
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-8 py-16 sm:grid-cols-3">
        {[
          {
            title: t("feature_forwarding_title"),
            desc: t("feature_forwarding_desc"),
            icon: Zap,
            color: "text-amber-600 bg-amber-50",
          },
          {
            title: t("feature_ai_title"),
            desc: t("feature_ai_desc"),
            icon: MessageSquareWarning,
            color: "text-rose-600 bg-rose-50",
          },
          {
            title: t("feature_native_title"),
            desc: t("feature_native_desc"),
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
      <section className="mt-16 rounded-[40px] bg-slate-950 p-8 sm:p-16 text-white overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-sky-400 ring-1 ring-white/20">
            <Users className="h-3.5 w-3.5" />
            {t("community_powered")}
          </div>
          <h2 className="mt-8 text-4xl font-black tracking-tight sm:text-5xl">
            {t("community_headline")}
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300 font-medium">
            {t("community_desc")}
          </p>
          <div className="mt-10">
            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl bg-white px-8 py-4 text-base font-black text-slate-950 transition hover:bg-slate-100 active:scale-95"
            >
              {t("explore_trustwall")}
            </button>
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px]" />
      </section>
    </main>
  )
}
