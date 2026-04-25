export function redactPII(text: string): string {
  if (!text) return text
  // Redact basic SSN patterns
  let redacted = text.replace(/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g, "[REDACTED SSN]")
  // Redact basic credit card patterns (13-16 digits)
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, "[REDACTED CARD]")
  // Redact basic phone numbers (US)
  redacted = redacted.replace(/\b\+?1?[-.]?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g, "[REDACTED PHONE]")
  return redacted
}