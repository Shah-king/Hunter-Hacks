// ============================================================
// TrustLayer — Core Types
// ============================================================

// --- Pipeline Types ---

export interface LanguageDetectionResult {
  detected_language: string;   // e.g. "es", "zh", "en"
  language_name: string;       // e.g. "Spanish", "Chinese"
  is_english: boolean;
  english_text: string;        // translated or original
}

export interface RuleScoreResult {
  rule_score: number;          // 0-100
  matched_keywords: string[];  // which keywords triggered
  categories_hit: string[];    // e.g. ["urgency", "payment", "threat"]
}

export interface AIScoreResult {
  fraud_score: number;         // 0-100
  scam_type: string;           // "phishing" | "impersonation" | "job_scam" | etc.
  red_flags: string[];         // specific flags found
  reasoning: string;           // one sentence why
}

export interface PipelineResult {
  // Stage 0
  detected_language: string;
  language_name: string;
  is_english: boolean;
  english_text: string;
  original_text: string;

  // Stage 1
  rule_score: number;
  matched_keywords: string[];

  // Stage 2
  ai_score: number;
  scam_type: string;
  red_flags: string[];
  reasoning: string;

  // Stage 3
  final_score: number;
  risk_level: "scam" | "suspicious" | "safe";

  // Stage 4 (only if fraud)
  explanation: string | null;
  actions: string[] | null;
  alert_sent: boolean;
}

// --- Database Types ---

export interface User {
  id: string;
  email: string;
  forwarding_address: string;
  language_preference: string;
  created_at: string;
}

export interface ProcessedEmail {
  id: string;
  user_id: string;
  sender: string;
  subject: string;
  body: string;
  detected_language: string;
  english_text: string;
  received_at: string;
}

export interface AnalysisResult {
  id: string;
  email_id: string;
  rule_score: number;
  ai_score: number;
  final_score: number;
  risk_level: "scam" | "suspicious" | "safe";
  scam_type: string;
  red_flags: string[];
  explanation: string;
  actions: string[];
  alert_sent: boolean;
  analyzed_at: string;
}

// --- API Types ---

export interface DashboardEmail {
  id: string;
  sender: string;
  subject: string;
  received_at: string;
  detected_language: string;
  rule_score: number;
  ai_score: number;
  final_score: number;
  risk_level: "scam" | "suspicious" | "safe";
  scam_type: string;
  red_flags: string[];
  explanation: string;
  actions: string[];
  alert_sent: boolean;
}

export interface SimulateEmailRequest {
  from: string;
  subject: string;
  body: string;
}
