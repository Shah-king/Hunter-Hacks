import type { Channel, Language, ScamPost } from "./types"

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文 (Chinese)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "ht", label: "Kreyòl (Haitian Creole)" },
]

export const EXAMPLE_MESSAGES: Record<Channel, string> = {
  sms: "URGENT: Your Social Security Number has been suspended due to suspicious activity. To reactivate, call 1-800-555-0199 immediately or a warrant will be issued for your arrest.",
  email:
    "Dear Customer, We detected unauthorized access to your Wells Fargo account. Click here to verify your identity within 24 hours or your account will be permanently closed: http://wellsfargo-secure-verify.net/login",
  call: "Hello, this is Officer Thompson from the IRS. We have a case filed against you for tax evasion. You owe $4,200 in back taxes. If you do not pay today using Google Play gift cards, federal agents will arrest you within the hour. Press 1 to speak with a payment officer.",
  social:
    "Hey! I'm a talent recruiter at Amazon. We're hiring remote workers — $85/hr, work from home, no experience needed. Just send me your SSN and bank account info for the background check to get started today! Limited spots available.",
}

export const FAKE_TRUSTWALL_POSTS: ScamPost[] = [
  {
    id: "1",
    username: "user_mx_492",
    channel: "sms",
    language: "es",
    snippet:
      "Su número de Seguro Social ha sido suspendido. Llame al 1-800-555-0199 inmediatamente o se emitirá una orden de arresto...",
    scam_type: "Government Impersonation",
    confidence: 98,
    reactions: { got_this_too: 47, scam_confirmed: 31, seems_safe: 0 },
    points_awarded: 25,
    created_at: "2026-04-25T10:22:00Z",
  },
  {
    id: "2",
    username: "user_cn_871",
    channel: "email",
    language: "zh",
    snippet:
      "您的亚马逊账户存在异常登录，请立即点击以下链接验证您的身份，否则账户将在24小时内被永久关闭...",
    scam_type: "Phishing",
    confidence: 95,
    reactions: { got_this_too: 63, scam_confirmed: 41, seems_safe: 2 },
    points_awarded: 25,
    created_at: "2026-04-25T09:15:00Z",
  },
  {
    id: "3",
    username: "user_bd_203",
    channel: "social",
    language: "bn",
    snippet:
      "আমি আমাজনের একজন রিক্রুটার। ঘরে বসে কাজ করুন, ঘণ্টায় $৮৫। আজই আপনার SSN এবং ব্যাংক তথ্য পাঠান...",
    scam_type: "Job Fraud",
    confidence: 97,
    reactions: { got_this_too: 28, scam_confirmed: 19, seems_safe: 0 },
    points_awarded: 25,
    created_at: "2026-04-25T08:40:00Z",
  },
  {
    id: "4",
    username: "user_ht_117",
    channel: "call",
    language: "ht",
    snippet:
      "Bonjou, mwen rele depatman IRS. Ou dwe $3,500 nan taks. Si ou pa peye jodi a avèk kat kado Google Play, lapolis pral arete ou...",
    scam_type: "IRS Phone Scam",
    confidence: 99,
    reactions: { got_this_too: 34, scam_confirmed: 27, seems_safe: 0 },
    points_awarded: 25,
    created_at: "2026-04-25T07:55:00Z",
  },
  {
    id: "5",
    username: "user_us_559",
    channel: "email",
    language: "en",
    snippet:
      "Your PayPal account has been limited. Verify your identity immediately at http://paypa1-secure.net or your funds will be held for 180 days...",
    scam_type: "Phishing",
    confidence: 96,
    reactions: { got_this_too: 89, scam_confirmed: 71, seems_safe: 1 },
    points_awarded: 25,
    created_at: "2026-04-24T22:10:00Z",
  },
]
