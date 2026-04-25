"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type DemoUser = {
  name: string
  email: string
}

const STORAGE_KEY = "trustlayer_demo_user"

function readDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null

  try {
    const savedUser = window.localStorage.getItem(STORAGE_KEY)
    return savedUser ? (JSON.parse(savedUser) as DemoUser) : null
  } catch {
    return null
  }
}

export default function DemoAuthButton() {
  const [user, setUser] = useState<DemoUser | null>(() => readDemoUser())

  useEffect(() => {
    const handleStorageChange = () => setUser(readDemoUser())
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("trustlayer-demo-auth", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("trustlayer-demo-auth", handleStorageChange)
    }
  }, [])

  function handleLogout() {
    window.localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event("trustlayer-demo-auth"))
    setUser(null)
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95"
      >
        Login
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
      <span className="max-w-28 truncate px-3 py-1.5 text-xs font-bold text-slate-700">
        {user.name}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
      >
        Logout
      </button>
    </div>
  )
}
