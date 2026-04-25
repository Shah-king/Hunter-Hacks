# TrustLayer — Plan (v3)

**One-liner:** Automated email fraud detection — monitors your inbox, catches scams with AI, and alerts you in your language.

---

## 1. Problem

- **47% of immigrants** are targeted by scams within their first 2 years in the US
- Scammers exploit language barriers, unfamiliarity with US systems, and fear of authorities
- Common email attacks: fake IRS notices, phishing, job offer fraud, business email compromise
- Average loss: **$500–$5,000+ per incident**
- **Why current tools fail:**
  - Spam filters use keyword matching — sophisticated social engineering slips through
  - No tool explains *why* it's a scam, *in the victim's language*, with *what to do next*
  - Immigrants often don't report because they fear immigration consequences

---

## 2. Solution

TrustLayer connects to a user's email. When an email arrives, it flows through a **multi-stage pipeline**:

1. Detect language + translate to English (if needed)
2. Run through rule-based keyword filters
3. OpenAI scores the email for fraud (scoring-only call)
4. If fraud score exceeds threshold → OpenAI generates a warning in the user's language → alert email sent
5. **Dashboard** shows every email processed, its fraud score, and whether an alert was sent

**This is not a paste-and-check tool. It's an automated protection layer that runs in the background.**

---

## 3. Pipeline Architecture

```
Email arrives (any language)
       │
       ▼
┌─────────────────────────────────┐
│  Stage 0: Language Detection    │  ← OpenAI gpt-4o-mini
│  + Translation to English       │     Returns: detected_language,
│                                 │     english_text, original_text
└──────────┬──────────────────────┘
           ▼
┌─────────────────────────────────┐
│  Stage 1: Rule-Based Filter     │  ← No AI. Deterministic.
│  Keywords + pattern matching    │     Scam phrases, suspicious domains,
│  on english_text                │     urgency language, payment requests
│  Output: rule_score (0-100)     │
└──────────┬──────────────────────┘
           ▼
┌─────────────────────────────────┐
│  Stage 2: AI Fraud Scoring      │  ← OpenAI gpt-4o-mini
│  Scoring-only prompt:           │     "Rate this email 0-100 for fraud.
│  No explanation, just a number  │      Return JSON only."
│  Output: ai_score (0-100)       │
└──────────┬──────────────────────┘
           ▼
┌─────────────────────────────────┐
│  Stage 3: Score Aggregation     │  ← Weighted average:
│  + Threshold Check              │     final = 0.3*rule + 0.7*ai
│                                 │     If final > 70 → FRAUD
│                                 │     If final > 40 → SUSPICIOUS
│                                 │     Else → SAFE
└──────────┬──────────────────────┘
           ▼ (only if FRAUD)
┌─────────────────────────────────┐
│  Stage 4: OpenAI Response       │  ← gpt-4o-mini generates warning
│  Generate warning email in      │     in detected_language
│  user's detected language       │     Sent to user via Resend API
└─────────────────────────────────┘
```

**All emails + scores are logged to the database and visible on the dashboard.**

### Why This Pipeline (Not Just One Call)

You might ask: "Why not just send the email to OpenAI in one shot?"

Separation matters:
- **Stage 1 (rule-based)** is free, instant, and deterministic — catches obvious scams without any API cost
- **Stage 2 (AI scoring)** is a focused scoring call — easier to calibrate than a multi-task prompt
- **Stage 4 (response)** only runs when fraud is confirmed — saves money on safe emails
- If OpenAI goes down, Stage 1 still works as a basic filter

---

## 4. Multilingual Strategy

**Problem:** Rule-based filter only works on English text.

**Solution:** Translate first, evaluate in English, respond in detected language.

```
Email (Spanish) ──▶ Stage 0: OpenAI detects "es", translates to English
                          │
                          ▼
                    english_text goes through Stage 1 + 2 ✅
                          │
                          ▼
                    Stage 4: OpenAI generates warning in Spanish ✅
```

### Stage 0 — Language Detection + Translation

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{
    role: "system",
    content: `Detect the language of the following text.
If it is not English, translate it to English.
Return JSON: {
  "detected_language": "language code (e.g. es, zh, bn, en)",
  "language_name": "human readable (e.g. Spanish, Chinese)",
  "is_english": true/false,
  "english_text": "translated or original text"
}`
  }, {
    role: "user",
    content: emailBody
  }],
  response_format: { type: "json_object" }
});
```

### Stage 2 — AI Fraud Scoring

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{
    role: "system",
    content: `You are a fraud detection system. Analyze the following email
and score it for fraud/scam likelihood.
Return JSON: {
  "fraud_score": 0-100,
  "scam_type": "phishing|impersonation|job_scam|investment|romance|government|other|none",
  "red_flags": ["list", "of", "specific", "red", "flags", "found"],
  "reasoning": "one sentence why"
}`
  }, {
    role: "user",
    content: englishText
  }],
  response_format: { type: "json_object" }
});
```

### Stage 4 — Warning Response (Only If Fraud)

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{
    role: "system",
    content: `You are a fraud protection assistant. Generate a clear, helpful
warning email about a detected scam. Write entirely in ${detectedLanguage}.
Include: what the scam is, why it's dangerous, and 3 specific action steps.
Keep it concise and non-alarming — helpful, not scary.`
  }, {
    role: "user",
    content: JSON.stringify({ original_email: originalText, red_flags, fraud_score })
  }]
});
```

### Cost Per Email

| Stage | Model | Cost |
|-------|-------|------|
| Stage 0 (detect + translate) | gpt-4o-mini | ~$0.0001 |
| Stage 2 (fraud scoring) | gpt-4o-mini | ~$0.0002 |
| Stage 4 (warning, fraud only) | gpt-4o-mini | ~$0.0003 |
| **Total per email** | | **< $0.001** |

---

## 5. Email Integration (Easiest Solution)

### How Emails Get Into Our System

**Approach: Email Forwarding + SendGrid Inbound Parse**

No OAuth, no Gmail API, no IMAP. Simplest viable approach.

1. User signs up on our dashboard (enters their email)
2. We give them a unique forwarding address: `user123@parse.trustlayer.app`
3. User adds an auto-forward rule in Gmail/Outlook to forward all emails to that address
4. SendGrid Inbound Parse receives the email and hits our webhook: `POST /api/webhook/email`
5. Our pipeline processes it

```
User's Gmail ──(auto-forward)──▶ user123@parse.trustlayer.app
                                        │
                                        ▼
                              SendGrid Inbound Parse
                                        │
                                        ▼
                              POST /api/webhook/email
                              { from, to, subject, body, user_id }
                                        │
                                        ▼
                              Pipeline (Stage 0 → 4)
```

**Setup required:**
- SendGrid account (free tier: 100 emails/day)
- Domain with DNS control (add MX records pointing to SendGrid)
- One webhook endpoint in our Next.js backend

### How Alert Emails Get Sent

**Approach: Resend API** (simplest email sending service)

When fraud is detected (Stage 4), we send a warning email to the user via Resend:
- Free tier: 100 emails/day
- 3 lines of code to send an email
- No SMTP config needed

### Demo Fallback

If DNS/SendGrid setup takes too long, add a **"Simulate Email"** button on the dashboard that manually triggers the webhook with a sample email. This lets the demo work without real email forwarding.

---

## 6. Dashboard

The dashboard is the main UI. It shows everything that's happening.

### Views

**Main Feed (default):**
- List of all received emails, newest first
- Each row shows:
  - 📧 Sender + subject line
  - 🕐 Timestamp
  - 🔴🟡🟢 Risk badge (Scam / Suspicious / Safe)
  - 📊 Fraud score (0-100)
  - ✉️ "Alert Sent" or "No Action" indicator
- Click any row → expand to see full analysis (explanation, red flags, action steps)

**Stats Bar (top):**
- Total emails processed
- Fraud detected count
- Alerts sent count
- Languages detected

### Filtering
- Filter by risk level (Scam / Suspicious / Safe)
- Filter by date range
- Search by sender or subject

---

## 7. Database

**We need a database for:**
- User accounts (email, forwarding address, language preference)
- Processed emails (from, subject, body, timestamp)
- Analysis results (fraud score, risk level, red flags, alert sent)

### Easiest Solution: Supabase

| Why Supabase | Details |
|-------------|---------|
| Free tier | 500MB storage, 50K API requests/month |
| Real PostgreSQL | Proper relational DB |
| Built-in auth | Optional, can use for user login |
| REST API | Auto-generated from tables, no ORM needed |

### Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  forwarding_address TEXT UNIQUE NOT NULL,
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Processed Emails
CREATE TABLE processed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  sender TEXT,
  subject TEXT,
  body TEXT,
  detected_language TEXT,
  english_text TEXT,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- Analysis Results
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES processed_emails(id),
  rule_score INTEGER,
  ai_score INTEGER,
  final_score INTEGER,
  risk_level TEXT, -- 'scam' | 'suspicious' | 'safe'
  scam_type TEXT,
  red_flags TEXT[],
  explanation TEXT,
  actions TEXT[],
  alert_sent BOOLEAN DEFAULT FALSE,
  analyzed_at TIMESTAMPTZ DEFAULT now()
);
```

### Fallback: In-Memory for Demo

If Supabase setup is slow, use an in-memory array on the server. Dashboard still works, data just doesn't persist across restarts.

---

## 8. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **Next.js 14 + Tailwind CSS** | Dashboard UI, fast to build |
| Backend | **Next.js API Routes** | Webhook endpoint, pipeline orchestration |
| AI | **OpenAI API (gpt-4o-mini)** | Language detection, fraud scoring, response generation |
| Database | **Supabase (PostgreSQL)** | User accounts, email logs, results |
| Email Inbound | **SendGrid Inbound Parse** | Receives forwarded emails via webhook |
| Email Outbound | **Resend** | Sends fraud alert emails to users |
| Deployment | **Render.com** | Free tier, no strict function timeout |

No Python service. No separate ML models. No microservices. **One Next.js app does everything.**

### Environment Variables

```
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SENDGRID_API_KEY=...
RESEND_API_KEY=...
```

---

## 9. Execution Plan

### Phase 1: Setup (0–2 hours)
- [ ] Initialize Next.js 14 + Tailwind + TypeScript
- [ ] Set up Supabase project + create tables
- [ ] Install dependencies: `openai`, `@supabase/supabase-js`, `resend`
- [ ] Set env vars
- [ ] Deploy skeleton to Render.com

### Phase 2: Core Pipeline (2–8 hours)
- [ ] Build `POST /api/webhook/email` — receives email data
- [ ] Implement Stage 0: OpenAI language detection + translation
- [ ] Implement Stage 1: Rule-based keyword/pattern scoring
- [ ] Implement Stage 2: OpenAI fraud scoring (scoring-only prompt)
- [ ] Implement Stage 3: Score aggregation + threshold check
- [ ] Implement Stage 4: OpenAI generates warning → Resend sends alert
- [ ] Save all results to Supabase
- [ ] Test with sample scam emails (IRS, phishing, job scam)

### Phase 3: Dashboard (8–14 hours)
- [ ] Build dashboard layout (stats bar + email feed)
- [ ] Fetch processed emails from Supabase
- [ ] Email list with risk badges, scores, alert indicators
- [ ] Expandable rows showing full analysis details
- [ ] "Simulate Email" button for demo
- [ ] Filter by risk level

### Phase 4: Email Integration (14–17 hours)
- [ ] Set up SendGrid Inbound Parse (domain + MX records + webhook)
- [ ] Test: forward a real email → confirm pipeline runs end-to-end
- [ ] Build simple signup page (enter email → get forwarding address)
- [ ] If SendGrid fails → "Simulate Email" button is the demo fallback

### Phase 5: Polish + Demo Prep (17–22 hours)
- [ ] Mobile responsive dashboard
- [ ] Loading states + error handling
- [ ] Risk badge animations (red pulse for scam)
- [ ] Pre-populate dashboard with 5+ sample emails for demo
- [ ] Practice demo 3 times
- [ ] Record backup video

---

## 10. Project Structure

```
Hunter-Hacks/
├── trust-layer/                         ← Next.js app (everything in one project)
│   ├── app/
│   │   ├── page.tsx                     ← Dashboard (main UI)
│   │   ├── signup/page.tsx              ← User signup (enter email)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── webhook/
│   │       │   └── email/route.ts       ← POST — SendGrid webhook
│   │       ├── emails/
│   │       │   └── route.ts             ← GET — fetch processed emails
│   │       └── simulate/
│   │           └── route.ts             ← POST — simulate email for demo
│   ├── components/
│   │   ├── Dashboard.tsx                ← Main email feed
│   │   ├── EmailRow.tsx                 ← Single email row (expandable)
│   │   ├── RiskBadge.tsx                ← Color-coded Scam/Suspicious/Safe
│   │   ├── AnalysisDetail.tsx           ← Expanded analysis view
│   │   ├── StatsBar.tsx                 ← Top-level counters
│   │   ├── SignupForm.tsx               ← Email signup form
│   │   └── SimulateButton.tsx           ← Demo: trigger fake email
│   ├── lib/
│   │   ├── openai.ts                    ← OpenAI client config
│   │   ├── supabase.ts                  ← Supabase client config
│   │   ├── pipeline.ts                  ← Orchestrates Stage 0-4
│   │   ├── rules.ts                     ← Stage 1: rule-based scoring
│   │   ├── email-sender.ts             ← Resend: send alert emails
│   │   └── types.ts                     ← TypeScript types
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── plan.md
└── architecture.md
```

---

## 11. Demo Script (3 Minutes)

### 0:00–0:30 — Hook
> "Every year, immigrants in the US lose over $2 billion to scams. Not because they're careless — because scammers target people who don't know the system and are afraid to ask for help. We built TrustLayer — an automated shield that monitors your email and catches fraud before you fall for it."

### 0:30–1:15 — Show the Pipeline
1. Open the dashboard — show it's live, monitoring
2. Click **"Simulate Email"** — paste a fake IRS phishing email
3. Show the pipeline running:
   - Language detected: English ✅
   - Rule-based score: 72 ⚠️
   - AI fraud score: 94 🔴
   - Final verdict: **SCAM — 87% confidence**
4. Email appears in dashboard with red badge

### 1:15–1:45 — The Alert
5. Show the alert email auto-sent to the user:
   - Subject: "⚠️ TrustLayer: Scam Detected in Your Email"
   - Warning with red flags highlighted
   - 3 action steps: don't respond, block sender, report to FTC

### 1:45–2:15 — Multilingual
6. Simulate another email — this time a scam in **Spanish**
7. Show: language detected as Spanish, translated for analysis, pipeline runs
8. Alert email arrives — **written entirely in Spanish**
9. **Say:** "One pipeline. Any language. The victim gets help in the language they actually understand."

### 2:15–3:00 — Dashboard + Close
10. Show dashboard with both emails logged, scores visible, alerts marked
11. > "TrustLayer doesn't wait for victims to realize they're being scammed. It catches fraud automatically, explains it in their language, and tells them what to do — before they lose a dollar."

---

## 12. Risks + Mitigations

| Risk | Mitigation |
|------|-----------|
| OpenAI scores inconsistently | Combine with rule-based score (Stage 1) for stability. Tune the prompt. |
| SendGrid DNS setup takes too long | "Simulate Email" button as demo fallback |
| OpenAI API latency in demo | Pre-warm API before demo; have pre-recorded backup |
| Supabase connection issues | Fallback to in-memory array for demo |
| Scope creep | Dashboard + pipeline = the demo. Nothing else. |

---

## 13. What We Are NOT Building

- ❌ Separate ML models / Python microservice
- ❌ Browser extension
- ❌ SMS / call / social media monitoring
- ❌ Community feed / TrustWall
- ❌ Gamification / points / badges
- ❌ User auth with passwords (just email signup)

**Focus: email pipeline + dashboard. That's the demo.**

---

## 14. Future Vision (Tell Judges This)

- **Gmail/Outlook OAuth** — one-click "Connect your email" instead of manual forwarding
- **Specialized ML models** — fine-tuned fraud classifiers for higher accuracy
- **SMS + call monitoring** — expand beyond email to all channels
- **Browser extension** — real-time scanning inside Gmail/Outlook UI
- **Community layer** — users report scams, building a shared defense network
- **Partnership with immigrant orgs** — deploy through community centers, ESL programs, legal aid
