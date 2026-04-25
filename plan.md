## Project Overview

**TrustFund** is a digital app for ROSCAs (rotating savings and credit associations) — informal savings circles that immigrant communities have used for generations. They go by many names:

- **Susu** in West African communities
- **Tanda** in Latin American communities
- **Hui** in Chinese communities
- **Kye** in Korean communities

**Core behavior:** A small trusted group (5-10 people) contributes a fixed amount monthly into a shared pot. One member receives the full pot each cycle. The rotation continues until every member has received once.

**Why it matters:** There are 4 million immigrants in NYC, most with no credit history. They already run these savings circles on WhatsApp group chats and Google Sheets. TrustFund digitizes existing trusted behavior — we are not inventing new behavior.

**Tracks targeted:**
- Manhattan Finance
- Queens Immigrant Support
- Multilingual Tools

**Tagline:** "Immigrants built their own banking system decades ago. We just built the app for it."

---

## How It Works (User Flow)

### 1. Circle Creation
The host opens VisaWallet and creates a new circle. They set:
- Contribution amount (e.g., $200/month)
- Cycle length (e.g., monthly)
- Member count (e.g., 6 people)
- Payout order (host assigns or members pick slots)

**On screen:** A form with these fields, a preview card showing "6 members x $200/month = $1,200 pot per cycle", and a "Create Circle" button.

### 2. Member Invitation and Onboarding
The host sends SMS invites to each member via Twilio. Each person receives a link.

**On screen (invitee):** A landing page showing the circle name, contribution amount, cycle schedule, and payout order. The member taps "Accept & Join", agrees to terms, and confirms their payment method (Stripe test mode).

### 3. Monthly Contribution
On the due date, each member pays their fixed amount into the shared pot. Twilio sends SMS reminders 3 days before and on the day.

**On screen:** A contribution page showing "Your payment of $200 is due April 25". A "Pay Now" button triggers the Stripe test charge. The shared ledger updates in realtime showing who has paid and who hasn't.

### 4. Payout Day
Once all members have contributed for the cycle, the designated member receives the full pot.

**On screen:** A payout confirmation screen showing "$1,200 sent to María (Month 3 recipient)". The schedule advances to show the next recipient. The ledger updates with a green checkmark for the completed payout.

### 5. Cycle Completion
After every member has received the pot once, the circle is complete. The host can close the circle or restart a new cycle.

**On screen:** A completion summary showing all payouts made, total money moved, and a "Start New Cycle" or "Close Circle" button.

---

## Core Features

These are the 5 features we are building during the hackathon:

- [ ] **Create a circle** — Host sets contribution amount, cycle length, member count, and payout order
- [ ] **Invite and onboard members** — SMS invite link, accept terms, confirm payment method
- [ ] **Shared ledger view** — Realtime transparency into who paid, who hasn't, and payout history (transparency is the trust mechanism)
- [ ] **Automated SMS reminders** — Twilio sends reminders 3 days before and on the due date
- [ ] **Payout simulation** — Stripe test mode simulates the full payout flow with no real money

---

## Out of Scope

What we are NOT building:

- No real banking integration — all payments are Stripe test mode
- No KYC or identity verification
- No credit reporting
- No native mobile app — PWA only
- No blockchain
- No social feed, profile photos, dark mode, or settings page

---

## Claude AI Layer

### Multilingual Onboarding Agent

Claude powers a conversational onboarding flow that speaks Spanish, Mandarin, Bengali, and Haitian Creole. The user describes their situation in their own language, and Claude explains the circle setup back in that language.

**Example 1 — Spanish:**
> **User:** "Hola, quiero hacer una tanda con mis compañeras de trabajo. Somos 6 y queremos poner $200 cada mes."
>
> **Claude:** "¡Perfecto! Voy a crear un círculo para 6 personas con una contribución de $200 al mes. Eso significa que cada mes, una persona recibirá $1,200. El ciclo completo durará 6 meses. ¿Quieres elegir el orden de pago ahora o dejar que tus compañeras elijan sus turnos?"

**Example 2 — Mandarin:**
> **User:** "我想和几个朋友一起做会，每人每月存300美元，一共8个人。"
>
> **Claude:** "好的！我来帮你建立一个互助会：8个人，每人每月存$300，每个月有一个人拿到$2,400的总额。整个周期需要8个月。你想现在决定领钱的顺序，还是让大家自己选？"

**Example 3 — Haitian Creole:**
> **User:** "Mwen vle fè yon sol ak fanmi mwen. Nou se 5 moun, chak moun ap mete $150 chak mwa."
>
> **Claude:** "Dakò! M ap kreye yon sèk pou 5 moun ak $150 chak mwa. Sa vle di chak mwa, yon moun ap resevwa $750. Sèk la ap dire 5 mwa. Èske ou vle deside ki lòd moun yo ap resevwa lajan an kounye a?"

### In-Circle Dispute Mediator

When a member claims "I already paid" or disputes a ledger entry, Claude pulls the actual contribution record from Supabase and resolves the dispute in the relevant language.

**Example 1 — Spanish/English dispute:**
> **User (María):** "Ya pagué este mes, no sé por qué dice que no."
>
> **Claude:** "María, revisé el registro del círculo 'China Lee Coworkers'. Tu pago de $200 para el mes de abril fue recibido el 3 de abril a las 2:15 PM. El sistema lo muestra como confirmado ✅. Parece que hubo un retraso en la actualización de la pantalla. Tu pago está registrado correctamente."
>
> **Claude (to the group in English):** "Update: María's April payment of $200 was confirmed on April 3 at 2:15 PM. The ledger has been refreshed and shows her payment as complete."

**Example 2 — Mandarin dispute:**
> **User (Wei):** "我上周已经付了，为什么还显示未付？"
>
> **Claude:** "Wei，我查了一下记录。你的$300付款在4月10日下午3:30收到，状态是已确认 ✅。账本现在已经更新了。如果你还看到'未付'，请刷新页面。"

**Example 3 — Bengali missed payment:**
> **User (Rina):** "আমি তো টাকা দিয়েছিলাম, কেন দেখাচ্ছে দেইনি?"
>
> **Claude:** "Rina, আমি রেকর্ড চেক করেছি। আপনার এপ্রিল মাসের $150 পেমেন্ট এখনও পাওয়া যায়নি। শেষ সফল পেমেন্ট ছিল মার্চ 15 তারিখে। আপনি কি আবার চেষ্টা করতে চান? আমি আপনাকে পেমেন্ট লিংক পাঠাচ্ছি।"

---

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** (auth + Postgres + realtime subscriptions)
- **Anthropic Claude API** (claude-sonnet-4-5) for multilingual onboarding and dispute resolution
- **Twilio** for SMS invitations and payment reminders
- **Stripe in TEST MODE only** for payout simulation
- **Deployed to Vercel** as a PWA

---

## 24-Hour Timeline

### Saturday 8 AM - 12 PM: Setup + Scaffolding

- [ ] Initialize Next.js 14 repo with TypeScript and Tailwind
- [ ] Create Supabase project, connect to app
- [ ] Set up Vercel deployment with preview URLs
- [ ] Design and migrate database schema (circles, members, contributions, payouts)
- [ ] Implement Supabase auth (email/phone sign-up and login)
- [ ] Verify auth flow works end-to-end on deployed preview
- [ ] Set up environment variables for Supabase, Stripe, Twilio, Claude API

### Saturday 12 PM - 4 PM: Core Flows

- [ ] Build "Create Circle" form (contribution amount, cycle length, member count, payout order)
- [ ] Build circle dashboard page showing circle details and member list
- [ ] Implement invite flow — generate SMS invite links, store pending invitations
- [ ] Build member onboarding page (accept terms, confirm payment method via Stripe test)
- [ ] Build shared ledger view with realtime updates via Supabase subscriptions
- [ ] Display contribution status per member (paid / pending / overdue)

### Saturday 4 PM - 8 PM: Claude Integration + Twilio SMS

- [ ] Integrate Anthropic Claude API (claude-sonnet-4-5)
- [ ] Build multilingual onboarding chat agent — user describes their circle in their language, Claude responds in that language and creates the circle
- [ ] Build dispute mediator agent — Claude queries Supabase for contribution records and resolves disputes in the member's language
- [ ] Set up Twilio SMS — send invite links to phone numbers
- [ ] Implement automated SMS reminders (3 days before due date + day of)
- [ ] Test both Claude agents with Spanish, Mandarin, Bengali, and Haitian Creole inputs

### Saturday 8 PM - 12 AM: Polish UI + Demo Data

- [ ] Polish all pages with Tailwind — clean layout, mobile-responsive, consistent design
- [ ] Seed demo circle: "China Lee Coworkers" with 5 members and 3 months of fake contribution/payout history
- [ ] Add loading states, error states, and empty states
- [ ] Build PWA manifest and service worker for installability
- [ ] Test full flow on mobile browser

### Sunday 12 AM - 4 AM: Bug Fixes + Edge Cases

- [ ] Run through entire user flow end-to-end 3 times, fix bugs found
- [ ] Handle edge cases: double payment attempts, member leaving mid-cycle, late payments
- [ ] Test Claude agents with edge case inputs (mixed languages, ambiguous requests)
- [ ] Fix any realtime sync issues in the ledger view
- [ ] Test SMS delivery and reminder timing

### Sunday 4 AM - 8 AM: Pitch + Submission

- [ ] Build pitch deck (6-8 slides: problem, solution, demo screenshots, market, team, tech)
- [ ] Write Devpost submission (description, inspiration, what it does, how we built it, challenges, accomplishments, what's next)
- [ ] Rehearse 4-minute demo 3 times with the team
- [ ] Record backup demo video in case of live demo issues
- [ ] Final deploy to production Vercel URL
- [ ] Submit to Devpost by 8:00 AM

---

## Demo Script (4 Minutes)

### 0:00 - 0:30: The Problem
Open on a real screenshot of a Google Sheets susu tracker and a WhatsApp group chat full of payment confirmations. State: "4 million immigrants in NYC run savings circles on spreadsheets and group chats. They built their own banking system decades ago — it works, but it doesn't scale. One typo in the spreadsheet and trust breaks down."

### 0:30 - 1:30: Circle Creation with Claude
Switch to VisaWallet. María opens the app and types in Spanish: "Quiero hacer una tanda con mis compañeras, somos 6, $200 cada mes." Claude responds in Spanish, confirms the details, and creates the circle. María taps to send SMS invites. Show a member receiving the text, tapping the link, and joining the circle in under 30 seconds.

### 1:30 - 2:30: Month 3 — Dispute Resolution
Fast-forward to month 3 of the demo circle. The ledger shows 3 months of contribution history. A member messages: "Ya pagué, no sé por qué dice que no." Claude pulls the contribution record, confirms the payment was received on April 3 at 2:15 PM, and posts the resolution to the group in both Spanish and English. The ledger updates in realtime.

### 2:30 - 3:15: Payout Day
It's payout day. The pot is $1,200. María is the month 3 recipient. Show the payout confirmation screen. The ledger updates with a green checkmark. The schedule advances to show the next recipient. All members see the update in realtime.

### 3:15 - 4:00: Close
Return to the tagline slide: "Immigrants built their own banking system decades ago. We just built the app for it." State the market: 4 million immigrants in NYC alone, ROSCAs exist in 80+ countries. VisaWallet doesn't ask anyone to change their behavior — it just makes the behavior they already trust more transparent, more reliable, and more accessible. Close.
