# TrustLayer — Plan

**One-liner:** Real-time scam and fraud protection for immigrants and international students.

---

## 1. Problem

- **47% of immigrants** report being targeted by scams in their first 2 years in the US
- Scammers exploit language barriers, unfamiliarity with US systems, and fear of authorities
- Common attacks: fake IRS calls, rental scams, job offer fraud, phishing texts, social security threats
- Victims lose **$500-$5,000+ per incident** — money they cannot afford to lose
- **Why current solutions fail:**
  - Spam filters catch obvious junk, not sophisticated social engineering
  - FTC complaint forms are in English, buried, and slow
  - No tool explains *why* something is a scam or *what to do next* in the victim's language
  - Immigrants often don't report because they fear deportation consequences

---

## 2. Solution

TrustLayer lets anyone paste a suspicious message (text, email, DM) and instantly get a clear verdict: **Scam, Suspicious, or Safe** — with a plain-language explanation and specific action steps, all in their native language.

**Key differentiators:**
- **Multilingual by default** — explains threats in Spanish, Mandarin, Bengali, Haitian Creole, etc.
- **Explanation + action** — doesn't just flag danger, tells you exactly what to do
- **Zero setup** — paste and click, no account needed

---

## 3. MVP Scope (Strict)

We build ONLY this:

- [ ] Text input box (paste any suspicious message)
- [ ] "Analyze" button
- [ ] Output panel showing:
  - **Risk level:** Scam / Suspicious / Safe (color-coded)
  - **Explanation:** Why this is/isn't a scam (2-3 sentences, plain language)
  - **Action steps:** What to do right now (1-3 bullet points)
- [ ] Language selector for output translation

**NOT building:** browser extension, email integration, call detection, user accounts, history, reporting dashboard.

---

## 4. Core Features (3 Only)

### Feature 1: Scam Detection
- **What:** Analyzes pasted text and classifies risk level
- **Input:** Raw message text -> **Output:** Scam / Suspicious / Safe with confidence indicator
- **Why it matters:** Gives an instant second opinion when something feels wrong

### Feature 2: Multilingual Explanation
- **What:** Explains the verdict in the user's preferred language
- **Input:** Detection result + selected language -> **Output:** Clear explanation in that language
- **Why it matters:** English-only warnings fail the people most at risk

### Feature 3: Action Guidance
- **What:** Tells the user exactly what to do next
- **Input:** Scam type detected -> **Output:** Specific steps (block number, report to FTC, do NOT send money, etc.)
- **Why it matters:** Knowing it's a scam isn't enough — people freeze without clear next steps

---

## 5. User Flow (Demo-Focused)

1. User opens TrustLayer (no login required)
2. Pastes suspicious message into text box
3. Selects their preferred language (default: English)
4. Clicks **"Analyze"**
5. Loading spinner (1-3 seconds)
6. Results appear:
   - Red/yellow/green badge with risk level
   - 2-3 sentence explanation of why
   - Numbered action steps
7. User can switch language — explanation and actions re-render in new language

---

## 6. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **Next.js 14 + Tailwind CSS** | Fast to build, easy to deploy |
| Backend | **Next.js API Routes** | No separate server needed |
| AI | **Claude API (claude-sonnet-4-5)** | Best multilingual reasoning, handles nuance |
| Deployment | **Vercel** | One-click deploy, free tier |

No database. No auth. No external translation API needed — Claude handles translation natively.

---

## 7. Detection Logic

Claude receives a structured prompt with the suspicious message and is asked to:

1. **Identify scam signals:** urgency language ("act now", "your account will be closed"), authority impersonation (IRS, SSA, ICE), requests for payment (gift cards, wire transfer, crypto), suspicious links, too-good-to-be-true offers
2. **Classify risk:** Based on signal density and severity
   - **Scam** = 2+ strong signals, clear malicious intent
   - **Suspicious** = 1 signal or ambiguous intent
   - **Safe** = no signals detected
3. **Generate explanation:** In the selected language, referencing the specific signals found
4. **Generate action steps:** Based on scam type (phishing -> don't click links, report; IRS scam -> IRS never calls, hang up; rental -> never pay before seeing unit)

The prompt includes common scam patterns targeting immigrants specifically (ICE threats, visa scams, fake job offers requiring upfront payment).

---

## 8. Execution Plan

### Phase 1: Setup (0-2 hours)
- [ ] Initialize Next.js 14 repo with TypeScript + Tailwind
- [ ] Deploy skeleton to Vercel
- [ ] Set up Claude API key in environment variables
- [ ] Create basic page layout (header, input area, results area)
- [ ] Agree on component structure and API route shape

### Phase 2: Core Build (2-8 hours)
- [ ] Build input component (textarea + analyze button)
- [ ] Build API route `/api/analyze` that accepts message text + language
- [ ] Write Claude system prompt for scam detection
- [ ] Parse Claude's structured response (risk level, explanation, actions)
- [ ] Build results component (risk badge, explanation text, action list)
- [ ] Connect frontend to API, display results
- [ ] Test with 5+ real scam examples

### Phase 3: Intelligence Layer (8-14 hours)
- [ ] Refine Claude prompt with immigrant-specific scam patterns
- [ ] Add language selector (English, Spanish, Mandarin, Bengali, Haitian Creole)
- [ ] Ensure explanation + actions render in selected language
- [ ] Add scam type label (IRS, phishing, rental, job, romance, etc.)
- [ ] Add "common signs" section highlighting specific red flags found in the message
- [ ] Test with messages in multiple languages as INPUT (not just output)

### Phase 4: Polish (14-20 hours)
- [ ] Color-coded risk badges (red/yellow/green)
- [ ] Loading animation during analysis
- [ ] Mobile-responsive layout
- [ ] Add 3 pre-loaded example scam messages users can click to try
- [ ] Error handling (empty input, API failure)
- [ ] Final UI pass — clean typography, spacing, contrast

### Phase 5: Pitch + Demo (Final hours)
- [ ] Build pitch deck (max 7 slides)
- [ ] Write demo script
- [ ] Practice demo 3 times
- [ ] Record backup video
- [ ] Submit to Devpost

---

## 9. Task Checklist

- [ ] `npx create-next-app` with TypeScript + Tailwind
- [ ] Create `/app/page.tsx` — main UI with input + results
- [ ] Create `/app/api/analyze/route.ts` — POST endpoint
- [ ] Write `systemPrompt.ts` — Claude scam detection prompt
- [ ] Build `<RiskBadge />` component (Scam/Suspicious/Safe)
- [ ] Build `<Explanation />` component
- [ ] Build `<ActionSteps />` component
- [ ] Build `<LanguageSelector />` component
- [ ] Build `<ExampleMessages />` component (pre-loaded scam examples)
- [ ] Add Anthropic SDK (`@anthropic-ai/sdk`)
- [ ] Test: fake IRS message -> should return Scam
- [ ] Test: normal message from friend -> should return Safe
- [ ] Test: ambiguous job offer -> should return Suspicious
- [ ] Test: output in Spanish, Mandarin, Bengali
- [ ] Deploy final version to Vercel
- [ ] Prepare pitch deck
- [ ] Rehearse demo

---

## 10. Team Roles

### AI / Logic (1 person)
- Write and iterate on Claude system prompt
- Handle API route and response parsing
- Test detection accuracy across scam types
- **Deliverable:** `/api/analyze` returns correct, structured results for all test cases

### Frontend (1 person)
- Build all UI components
- Handle state management (input -> loading -> results)
- Mobile responsiveness
- **Deliverable:** Clean, working UI that displays results clearly

### Backend + Integration (1 person)
- Set up Next.js project and deployment
- Connect frontend to API
- Environment variables, error handling, edge cases
- **Deliverable:** End-to-end flow works on deployed Vercel URL

### Presentation (1 person, shared role)
- Build pitch deck
- Write demo script
- Coordinate practice runs
- **Deliverable:** Polished 3-minute demo ready to present

---

## 11. Demo Script (3 Minutes)

### 0:00 - 0:30: The Hook
> "Last year, immigrants in the US lost over $2 billion to scams. Not because they're careless — because scammers specifically target people who don't know the system yet, don't speak English fluently, and are afraid to ask for help."

### 0:30 - 1:00: Show the Problem
Paste this real-world scam message:
> "URGENT: This is the IRS. Your Social Security number has been suspended due to suspicious activity. You must call 1-800-XXX-XXXX immediately or a warrant will be issued for your arrest. Press 1 to speak with an agent."

### 1:00 - 1:45: The Analysis
Click "Analyze." Results appear:
- **Risk: SCAM** (red badge)
- **Type: Government Impersonation**
- **Explanation:** "This is a scam. The IRS never contacts people by text message, never threatens arrest, and never asks you to call a phone number to avoid a warrant. Your Social Security number cannot be 'suspended.' This is a common scam targeting immigrants."
- **Actions:** (1) Do not call this number. (2) Block the sender. (3) Report to FTC at reportfraud.ftc.gov.

### 1:45 - 2:15: Multilingual
Switch language to Spanish. Same results now display:
> "Esto es una estafa. El IRS nunca contacta a las personas por mensaje de texto, nunca amenaza con arresto..."

Switch to Mandarin. Results re-render in Chinese.
> "这是一个骗局。IRS从不通过短信联系人..."

### 2:15 - 3:00: Close
> "TrustLayer is one paste away from protecting the people who need it most. No account, no download, no English required. We're building the safety net that should already exist."

---

## 12. Winning Strategy

**Why judges will pick TrustLayer:**

1. **Real, urgent problem** — immigrant scam targeting is documented, growing, and underserved
2. **Clear user** — not abstract; we can name exactly who this helps and show the pain
3. **Working demo** — paste a message, get a result. Simple, tangible, impressive
4. **Emotional impact** — multilingual output hits hard in a live demo. Switching to Spanish or Mandarin makes the room feel the problem
5. **Technical substance** — smart use of LLM for classification + explanation + translation in one call
6. **Feasible beyond hackathon** — browser extension, SMS integration, and community reporting are obvious next steps

**In the presentation, emphasize:**
- The HUMAN story (use a real scam example, mention real dollar losses)
- The multilingual moment (switch languages live — this is the "wow" moment)
- Simplicity (no login, no setup, just paste and know)

---

## 13. Risks

| Risk | Mitigation |
|------|-----------|
| Claude misclassifies a message | Add disclaimer: "This is a tool to help you evaluate — when in doubt, don't send money" |
| API latency makes demo slow | Pre-warm the API before demo; have backup screenshots |
| Scope creep | MVP is ONE page. If it's not paste -> analyze -> result, it's out of scope |
| Time runs out | Core build (Phase 2) is the minimum viable demo. Everything after is polish |

---

## 14. Future Vision

- **Browser extension** — auto-scans emails and flags suspicious messages inline
- **SMS integration** — forward a suspicious text to TrustLayer's number, get a reply
- **Real-time call detection** — listen to live calls and alert if scam patterns detected
- **Community reporting** — users flag new scam patterns, improving detection for everyone
- **Partnership with immigrant orgs** — distribute through community centers, legal aid, ESL programs
