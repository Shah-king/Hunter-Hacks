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
    color: "from-[#ec4899] via-[#8b5cf6] to-[#38bdf8]",
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
    color: "from-[#38bdf8] via-[#8b5cf6] to-[#ec4899]",
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
    color: "from-[#ec4899] via-[#8b5cf6] to-[#38bdf8]",
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
    color: "from-[#8b5cf6] to-[#ec4899]",
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
    color: "from-[#ec4899] to-[#38bdf8]",
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
    color: "from-[#38bdf8] to-[#8b5cf6]",
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

const COMMUNITY_COMMENTS = [
  { text: "我妈差点信了这个 😭", className: "ml-0" },
  { text: "Why is the IRS asking for gift cards 💀", className: "ml-auto" },
  { text: "Esto parece súper falso 😂", className: "ml-6" },
  { text: "এটা তো পুরো স্ক্যাম 😭", className: "ml-auto mr-8" },
  { text: "Sa a pa fè sans ditou 💀", className: "ml-2" },
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
    <article className={`overflow-hidden rounded-[20px] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)] ${post.trending ? "ring-1 ring-pink-100" : ""}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${post.color} text-sm font-bold text-white shadow-sm`}>
              {post.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[16px] font-bold leading-tight text-zinc-950">{post.user}</p>
                <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-[#ec4899]">
                  {post.points} pts
                </span>
              </div>
              <p className="mt-1 text-[12px] font-medium leading-[1.4] text-zinc-400">{post.time}</p>
              <p className="mt-1 max-w-[19rem] text-[12px] font-medium leading-[1.4] text-zinc-500">
                👀 {post.seenCount} · {post.location}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {post.trending ? (
              <span className="rounded-full bg-gradient-to-r from-pink-100 via-purple-100 to-sky-100 px-2.5 py-1 text-[11px] font-bold text-[#ec4899]">
                🔥 Trending
              </span>
            ) : null}
            <span className="rounded-full bg-gradient-to-r from-pink-50 to-sky-50 px-2.5 py-1 text-[11px] font-bold text-zinc-600">
              {post.tag}
            </span>
            <span className="rounded-full bg-[#fee2e2] px-2.5 py-1 text-[11px] font-bold text-[#ec4899]">
              Risk: {post.risk}
            </span>
          </div>
        </div>

        <p className="mt-5 text-[15px] font-semibold leading-[1.4] text-zinc-800">{post.story}</p>

        <div className="mt-3 max-w-[520px] rounded-xl bg-zinc-100 p-[10px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">Scam message</p>
          <p className="mt-1.5 text-[14px] leading-[1.4] text-zinc-800">“{post.message}”</p>
        </div>

        <p className="mt-3 max-w-[520px] rounded-xl bg-[#fee2e2] p-[10px] text-[14px] font-semibold leading-[1.4] text-rose-700">
          {post.explanation}
        </p>

        <div className="mt-3 max-w-[520px] rounded-2xl p-3 text-[14px] leading-[1.4]">
          <p className="mb-2 text-[12px] font-medium leading-[1.4] text-zinc-400">💬 What people are saying</p>
          {COMMUNITY_COMMENTS.slice(0, post.memeImage ? 5 : 3).map((comment) => (
            <p
              key={comment.text}
              className={`mb-2 max-w-[240px] rounded-[18px] bg-white px-3.5 py-2.5 text-[14px] leading-[1.4] text-zinc-600 shadow-[0_4px_10px_rgba(0,0,0,0.04)] ${comment.className}`}
            >
              {comment.text}
            </p>
          ))}
        </div>

        {post.memeImage ? (
          <div className="mt-3 max-w-[520px] rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
            <p className="mb-2 px-1 text-[12px] font-medium leading-[1.4] text-zinc-500">💬 Common reaction in community</p>
            <Image
              src={post.memeImage.src}
              alt={post.memeImage.alt}
              width={960}
              height={540}
              className="max-h-[180px] w-full rounded-xl object-cover"
            />
            <p className="mt-2 px-1 text-[12px] font-medium leading-[1.4] text-zinc-500">
              This scam format has been reported multiple times
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex max-w-[520px] flex-wrap gap-2 px-4 pb-4 text-[12px]">
        <button
          type="button"
          onClick={() => react("love")}
          disabled={!!reaction}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition active:scale-95 ${
            reaction === "love" ? "bg-pink-100 text-[#ec4899]" : "bg-zinc-100 text-zinc-500 hover:bg-pink-50 hover:text-[#ec4899]"
          }`}
        >
          ❤️ Helpful {counts.love}
        </button>
        <button
          type="button"
          onClick={() => react("got")}
          disabled={!!reaction}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition active:scale-95 ${
            reaction === "got" ? "bg-sky-100 text-[#38bdf8]" : "bg-zinc-100 text-zinc-500 hover:bg-sky-50 hover:text-[#38bdf8]"
          }`}
        >
          🙋 I got this too {counts.got}
        </button>
        <button
          type="button"
          onClick={() => react("confirmed")}
          disabled={!!reaction}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition active:scale-95 ${
            reaction === "confirmed" ? "bg-rose-100 text-[#ec4899]" : "bg-zinc-100 text-zinc-500 hover:bg-rose-50 hover:text-[#ec4899]"
          }`}
        >
          ⚠️ Scam confirmed {counts.confirmed}
        </button>
      </div>
    </article>
  )
}

export default function SocialPage() {
  const featuredPost = POSTS[0]

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#fdf2f8_100%)] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#ec4899] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              TrustWall social feed
            </div>
            <h1 className="mt-5 max-w-2xl text-[40px] font-bold leading-[1.05] tracking-tight text-zinc-950 sm:text-[48px]">
              Catch scams before they catch your family.
            </h1>
            <p className="mt-4 text-lg font-medium leading-[1.4] text-zinc-600">
              Simple. Clear. Community-powered.
            </p>
            <Link href="/#analyze" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ec4899] via-[#8b5cf6] to-[#38bdf8] px-5 py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5">
              <ShieldCheck className="h-4 w-4" />
              Try a message
            </Link>
          </div>

          <div className="rotate-2 rounded-[20px] bg-white p-4 shadow-[0_18px_38px_rgba(0,0,0,0.10)]">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${featuredPost.color} text-sm font-bold text-white`}>
                {featuredPost.initials}
              </div>
              <div>
                <p className="text-[16px] font-bold leading-tight text-zinc-950">{featuredPost.user}</p>
                <p className="text-[12px] font-medium leading-[1.4] text-zinc-400">{featuredPost.location}</p>
              </div>
            </div>
            <p className="mt-4 text-[14px] font-semibold leading-[1.4] text-zinc-800">{featuredPost.story}</p>
            <div className="mt-3 rounded-xl bg-zinc-100 p-[10px]">
              <p className="text-[14px] leading-[1.4] text-zinc-700">“{featuredPost.message}”</p>
            </div>
            <div className="mt-3 flex gap-2 text-[12px] font-bold text-zinc-500">
              <span className="rounded-full bg-pink-50 px-3 py-1.5">❤️ {featuredPost.reactions.love}</span>
              <span className="rounded-full bg-rose-50 px-3 py-1.5">⚠️ {featuredPost.reactions.confirmed}</span>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-[12px] font-medium leading-[1.4] text-zinc-400">💬 What people are saying</p>
              {COMMUNITY_COMMENTS.slice(0, 3).map((comment) => (
                <p
                  key={comment.text}
                  className={`mb-2 max-w-[240px] rounded-[18px] bg-white px-3.5 py-2.5 text-[14px] leading-[1.4] text-zinc-600 shadow-[0_4px_10px_rgba(0,0,0,0.04)] ${comment.className}`}
                >
                  {comment.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-6">
          {POSTS.map((post) => (
            <SocialPost key={post.id} post={post} />
          ))}
        </div>

        <aside className="h-fit rounded-[20px] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#ec4899]" />
            <p className="font-bold text-zinc-950">Community pulse</p>
          </div>
          <div className="mt-4 space-y-2.5">
            {[
              ["183", "people warned today"],
              ["41", "confirmed scams"],
              ["5", "languages supported"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-zinc-50 px-4 py-3">
                <p className="text-xl font-black text-zinc-950">{value}</p>
                <p className="text-xs font-medium text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-gradient-to-br from-pink-50 to-sky-50 p-4 text-sm leading-[1.4] text-zinc-600">
            When one person shares a scam, everyone else gets a little safer.
          </p>
        </aside>
      </section>

      <FloatingActionButton />
    </main>
  )
}
