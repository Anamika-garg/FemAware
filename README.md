# FemAware

FemAware is a women's healthcare and awareness platform. It connects reproductive
health education, symptom tracking and health insights in one place, with a
personalised space for each life stage:

- **Teens (13–19)**: puberty and first-period guides, period tracking, a symptom
  diary, interactive lessons and quizzes with XP and badges, myth-busting, and
  age-appropriate lessons on consent and body safety.
- **Adult women**: menstrual and symptom tracking, a late or irregular period
  guide, PCOS/PCOD awareness, contraception and fertility education, pregnancy
  and postpartum resources, and perimenopause support.
- **Senior women**: post-menopause education, daily comfort check-ins, bone and
  heart health awareness, intimate and urinary health resources, and
  appointment preparation.

Every space includes a guided symptom navigator, personal charts, and a
shareable summary to bring to a clinician. Each space also has a private AI
health guide — **Bloom** for teens, **Ava** for adults and **Mira** for
seniors — that answers questions in the tone and reading level of that life
stage.

> FemAware is educational. It does not diagnose medical conditions and is not a
> substitute for professional medical advice. It points out warning signs that
> need medical attention and helps people decide on next steps.

---

## Tech stack

| Layer    | Technology                                                         |
| -------- | ------------------------------------------------------------------ |
| Frontend | React 18, Vite, React Router, Tailwind CSS 3, Recharts, lucide-react |
| Backend  | Node.js, Express, Mongoose                                          |
| Database | MongoDB Atlas (or in-memory for local development)                  |
| Auth     | JWT + bcrypt                                                        |
| AI       | Google Gemini via `@google/genai` (server-side only)                |
| Tests    | Vitest, Supertest, Testing Library                                  |

---

## Project structure

```text
FemAware/
├─ client/
│  └─ src/
│     ├─ modules/
│     │  ├─ teen/      # Teen space: calendar, diary, lessons, guided check, insights
│     │  ├─ adult/     # Adult space: tracker, journal, insights, doctor report, library
│     │  ├─ senior/    # Senior space: check-ins, trends, visit preparation, library
│     │  └─ chat/      # Shared chat UI with stage-aware fallback copy
│     ├─ components/   # Shared shell (sidebar, navbar, mobile nav) and UI primitives
│     ├─ context/      # Auth and toast providers
│     ├─ lib/          # API client, constants, navigation per life stage
│     ├─ pages/        # Login, register, onboarding, privacy, PCOS, late-period guide
│     └─ App.jsx       # Routes; each shared route renders the user's life-stage page
└─ server/
   ├─ app.js           # Express app (middleware + routes)
   ├─ server.js        # Connects to MongoDB and starts listening
   ├─ config/db.js     # Atlas / in-memory connection, content seeding
   ├─ controllers/     # Auth, cycles, symptoms, reports, user data (adult + senior)
   ├─ models/          # User, CycleLog, SymptomLog, HealthReport, ChatThread
   ├─ routes/          # /api route modules
   ├─ chatbot/         # Gemini guide: prompts, safety screen, context, routes
   ├─ teen/            # Teen API mounted at /api/teen: models, rules, lessons, routes
   ├─ seed/            # Demo accounts for every life stage
   └─ tests/           # API and unit tests
```

Every account has one `lifeStage`: `teen`, `adult` or `senior`. People choose it
during onboarding and can switch it later under **Privacy & data**. The
sidebar, mobile tabs, dashboard and pages such as `/cycle`, `/symptoms` and
`/insights` all follow it.

---

## Getting started

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Set `MONGODB_URI` to your MongoDB Atlas connection string, using the `femaware`
database, and set a long random `JWT_SECRET`. To try the app without Atlas, set
`USE_MEMORY_DB=true`. The API then starts a throwaway database with the demo
accounts already loaded.

To enable the health guide, also set `GEMINI_API_KEY` from
<https://aistudio.google.com/apikey>. The key is read only by the server and
must never be added to the client. `GEMINI_MODEL` defaults to
`gemini-2.5-flash`. `GEMINI_THINKING_BUDGET` controls hidden reasoning for
thinking-capable models (default `1024`; set `0` to disable). Until a key is
set, `/chat` returns a clear setup message instead of a model answer.

### 3. Seed the demo accounts (Atlas)

```bash
npm run seed
```

The seed only touches the three demo accounts below. Teen lessons and
guided-check guidance are seeded automatically every time the API starts.

### 4. Run

```bash
npm run dev          # API on :5000 + web app on :5173 (uses MONGODB_URI)
npm run dev:memory   # same, with the in-memory database
```

Open <http://localhost:5173>.

### 5. Test

```bash
npm test
```

### Production build

```bash
npm run build
npm start            # Express serves the built app at http://localhost:5000
```

---

## Demo accounts

All demo accounts use the password `FemAware123!`. The sign-in page also has a
one-click button for each.

| Space  | Email                 | Includes                                          |
| ------ | --------------------- | ------------------------------------------------- |
| Teen   | `teen@femaware.app`   | Six periods and symptom logs                      |
| Adult  | `demo@femaware.app`   | Eight months of cycles, journal entries, a report |
| Senior | `senior@femaware.app` | Comfort check-ins and a saved visit summary       |

Every account uses the same password, `FemAware123!`, and opens directly on the
dashboard for its life stage. With `USE_MEMORY_DB=true` the accounts are
recreated on each server start.

---

## Health guide chatbot

The `/chat` route is one shared conversation UI rendered for every life stage.
The server derives the module from the signed-in account's `lifeStage` — it
never accepts a module from the client — so a teen cannot switch into the adult
voice by editing a request. A floating **Ask Bloom / Ask Ava / Ask Mira** button
also appears in the bottom-right of every signed-in page and hides on `/chat`
itself.

| Stage  | Guide | Tone                                                        |
| ------ | ----- | ----------------------------------------------------------- |
| Teen   | Bloom | Plain, age-appropriate language; encourages a trusted adult |
| Adult  | Ava   | Warm, evidence-informed, practical next steps               |
| Senior | Mira  | Calm, plain language and larger-print-friendly spacing      |

The prompt combines the person's profile and a compact summary of recent cycle
and symptom logs with stage-specific scope, reading level, word limit and
safety rules. The model works through a private reasoning step, then returns
structured JSON containing the visible `answer`, a short user-facing
`reasoning` summary, an `urgency` level (`routine`, `soon`, `urgent`,
`emergency` or `crisis`) and two or three `followUps`. The UI shows the urgency
as a banner and lets the person expand **How I thought about this** to read the
summary. That summary is deliberately not raw chain of thought.

### Safety

- A deterministic keyword screen runs before Gemini and flags red flags such as
  chest pain, severe bleeding, pregnancy with pain or bleeding, post-menopausal
  bleeding, fever with pelvic pain, abuse and self-harm.
- `emergency` and `crisis` messages short-circuit the model with fixed, safe
  replies that put emergency services, a crisis line or a trusted person first.
- The prompt forbids diagnosis, prescriptions and medication changes, and tells
  the model to treat the person's message and saved context as data, not
  instructions.
- Chat messages are limited to 30 per 15 minutes per account, and model calls
  time out after 45 seconds.
- FemAware is still not an emergency service; the UI repeats that notice on
  every conversation.

### Data and privacy

Each account has one `ChatThread` per module. The server stores at most 60
messages, returns the latest 40, and sends only the last 12 to Gemini as
conversation history. Chat threads are included in `GET /user/export` and are
deleted by `DELETE /user/data`. The **Clear chat** button deletes the current
module's thread without touching health logs.

| Method   | Endpoint              | Purpose                                       |
| -------- | --------------------- | --------------------------------------------- |
| `GET`    | `/api/chat`           | Current guide, module and recent messages     |
| `POST`   | `/api/chat/messages`  | Send `{ "message": "..." }` and get a reply   |
| `DELETE` | `/api/chat`           | Clear the current module's conversation       |

---

## Senior space

The senior module is built for post-menopause care: larger type, generous touch
targets, high-contrast text and plain-language guidance. It reuses the shared
shell, API client and privacy settings, so there are no separate services or
dependencies.

| Route            | Page                     | Purpose                                                                 |
| ---------------- | ------------------------ | ----------------------------------------------------------------------- |
| `/dashboard`     | `SeniorDashboard`        | Greeting, status badges, weekly comfort metrics, quick actions, warning signs |
| `/symptoms`      | `SeniorSymptomJournal`   | Five-section daily check-in, date-filtered history, edit and delete     |
| `/insights`      | `SeniorHealthInsights`   | 30/60/90-day trend charts with natural-language summaries               |
| `/doctor-report` | `SeniorDoctorReport`     | Four-step appointment planner and printable clinical summary            |
| `/resources`     | `SeniorResourceLibrary`  | Searchable guides on post-menopause, bone, heart, intimate and healthy-aging topics |
| `/chat`          | `SeniorChat`             | Mira, the private senior health guide                                   |

Shared routes pick the senior page when `user.lifeStage === 'senior'`.
Cycle-specific routes such as `/cycle` stay in the adult space. `DASHBOARDS`
and `StagePage` in `client/src/App.jsx` choose the stage-appropriate component.

### Accessibility

Every senior page includes a persistent **Text size** toolbar with Standard,
Large and Extra Large options. The choice is stored in `localStorage` under
`femaware_senior_font_scale` and applied through
`html[data-senior-font-scale]` (18px and 20px root sizes). Controls use at least
48px targets, strong borders and visible focus rings. The toolbar and scaling are
removed automatically for non-senior accounts.

### Daily check-in

The journal records sleep and fatigue, temperature and comfort, intimate and
urinary health, bone and joint wellbeing, and mood and memory. It includes an
explicit post-menopausal bleeding prompt and supports editing or deleting saved
entries. History can be filtered to the last 7, 30 or 90 days, all entries, or an
exact date.

### Visit preparation

The planner walks through concerns, medications, symptom topics and a review
step, then builds a `/reports/preview` snapshot with `careContext: 'senior'`.
The summary uses `window.print()` with dedicated print styles and can be saved
for later. Saved summaries reopen with their concerns and medication list intact.

### Data shape

Senior check-ins extend the existing `SymptomLog` with an optional `senior`
subdocument, so no new collections or endpoints are needed. Report snapshots gain
`seniorSummary`, `appointment`, `careContext`, and a
`flags.postmenopausalBleeding` warning. Adult pages continue to use the same
`/api/symptoms` and `/api/reports` endpoints unchanged.

---

## API overview

All endpoints are under `/api`. Everything except `/health`, `/auth/register`
and `/auth/login` needs `Authorization: Bearer <token>`.

| Area           | Endpoints                                                                            |
| -------------- | ------------------------------------------------------------------------------------ |
| Auth & profile | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/onboarding`, `PATCH /auth/profile` |
| Adult / senior | `/cycles`, `/symptoms`, `/reports`                                                   |
| Chat guide     | `GET /chat`, `POST /chat/messages`, `DELETE /chat` (30 messages / 15 minutes)         |
| Privacy        | `GET /user/export` (includes teen data), `DELETE /user/data`                         |
| Teen           | `/teen/cycles`, `/teen/symptoms`, `/teen/learning/modules[/:slug[/quiz]]`, `/teen/learning/progress`, `/teen/assessments`, `/teen/insights[/summary]`, `/teen/guidance/:key`, `POST /teen/sample-data` |

The teen API returns errors as `{ error, details }`. The rest of the API returns
`{ success: false, message, errors }`.

Senior check-ins send the same `/symptoms` endpoints with an additional `senior`
object containing sleep quality, hot flash counts, night sweats, joint and
bladder levels, mood, memory and `postmenopausalBleeding`. Partial updates merge
the supplied `senior` fields with the saved record.

---

## Clinical review

Teen lessons and guided-check guidance are drafted from public health sources
(ACOG, NHS, Nemours KidsHealth and others) and stored as
`pending_clinical_review`. Outside production they are shown with a "draft"
notice. With `NODE_ENV=production`, only clinician-reviewed content is served,
unless `ALLOW_UNREVIEWED_GUIDANCE=true`. Record a sign-off with:

```bash
npm --prefix server run review -- --module menstrual-cycle-basics --reviewer "Dr A. Example, MD"
npm --prefix server run review -- --all-guidance --reviewer "Dr A. Example, MD"
```

Changing reviewed content resets it to pending review the next time the API
starts. The triage rules live in `server/teen/guidance/rules.js` and the insight
thresholds in `server/teen/services/insights.js`. Both need clinician
validation before production.
