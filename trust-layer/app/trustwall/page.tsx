"use client"

import { useState } from "react"
import { FAKE_TRUSTWALL_POSTS } from "@/lib/constants"
import type { ScamPost } from "@/lib/types"

const CHANNEL_ICONS: Record<string, string> = {
  sms: "💬",
  email: "📧",
  call: "📞",
  social: "📱",
}

const LANG_LABELS: Record<string, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  bn: "বাংলা",
  ht: "Kreyòl",
}

function ScamPostCard({ post }: { post: ScamPost }) {
  const [reactions, setReactions] = useState(post.reactions)
  const [voted, setVoted] = useState<string | null>(null)

  function react(type: keyof typeof reactions) {
    if (voted) return
    setReactions((r) => ({ ...r, [type]: r[type] + 1 }))
    setVoted(type)
  }

  const timeAgo = new Date(post.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
            {post.username.slice(-2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">{post.username}</p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5 text-gray-400">
            {CHANNEL_ICONS[post.channel]} {post.channel.toUpperCase()}
          </span>
          <span className="text-xs bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5 text-gray-400">
            {LANG_LABELS[post.language] ?? post.language}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-red-400 bg-red-950 border border-red-900 rounded-full px-2 py-0.5">
          🚨 {post.scam_type}
        </span>
        <span className="text-xs text-gray-500">{post.confidence}% confidence</span>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 font-mono bg-gray-800 rounded-lg px-3 py-2">
        {post.snippet}
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => react("got_this_too")}
          disabled={!!voted}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all disabled:cursor-default ${
            voted === "got_this_too"
              ? "border-blue-500 bg-blue-500/10 text-blue-400"
              : "border-gray-700 text-gray-400 hover:border-gray-500"
          }`}
        >
          😨 I got this too ({reactions.got_this_too})
        </button>
        <button
          onClick={() => react("scam_confirmed")}
          disabled={!!voted}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all disabled:cursor-default ${
            voted === "scam_confirmed"
              ? "border-red-500 bg-red-500/10 text-red-400"
              : "border-gray-700 text-gray-400 hover:border-gray-500"
          }`}
        >
          🚫 Scam confirmed ({reactions.scam_confirmed})
        </button>
      </div>
    </div>
  )
}

export default function TrustWall() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">← Back</a>
          <div className="w-px h-5 bg-gray-700" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">🌐 TrustWall</h1>
            <p className="text-xs text-gray-400">Community scam alerts — reported by people like you</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-yellow-400">🏆 247 pts</p>
          <p className="text-xs text-gray-500">Scam Spotter badge</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            <span className="text-white font-semibold">{FAKE_TRUSTWALL_POSTS.length} scams</span> reported in the last 24 hours
          </p>
          <span className="text-xs text-green-400 border border-green-800 bg-green-950 rounded-full px-3 py-1">
            🟢 Live
          </span>
        </div>

        {FAKE_TRUSTWALL_POSTS.map((post) => (
          <ScamPostCard key={post.id} post={post} />
        ))}
      </main>
    </div>
  )
}
