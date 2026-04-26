"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js"

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    async function getInitialUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (mounted) {
        setUser(user)
        setLoading(false)
      }
    }
    void getInitialUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-8 w-20">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </div>
    )
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
        {user.email?.split("@")[0]}
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
