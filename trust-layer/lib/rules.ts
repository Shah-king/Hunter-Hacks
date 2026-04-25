const URGENCY = [
  "act now", "immediately", "last warning", "urgent", "your account will be closed",
  "respond within", "limited time", "expires today", "final notice", "action required",
]

const PAYMENT = [
  "gift card", "wire transfer", "bitcoin", "crypto", "western union", "zelle",
  "money order", "cashapp", "send payment", "processing fee", "upfront payment",
  "google play", "itunes card",
]

const AUTHORITY = [
  "irs", "social security", "ice", "immigration officer", "federal agent",
  "department of homeland", "fbi", "bank fraud department", "microsoft support",
  "apple support", "social security administration", "us customs",
]

const THREATS = [
  "arrest", "warrant", "deportation", "legal action", "suspended", "terminated",
  "lawsuit", "police", "jail", "prison", "criminal charges",
]

const TOO_GOOD = [
  "congratulations you won", "lottery", "free money", "guaranteed income",
  "work from home $", "inheritance", "unclaimed funds", "you've been selected",
  "you have been selected", "million dollar",
]

const SUSPICIOUS_URL = /https?:\/\/(bit\.ly|tinyurl|t\.co|ow\.ly|goo\.gl|rb\.gy)/i
const SPOOFED_BRAND = /(amaz[o0]n|paypa[l1]|g[o0]{2}gle|micros[o0]ft|app[l1]e|faceb[o0]{2}k|netfl[i1]x)/i
const GENERIC_GREETING = /dear (customer|user|account holder|member|sir|madam)/i

function checkCategory(text: string, words: string[], perMatch: number, cap: number): number {
  let score = 0
  for (const word of words) {
    if (text.includes(word)) {
      score += perMatch
      if (score >= cap) return cap
    }
  }
  return score
}

export function calculateRuleScore(text: string): { score: number; hits: string[] } {
  const lower = text.toLowerCase()
  const hits: string[] = []
  let score = 0

  const urgencyScore = checkCategory(lower, URGENCY, 15, 30)
  if (urgencyScore > 0) { score += urgencyScore; hits.push("urgency/pressure tactics") }

  const paymentScore = checkCategory(lower, PAYMENT, 25, 50)
  if (paymentScore > 0) { score += paymentScore; hits.push("unusual payment method requested") }

  const authorityScore = checkCategory(lower, AUTHORITY, 20, 40)
  if (authorityScore > 0) { score += authorityScore; hits.push("government/authority impersonation") }

  const threatScore = checkCategory(lower, THREATS, 20, 40)
  if (threatScore > 0) { score += threatScore; hits.push("threats of arrest/legal action") }

  const tooGoodScore = checkCategory(lower, TOO_GOOD, 15, 30)
  if (tooGoodScore > 0) { score += tooGoodScore; hits.push("too-good-to-be-true offer") }

  if (SUSPICIOUS_URL.test(text)) { score += 20; hits.push("shortened/suspicious URL") }
  if (SPOOFED_BRAND.test(lower)) { score += 20; hits.push("spoofed brand name") }
  if (GENERIC_GREETING.test(lower)) { score += 10; hits.push("generic impersonal greeting") }

  return { score: Math.min(score, 100), hits }
}
