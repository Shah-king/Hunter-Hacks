import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface AlertEmailParams {
  to: string;
  subject: string;
  explanation: string;
  actions: string[];
  originalSubject: string;
  originalSender: string;
}

export async function sendFraudAlert({
  to,
  subject,
  explanation,
  actions,
  originalSubject,
  originalSender,
}: AlertEmailParams) {
  const actionList = actions.map((a, i) => `${i + 1}. ${a}`).join("\n");

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">⚠️ Fraud Alert — TrustLayer</h1>
      </div>
      <div style="background: #1a1a1a; color: #e5e5e5; padding: 24px; border-radius: 0 0 12px 12px;">
        <p style="color: #999; font-size: 13px; margin: 0 0 4px;">Suspicious email from:</p>
        <p style="font-weight: bold; margin: 0 0 16px;">${originalSender} — "${originalSubject}"</p>
        
        <p style="line-height: 1.6;">${explanation}</p>
        
        <div style="background: #262626; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="font-weight: bold; margin: 0 0 8px;">What you should do:</p>
          <pre style="white-space: pre-wrap; margin: 0; font-family: sans-serif;">${actionList}</pre>
        </div>
        
        <p style="color: #666; font-size: 12px; margin: 16px 0 0;">
          — TrustLayer Fraud Protection
        </p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: "TrustLayer <alerts@trustlayer.app>",
    to,
    subject,
    html: htmlBody,
  });
}
