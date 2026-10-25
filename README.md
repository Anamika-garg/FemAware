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
stage. Open the guide from the sidebar, the mobile **More** menu, or the
floating button in the bottom-right of any signed-in page.

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
│     ├─ components/   # Shared shell (sidebar, navbar, mobile nav, chat launcher) and UI primitives
│     ├─ context/      # Auth and toast providers
│     ├─ lib/          # API client, constants, navigation per life stage
│     ├─ pages/        # Login, register, onboarding, privacy, PCOS, late-period guide
│     └─ App.jsx       # Routes; each shared route renders the user's life-stage page
└─ server/
   ├─ app.js           # Express app (middleware + routes)
   ├─ server.js        # Vercel entry: exports the Express app
   ├─ local.js         # Local entry: connects to MongoDB and listens
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
must never be added to the client.

| Variable                 | Default             | Purpose                                                                 |
| ------------------------ | ------------------- | ----------------------------------------------------------------------- |
| `GEMINI_API_KEY`         | *(empty)*           | Server-side Gemini key. Until it is set, `/chat` returns a clear setup message instead of a model answer. |
| `GEMINI_MODEL`           | `gemini-2.5-flash`  | Model used for every guide.                                              |
| `GEMINI_THINKING_BUDGET` | `1024`              | Hidden reasoning budget for thinking-capable models. Set `0` to disable. |

`server/.env` is loaded when the API starts, so restart it after editing any of
these values.

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

### Deploy the API to Vercel

Set the Vercel project's **Root Directory** to `server`. Vercel detects the
Express app (`app.js` / `server.js`) with its zero-configuration runtime, so
`server/vercel.json` intentionally contains no `builds` or `routes` — the old
`@vercel/node` entry pointed at a file with no handler and returned
`FUNCTION_INVOCATION_FAILED` (a bare 500). Its install command also skips the
test-only in-memory MongoDB binary.

Configure these environment variables in the Vercel project:

| Variable                  | Notes                                                                 |
| ------------------------- | --------------------------------------------------------------------- |
| `MONGODB_URI`             | Atlas connection string. `USE_MEMORY_DB` is rejected on Vercel.        |
| `JWT_SECRET`              | Long random string. Without it the API returns a clear 503 instead of an opaque 500. |
| `CLIENT_URL`              | Deployed client origin, e.g. `https://your-app.vercel.app`. Comma-separate multiple origins. |
| `GEMINI_API_KEY`          | Optional; enables live chat replies.                                   |
| `GEMINI_MODEL`            | Optional; defaults to `gemini-2.5-flash`.                              |
| `GEMINI_THINKING_BUDGET`  | Optional; defaults to `1024`.                                          |

The API connects to MongoDB lazily on the first request and reuses the
connection on warm invocations, so cold starts stay short and repeated requests
do not reconnect. `express.static()` is ignored on Vercel — deploy the client
separately and point `CLIENT_URL` at it. `GET /api/health` is the quickest way
to confirm a deployment is up.

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

### Code map

| Path                                      | Role                                                              |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `server/chatbot/modules.js`               | Guide identities, scope, reading level, word limits, safety rules |
| `server/chatbot/prompts.js`               | System prompt and reasoning instructions                          |
| `server/chatbot/safety.js`                | Red-flag screen and fixed crisis/emergency replies                |
| `server/chatbot/context.js`               | Profile and recent health-log summary sent to the model           |
| `server/chatbot/gemini.js`                | SDK call, JSON schema, thinking config, error mapping             |
| `server/chatbot/controller.js`            | Endpoints, history persistence, safety short-circuit              |
| `server/models/ChatThread.js`             | One stored thread per account per module                          |
| `client/src/modules/chat/`                | Shared chat UI, rich-text renderer and stage config               |
| `client/src/components/ChatLauncher.jsx`  | Floating bottom-right shortcut                                    |
| `client/src/modules/{teen,adult,senior}/` | Stage wrappers that pick the guide and copy                       |

The prompt combines the person's profile and a compact summary of recent cycle
and symptom logs with stage-specific scope, reading level, word limit and
safety rules. The model works through a private reasoning step, then returns
structured JSON containing the visible `answer`, a short user-facing
`reasoning` summary, an `urgency` level (`routine`, `soon`, `urgent`,
`emergency` or `crisis`) and two or three `followUps`. The UI shows the urgency
as a banner and lets the person expand **How I thought about this** to read the
summary. That summary is deliberately not raw chain of thought.

If the model is unavailable, misconfigured or times out, the API returns a
friendly error instead of a partial answer, and the UI puts the message back in
the box so it can be sent again.

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

### Tests

The chatbot has focused server and client suites that do not need a Gemini key
(the model call is mocked):

```bash
npm --prefix server test -- tests/chatbot.test.js tests/chatbotSafety.test.js
npm --prefix client test -- src/modules/chat/__tests__/ChatPage.test.jsx src/components/__tests__/ChatLauncher.test.jsx
```

They cover module resolution, message validation, red-flag short-circuits,
export/delete, the chat UI states and the launcher's stage label.

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
| Privacy        | `GET /user/export` (includes teen and chat data), `DELETE /user/data`                |
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
