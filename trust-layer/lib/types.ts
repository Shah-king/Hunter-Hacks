export type RiskLevel = "scam" | "suspicious" | "safe"

export type Channel = "sms" | "email" | "call" | "social"

export type Language = "en" | "zh" | "es" | "bn" | "ht"

export type AnalysisResult = {
  risk_level: RiskLevel
  confidence: number
  scam_type: string
  red_flags: string[]
  explanation: string
  actions: string[]
}

export type ScamPost = {
  id: string
  username: string
  channel: Channel
  language: string
  snippet: string
  scam_type: string
  confidence: number
  reactions: {
    got_this_too: number
    scam_confirmed: number
    seems_safe: number
  }
  points_awarded: number
  created_at: string
}

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  zh: "中文 (Chinese)",
  es: "Español (Spanish)",
  bn: "বাংলা (Bengali)",
  ht: "Kreyòl Ayisyen (Haitian Creole)",
}

export const CHANNEL_LABELS: Record<Channel, string> = {
  sms: "SMS / Text",
  email: "Email",
  call: "Phone Call",
  social: "Social Media",
}
