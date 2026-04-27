import { createAdminClient } from "./supabase/admin"
import type { User, ProcessedEmail, AnalysisResult, EmailWithAnalysis } from "./types"
import { createForwardingAddress } from "./ids"

// In-memory fallback for local dev if keys are missing
const memoryUsers: User[] = []
const memoryEmails: ProcessedEmail[] = []
const memoryResults: AnalysisResult[] = []

const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY

export const store = {
  // Users
  async getUserByForwardingAddress(addr: string): Promise<User | null> {
    if (isSupabaseConfigured) {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("forwarding_address", addr)
        .single()
      
      if (error && error.code !== "PGRST116") {
        console.error(`[store] Error fetching user by address ${addr}:`, error.message)
      }
      return data
    }
    return memoryUsers.find((u) => u.forwarding_address === addr) ?? null
  },

  async getUserById(id: string): Promise<User | null> {
    if (isSupabaseConfigured) {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single()
      return data
    }
    return memoryUsers.find((u) => u.id === id) ?? null
  },

  async createUser(user: User): Promise<User> {
    if (isSupabaseConfigured) {
      const supabase = createAdminClient()
      const { data, error } = await supabase.from("users").insert(user).select().single()
      if (error) {
        console.error(`[store] Error creating user:`, error.message)
        throw error
      }
      return data
    }
    memoryUsers.push(user)
    return user
  },

  async getAllUsers(): Promise<User[]> {
    if (isSupabaseConfigured) {
      const supabase = createAdminClient()
      const { data, error } = await supabase.from("users").select("*")
      if (error) {
        console.error(`[store] Error fetching all users:`, error.message)
      }
      return data || []
    }
    return memoryUsers
  },

  async getOrRegisterUser(id: string, email: string): Promise<User> {
    let user = await this.getUserById(id)
    if (!user) {
      user = await this.createUser({
        id,
        email,
        forwarding_address: createForwardingAddress(),
        language_preference: "en",
        created_at: new Date().toISOString(),
      })
    }
    return user
  },

  // Emails
  async saveEmail(email: ProcessedEmail): Promise<ProcessedEmail> {
    if (isSupabaseConfigured) {
      const supabase = createAdminClient()
      const { data, error } = await supabase.from("emails").insert(email).select().single()
      if (error) {
        console.error(`[store] Error saving email:`, error.message)
        throw error
      }
      return data
    }
    memoryEmails.push(email)
    return email
  },

  async getEmailById(id: string): Promise<ProcessedEmail | null> {
    if (isSupabaseConfigured) {
      const supabase = createAdminClient()
      const { data, error } = await supabase.from("emails").select("*").eq("id", id).single()
      if (error && error.code !== "PGRST116") {
        console.error(`[store] Error fetching email by ID ${id}:`, error.message)
      }
      return data
    }
    return memoryEmails.find((e) => e.id === id) ?? null
  },

  // Analysis results
  async saveResult(result: AnalysisResult): Promise<AnalysisResult> {
    if (isSupabaseConfigured) {
      const supabase = createAdminClient()
      const { data, error } = await supabase.from("analysis_results").insert(result).select().single()
      if (error) {
        console.error(`[store] Error saving analysis result:`, error.message)
        throw error
      }
      return data
    }
    memoryResults.push(result)
    return result
  },

  // Combined: all emails with their analysis, newest first
  async getAllEmailsWithAnalysis(userId: string): Promise<EmailWithAnalysis[]> {
    if (isSupabaseConfigured) {
      const supabase = createAdminClient()
      const { data: emailsData, error: emailError } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", userId)
        .order("received_at", { ascending: false })
      
      if (emailError) {
        console.error(`[store] Error fetching isolated emails for ${userId}:`, emailError.message)
      }

      const { data: resultsData } = await supabase
        .from("analysis_results")
        .select("*")

      return (emailsData || []).map((email: ProcessedEmail) => ({
        ...email,
        analysis: (resultsData || []).find((r: AnalysisResult) => r.email_id === email.id) ?? null,
      }))
    }

    return [...memoryEmails]
      .filter((e) => e.user_id === userId)
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .map((email) => ({
        ...email,
        analysis: memoryResults.find((r) => r.email_id === email.id) ?? null,
      }))
  },

  async getStats(userId: string) {
    let emailsCount = 0
    let fraudCount = 0
    let suspiciousCount = 0
    let alertsSentCount = 0
    let languages: string[] = []

    if (isSupabaseConfigured) {
      const supabase = createAdminClient()
      
      // Isolated count
      const { count, error: countError } = await supabase
        .from("emails")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
      
      if (countError) console.error(`[store] Stats count error:`, countError.message)
      emailsCount = count || 0

      // Isolated analysis stats
      // We join analysis_results with emails to ensure we only count results belonging to the user
      const { data: results, error: resultsError } = await supabase
        .from("analysis_results")
        .select("risk_level, alert_sent, emails!inner(user_id)")
        .eq("emails.user_id", userId)
      
      if (resultsError) console.error(`[store] Stats results error:`, resultsError.message)
      
      fraudCount = results?.filter((r) => r.risk_level === "scam").length || 0
      suspiciousCount = results?.filter((r) => r.risk_level === "suspicious").length || 0
      alertsSentCount = results?.filter((r) => r.alert_sent).length || 0

      const { data: langs } = await supabase
        .from("emails")
        .select("language_name")
        .eq("user_id", userId)
      
      languages = [...new Set((langs || []).map((l) => l.language_name).filter(Boolean))]
    } else {
      const userEmails = memoryEmails.filter((e) => e.user_id === userId)
      const userEmailIds = new Set(userEmails.map((e) => e.id))
      const userResults = memoryResults.filter((r) => userEmailIds.has(r.email_id))

      emailsCount = userEmails.length
      fraudCount = userResults.filter((r) => r.risk_level === "scam").length
      suspiciousCount = userResults.filter((r) => r.risk_level === "suspicious").length
      alertsSentCount = userResults.filter((r) => r.alert_sent).length
      languages = [...new Set(userEmails.map((e) => e.language_name).filter(Boolean))]
    }

    return { total: emailsCount, fraud: fraudCount, suspicious: suspiciousCount, alertsSent: alertsSentCount, languages }
  },
}
