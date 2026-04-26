import { createBrowserClient } from "@supabase/ssr"

// Stub client returned when Supabase env vars are not configured.
// Lets the app run in demo mode without auth.
const stubClient = {
  auth: {
    async getUser() {
      return { data: { user: null }, error: null }
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } }
    },
    async signOut() {
      return { error: null }
    },
  },
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return stubClient as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}
