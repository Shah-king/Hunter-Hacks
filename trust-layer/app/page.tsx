import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LandingContent from "./LandingContent"

export default async function Home() {
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

  if (user) {
    redirect("/dashboard")
  }

  return <LandingContent />
}
