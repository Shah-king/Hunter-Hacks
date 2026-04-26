export type RiskLevel = "scam" | "suspicious" | "safe"
export type Language = string

export type LanguageDetectionResult = {
  detected_language: string
  language_name: string
  is_english: boolean
  english_text: string
}

export type BreakdownItem = {
  label: string
  score: number
  reason: string
}

export type AIScoringResult = {
  fraud_score: number
  scam_type: string
  red_flags: string[]
  reasoning: string
  breakdown: BreakdownItem[]
}

export type User = {
  id: string
  email: string
  forwarding_address: string
  language_preference: string
  created_at: string
}

export type ProcessedEmail = {
  id: string
  user_id: string
  sender: string
  subject: string
  body: string
  detected_language: string
  language_name: string
  english_text: string
  received_at: string
}

export type AnalysisResult = {
  id: string
  email_id: string
  rule_score: number
  ai_score: number
  final_score: number
  risk_level: RiskLevel
  scam_type: string
  red_flags: string[]
  breakdown: BreakdownItem[]
  explanation: string
  actions: string[]
  alert_sent: boolean
  analyzed_at: string
}

export type EmailWithAnalysis = ProcessedEmail & {
  analysis: AnalysisResult | null
}
