import { NextResponse } from "next/server"
import { store } from "@/lib/store"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let user = null
  if (authUser) {
    user = await store.getOrRegisterUser(authUser.id, authUser.email ?? "")
  }

  const emails = await store.getAllEmailsWithAnalysis()
  const stats = await store.getStats()
  return NextResponse.json({ emails, stats, user })
}

