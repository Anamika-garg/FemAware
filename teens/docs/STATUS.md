# Feature status report

Legend: ✅ functional (real API + MongoDB) · 🧪 uses synthetic demo data · 🩺 requires clinical review before production

| Feature | Status | Notes |
|---|---|---|
| Landing page | ✅ | Static marketing content |
| Onboarding | ✅ | Creates an anonymous demo session; nickname/age/goals stay in `localStorage` |
| Demo sessions & ownership | ✅ | httpOnly cookie, hashed token, owner-scoped queries, TTL expiry |
| Sample data loader | ✅ 🧪 | `POST /api/session/demo-data` writes 6 synthetic cycles + symptom logs |
| Dashboard | ✅ 🧪 | Live data from insights, progress, and symptoms APIs |
| Lessons & quizzes (6 modules) | ✅ 🩺 | Server-side scoring, XP, levels, 4 achievements; answers never sent before submission |
| Period calendar | ✅ | Create/edit/delete periods, end an open period, predicted next period |
| Symptom diary | ✅ | Full CRUD with validation |
| Guided check: cramps | ✅ 🩺 | Rules in `server/src/guidance/rules.js`; urgent red flags covered by tests |
| Guided check: late/irregular periods | ✅ 🩺 | Same as above |
| Health insights + charts | ✅ 🩺 | Cycle stats, regularity, flags; thresholds need clinician validation |
| Downloadable summary | ✅ 🧪 | Plain-text file, labelled as demo data and non-diagnostic |
| Body safety & consent page | ✅ 🩺 | Pulls lessons + helpline guidance from the API |
| Privacy & data deletion | ✅ | Deletes all server data + local profile |
| Health disclaimer | ✅ | Needs legal/compliance review for your region |

## PS1 checkpoints

| Checkpoint | Where to demo it |
|---|---|
| Diagnosis gaps (non-diagnostic guidance) | **Symptom check** → cramps → tick "Fainting" → urgent guidance; or set pain 8 → "talk to a doctor" |
| Symptom tracking | **Calendar** and **Symptoms**: add, edit, delete entries |
| Health awareness | **Learn**: complete a lesson quiz → XP + badge |
| Meaningful clinical insights | **Insights**: charts, "Things to talk to a doctor about", **Download summary** |

## What needs clinical review 🩺

All content is seeded as `pending_clinical_review`, drafted from public sources (ACOG, NHS, Nemours KidsHealth, Planned
Parenthood, Childhelp, RAINN). It has **not** been reviewed by a clinician. Before production:

1. **Triage rules** (`server/src/guidance/rules.js`): red-flag list; pain ≥ 7 threshold; "no period by 15"; > 90 days
   without a period; cycles < 21 / > 45 days after 2 years; pregnancy + severe pain → urgent.
2. **Insight thresholds** (`server/src/services/insights.js`): typical cycle 21–45 days, period ≤ 7 days, variation > 9
   days = "irregular", ≥ 50% severe logs, ≥ 3 heavy-flow logs.
3. **All guidance copy** (`server/src/content/guidanceContent.js`), including emergency numbers and helplines (US-centric
   hotlines; localise per market).
4. **All six lessons** (`server/src/content/learningModules.js`), including medication wording (currently "ask a parent or
   pharmacist" with no specific drugs or doses).
5. **Assessment questions** (`server/src/guidance/questions.js`).

## Known limitations

- Demo mode only. There are no real accounts, so data doesn't move between browsers or devices.
- Cycle prediction is a simple average and is shown as an estimate.
- Quiz attempts that fail before a lesson's first pass are not recorded in progress.
- Helplines are US-specific, with a generic fallback for other countries.
