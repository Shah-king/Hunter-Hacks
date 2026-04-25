# TrustLayer — Plan (24-Hour Build)

**One-liner:** Real-time, multi-channel scam and fraud protection for immigrants and international students — powered by OpenAI GPT-4o, multilingual by default.

---

## 1. The Problem

- **47% of immigrants** are targeted by scams within their first 2 years in the US
- Scammers exploit language barriers, unfamiliarity with US systems, and fear of authorities
- Attack channels: fake IRS calls, phishing emails, job offer fraud, rental scams, social media cons
- Average loss: **$500–$5,000+ per incident**
- **Why current tools fail:**
  - Spam filters use keyword rules — sophisticated social engineering slips through
  - FTC complaint forms are English-only, buried, and retroactive
  - No tool explains *why* it's a scam in the victim's language with *what to do right now*

---

## 2. Solution

TrustLayer lets anyone paste a suspicious message across **4 channels** (SMS, Email, Call, Social) and instantly get:

- **Risk level** — Scam / Suspicious / Safe
- **Confidence score** (%)
- **Red flags** highlighted directly in the message
- **Plain-language explanation + action steps** in their native language

**Powered by OpenAI GPT-4o** — handles detection, classification, explanation, and translation in one call. No separate ML service. No training. Ship fast.

---

## 3. AI Layer — OpenAI GPT-4o

### Why OpenAI (Not a Custom ML Model)

- Multilingual natively — no separate translation step
- Deep understanding of scam patterns, US government systems, cultural context
- Structured JSON output via function calling / response format
- Zero training, zero infrastructure — one API key and go
- GPT-4o is fast enough for real-time demo (<3 seconds per call)
- **We have <24 hours — this is the right call**

### What GPT-4o Does Per Request

1. Analyze the message for scam indicators specific to the channel (SMS / Email / Call / Social)
2. Classify: **Scam / Suspicious / Safe** with a confidence score
3. Identify scam type (Government Impersonation, Phishing, Job Fraud, etc.)
4. Extract specific red flag phrases from the original text
5. Write a plain-language explanation in the user's selected language
6. Generate 3–5 action steps in the user's selected language

### Channel-Aware Prompting

Each tab sends a `channel` field that adjusts the system prompt context:

| Tab | GPT-4o Context Added |
|-----|---------------------|
| **SMS** | Phone scams, USPS fraud, fake delivery alerts, prize texts |
| **Email** | Gmail/Outlook phishing, BEC, fake invoices, spoofed domains |
| **Call** | IRS calls, SSN suspension, immigration threats, voicemail scripts |
| **Social** | Instagram giveaways, fake job DMs, crypto fraud, romance scams |

---

## 4. MVP Scope (Strict — 24 Hours)

### Building This:
- [ ] 4-tab UI: SMS / Email / Call / Social
- [ ] Message input + language selector
- [ ] Analyze button → GPT-4o call → results
- [ ] Results: risk badge + confidence + red flags + explanation + actions
- [ ] TrustWall feed (hardcoded fake data — looks real)
- [ ] Gamification: points counter + badge display (UI only)

### NOT Building:
- No custom ML models
- No Python microservice
- No database
- No user auth
- No real-time TrustWall updates
- No SMS/email integration
- No browser extension

---

## 5. User Flow

1. User opens TrustLayer — no login
2. Selects channel tab (SMS / Email / Call / Social)
3. Pastes suspicious message
4. Selects output language (English, Chinese, Spanish, Bengali, Haitian Creole)
5. Clicks **Analyze**
6. Loading spinner: "Analyzing with AI..."
7. Results appear:
   - Color-coded risk badge (red/yellow/green) + confidence %
   - Original message with red flag phrases highlighted
   - 2–3 sentence explanation in selected language
   - Numbered action steps in selected language
8. Option: "Share to TrustWall" → adds to community feed (fake post for demo)

---

## 6. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js 14 + Tailwind CSS | Fast to build, easy to deploy |
| Backend | Next.js API Routes | No separate server needed |
| AI | OpenAI GPT-4o | Fraud detection + multilingual in one call |
| SDK | `openai` npm package | Official Node.js client |
| Deployment | Vercel | One-click deploy, free tier |

No database. No auth. No ML service. No translation API.

---

## 7. Detection Logic (GPT-4o Prompt Strategy)

GPT-4o receives a structured system prompt instructing it to:

**Scam signals to identify (channel-specific):**
- Urgency language: "act now", "immediately", "last warning", "your account will be closed"
- Authority impersonation: IRS, SSA, ICE, immigration officers, bank fraud departments
- Payment red flags: gift cards, wire transfer, crypto, Western Union, Zelle
- Threats: arrest, deportation, warrant, lawsuit, account closure
- Too-good-to-be-true: job paying $5000/week, free visa, lottery winnings
- Suspicious URLs, spoofed domains, unknown phone numbers

**Classification logic:**
- **Scam** — 2+ strong signals, clear malicious intent
- **Suspicious** — 1 signal or ambiguous intent
- **Safe** — no signals detected

**Output format (JSON via `response_format`):**
```json
{
  "risk_level": "scam",
  "confidence": 96,
  "scam_type": "Government Impersonation",
  "red_flags": ["Urgency — 'immediately'", "SSN cannot be suspended", "Unsolicited SMS"],
  "explanation": "...",
  "actions": ["...", "..."]
}
```

---

## 8. Execution Plan (24 Hours)

### Phase 1 — Setup (0–2 hrs)
- [ ] `npx create-next-app` with TypeScript + Tailwind
- [ ] Add `openai` package, set `OPENAI_API_KEY` in `.env.local`
- [ ] Deploy skeleton to Vercel
- [ ] Define API route shape + TypeScript types

### Phase 2 — Core Build (2–8 hrs)
- [ ] Build `POST /api/analyze` — accepts `{ text, channel, language }`, calls GPT-4o, returns result
- [ ] Write GPT-4o system prompt with channel-aware context
- [ ] Build main page: `<ChannelTabs />`, `<MessageInput />`, `<LanguageSelector />`, `<AnalyzeButton />`
- [ ] Build `<ResultsPanel />`: risk badge + explanation + actions
- [ ] Connect frontend to API
- [ ] Test with 5 real scam examples across 3 channels

### Phase 3 — Multilingual + Red Flags (8–13 hrs)
- [ ] Confirm GPT-4o returns explanation + actions in selected language
- [ ] Test: Chinese, Spanish, Bengali, Haitian Creole outputs
- [ ] Build `<HighlightedText />` — underline red flag phrases in original message
- [ ] Add scam type label to results

### Phase 4 — TrustWall UI (13–18 hrs)
- [ ] Build `/trustwall` page with hardcoded scam posts
- [ ] `<ScamPost />` — username, snippet, channel tag, language tag, reaction counts
- [ ] `<ReactionButtons />` — "I got this too" / "Scam confirmed" (local state only)
- [ ] Points counter in nav (fake increment on each analysis)

### Phase 5 — Polish + Demo Prep (18–24 hrs)
- [ ] Red pulse animation on Scam badge
- [ ] Loading skeleton during analysis
- [ ] Mobile responsive
- [ ] 3 pre-loaded example messages (click to populate)
- [ ] Error handling + retry
- [ ] Practice demo script 3 times
- [ ] Record backup video

---

## 9. Task Checklist

- [ ] `npx create-next-app` — TypeScript + Tailwind
- [ ] Install `openai` package
- [ ] Create `/app/api/analyze/route.ts`
- [ ] Write `lib/openai.ts` — client + system prompt builder
- [ ] Write `lib/types.ts` — `AnalysisResult` type
- [ ] Write `lib/constants.ts` — languages, example messages, fake TrustWall posts
- [ ] Write `lib/channelContext.ts` — channel → prompt context map
- [ ] Build `<ChannelTabs />`
- [ ] Build `<MessageInput />`
- [ ] Build `<LanguageSelector />`
- [ ] Build `<AnalyzeButton />`
- [ ] Build `<ResultsPanel />`
- [ ] Build `<RiskBadge />`
- [ ] Build `<HighlightedText />`
- [ ] Build `<Explanation />`
- [ ] Build `<ActionSteps />`
- [ ] Build `<TrustWallFeed />`
- [ ] Build `<ScamPost />`
- [ ] Build `<ReactionButtons />`
- [ ] Test: fake IRS SMS → Spanish → Scam
- [ ] Test: phishing email → Chinese → Scam
- [ ] Test: fake job offer → Bengali → Suspicious
- [ ] Test: normal message → English → Safe
- [ ] Deploy to Vercel
- [ ] Prepare pitch deck

---

## 10. Team Roles

### AI / Logic (1 person)
- Write and iterate on GPT-4o system prompt
- Handle channel-aware context injection
- Parse + validate structured JSON response
- **Deliverable:** `/api/analyze` returns correct results for all test cases in all languages

### Frontend (1 person)
- Build all UI components
- Handle tab state, loading states, results rendering
- `<HighlightedText />` — match red flag strings in original message
- **Deliverable:** Clean, working UI that displays results clearly on mobile + desktop

### Integration + TrustWall (1 person)
- Connect frontend to API end-to-end
- Build TrustWall page with realistic fake data
- Reaction buttons + points counter (local state)
- **Deliverable:** Full demo flow works on live Vercel URL

### Presentation (shared)
- Build 7-slide pitch deck
- Write + rehearse demo script
- **Deliverable:** Polished 3-minute demo

---

## 11. Demo Script (3 Minutes — Judge-Winning)

### 0:00–0:30 — Hook
> "Every year, immigrants in the US lose over $2 billion to scams. Not because they're careless — because scammers target people who don't know the system, and every existing tool either misses sophisticated attacks or only works in English. TrustLayer fixes both."

### 0:30–1:30 — The Detection
1. Go to **Email tab**
2. Paste fake IRS phishing email
3. Select **Chinese** output
4. Hit **Analyze**
5. Show results:
   - Red badge: **SCAM — 96% confidence**
   - Scam phrases highlighted in the original text
   - Explanation in **Chinese**: *"这是一封钓鱼邮件。IRS从不通过电子邮件要求付款..."*
   - Action steps in Chinese

### 1:30–2:00 — Switch Channel
6. Switch to **SMS tab**
7. Paste fake SSN suspension text
8. Select **Spanish**
9. Hit **Analyze** → results in Spanish
10. **Say:** "Same system. Different channel. Different language. Instant."

### 2:00–2:30 — TrustWall
11. Click **TrustWall**
12. Show community feed — posts in multiple languages with reaction counts
13. **Say:** "Our community is already reporting scams. Every submission trains the network."

### 2:30–3:00 — Close
> "Most teams built a chatbot. We built a fraud detection system — multi-channel, multilingual, with a community layer that gets smarter with every report. This is the safety net that should already exist."

---

## 12. Why TrustLayer Wins

| What Other Teams Do | What We Do |
|---------------------|-----------|
| Single text box, one language | 4 channels with channel-aware detection |
| English only | 5 languages, native-quality output |
| Generic scam warning | Red flags highlighted IN the original message |
| No community layer | TrustWall — community confirms and shares scams |
| "Future: multilingual" | Multilingual is live, in the demo, right now |

**The moment that wins:** switching to Chinese mid-demo. The room feels the problem.

---

## 13. Risks + Mitigations

| Risk | Mitigation |
|------|-----------|
| GPT-4o API latency | Pre-warm before demo; have backup screenshots |
| JSON parsing fails | Wrap in try/catch; fallback to safe error message |
| Highlighted text mismatches | Fuzzy-match red flag strings in frontend |
| Scope creep | If it's not paste → analyze → result, it's cut |
| Time runs out | Phase 2 alone is a working demo. TrustWall is polish |

---

## 14. Future Vision (Tell Judges)

- **Specialized fine-tuned models** per scam channel — once we have labeled data from TrustWall
- **Browser extension** — auto-scans emails inline inside Gmail / Outlook
- **SMS integration** — forward suspicious texts to TrustLayer's number, get a reply
- **Community training loop** — TrustWall confirmed posts become fine-tuning data
- **Partnership** — deploy through community centers, ESL programs, legal aid orgs
