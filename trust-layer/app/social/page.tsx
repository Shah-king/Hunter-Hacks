"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Flame, Heart, MessageCircle, PlayCircle, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react"
import FloatingActionButton from "../components/FloatingActionButton"

type SocialPostData = {
  id: string
  user: string
  initials: string
  points: number
  tag: string
  risk: "High" | "Medium" | "Low"
  color: string
  story: string
  message: string
  reaction: string
  time: string
  trending?: boolean
  media?: {
    type: "image" | "video"
    src: string
    alt: string
  }
  reactions: {
    got: number
    confirmed: number
    love: number
  }
}

const POSTS: SocialPostData[] = [
  {
    id: "p1",
    user: "Maya from Queens",
    initials: "MQ",
    points: 328,
    tag: "IRS Scam",
    risk: "High",
    color: "from-pink-300 to-sky-300",
    story: "Almost had a heart attack reading this 😭 thought I was going to jail for taxes",
    message:
      "Final notice: your tax case will be sent to federal court unless you pay today with gift cards.",
    reaction: "Why is the IRS asking for Apple gift cards 💀",
    time: "just now",
    reactions: { got: 44, confirmed: 72, love: 130 },
  },
  {
    id: "p5",
    user: "Kevin (Software Engineer)",
    initials: "KV",
    points: 391,
    tag: "Phishing",
    risk: "High",
    color: "from-sky-300 to-violet-300",
    story: "Got this message during standup meeting 😭",
    message: "Urgent: your account will be locked unless you verify now.",
    reaction: "Bro I haven’t even pushed my code yet 💀",
    time: "8 min ago",
    trending: true,
    media: {
      type: "image",
      src: "/social/confused-programmer.svg",
      alt: "Meme-style illustration of a confused programmer seeing an urgent scam message",
    },
    reactions: { got: 58, confirmed: 86, love: 171 },
  },
  {
    id: "p2",
    user: "Lina in Flushing",
    initials: "林",
    points: 412,
    tag: "Embassy Scam",
    risk: "High",
    color: "from-rose-200 to-amber-200",
    story: "我妈差点信了这个，还让我帮她转钱 😭",
    message: "您好，这里是中国大使馆，您的身份信息涉及案件，请立即配合调查。",
    reaction: "大使馆什么时候用微信联系了？？？",
    time: "12 min ago",
    trending: true,
    media: {
      type: "image",
      src: "/social/flushing-reaction.svg",
      alt: "Meme-style shocked reaction image for a Chinese embassy scam warning",
    },
    reactions: { got: 63, confirmed: 91, love: 144 },
  },
  {
    id: "p3",
    user: "Anika",
    initials: "AN",
    points: 247,
    tag: "Job Scam",
    risk: "High",
    color: "from-violet-200 to-pink-200",
    story: "The job sounded cute until they asked for my routing number before the interview.",
    message: "Remote assistant role. $85/hr. Send SSN and bank details today to reserve your position.",
    reaction: "No interview, just vibes and identity theft.",
    time: "28 min ago",
    reactions: { got: 24, confirmed: 41, love: 88 },
  },
  {
    id: "p6",
    user: "Nora",
    initials: "NO",
    points: 289,
    tag: "Delivery Scam",
    risk: "Medium",
    color: "from-amber-200 to-pink-200",
    story: "The fake delivery text arrived 2 minutes after I ordered noodles. Suspicious timing.",
    message: "Package delivery failed. Pay $1.99 redelivery fee at parcel-help-fast.example.",
    reaction: "The package was still at the restaurant, bestie.",
    time: "35 min ago",
    trending: true,
    media: {
      type: "video",
      src: "/social/delivery-video.svg",
      alt: "Fake video preview thumbnail about a delivery scam text",
    },
    reactions: { got: 31, confirmed: 57, love: 103 },
  },
  {
    id: "p4",
    user: "Luis",
    initials: "LU",
    points: 193,
    tag: "Bank Phishing",
    risk: "Medium",
    color: "from-emerald-200 to-sky-200",
    story: "Looked official for 0.5 seconds, then I saw the weird URL.",
    message: "Your account is frozen. Verify at wells-farg0-secure-login.example within 24 hours.",
    reaction: "The zero in Fargo was doing too much.",
    time: "41 min ago",
    reactions: { got: 17, confirmed: 36, love: 52 },
  },
]

function SocialPost({ post }: { post: SocialPostData }) {
  const [reaction, setReaction] = useState<"got" | "confirmed" | "love" | null>(null)
  const [counts, setCounts] = useState(post.reactions)

  function react(type: keyof typeof counts) {
    if (reaction) return
    setReaction(type)
    setCounts((current) => ({ ...current, [type]: current[type] + 1 }))
  }

  return (
    <article className={`social-card overflow-hidden rounded-[34px] ${post.trending ? "border-rose-100 bg-gradient-to-br from-white to-rose-50/50" : ""}`}>
      <div className="p-5">
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
          <div className="flex flex-col items-end gap-2">
            {post.trending ? (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-500">
                🔥 Trending
              </span>
            ) : null}
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-500">
              {post.tag}
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">
              Risk: {post.risk}
            </span>
          </div>
        </div>

        <p className="mt-5 text-[15px] font-semibold leading-7 text-slate-700">{post.story}</p>

        <div className="mt-4 rounded-[26px] border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Scam message</p>
          <p className="mt-2 text-[15px] leading-7 text-slate-800">“{post.message}”</p>
        </div>

        <p className="mt-3 rounded-3xl bg-gradient-to-br from-sky-50 to-pink-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
          {post.reaction}
        </p>

        {post.media ? (
          <div className="relative mt-4 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
            <Image
              src={post.media.src}
              alt={post.media.alt}
              width={960}
              height={540}
              className="h-auto w-full object-cover"
            />
            {post.media.type === "video" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/10">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-sm backdrop-blur">
                  <PlayCircle className="h-8 w-8" />
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-5 py-4">
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
              A community feed for patterns, warnings, and reassurance. Friendly enough to share, useful enough to act on.
            </p>
          </div>
          <Link href="/#analyze" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5">
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

        <aside className="h-fit rounded-[30px] border border-slate-200 bg-white/85 p-5 shadow-sm">
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
