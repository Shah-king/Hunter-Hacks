// ============================================================
// Stage 1: Rule-Based Keyword Scoring
// No AI. Instant. Free. Deterministic.
// ============================================================

const URGENCY_WORDS = [
  "act now", "immediately", "last warning", "urgent",
  "your account will be closed", "respond within",
  "limited time", "expires today", "final notice",
  "time sensitive", "don't delay", "right away"
];

const PAYMENT_WORDS = [
  "gift card", "wire transfer", "bitcoin", "crypto",
  "western union", "zelle", "money order", "cashapp",
  "send payment", "processing fee", "upfront payment",
  "itunes card", "google play card", "prepaid card"
];

const AUTHORITY_WORDS = [
  "irs", "social security", "ice", "immigration officer",
  "federal agent", "department of homeland", "fbi",
  "bank fraud department", "microsoft support", "apple support",
  "internal revenue", "social security administration",
  "customs and border", "us marshals"
];

const THREAT_WORDS = [
  "arrest", "warrant", "deportation", "legal action",
  "suspended", "terminated", "lawsuit", "police",
  "criminal charges", "jail", "prison", "seized",
  "frozen account", "penalty"
];

const TOO_GOOD_WORDS = [
  "congratulations you won", "lottery", "free money",
  "guaranteed income", "work from home", "inheritance",
  "unclaimed funds", "you've been selected", "prize winner",
  "million dollars", "easy money", "risk free"
];

const SUSPICIOUS_PATTERNS = [
  /bit\.ly\//i,
  /tinyurl\./i,
  /t\.co\//i,
  /goo\.gl\//i,
  /paypa[l1]\./i,           // misspelled PayPal
  /amaz[o0]n\./i,           // misspelled Amazon
  /we[l1]{2}sfargo/i,       // misspelled Wells Fargo
  /dear\s+(customer|user|member|account\s+holder)/i,  // generic greetings
  /click\s+(here|below|this\s+link)/i,
];

function checkCategory(text: string, keywords: string[], pointsEach: number, maxPoints: number): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      score += pointsEach;
      matches.push(keyword);
      if (score >= maxPoints) {
        return { score: maxPoints, matches };
      }
    }
  }

  return { score, matches };
}

function checkPatterns(text: string, pointsEach: number, maxPoints: number): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      score += pointsEach;
      const match = text.match(pattern);
      if (match) matches.push(match[0]);
      if (score >= maxPoints) {
        return { score: maxPoints, matches };
      }
    }
  }

  return { score, matches };
}

export interface RuleCheckResult {
  rule_score: number;
  matched_keywords: string[];
  categories_hit: string[];
}

export function calculateRuleScore(text: string): RuleCheckResult {
  const lowerText = text.toLowerCase();
  const allMatches: string[] = [];
  const categoriesHit: string[] = [];
  let totalScore = 0;

  const urgency = checkCategory(lowerText, URGENCY_WORDS, 15, 30);
  if (urgency.score > 0) { totalScore += urgency.score; allMatches.push(...urgency.matches); categoriesHit.push("urgency"); }

  const payment = checkCategory(lowerText, PAYMENT_WORDS, 25, 50);
  if (payment.score > 0) { totalScore += payment.score; allMatches.push(...payment.matches); categoriesHit.push("payment"); }

  const authority = checkCategory(lowerText, AUTHORITY_WORDS, 20, 40);
  if (authority.score > 0) { totalScore += authority.score; allMatches.push(...authority.matches); categoriesHit.push("authority"); }

  const threats = checkCategory(lowerText, THREAT_WORDS, 20, 40);
  if (threats.score > 0) { totalScore += threats.score; allMatches.push(...threats.matches); categoriesHit.push("threats"); }

  const tooGood = checkCategory(lowerText, TOO_GOOD_WORDS, 15, 30);
  if (tooGood.score > 0) { totalScore += tooGood.score; allMatches.push(...tooGood.matches); categoriesHit.push("too_good_to_be_true"); }

  const patterns = checkPatterns(lowerText, 20, 20);
  if (patterns.score > 0) { totalScore += patterns.score; allMatches.push(...patterns.matches); categoriesHit.push("suspicious_patterns"); }

  return {
    rule_score: Math.min(totalScore, 100),
    matched_keywords: allMatches,
    categories_hit: categoriesHit,
  };
}
