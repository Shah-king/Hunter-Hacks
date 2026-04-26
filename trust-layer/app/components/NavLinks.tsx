"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function NavLinks() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: unknown, session: { user: unknown } | null) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const linkStyle = (path: string) => {
    const isActive = pathname === path
    return `rounded-full px-4 py-2 transition ${
      isActive
        ? "bg-white text-slate-950 shadow-sm"
        : "text-slate-600 hover:bg-white/50 hover:text-slate-950"
    }`
  }

  return (
    <nav className="hidden items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold shadow-sm md:flex">
      {!isLoggedIn && (
        <Link href="/" className={linkStyle("/")}>
          Home
        </Link>
      )}
      {isLoggedIn && (
        <>
          <Link href="/dashboard" className={linkStyle("/dashboard")}>
            Dashboard
          </Link>
        </>
      )}
      <Link href="/social" className={linkStyle("/social")}>
        Social
      </Link>
    </nav>
  )
}
