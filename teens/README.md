# FemAware

Reproductive health education and cycle awareness for teens (about 13–19). FemAware combines gamified lessons, a period
calendar, a symptom diary, non-diagnostic guided symptom checks, and a health-insights dashboard with a downloadable
summary.

> **FemAware is educational and does not diagnose.** The first release runs in **demo mode** with synthetic data. All
> health content is currently **pending clinical review**; see [docs/STATUS.md](docs/STATUS.md).

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 6, React Router 6, Tailwind CSS 4, Lucide React, Recharts |
| Backend | Node.js 20+ (tested on 22), Express 4 |
| Database | MongoDB with Mongoose 8 |
| Tests | Vitest, React Testing Library, Supertest, mongodb-memory-server |

## Quick start

```bash
npm install

# Option A: no MongoDB installed. Starts an in-memory DB and seeds content automatically.
npm run dev:memory

# Option B: with a local or Atlas MongoDB
cp server/.env.example server/.env    # set MONGODB_URI
npm run seed                          # lessons + guidance content
npm run dev
```

- Web app: http://localhost:5173 (Vite proxies `/api` to the API)
- API: http://localhost:4000/api/health

Open the app, choose **Get started**, and leave "Fill my dashboard with sample data" ticked to explore with synthetic data.

> The first in-memory run downloads a MongoDB binary (~600 MB) into the npm cache.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API (watch mode) + Vite dev server |
| `npm run dev:memory` | Same, with an in-memory MongoDB (auto-seeded) |
| `npm run seed` | Upsert lessons and guidance content into `MONGODB_URI` |
| `npm test` | Server tests (Vitest + Supertest + in-memory MongoDB), then client tests (Vitest + RTL) |
| `npm run build` | Production build of the client into `client/dist` |
| `npm start` | Start the API (`SERVE_CLIENT=true` also serves `client/dist`) |
| `npm run review -w server -- --module <slug> --reviewer "<name, credentials>"` | Record a clinician sign-off |

## Project layout

```
client/                 React app
  src/index.css         Design tokens (pink-only theme, Tailwind @theme)
  src/theme/tokens.js   Same tokens for charts
  src/lib/api.js        API client (cookies + CSRF header)
  src/pages/            Landing, Onboarding, Dashboard, Learn, Lesson, Calendar,
                        Symptoms, Check (assessment), Insights, Safety, Privacy, Disclaimer
server/
  src/models/           Mongoose schemas (6 required collections + DemoSession)
  src/guidance/         Assessment questions + triage rules (medical logic, no UI)
  src/content/          Lesson and guidance copy + cited sources (pending review)
  src/services/         Quiz scoring, insights, synthetic demo data
  src/routes/           REST API
  src/scripts/          seed + clinician sign-off
  tests/                Unit + API tests
docs/                   Deployment, status report
```

## Database

Collections (Mongoose models in `server/src/models`):

| Model | Purpose | Notes |
|---|---|---|
| `DemoSession` | Anonymous demo session | Stores only a SHA-256 hash of the cookie token; TTL index on `expiresAt` |
| `CycleEntry` | Period start/end dates, flow | `owner`, `dataMode`, `expiresAt` (TTL); index `{owner, startDate}`; end ≥ start, ≤ 15 days, not in future |
| `SymptomLog` | Symptoms, severity 1–5, date, notes | Enum symptoms, no duplicates, notes ≤ 500 chars; index `{owner, date}` |
| `LearningModule` | Lesson content, quiz, sources, `reviewStatus`, `version` | Unique `slug`; quiz answers never sent to the browser |
| `LearningProgress` | Completed modules, scores, XP, achievements | Unique index on `owner` |
| `AssessmentSession` | Check type, `guidanceVersion`, result level, reason codes | **Raw answers never stored**; pregnancy-related codes are filtered out |
| `GuidanceContent` | Reviewed guidance copy, sources, versions, review status | Unique `{key, version}`; `clinician_reviewed` requires `reviewedBy` and `reviewedAt` |

Indexes are created on startup (`syncIndexes`). Seed content with `npm run seed`. Seeding is idempotent: changed content
is reset to `pending_clinical_review` (and lesson `version` is bumped), and unchanged content keeps its sign-off.

### Local MongoDB setup

- **Docker:** `docker run -d --name femaware-mongo -p 27017:27017 mongo:7`
- **Atlas:** create a free cluster and a database user, then set
  `MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/femaware_demo`. Use a database dedicated to demo data.

## Security and privacy model

- **No fake login.** Visiting `POST /api/session` creates an anonymous demo session. The browser gets a random 256-bit token
  in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production). Only its hash is stored.
- **Ownership comes from the session, never the client.** Every owned query is scoped by `owner: <session id>`. `owner`,
  `userId`, `dataMode`, and `expiresAt` in request bodies are ignored (allow-listed fields only), and other sessions' ids
  return 404. Covered by tests.
- **CSRF:** state-changing requests need the `X-FemAware-Client: 1` header, which cross-site forms can't send.
- **Demo data separation:** every owned record is stamped `dataMode: "demo"` and expires with its session (TTL). The server
  refuses to start with any other `DATA_MODE`. Use a dedicated demo database.
- **Deletion:** `DELETE /api/session` (Privacy page → "Delete all my data") removes all owned records and the session.
- **Minimum necessary:** onboarding answers stay in `localStorage`. Assessment answers are evaluated in memory, and only the
  level plus non-sensitive reason codes are saved.
- Helmet, CORS allow-list, 20 KB JSON body limit, and rate limiting on `/api`.

## API overview

| Method | Path | Auth |
|---|---|---|
| GET | `/api/health` | – |
| POST/GET/DELETE | `/api/session` | POST creates; GET and DELETE need a session |
| POST | `/api/session/demo-data` | session |
| GET/POST, GET/PATCH/DELETE `/:id` | `/api/cycles`, `/api/symptoms` (`?from=&to=`) | session |
| GET | `/api/learning/modules`, `/api/learning/modules/:slug` | public (no answers) |
| POST | `/api/learning/modules/:slug/quiz` | public; progress saved only with a session |
| GET | `/api/learning/progress` | session |
| GET | `/api/assessments/questions/:type` | public |
| POST | `/api/assessments` | public; result saved only with a session |
| GET, DELETE `/:id` | `/api/assessments` | session |
| GET | `/api/insights`, `/api/insights/summary` (text download) | session |
| GET | `/api/guidance/:key` | public |

## Clinical review workflow

1. Health copy lives only in `server/src/content` (lessons, guidance) and `server/src/guidance` (questions and rules), never in
   React components.
2. A qualified clinician reviews the content, rules, and thresholds (see `docs/STATUS.md` for the list).
3. Record the sign-off: `npm run review -w server -- --all-guidance --reviewer "Dr Name, MD"` and
   `--module <slug>` for each lesson.
4. In production (`NODE_ENV=production`), **only `clinician_reviewed` content is served**. Unreviewed lessons are hidden, and
   checks return 503 rather than showing unreviewed guidance.
5. Any change to rules or copy → bump `GUIDANCE_VERSION` in `server/src/guidance/constants.js`, re-seed, and re-review.

## Design tokens

The pink-only palette is defined once in `client/src/index.css` (`@theme`). Tailwind's default palette is removed, so only
these colours are usable: `mist #FFF1F6`, `petal #FFD6E7`, `blush #F8BBD0`, `glow #F672A7`, `rose #E0487E`,
`deep #C2185B` (plus white). Body text uses Deep Rose (≈5.6:1 on white). Pink Glow and Rose Pink are reserved for decoration
and large text.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment.
