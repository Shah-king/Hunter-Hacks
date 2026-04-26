import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardContent from "./DashboardContent"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
