import { readFileSync } from "fs"
import { resolve } from "path"

// Load .env and .env.local before anything else imports process.env
function loadEnvFile(filename: string) {
  try {
    const raw = readFileSync(resolve(process.cwd(), filename), "utf-8")
    for (const line of raw.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eqIdx = trimmed.indexOf("=")
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim()
        if (!process.env[key]) process.env[key] = val
      }
    }
  } catch {
    // File not found — skip
  }
}
loadEnvFile(".env")
loadEnvFile(".env.local")

import("../lib/pipeline").then(({ runPipeline }) => main(runPipeline))

import type { User } from "../lib/types"

const TEST_USER: User = {
  id: "test-user-1",
  email: "test@example.com",
  forwarding_address: "test@parse.trustlayer.store",
  language_preference: "en",
  created_at: new Date().toISOString(),
}

const TEST_CASES = [
  {
    name: "IRS Phishing",
    expected: ">= 85",
    passes: (score: number) => score >= 85,
    sender: "irs-alert@secure-irs-gov.com",
    subject: "URGENT: Your SSN Has Been Suspended",
    body: `This is the IRS. We have detected suspicious activity on your Social Security number. Your account will be suspended within 24 hours unless you call 1-888-555-0199 immediately. A federal warrant will be issued for your arrest if you do not comply. You must pay $3,450 in outstanding taxes via Google Play gift cards. Act now to avoid legal action.`,
  },
  {
    name: "Fake Job Offer",
    expected: ">= 70",
    passes: (score: number) => score >= 70,
    sender: "hr@globalstaffing-careers.net",
    subject: "You've Been Selected — $5,000/Week Work From Home",
    body: `Congratulations! You have been selected for a remote position paying $5,000 per week. No experience required. To secure your spot, you must pay a $200 processing fee via Zelle or CashApp before your start date. This offer expires today. Reply with your full name, address, and bank account number to get started.`,
  },
  {
    name: "Legitimate Newsletter",
    expected: "< 20",
    passes: (score: number) => score < 20,
    sender: "newsletter@medium.com",
    subject: "Your Weekly Reading List — Top Stories This Week",
    body: `Hi there, here are this week's top stories curated just for you. We hope you enjoy them! Click any story to read the full article on Medium. You are receiving this because you subscribed to the Medium Daily Digest. To unsubscribe, click here. Medium, 799 Market St, San Francisco, CA 94103.`,
  },
  {
    name: "Amazon Phishing",
    expected: ">= 80",
    passes: (score: number) => score >= 80,
    sender: "no-reply@amaz0n-security.com",
    subject: "Your Amazon Account Has Been Locked",
    body: `Dear Customer, we have detected unusual sign-in activity on your Amazon account. Your account has been temporarily suspended. To restore access, verify your information immediately by clicking: http://bit.ly/amzn-verify-account. You must complete this within 12 hours or your account will be permanently closed and any pending orders cancelled.`,
  },
  {
    name: "Spanish-Language Scam",
    expected: ">= 75 (+ Spanish detected)",
    passes: (score: number) => score >= 75,
    sender: "seguridad@banco-alertas-urgente.com",
    subject: "URGENTE: Su cuenta bancaria ha sido suspendida",
    body: `Estimado cliente, hemos detectado actividad sospechosa en su cuenta bancaria. Su cuenta será cerrada permanentemente a menos que llame al 1-800-555-0123 de inmediato. Debe transferir sus fondos a una cuenta segura mediante Western Union para protegerlos. Tiene 2 horas para actuar antes de que se emita una orden judicial. No ignore este mensaje.`,
  },
]

async function main(runPipeline: typeof import("../lib/pipeline").runPipeline) {
  console.log("=".repeat(60))
  console.log("  TrustLayer — Pipeline Test Suite")
  console.log("=".repeat(60))

  if (!process.env.OPENAI_API_KEY) {
    console.error("\n❌ OPENAI_API_KEY is not set. Add it to trust-layer/.env.local and retry.\n")
    process.exit(1)
  }

  let passed = 0
  let failed = 0

  for (const tc of TEST_CASES) {
    console.log(`\n▶  ${tc.name}`)
    console.log(`   Expected score: ${tc.expected}`)

    try {
      const { email, analysis } = await runPipeline({
        user: TEST_USER,
        sender: tc.sender,
        subject: tc.subject,
        body: tc.body,
      })

      const ok = tc.passes(analysis.final_score)
      if (ok) passed++; else failed++

      console.log(`   Language:    ${email.language_name} (${email.detected_language})`)
      console.log(`   Rule score:  ${analysis.rule_score}`)
      console.log(`   AI score:    ${analysis.ai_score}`)
      console.log(`   Final score: ${analysis.final_score}   ${ok ? "✅ PASS" : "❌ FAIL — tune prompt or rules"}`)
      console.log(`   Risk level:  ${analysis.risk_level.toUpperCase()}`)
      console.log(`   Scam type:   ${analysis.scam_type}`)
      if (analysis.red_flags.length > 0) {
        console.log(`   Red flags:   ${analysis.red_flags.join(" | ")}`)
      }
      console.log(`   Alert sent:  ${analysis.alert_sent}`)
    } catch (err) {
      failed++
      console.log(`   ❌ ERROR: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log(`  Results: ${passed}/${TEST_CASES.length} passed, ${failed} failed`)
  console.log("=".repeat(60) + "\n")

  if (failed > 0) {
    console.log("Tune tips:")
    console.log("  • Score too low on scams → raise keyword weights in lib/rules.ts")
    console.log("  • Score too high on legit email → AI prompt may be over-sensitive")
    console.log("  • Spanish not detected → check Stage 0 in lib/openai.ts\n")
  }

  process.exit(failed > 0 ? 1 : 0)
}
