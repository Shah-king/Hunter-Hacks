"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useT } from "./useT"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

export default function NavLinks() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()
  const { t } = useT()

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          if (error.code === "refresh_token_not_found") {
            await supabase.auth.signOut()
          }
          setIsLoggedIn(false)
          return
        }
        setIsLoggedIn(!!user)
      } catch (err) {
        console.error("Supabase auth getUser failed", err)
        setIsLoggedIn(false)
      }
    }
    void checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
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
          {t("nav_home")}
        </Link>
      )}
      {isLoggedIn && (
        <>
          <Link href="/dashboard" className={linkStyle("/dashboard")}>
            {t("nav_dashboard")}
          </Link>
        </>
      )}
      <Link href="/social" className={linkStyle("/social")}>
        {t("nav_social")}
      </Link>
    </nav>
  )
}
