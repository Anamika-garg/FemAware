# FemAware — Demo Video Script

**Runtime:** 5:05 (full cut) · 90-second short cut included
**Format:** Screen recording + voiceover, 1080p, 16:9
**Accounts:** all three demo logins (`FemAware123!`)
**Goal:** show every major feature and tie each one to the women's-health problem statement.

---

## 1. The problem statement, in one paragraph

Women's health is not short of information — it is short of **timely, understandable, trustworthy** information. Symptoms are normalised ("periods are supposed to hurt"), conditions such as PCOS go unrecognised or get reduced to a checklist, menopause is under-discussed, teenagers are left to piece together body literacy from unreliable sources, and appointments are too short to reconstruct months of history from memory. At the same time, privacy concerns stop women from tracking anything at all.

FemAware answers that with one platform across three life stages: **plain-language education with sources, low-effort tracking, pattern insights, red-flag guidance, a printable clinician summary, a stage-aware AI health guide, and data controls that actually delete data.**

### Problem → feature → proof on screen

| Problem | FemAware feature | Where to point the camera |
| --- | --- | --- |
| Jargon-heavy, scattered information | Life-stage learning library, 26 articles, cited sources, review status shown | Library + article sidebar |
| Symptoms dismissed or normalised | Symptom guide with 7 urgent signs; guided checks with urgency tiers | `/symptom-guide`, late period guide, teen check |
| Rushed appointments, poor recall | Doctor report (adult) and 4-step visit preparation (senior), printable | `/doctor-report` |
| PCOS under-recognition and fear | PCOS awareness: Rotterdam criteria, 14-pattern reflection, "not a diagnosis" | `/pcos` |
| Missed red flags after menopause | Postmenopausal bleeding flagged at the point of logging, in trends, and in the printed summary | Senior check-in |
| Teens lack body literacy and safety language | 6 lessons, quizzes, XP, consent & body-safety lesson, real helplines | Teen space |
| Privacy fear blocks tracking | No account to read; export JSON; delete range / all logs / account; no ad tracking | `/privacy` |
| Generic AI advice is unsafe | Persona derived from the signed-in account, server-side red-flag screening, visible reasoning summary, urgency levels | `/chat` |
| Accessibility and equity | Works on a phone, senior text-size control, plain language, free to read | Mobile view, senior toolbar |

> If your problem statement is worded differently, keep this table and swap the bolded phrases in Beat 1. Do **not** add statistics that are not in the app — judges reward precision.

---

## 2. Pre-flight checklist (do this before recording)

- [ ] `GEMINI_API_KEY` is set and a test message returns a real answer. **Record one successful chat exchange as a backup clip.**
- [ ] Send one chat message before recording so the model and connection are warm.
- [ ] Log in once with each demo account to confirm data loads: `teen@femaware.app`, `demo@femaware.app`, `senior@femaware.app`, password `FemAware123!`.
- [ ] Optional: complete one teen lesson and quiz on the teen demo before filming so an earned badge and XP are visible. Otherwise the teen dashboard shows Level 1 and the locked badge row — that is still accurate, just less visual.
- [ ] Browser: 1920×1080, zoom 90–100%, bookmarks bar hidden, notifications off, only the FemAware tab open.
- [ ] Clear any real personal data from the profile you film.
- [ ] Use a large, visible cursor (or a click highlighter) and move slowly.
- [ ] Record in four segments (public+adult, teen, senior, privacy+close) and edit — it avoids slow account switching.
- [ ] Have the exact questions from this script copied to a notes file so you can paste them into chat.
- [ ] Keep the mouse still while narration plays; do not scroll during a key sentence.

**Demo data available**

| Account | Button on login | What is preloaded |
| --- | --- | --- |
| Adult | "Adult demo" | 8 periods, 29 journal entries, 1 saved report |
| Teen | "Teen demo" | 6 periods, 24 symptom logs (lesson progress starts at Level 1) |
| Senior | "Senior care demo" | 45 check-ins, 1 saved visit summary |

---

## 3. Full script — 5:05

Read the narration at a calm pace. Bracketed text is a direction, not spoken.

---

### BEAT 1 · 0:00–0:20 · The hook

**On screen:** Landing hero, cursor still. Slow push-in (or 2% zoom in editing).

**Do:** Nothing. Let the headline sit.

**Say:**
> "Pain that gets dismissed. Symptoms that get normalised. Answers that arrive years too late. Women are told to wait, to relax, or that it is normal — when what they needed was clear information and someone to take the pattern seriously. FemAware is built for that gap."

**Lower third:** `FemAware — Understand your body. Own your health.`

---

### BEAT 2 · 0:20–0:45 · Three life stages, one platform

**On screen:** Scroll to "Your health journey, at every stage."

**Do:** Hover each card in turn — Teenagers 13–19, Adult women 20–59, Senior women 60+ — then stop.

**Say:**
> "FemAware meets women where they actually are: teenagers learning about puberty and their first periods, adults tracking cycles and symptoms, and senior women navigating life after menopause. Same platform, three genuinely different experiences — not one dashboard with a different colour. And everything you can read here is open without an account."

**Callout:** `No account needed to read`

---

### BEAT 3 · 0:45–1:05 · Education with sources

**On screen:** Click **Learn** → Library. Search "PCOS".

**Do:** Open the PCOS article. Scroll slowly past "The takeaway" to the **Sources** panel.

**Say:**
> "The library turns public health guidance from the NHS, ACOG and WHO into plain language, and every article shows its sources. It is also honest about status: content awaiting clinician review says so. No fear, no jargon, and no pretending a website can diagnose you."

**Callout:** `26 articles · sources on every page`

---

### BEAT 4 · 1:05–1:28 · From question to starting point

**On screen:** Click **Symptom Guide**. Scroll the "Get help now" block, then open one accordion (Period pain).

**Do:** Let the seven urgent signs register on screen for two seconds. Then jump-cut to **Explore Your Health** → choose **Adult woman** → **Continue** → pick two topics → **Show my starting point**.

**Say:**
> "The symptom guide separates what is common from what needs urgent care — seven warning signs, stated plainly. And if someone does not know where to begin, two questions are enough: where they would like to start, and what they want help with. No name, no email, no health details."

**Callout:** `Guidance, not diagnosis`

---

### BEAT 5 · 1:28–2:00 · The adult dashboard

**On screen:** **Sign in → "Adult demo".** Land on `/dashboard`.

**Do:** Point at the phase label and cycle ring, then the four stat tiles. Do not scroll past the fold.

**Say:**
> "This is the adult space with eight months of sample data. The dashboard answers the questions people actually open an app for: what phase am I in, when is my next period, when is my fertile window. The cycle logic runs on the server, and every prediction is labelled an estimate — never a contraceptive method."

**Callout:** `Predictions are estimates`

---

### BEAT 6 · 2:00–2:30 · Tracking and patterns

**On screen:** Click **Cycle tracker**. Show the calendar, then "Your averages" and "Period history".

**Do:** Click one logged period day to flash the edit modal, then close it.

**Say:**
> "Logging a period takes seconds, and the calendar fills in the predicted period, fertile window and ovulation. Every cycle makes the averages more personal."

**On screen:** Navigate to **Symptom journal**.

**Say:**
> "The journal is deliberately low-effort: tap what you feel, set severity, add sleep and energy. One severe day is a data point. A pattern is what helps a clinician."

**On screen:** Navigate to **Health insights**.

**Do:** Scroll to the cycle-length chart and the "Gentle patterns in your data" cards.

**Say:**
> "Insights turn that pattern into charts and plain-language observations — like a cycle that varies by more than five days, which is worth mentioning at a visit."

**Callout:** `Patterns over time`

---

### BEAT 7 · 2:30–3:00 · The appointment changer

**On screen:** Click **Doctor report**.

**Do:** Set range to **6 months**, click **Update preview**, then scroll the preview: "1. Cycle summary", "2. Period history", "3. Symptom patterns", "4. Conversation starters & notes".

**Say:**
> "This is the part that changes appointments. Months of logs become a structured summary: cycle history, symptom frequency, the questions you want to ask, and any red flags. Export it as JSON, print it as a PDF, or save it to reopen before the next visit. Patients stop reconstructing six months from memory in a ten-minute consultation."

**Callout:** `Print / PDF · JSON · Saved reports`

---

### BEAT 8 · 3:00–3:30 · Ava, the private health guide

**On screen:** Point at the floating **Ask Ava** button in the bottom-right corner, then click it to open the chat.

**Do:** Paste: `My cycles vary from 27 to 33 days. Is that a problem?` Send. While waiting, hold on "Ava is thinking…", then cut/speed-ramp the wait.

**Do:** When the reply appears, expand **"How I thought about this"**. Then hover the urgency badge and the follow-up chips.

**Say:**
> "Every space has a private AI health guide — Ava for adults, Bloom for teens, Mira for seniors. It runs on Gemini, but the guardrails are ours. The persona comes from the signed-in account, never from the request, and deterministic red-flag screening runs before the model is called. You get an answer, a short reasoning summary, follow-up questions, and an urgency level: worth mentioning, ask promptly, or get urgent help now."

**Callout:** `Reasoning · urgency · follow-ups`

---

### BEAT 9 · 3:30–3:50 · The 2 a.m. questions

**On screen:** Navigate to **Late period guide**.

**Do:** Answer the five questions quickly — "8–14 days", "No, it is not possible", "Not applicable", "High stress", "Mild cramps only" — and land on the result.

**Say:**
> "Two guided tools handle the questions people search at two in the morning. The late period guide asks five questions and returns a tier: keep tracking, take a test, see a clinician, or seek same-day care. It runs entirely in the browser and saves nothing."

**On screen:** Navigate to **PCOS awareness**, scroll to "Pattern reflection", select four patterns.

**Say:**
> "PCOS awareness explains the Rotterdam criteria, then lets you reflect on fourteen patterns — explicitly not a score, not a diagnosis, just a better-prepared conversation. It can copy a plain-language note with your own cycle averages."

**Callout:** `Answers stay in this browser`

---

### BEAT 10 · 3:50–4:15 · Teen space: learning first

**On screen:** Sign out → **"Teen demo"** → `/dashboard`.

**Do:** Show the "Up next" lesson, XP card, and badges. If you have not pre-earned a badge, hold on the locked badge row — the narration still lands. Then open **Learn & quizzes** and one lesson's quiz.

**Say:**
> "The teen space leads with learning, not fertility. Six short lessons, quizzes scored on the server, and XP and badges that come only from knowledge — never from what a teenager logs about her body. That was a deliberate design decision."

**On screen:** Open **Symptom check**, choose **Period cramps**, show the first question, then cut to a separately recorded result screen showing the urgency badge.

**Say:**
> "The guided symptom check returns one of three levels: self-care and tracking, talk to a doctor, or get help now — with the reasons and sources, never a diagnosis."

**On screen:** Open **Body safety & help**, show the helplines card.

**Say:**
> "And consent and body safety are a first-class feature, with real helplines surfaced prominently. That is not a side page — for a teenager, it may be the most important page in the product."

**Callout:** `XP comes from lessons, not body logs`

---

### BEAT 11 · 4:15–4:40 · Senior care

**On screen:** Sign out → **"Senior care demo"** → `/dashboard`.

**Do:** Click **A++** in the accessibility toolbar so the text visibly grows. Pause one second.

**Say:**
> "Senior care replaces cycle tracking with what matters after menopause: sleep, hot flushes, joints, mood and memory. Every page has a text-size control, because readability is a health feature, not a setting."

**On screen:** Open **Daily check-in** and jump-cut (or speed-ramp the scroll) to the bleeding block, then tick **"I noticed vaginal bleeding after menopause"**.

**Do:** Hold on the warning that appears. Do **not** click Save — leave the entry unsaved so the demo data stays clean.

**Say:**
> "The check-in flags postmenopausal bleeding at the moment it is logged — one of the clearest reasons to see a clinician promptly — and carries that flag into trends and into the printed summary."

**On screen:** Open **Visit preparation**, click through to **Step 4**, show the print preview. (Add one concern first if **Continue** is disabled.)

**Say:**
> "The four-step visit planner turns concerns, medications and check-ins into a summary a clinician can actually use."

**Callout:** `Plain language · large text · printable`

---

### BEAT 12 · 4:40–5:05 · Trust, then close

**On screen:** Return to the adult account → **Privacy & data**.

**Do:** Scroll the export card, the delete-range card, and the delete-account card. Do not actually delete.

**Say:**
> "Underneath all of it: reading needs no account, passwords are hashed, and health data is never sold or used to train public models. You can export everything as JSON, delete a date range, or erase your account entirely — with your password and a typed confirmation."

**On screen:** Cut back to the landing hero. Slow fade to the logo.

**Say:**
> "FemAware does not diagnose. It closes the distance between noticing something and getting the right care — for a teenager's first period, for a woman preparing for an appointment, and for the decades after menopause. Understand your body. Own your health."

**End card:** `FemAware` · `[your deployed client URL]` · `Educational guidance, not diagnosis.`

---

## 4. Feature coverage checklist

Tick each item as you record. Every core feature below appears in the 5-minute cut; optional extras are marked.

| Area | Feature | Beat |
| --- | --- | --- |
| Public | Landing hero, life-stage cards, Learn→Track→Act, trust principles | 1–2 |
| Public | Learning library, search, filters, article sources, review status | 3 |
| Public | Symptom guide, urgent signs, common-concern accordions | 4 |
| Public | Two-question starting-point flow | 4 |
| Auth | Login with one-click demo accounts | 5 |
| Adult | Dashboard: phase, cycle ring, next period, fertile window, averages, check-in | 5 |
| Adult | Cycle tracker: calendar, predictions, averages, history, edit modal | 6 |
| Adult | Symptom journal: symptoms, severity, mood, flow, sleep, energy, notes | 6 |
| Adult | Health insights: charts, pattern cards | 6 |
| Adult | Doctor report: date range, live preview, JSON, print/PDF, save | 7 |
| Chat | Ava: answer, reasoning toggle, urgency badge, follow-ups, clear chat | 8 |
| Chat | Floating bottom-right launcher | 8 |
| Adult | Late period guide: 5 questions, 4 result tiers, browser-only | 9 |
| Adult | PCOS awareness: criteria, 14-pattern reflection, copy notes | 9 |
| Teen | Dashboard: next lesson, XP, badges, cycle snapshot | 10 |
| Teen | Lessons + server-scored quiz + 70% pass mark | 10 |
| Teen | Guided symptom check: 3 urgency tiers, reasons, sources | 10 |
| Teen | Body safety & consent + helplines | 10 |
| Senior | Accessibility toolbar (A / A+ / A++) | 11 |
| Senior | Care overview + daily check-in + postmenopausal bleeding flag | 11 |
| Senior | Health trends in plain language | 11 (optional) |
| Senior | 4-step visit preparation + printable summary | 11 |
| Trust | Export JSON, delete range, clear logs, delete account | 12 |
| Trust | Server-side stage selection and red-flag screening (narrated) | 8 |

**Not shown in the 5-minute cut (mention or add if time):** Myth or Fact quiz, adult resource library with 15 articles and bookmarks, senior weekly heart check-in, saved report reprint, mobile bottom navigation, sample-data toggle in the teen space, health disclaimer page.

---

## 5. 90-second short cut (social / elevator pitch)

| Time | Screen | Narration |
| --- | --- | --- |
| 0:00–0:08 | Landing hero | "Pain gets dismissed. Symptoms get normalised. Answers arrive years too late." |
| 0:08–0:18 | Life-stage cards | "FemAware covers three life stages — teen, adult, senior — with three different experiences." |
| 0:18–0:30 | Library + sources | "Plain-language education with real sources, open without an account." |
| 0:30–0:45 | Adult dashboard → tracker | "Track periods and symptoms; predictions are always labelled estimates." |
| 0:45–0:58 | Insights → doctor report preview | "Patterns become charts, then a printable summary a clinician can use." |
| 0:58–1:12 | Chat with Ava + reasoning | "A private AI guide with red-flag screening, visible reasoning and urgency levels." |
| 1:12–1:22 | Teen safety + senior toolbar | "Body-safety lessons for teens; large-text care for senior women." |
| 1:22–1:30 | Privacy + logo | "Export or delete everything. FemAware doesn't diagnose — it gets you to the right care." |

---

## 6. Optional beats if you have 8 minutes

Insert in this order:

1. **After Beat 3** — Myth or Fact quiz (4 statements), 15 seconds.
2. **After Beat 6** — Adult Resource Library: search "fertility", filter a category, save an article, 20 seconds.
3. **After Beat 7** — Reopen a saved report from "Saved reports", 10 seconds.
4. **After Beat 10** — Teen "Try with sample data", then Insights with the sample-data notice, 20 seconds.
5. **After Beat 11** — Senior "Health trends": bleeding banner and plain-language weekly summaries, 20 seconds.
6. **After Beat 11** — Senior Learning Library + weekly heart check-in, 15 seconds.
7. **Anywhere** — Resize to a phone width to show the bottom tab bar and the raised **Log** button, 10 seconds.

---

## 7. Production notes

**Pacing.** The 12 beats total roughly 760 spoken words, which lands at 5:05–5:15 at a calm 145–150 words per minute. If you need to hit exactly five minutes, trim the pause after the end card and the hover time in Beat 2 — not the feature names.

**Chat latency.** Gemini typically answers in 3–8 seconds. Options: cut the wait, speed-ramp 2× with a small "thinking…" caption, or record the reply in a separate take and splice. Never leave eight seconds of silence.

**Account switching.** Film each module as its own segment. Sign out off-camera, or cut on the login screen.

**Claims to avoid.**
- Do not say FemAware diagnoses, treats, prevents or cures anything.
- Do not say the content is clinically approved — say "sourced from public health guidance, with clinician review status shown".
- Do not claim HIPAA or GDPR certification. Say "private by design, with export and deletion".
- Do not invent prevalence or delay statistics. If you want one, quote the app: PCOS affects "roughly 1 in 10 women of reproductive age, depending on the criteria used."

**Visual polish.**
- 1080p, 30 fps, cursor smoothing on.
- One lower-third per beat, max six words.
- Keep the same browser window size for all segments so cuts feel continuous.
- End on the hero with the product URL, not on a settings screen.

**If Gemini is unavailable on the day.** Record the chat segment in advance, or demonstrate the deterministic safety short-circuit with a crisis phrase and show the fixed safe reply. Do not film the "chat guide is not configured" error.

---

## 8. Judge Q&A — four answers to have ready

**"Is this a medical device?"**
> "No. It is educational and self-tracking. We never diagnose, and the guided checks never name a condition as the cause of your symptoms. They surface warning signs and end with a next step. The clinical logic is deterministic and server-side, and the AI is instructed to escalate rather than conclude."

**"Why three modules instead of one?"**
> "Because the questions are different. A teenager needs body literacy and safety; an adult needs cycle and symptom patterns; a senior needs comfort, bleeding alerts and appointment preparation. Same account system and shell, different content, navigation, tone and metrics. The module is chosen from the signed-in account, not the client."

**"What happens to the data?"**
> "Reading requires no account. Tracking is opt-in. Passwords are bcrypt-hashed, sessions are signed tokens, health data is never sold or used for ad tracking or public model training. Users can export everything as JSON, delete a date range, clear all logs, or delete the account with a password and typed confirmation."

**"What would you build next?"**
> "Clinician review workflow at scale, localisation and language support, offline logging for low-connectivity settings, and integration with real clinical records — plus validation studies for the red-flag rules."

---

## 9. One-line summary for the submission form

> FemAware is a stage-aware women's health platform that turns plain-language education and everyday symptom logging into pattern insights, red-flag guidance and a clinician-ready summary — with a private, stage-specific AI health guide and full data export and deletion.
