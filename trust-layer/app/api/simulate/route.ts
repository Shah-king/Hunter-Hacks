import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/store"
import { runPipeline } from "@/lib/pipeline"
import { createClient } from "@/lib/supabase/server"

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  zh: "Chinese",
  fr: "French",
  ko: "Korean",
  bn: "Bengali",
  ht: "Haitian Creole",
}

const SAMPLE_EMAILS = {
  irs: {
    sender: "irs-alerts@irs-gov-notice.net",
    subject: "URGENT: IRS Case #2026-TXF-8821 — Final Notice",
    body: "This is Officer James Crawford from the IRS Criminal Investigation Division. We have filed a case against you for tax evasion totaling $4,872. Failure to respond within 2 hours will result in a federal arrest warrant being issued. You must pay immediately using Google Play gift cards. Call 1-800-555-0192 to resolve this case and avoid arrest.",
  },
  phishing: {
    sender: "security@wellsfarg0-secure.net",
    subject: "Your Wells Fargo account has been suspended",
    body: "Dear Customer, We detected unauthorized access to your Wells Fargo account. Your account has been temporarily suspended. Please click here to verify your identity within 24 hours or your account will be permanently closed: http://bit.ly/wf-verify-now",
  },
  spanish: {
    sender: "seguridad@banco-america-mx.com",
    subject: "Su cuenta ha sido suspendida — Acción requerida",
    body: "Estimado cliente, hemos detectado actividad sospechosa en su cuenta. Su número de Seguro Social ha sido suspendido por orden federal. Debe llamar al 1-800-555-0199 inmediatamente o se emitirá una orden de arresto en su contra. Tenga lista su información bancaria para resolver este asunto.",
  },
  job: {
    sender: "recruiter@amazon-remote-jobs.info",
    subject: "Job Offer: $85/hr Remote Position — Start Today",
    body: "Hi! I'm a talent recruiter at Amazon. We're hiring remote workers — $85/hr, work from home, no experience needed. Positions are extremely limited. To get started, please send me your Social Security Number and bank account routing number for our background check. You'll receive your first payment within 24 hours!",
  },
}

// Simple global rate limiter for hackathon demo
let simulateRequests = 0
let lastReset = Date.now()
const LIMIT_PER_MINUTE = 15

export async function POST(req: NextRequest) {
  try {
    // SECURITY 4: Prevent Memory Crash (OOM) by checking content length
    const contentLength = Number(req.headers.get("content-length") || "0")
    if (contentLength > 1024 * 1024) { // 1MB limit for simulate
      return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }

    // SECURITY 3: API Credit Exhaustion (DoS Attack) Protection
    const now = Date.now()
    if (now - lastReset > 60000) {
      simulateRequests = 0
      lastReset = now
    }
    simulateRequests++
    if (simulateRequests > LIMIT_PER_MINUTE) {
      console.warn("[simulate] Rate limit exceeded")
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a minute." }, { status: 429 })
    }

    // Auth lookup is optional — fall back to demo user if Supabase isn't configured
    let authUser: { id: string; email?: string } | null = null
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.getUser()
      if (!error) {
        authUser = data.user
      }
    } catch (err) {
      console.warn("Supabase auth getUser failed in simulate route", err)
    }

    const body = await req.json()

    let user = (await store.getAllUsers())[0]
    if (authUser) {
      user = await store.getOrRegisterUser(authUser.id, authUser.email ?? "")
    }

    if (!user) return NextResponse.json({ error: "No users registered" }, { status: 404 })

    // Map ISO language code to full language name (e.g. "es" -> "Spanish")
    const langCode: string = body.language ?? "en"
    const outputLanguage = LANGUAGE_NAMES[langCode] ?? "English"

    // SECURITY: Support custom message analysis from the Quick Check UI
    if (body.customMessage) {
      const { email, analysis } = await runPipeline({
        user,
        sender: "direct-check@trustlayer.store",
        subject: "Direct Message Analysis",
        body: body.customMessage,
        outputLanguage,
      })
      return NextResponse.json({ email, analysis, scenario: "custom" })
    }

    const scenario = (body.scenario ?? "irs") as keyof typeof SAMPLE_EMAILS
    const sample = SAMPLE_EMAILS[scenario] ?? SAMPLE_EMAILS.irs

    const { email, analysis } = await runPipeline({
      user,
      sender: sample.sender,
      subject: sample.subject,
      body: sample.body,
      outputLanguage,
    })

    return NextResponse.json({ email, analysis, scenario })
  } catch (err) {
    console.error("[simulate]", err)
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 })
  }
}
