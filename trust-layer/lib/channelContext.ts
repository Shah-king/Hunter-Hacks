export const channelContext: Record<string, string> = {
  sms: `
This is an SMS or text message. Common scams in this channel:
- Fake USPS/UPS/FedEx delivery alerts with phishing links
- Prize or lottery winning notifications
- Bank fraud alerts asking to call back or click a link
- IRS or Social Security Administration suspension threats
- Fake verification codes claiming to be from Google, Apple, or banks
- "Smishing" — phishing via SMS with urgent language and short URLs
Focus on: urgency language, suspicious links, fake government/bank claims.
  `.trim(),

  email: `
This is an email message body or subject line. Common scams in this channel:
- Gmail or Outlook phishing with spoofed sender domains (e.g. support@paypa1.com)
- Fake invoice or payment requests pretending to be from vendors
- Business email compromise (BEC) — impersonating a boss or executive
- Account verification emails with malicious links
- IRS tax refund or audit notices
- Job offer emails asking for personal info upfront
Focus on: spoofed domains, urgent payment requests, authority impersonation, suspicious links.
  `.trim(),

  call: `
This is a phone call script, voicemail transcript, or description of a call received. Common scams:
- IRS agents threatening arrest for unpaid taxes
- Social Security Administration claiming your SSN is suspended
- Immigration officers threatening deportation
- Bank fraud departments asking to confirm account info or transfer funds
- Tech support (Microsoft, Apple) requesting remote access
- Utility companies threatening to shut off service immediately
Focus on: government impersonation, threats of arrest or legal action, requests for gift cards or wire transfers.
  `.trim(),

  social: `
This is a social media message, DM, post, or comment. Common scams in this channel:
- Instagram or Facebook giveaway scams requiring personal info to claim prize
- Fake job offers sent via DM promising high pay with no experience
- Crypto investment opportunities with guaranteed returns
- Romance scams — building trust before asking for money
- Fake influencer sponsorship opportunities asking for bank details
- Impersonation of friends or family accounts asking for money
Focus on: unrealistic offers, requests for sensitive info, emotional manipulation, unsolicited contact.
  `.trim(),
}
