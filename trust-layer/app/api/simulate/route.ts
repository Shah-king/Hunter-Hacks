import { NextRequest, NextResponse } from "next/server"
import { store } from "@/backend/lib/store"
import { runPipeline } from "@/backend/lib/pipeline"

const SAMPLE_EMAILS = {
  irs: {
    sender: "irs-alerts@irs-gov-notice.net",
    subject: "URGENT: IRS Case #2026-TXF-8821 — Final Notice",
    body: "This is Officer James Crawford from the IRS Criminal Investigation Division. We have filed a case against you for tax evasion totaling $4,872. Failure to respond within 2 hours will result in a federal arrest warrant being issued. You must pay immediately using Google Play gift cards. Call 1-800-555-0192 to resolve this case and avoid arrest.",
    language: "en",
  },
  phishing: {
    sender: "security@wellsfarg0-secure.net",
    subject: "Your Wells Fargo account has been suspended",
    body: "Dear Customer, We detected unauthorized access to your Wells Fargo account. Your account has been temporarily suspended. Please click here to verify your identity within 24 hours or your account will be permanently closed: http://bit.ly/wf-verify-now",
    language: "en",
  },
  spanish: {
    sender: "seguridad@banco-america-mx.com",
    subject: "Su cuenta ha sido suspendida — Acción requerida",
    body: "Estimado cliente, hemos detectado actividad sospechosa en su cuenta. Su número de Seguro Social ha sido suspendido por orden federal. Debe llamar al 1-800-555-0199 inmediatamente o se emitirá una orden de arresto en su contra. Tenga lista su información bancaria para resolver este asunto.",
    language: "es",
  },
  job: {
    sender: "recruiter@amazon-remote-jobs.info",
    subject: "Job Offer: $85/hr Remote Position — Start Today",
    body: "Hi! I'm a talent recruiter at Amazon. We're hiring remote workers — $85/hr, work from home, no experience needed. Positions are extremely limited. To get started, please send me your Social Security Number and bank account routing number for our background check. You'll receive your first payment within 24 hours!",
    language: "en",
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const scenario = (body.scenario ?? "irs") as keyof typeof SAMPLE_EMAILS
    const sample = SAMPLE_EMAILS[scenario] ?? SAMPLE_EMAILS.irs

    const user = store.getAllUsers()[0]
    if (!user) return NextResponse.json({ error: "No users registered" }, { status: 404 })

    const { email, analysis } = await runPipeline({
      user,
      sender: sample.sender,
      subject: sample.subject,
      body: sample.body,
    })

    return NextResponse.json({ email, analysis, scenario })
  } catch (err) {
    console.error("[simulate]", err)
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 })
  }
}
