import { NextResponse } from "next/server"
import { store } from "@/lib/store"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let user = null
  if (authUser) {
    user = store.getOrRegisterUser(authUser.id, authUser.email ?? "")
  } else {
    // Demo mode (no Supabase configured) — fall back to the demo user
    user = store.getAllUsers()[0] ?? null
  }

  const emails = store.getAllEmailsWithAnalysis()
  const stats = store.getStats()
  return NextResponse.json({ emails, stats, user })
}

