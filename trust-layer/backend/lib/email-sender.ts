// Sends fraud alert emails via Resend. No-ops gracefully if RESEND_API_KEY is missing.
export async function sendFraudAlert(params: {
  to: string
  subject: string
  warningText: string
  senderEmail: string
  fraudScore: number
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email-sender] RESEND_API_KEY not set — skipping alert email")
    return false
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: "TrustLayer <alerts@trustlayer.app>",
      to: params.to,
      subject: `⚠️ TrustLayer: Scam Detected — Fraud Score ${params.fraudScore}/100`,
      text: `TrustLayer Fraud Alert\n\nA suspicious email from ${params.senderEmail} was detected.\n\n${params.warningText}\n\n---\nTrustLayer — Protecting you from scams`,
    })

    return true
  } catch (err) {
    console.error("[email-sender] Failed to send alert:", err)
    return false
  }
}
