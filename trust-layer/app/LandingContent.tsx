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
import { useT } from "@/app/components/useT"

export default function LandingContent() {
  const router = useRouter()
  const { t } = useT()

  const communityComments = [
    { text: "我妈差点信了这个 😭", className: "ml-auto" },
    { text: "Why is the IRS asking for gift cards 💀", className: "ml-0" },
    { text: "Esto parece súper falso 😂", className: "ml-8" },
    { text: "এটা তো পুরো স্ক্যাম 😭", className: "ml-auto mr-5" },
    { text: "Sa a pa fè sans ditou 💀", className: "ml-3" },
  ]

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
      <section className="mt-8 rounded-[28px] border border-pink-200/60 bg-[linear-gradient(135deg,#fff7ed,#fdf2f8,#eff6ff)] p-8 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-pink-500 shadow-sm">
              <Users className="h-3.5 w-3.5" />
              💬 {t("community_powered")}
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {t("community_headline")}
            </h2>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">
              {t("community_desc")}
            </p>
            <button
              onClick={() => router.push("/social")}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-[0_8px_20px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95"
            >
              {t("explore_trustwall")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold text-slate-400">{t("what_people_saying")}</p>
            <div className="space-y-2">
              {communityComments.map((comment) => (
                <div
                  key={comment.text}
                  className={`max-w-[240px] rounded-[18px] bg-white px-3.5 py-2.5 text-sm font-semibold leading-[1.4] text-slate-700 shadow-[0_4px_10px_rgba(0,0,0,0.04)] ${comment.className}`}
                >
                  {comment.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
