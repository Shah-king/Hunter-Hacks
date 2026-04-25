"use client"

import { useState } from "react"
import Link from "next/link"
import { Flame, Heart, MessageCircle, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react"
import FloatingActionButton from "../components/FloatingActionButton"

const POSTS = [
  {
    id: "p1",
    user: "Anika",
    initials: "AN",
    points: 247,
    tag: "Job Scam",
    color: "from-pink-200 to-sky-200",
    message:
      "Remote assistant job offered $85/hr and asked for my bank routing number before an interview.",
    time: "8 min ago",
    reactions: { got: 24, confirmed: 41, love: 88 },
  },
  {
    id: "p2",
    user: "Luis",
    initials: "LU",
    points: 193,
    tag: "Bank Phishing",
    color: "from-emerald-200 to-sky-200",
    message:
      "Text said my account was frozen and linked to a site that looked like Wells Fargo but had a zero in the URL.",
    time: "21 min ago",
    reactions: { got: 17, confirmed: 36, love: 52 },
  },
  {
    id: "p3",
    user: "Mei",
    initials: "MX",
    points: 318,
    tag: "Immigration Threat",
    color: "from-violet-200 to-pink-200",
    message:
      "Caller said they were from immigration and wanted payment by Zelle today. They knew my first name.",
    time: "43 min ago",
    reactions: { got: 31, confirmed: 58, love: 101 },
  },
  {
    id: "p4",
    user: "Samira",
    initials: "SA",
    points: 156,
    tag: "IRS Scam",
    color: "from-amber-200 to-rose-200",
    message:
      "Email threatened federal court unless I bought gift cards. Sharing so other students know the pattern.",
    time: "1 hr ago",
    reactions: { got: 44, confirmed: 72, love: 130 },
  },
]

function SocialPost({ post }: { post: (typeof POSTS)[number] }) {
  const [reaction, setReaction] = useState<"got" | "confirmed" | "love" | null>(null)
  const [counts, setCounts] = useState(post.reactions)

  function react(type: keyof typeof counts) {
    if (reaction) return
    setReaction(type)
    setCounts((current) => ({ ...current, [type]: current[type] + 1 }))
  }

  return (
    <article className="social-card rounded-[34px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${post.color} text-sm font-black text-white shadow-sm`}>
            {post.initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-black text-slate-950">{post.user}</p>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-600">
                {post.points} pts
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-400">{post.time}</p>
          </div>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-500">
          {post.tag}
        </span>
      </div>

      <p className="mt-5 rounded-[26px] bg-slate-50 p-4 text-[15px] leading-7 text-slate-700">
        {post.message}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => react("got")}
          disabled={!!reaction}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black transition active:scale-95 ${
            reaction === "got" ? "bg-sky-100 text-sky-600" : "bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          I got this too {counts.got}
        </button>
        <button
          type="button"
          onClick={() => react("confirmed")}
          disabled={!!reaction}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black transition active:scale-95 ${
            reaction === "confirmed" ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          }`}
        >
          <TriangleAlert className="h-3.5 w-3.5" />
          Scam confirmed {counts.confirmed}
        </button>
        <button
          type="button"
          onClick={() => react("love")}
          disabled={!!reaction}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black transition active:scale-95 ${
            reaction === "love" ? "bg-pink-100 text-pink-600" : "bg-slate-50 text-slate-500 hover:bg-pink-50 hover:text-pink-600"
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          Helpful {counts.love}
        </button>
      </div>
    </article>
  )
}

export default function SocialPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="soft-card rounded-[34px] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-600">
              <Sparkles className="h-3.5 w-3.5" />
              TrustWall social feed
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Scams people are seeing right now
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              A community feed for patterns, screenshots, warnings, and reassurance. Friendly enough to share, useful enough to act on.
            </p>
          </div>
          <Link href="/#analyze" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5">
            <ShieldCheck className="h-4 w-4" />
            Check a message
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {POSTS.map((post) => (
            <SocialPost key={post.id} post={post} />
          ))}
        </div>

        <aside className="h-fit rounded-[30px] border border-slate-200 bg-white/85 p-5 shadow-lg shadow-slate-200/60">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-400" />
            <p className="font-black text-slate-950">Community pulse</p>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ["183", "people warned today"],
              ["41", "confirmed scams"],
              ["5", "languages supported"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl bg-slate-50 p-4">
                <p className="text-2xl font-black text-slate-950">{value}</p>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-3xl bg-gradient-to-br from-sky-50 to-pink-50 p-4 text-sm leading-6 text-slate-600">
            When one person shares a scam, everyone else gets a little safer.
          </p>
        </aside>
      </section>

      <FloatingActionButton />
    </main>
  )
}
