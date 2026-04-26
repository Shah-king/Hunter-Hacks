"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Flame, ShieldCheck, Sparkles } from "lucide-react"
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
  emotionalContext: string
  explanation: string
  seenCount: string
  location: string
  time: string
  trending?: boolean
  memeImage?: {
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
    emotionalContext: "Would your parents pause before paying this?",
    explanation: "🚨 This is a scam because it creates urgency and asks for gift cards",
    seenCount: "2,134 people saw this this week",
    location: "Seen in Queens / NYC",
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
    story: "Got this message during standup 😭",
    message: "Your account will be locked unless you verify immediately.",
    reaction: "I haven’t even finished my Jira ticket 💀",
    emotionalContext: "Easy to click when you are rushing between meetings.",
    explanation: "🚨 This is a scam because it threatens account loss and pushes instant verification",
    seenCount: "1,482 people saw this this week",
    location: "Seen in NYC tech chats",
    time: "8 min ago",
    trending: true,
    memeImage: {
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
    emotionalContext: "My mom almost fell for this",
    explanation: "🚨 This is a scam because it uses fear, authority, and pressure to make people send money",
    seenCount: "3,029 people saw this this week",
    location: "Seen in Flushing / NYC",
    time: "12 min ago",
    trending: true,
    memeImage: {
      src: "/social/panda-scam-warning.svg",
      alt: "Panda meme image with Chinese text warning people not to trust online scams",
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
    emotionalContext: "Students and new immigrants get targeted with posts like this a lot.",
    explanation: "🚨 This is a scam because it asks for SSN and bank details before any real interview",
    seenCount: "986 people saw this this week",
    location: "Seen in campus groups",
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
    emotionalContext: "Would your family notice the fake delivery link?",
    explanation: "🚨 This is suspicious because it uses a tiny fee to get payment details",
    seenCount: "1,207 people saw this this week",
    location: "Seen across NYC",
    time: "35 min ago",
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
    emotionalContext: "This one looks official until you slow down and read the URL.",
    explanation: "🚨 This is a scam because the link impersonates a bank with a fake domain",
    seenCount: "743 people saw this this week",
    location: "Seen in Brooklyn",
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
    <article className={`overflow-hidden rounded-[20px] bg-white shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.07)] ${post.trending ? "ring-1 ring-pink-100" : ""}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${post.color} text-sm font-black text-white shadow-sm`}>
              {post.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-slate-950">{post.user}</p>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
                  {post.points} pts
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-400">{post.time}</p>
              <p className="mt-1 max-w-[19rem] text-xs font-medium leading-5 text-slate-500">
                👀 {post.seenCount} · {post.location}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {post.trending ? (
              <span className="rounded-full bg-gradient-to-r from-pink-100 via-purple-100 to-sky-100 px-2.5 py-1 text-[11px] font-bold text-rose-500">
                🔥 Trending
              </span>
            ) : null}
            <span className="rounded-full bg-gradient-to-r from-pink-50 to-sky-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
              {post.tag}
            </span>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-500">
              Risk: {post.risk}
            </span>
          </div>
        </div>

        <p className="mt-5 text-[15px] font-bold leading-6 text-slate-800">{post.story}</p>
        <p className="mt-1.5 text-sm font-medium leading-5 text-slate-500">{post.emotionalContext}</p>

        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Scam message</p>
          <p className="mt-2 text-[14px] leading-6 text-slate-800">“{post.message}”</p>
        </div>

        <p className="mt-3 max-w-xl rounded-2xl bg-gradient-to-br from-pink-50 to-sky-50 px-4 py-3 text-sm font-medium leading-5 text-slate-600">
          {post.reaction}
        </p>

        <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold leading-5 text-rose-700">
          {post.explanation}
        </p>

        {post.memeImage ? (
          <div className="mt-4 max-w-xl rounded-[18px] bg-white p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
            <p className="mb-2 px-1 text-xs font-semibold text-slate-500">💬 Common reaction in community</p>
            <Image
              src={post.memeImage.src}
              alt={post.memeImage.alt}
              width={960}
              height={540}
              className="h-auto w-full rounded-2xl object-cover"
            />
            <p className="mt-2 px-1 text-xs font-medium leading-5 text-slate-500">
              This scam format has been reported multiple times
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex max-w-2xl flex-wrap gap-2 px-4 pb-4 sm:px-5">
        <button
          type="button"
          onClick={() => react("love")}
          disabled={!!reaction}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
            reaction === "love" ? "bg-pink-100 text-pink-600" : "bg-slate-50 text-slate-500 hover:bg-pink-50 hover:text-pink-600"
          }`}
        >
          ❤️ Helpful {counts.love}
        </button>
        <button
          type="button"
          onClick={() => react("got")}
          disabled={!!reaction}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
            reaction === "got" ? "bg-sky-100 text-sky-600" : "bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
          }`}
        >
          🙋 I got this too {counts.got}
        </button>
        <button
          type="button"
          onClick={() => react("confirmed")}
          disabled={!!reaction}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
            reaction === "confirmed" ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          }`}
        >
          ⚠️ Scam confirmed {counts.confirmed}
        </button>
      </div>
    </article>
  )
}

export default function SocialPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[24px] bg-gradient-to-br from-pink-50 via-white to-sky-50 p-6 shadow-[0_4px_12px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-sky-600 shadow-sm">
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
          <Link href="/#analyze" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5">
            <ShieldCheck className="h-4 w-4" />
            Check a message
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-5">
          {POSTS.map((post) => (
            <SocialPost key={post.id} post={post} />
          ))}
        </div>

        <aside className="h-fit rounded-[20px] bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-400" />
            <p className="font-bold text-slate-950">Community pulse</p>
          </div>
          <div className="mt-4 space-y-2.5">
            {[
              ["183", "people warned today"],
              ["41", "confirmed scams"],
              ["5", "languages supported"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xl font-black text-slate-950">{value}</p>
                <p className="text-xs font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-gradient-to-br from-pink-50 to-sky-50 p-4 text-sm leading-6 text-slate-600">
            When one person shares a scam, everyone else gets a little safer.
          </p>
        </aside>
      </section>

      <FloatingActionButton />
    </main>
  )
}
