"use client"

import Link from "next/link"
import { MessageCircle, PenLine, Play, Plus, Search } from "lucide-react"
import { useState } from "react"

export default function FloatingActionButton({ onSimulate }: { onSimulate?: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <div
        className={`flex origin-bottom-right flex-col gap-2 transition-all duration-200 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        <a href="#analyze" className="fab-menu-item">
          <Search className="h-4 w-4" />
          Analyze Message
        </a>
        <Link href="/social" className="fab-menu-item">
          <PenLine className="h-4 w-4" />
          Post Scam
        </Link>
        <button type="button" onClick={onSimulate} className="fab-menu-item">
          <Play className="h-4 w-4" />
          Simulate
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open quick actions"
        className="flex h-15 w-15 items-center justify-center rounded-full bg-sky-500 text-white shadow-xl shadow-sky-500/30 transition hover:-translate-y-1 hover:bg-sky-600 active:scale-95"
      >
        {open ? <MessageCircle className="h-6 w-6" /> : <Plus className="h-7 w-7" />}
      </button>
    </div>
  )
}
