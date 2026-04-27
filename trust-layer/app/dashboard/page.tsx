import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardContent from "./DashboardContent"

export default async function DashboardPage() {
  const supabase = await createClient()
  let user = null

  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    if (!error) {
      user = authUser
    }
  } catch (err) {
    console.warn("Supabase auth getUser failed on server route", err)
    user = null
  }

  // Only enforce login if Supabase is actually configured. In demo mode
  // (no Supabase env vars), allow direct access for testing.
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
  if (supabaseConfigured && !user) {
    redirect("/login")
  }

  return <DashboardContent />
}
