# CycleSense — Adult Women: Track & Understand

CycleSense is a full-stack MERN women's health platform focused on helping adult
women understand their cycles, symptoms, and patterns. It combines cycle
prediction, a daily symptom journal, guided assessments, analytics, and a
doctor-ready report generator in one calm, privacy-conscious workspace.

> CycleSense is an educational tracking tool. It does not diagnose conditions
> and is not a substitute for professional medical advice.

---

## Highlights

- **Personal dashboard** — cycle phase, next period, ovulation window, average
  cycle length, recent logs, and contextual guidance.
- **Smart period tracker** — custom calendar with logged periods, predicted
  fertile windows, and ovulation days, plus a quick-add cycle modal.
- **Daily symptom journal** — physical, mood, and flow symptoms with severity,
  notes, editing, and deletion.
- **Late period navigator** — a step-by-step assessment of common non-pregnancy
  factors and clear guidance on when to contact a clinician.
- **PCOS awareness** — educational pattern tracking with an explicit
  non-diagnostic disclaimer.
- **Health insights** — six-month cycle charts and symptom frequency
  visualizations powered by Recharts.
- **Doctor-ready reports** — 3/6/12-month summaries with cycle trends, frequent
  symptoms, and clinician questions that can be printed or saved as PDF.
- **Resource library** — searchable, categorized articles on contraception,
  fertility, sexual health, pregnancy/postpartum, and perimenopause.
- **Privacy controls** — profile and focus-area editing, JSON data export,
  date-range deletion, and full account deletion.

---

## Tech stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Frontend  | React 18, Vite, React Router, Tailwind CSS, Recharts, lucide-react |
| Backend   | Node.js, Express, Mongoose                                         |
| Database  | MongoDB (local, Atlas, or in-memory for development)               |
| Auth      | JWT + bcrypt                                                       |
| Security  | Helmet, CORS allow-list, compression, rate limiting                |

No extra UI or state libraries are required — the app uses shared local
components and React context.

---

## Project structure

```text
Adult_Women/
├─ client/
│  ├─ src/
│  │  ├─ modules/adult/          # Adult women experience
│  │  │  ├─ AdultDashboard.jsx
│  │  │  ├─ PeriodTracker.jsx
│  │  │  ├─ SymptomJournal.jsx
│  │  │  ├─ HealthInsights.jsx
│  │  │  ├─ DoctorReport.jsx
│  │  │  └─ ResourceLibrary.jsx
│  │  ├─ components/             # Shared Navbar, Sidebar, layout, UI primitives
│  │  ├─ context/                # Auth and toast providers
│  │  ├─ data/                   # Resource library content
│  │  ├─ lib/                    # API client, constants, date helpers
│  │  ├─ pages/                  # Auth, onboarding, privacy, guide pages
│  │  ├─ App.jsx                 # Lazy routes + life-stage dashboard gate
│  │  └─ main.jsx
│  ├─ tailwind.config.js         # Brand palette and typography
│  └─ vite.config.js             # Dev proxy: /api → localhost:5000
├─ server/
│  ├─ config/db.js               # MongoDB / in-memory connection
│  ├─ controllers/               # Auth, cycles, symptoms, reports, user data
│  ├─ middleware/                # JWT protection, ownership, errors
│  ├─ models/                    # User, CycleLog, SymptomLog, HealthReport
│  ├─ routes/                    # /api route modules
│  ├─ seed/                      # Demo account and sample history
│  ├─ utils/                     # Date math, cycle stats, report builder
│  ├─ server.js                  # Express app, static SPA, security middleware
│  └─ .env.example
├─ package.json                  # Root scripts
└─ README.md
```

The adult module is rendered when `user.lifeStage === 'adult'` (or
`'perimenopause'`). `DashboardRoute` in `client/src/App.jsx` is the single place
to register future life-stage dashboards.

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (optional if using the in-memory database)

### 1. Install dependencies

From the project root:

```bash
npm run install:all
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cyclesense
JWT_SECRET=replace-with-a-long-random-string-at-least-32-characters
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
USE_MEMORY_DB=false
```

Set `USE_MEMORY_DB=true` to start an ephemeral in-memory MongoDB that is
automatically seeded with demo data. This is ideal for a quick local review and
does not require a local MongoDB install.

### 3. Run in development

```bash
# API on :5000 + Vite dev server on :5173
npm run dev

# API with the in-memory database + Vite dev server
npm run dev:memory
```

Open <http://localhost:5173>.

### 4. Run the production build locally

```bash
npm run build
npm start
```

The Express server serves the compiled SPA at <http://localhost:5000>.

### 5. Seed demo data (persistent MongoDB)

```bash
npm run seed
```

---

## Demo account

| Field    | Value                 |
| -------- | --------------------- |
| Email    | `demo@cyclesense.app` |
| Password | `CycleSense123!`      |

The demo account includes eight cycles, twenty-nine symptom entries, and one
saved doctor report. With `USE_MEMORY_DB=true`, the account is recreated on
every server start.

---

## Life stages and focus areas

`User` stores two related concepts:

- **`lifeStage`** — the active product module: `adolescent`, `adult`, or
  `perimenopause` (defaults to `adult`).
- **`focusAreas`** — the user's saved priorities:
  `general`, `pcos`, `perimenopause`, `fertility`, and `irregular-periods`.

Focus areas are captured by onboarding and can be changed later in
**Privacy & data**. They can be sent explicitly, or derived from the user's
selected life stages and goals for older clients.

All health dates are stored and compared as date-only `YYYY-MM-DD` strings to
avoid timezone drift.

---

## API reference

All endpoints are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`.

### Health

| Method | Endpoint      | Description          |
| ------ | ------------- | -------------------- |
| GET    | `/health`     | Service health check |

### Auth and profile

| Method | Endpoint            | Description                                      |
| ------ | ------------------- | ------------------------------------------------ |
| POST   | `/auth/register`    | Create an account                                 |
| POST   | `/auth/login`       | Sign in and receive a JWT                         |
| GET    | `/auth/me`          | Current user                                      |
| POST   | `/auth/onboarding`  | Save life stage, focus areas, goals, cycle profile |
| PATCH  | `/auth/profile`     | Update name, age, stages, focus areas, goals      |

### Cycles

| Method | Endpoint                    | Description                                      |
| ------ | --------------------------- | ------------------------------------------------ |
| POST   | `/cycles`                   | Log a period (start/end dates, flow, notes)       |
| GET    | `/cycles/:userId`           | Cycles plus computed stats and chart series       |
| GET    | `/cycles/:userId/summary`   | Predictions and cycle summary                     |
| PUT    | `/cycles/:id`               | Update a cycle                                    |
| DELETE | `/cycles/:id`               | Delete a cycle                                    |

### Symptoms

| Method | Endpoint                    | Description                                      |
| ------ | --------------------------- | ------------------------------------------------ |
| POST   | `/symptoms`                 | Create or update a daily log                      |
| GET    | `/symptoms/:userId`         | Symptom history                                   |
| GET    | `/symptoms/:userId/summary` | Frequency and severity aggregates                 |
| PUT    | `/symptoms/:id`             | Update a log                                      |
| DELETE | `/symptoms/:id`             | Delete a log                                      |

### Reports

| Method | Endpoint            | Description                                      |
| ------ | ------------------- | ------------------------------------------------ |
| POST   | `/reports/preview`  | Build a report for a date range without saving    |
| GET    | `/reports`          | Saved reports                                     |
| POST   | `/reports`          | Save the current report                           |
| GET    | `/reports/:id`      | Retrieve a saved report                           |
| DELETE | `/reports/:id`      | Delete a saved report                             |

### Privacy and data

| Method | Endpoint        | Description                                      |
| ------ | --------------- | ------------------------------------------------ |
| GET    | `/user/export`  | Download all account data as JSON                 |
| DELETE | `/user/data`    | Delete data in a date range or the whole account  |

---

## Design system

The Tailwind palette is defined in `client/tailwind.config.js`:

| Token        | Hex       | Usage                                |
| ------------ | --------- | ------------------------------------ |
| `rose-mist`  | `#FFF1F6` | App background and section backdrops |
| `soft-petal` | `#FFD6E7` | Cards and interactive containers     |
| `blush-pink` | `#F8BBD0` | Tabs, table headers, hover states    |
| `pink-glow`  | `#F672A7` | Primary actions and accents          |
| `rose-pink`  | `#E0487E` | Active and hover interactions        |
| `deep-rose`  | `#C2185B` | Headings and high-priority text      |

Shared primitives (`Button`, `Badge`, `Field`, `Modal`, `PageHeader`,
`States`, `CycleRing`, `ConfirmDialog`) keep spacing, focus states, loading
skeletons, and empty/error states consistent across the module.

---

## Security and privacy notes

- Passwords are hashed with bcrypt and never returned by the API.
- Health records are scoped to the authenticated user with ownership checks.
- Helmet sets security headers; CORS only accepts configured origins.
- Auth and API rate limits protect against brute-force and abuse.
- Data export and deletion are available from **Privacy & data**.
- No health data is sent to third-party analytics services.

## Scripts

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `npm run install:all` | Install root, server, and client dependencies   |
| `npm run dev`       | Run API and Vite dev server                       |
| `npm run dev:memory`| Run API with in-memory MongoDB and Vite            |
| `npm run build`     | Build the client into `client/dist`               |
| `npm start`         | Serve the production build from Express           |
| `npm run seed`      | Seed the demo account into the configured database|
| `npm run preview`   | Preview the built client with Vite                |

---

## Medical disclaimer

CycleSense provides educational information and pattern tracking only. It does
not provide a diagnosis, treatment plan, or emergency care. Always consult a
qualified healthcare professional about concerning symptoms, cycle changes, or
before making medical decisions.
