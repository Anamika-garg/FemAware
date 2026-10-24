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
shareable summary to bring to a clinician.

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
│     │  └─ senior/    # Senior space: check-ins, trends, visit preparation, library
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
   ├─ models/          # User, CycleLog, SymptomLog, HealthReport
   ├─ routes/          # /api route modules
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

---

## API overview

All endpoints are under `/api`. Everything except `/health`, `/auth/register`
and `/auth/login` needs `Authorization: Bearer <token>`.

| Area           | Endpoints                                                                            |
| -------------- | ------------------------------------------------------------------------------------ |
| Auth & profile | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/onboarding`, `PATCH /auth/profile` |
| Adult / senior | `/cycles`, `/symptoms`, `/reports`                                                   |
| Privacy        | `GET /user/export` (includes teen data), `DELETE /user/data`                         |
| Teen           | `/teen/cycles`, `/teen/symptoms`, `/teen/learning/modules[/:slug[/quiz]]`, `/teen/learning/progress`, `/teen/assessments`, `/teen/insights[/summary]`, `/teen/guidance/:key`, `POST /teen/sample-data` |

The teen API returns errors as `{ error, details }`. The rest of the API returns
`{ success: false, message, errors }`.

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
