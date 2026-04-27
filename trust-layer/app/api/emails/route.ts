import { NextResponse } from "next/server"
import { store } from "@/lib/store"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  let authUser = null

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error) {
      authUser = user
    }
  } catch (err) {
    console.warn("Supabase auth getUser failed in email route", err)
  }

  let user = null
  if (authUser) {
    user = await store.getOrRegisterUser(authUser.id, authUser.email ?? "")
  } else {
    // Demo mode fallback — helpful during development if not logged in
    const allUsers = await store.getAllUsers()
    user = allUsers[0] ?? null
  }

  const emails = await store.getAllEmailsWithAnalysis()
  const stats = await store.getStats()
  return NextResponse.json({ emails, stats, user })
}
