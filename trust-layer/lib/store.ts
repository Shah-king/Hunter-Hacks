// In-memory store — works without Supabase for demo.
// Replace with real Supabase calls when env vars are set.
import type { User, ProcessedEmail, AnalysisResult, EmailWithAnalysis } from "@/lib/types"

const users: User[] = [
  {
    id: "demo-user-1",
    email: "demo@trustlayer.app",
    forwarding_address: "demo@parse.trustlayer.app",
    language_preference: "en",
    created_at: new Date().toISOString(),
  },
]

const emails: ProcessedEmail[] = []
const results: AnalysisResult[] = []

export const store = {
  // Users
  getUserByForwardingAddress(addr: string): User | null {
    return users.find((u) => u.forwarding_address === addr) ?? null
  },
  getUserById(id: string): User | null {
    return users.find((u) => u.id === id) ?? null
  },
  createUser(user: User): User {
    users.push(user)
    return user
  },
  getAllUsers(): User[] {
    return users
  },
  getOrRegisterUser(id: string, email: string): User {
    let user = this.getUserById(id)
    if (!user) {
      user = this.createUser({
        id,
        email,
        forwarding_address: `${id}@parse.trustlayer.app`,
        language_preference: "en",
        created_at: new Date().toISOString(),
      })
    }
    return user
  },

  // Emails
  saveEmail(email: ProcessedEmail): ProcessedEmail {
    emails.push(email)
    return email
  },
  getEmailById(id: string): ProcessedEmail | null {
    return emails.find((e) => e.id === id) ?? null
  },

  // Analysis results
  saveResult(result: AnalysisResult): AnalysisResult {
    results.push(result)
    return result
  },

  // Combined: all emails with their analysis, newest first
  getAllEmailsWithAnalysis(): EmailWithAnalysis[] {
    return [...emails]
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .map((email) => ({
        ...email,
        analysis: results.find((r) => r.email_id === email.id) ?? null,
      }))
  },

  getStats() {
    const total = emails.length
    const fraud = results.filter((r) => r.risk_level === "scam").length
    const suspicious = results.filter((r) => r.risk_level === "suspicious").length
    const alertsSent = results.filter((r) => r.alert_sent).length
    const languages = [...new Set(emails.map((e) => e.language_name).filter(Boolean))]
    return { total, fraud, suspicious, alertsSent, languages }
  },
}
