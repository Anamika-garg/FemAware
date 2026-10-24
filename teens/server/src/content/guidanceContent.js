/**
 * Educational guidance copy shown with assessment results.
 * STATUS: pending_clinical_review — drafted from public sources, NOT yet
 * reviewed by a clinician. Production servers refuse to serve it until a
 * reviewer signs off (see README "Clinical review workflow").
 */
import { GUIDANCE_VERSION } from '../guidance/constants.js';
import { SOURCES } from './sources.js';

const EMERGENCY =
  'If you feel very unwell, call your local emergency number (for example 911 in the US, 999 in the UK, or 112 in the EU and India) or go to the nearest emergency department.';

const results = [
  {
    key: 'cramps.urgent',
    title: 'Please get medical help now',
    body: `Some of what you shared can be a sign that you need to be checked by a medical professional today. This app can't tell what is causing it — only a doctor or nurse can. ${EMERGENCY}`,
    actions: [
      'Tell a parent, carer, school nurse, or another trusted adult right now.',
      'Go to urgent care or an emergency department, or call emergency services.',
      'Do not wait to see if it goes away on its own.',
    ],
    sources: [SOURCES.nhsPeriodPain, SOURCES.acogDysmenorrhea],
  },
  {
    key: 'cramps.see_doctor',
    title: 'It would be a good idea to talk to a doctor',
    body: "Period pain is common, but pain that is strong, gets in the way of your life, or doesn't get better with usual care is worth checking. A doctor or nurse can help find the cause and better ways to manage it. You don't have to just put up with it.",
    actions: [
      'Ask a trusted adult to help you book an appointment with a doctor, nurse, or school health service.',
      'Keep logging your symptoms in FemAware and download your summary to bring along.',
      'Write down how pain affects school, sleep, or activities.',
    ],
    sources: [SOURCES.acogDysmenorrhea, SOURCES.nhsPeriodPain],
  },
  {
    key: 'cramps.self_care',
    title: 'This sounds like common period cramps',
    body: 'Mild to moderate cramps in the first days of a period are very common. Gentle self-care often helps. Keep tracking — if things change or get worse, check in with a doctor.',
    actions: [
      'Try a heat pack or warm bath on your lower belly or back.',
      'Gentle movement such as walking, stretching, or yoga can ease cramps.',
      'Ask a parent or pharmacist which pain reliever is right for you and follow the label.',
      'Retake this check if your pain changes.',
    ],
    sources: [SOURCES.nhsPeriodPain, SOURCES.acogDysmenorrhea],
  },
  {
    key: 'irregular.urgent',
    title: 'Please get medical help now',
    body: `Some of what you shared needs to be checked by a medical professional today. This app can't tell what is causing it. ${EMERGENCY}`,
    actions: [
      'Tell a parent, carer, school nurse, or another trusted adult right now.',
      'Go to urgent care or an emergency department, or call emergency services.',
    ],
    sources: [SOURCES.nhsMissed, SOURCES.nhsHeavy],
  },
  {
    key: 'irregular.see_doctor',
    title: 'It would be a good idea to talk to a doctor',
    body: "Your answers include something doctors like to check. That doesn't mean something is wrong — lots of things can change your cycle — but a doctor or nurse can help you find out what's going on.",
    actions: [
      'Ask a trusted adult to help you book an appointment.',
      'Download your FemAware summary so you can share your cycle dates.',
      'If pregnancy is possible, a pregnancy test and a talk with a doctor or clinic are the best next steps.',
    ],
    sources: [SOURCES.acogVitalSign, SOURCES.nhsIrregular, SOURCES.nhsMissed],
  },
  {
    key: 'irregular.self_care',
    title: 'This is often normal — keep tracking',
    body: "Cycles can be irregular, especially in the first couple of years after your first period, and things like stress, illness, or training can shift them. Keep logging your periods so you and your doctor can spot patterns.",
    actions: [
      'Log each period start and end date in the FemAware calendar.',
      'Look after sleep, food, and stress — they all affect your cycle.',
      'Check in with a doctor if your period stops for 3 months or your cycle changes a lot.',
    ],
    sources: [SOURCES.acogVitalSign, SOURCES.nhsIrregular],
  },
];

const safety = [
  {
    key: 'safety.emergency',
    title: 'If you need help right now',
    body: `${EMERGENCY} You can also tell a parent, carer, school nurse, or another trusted adult.`,
    actions: [
      'Fainting, very heavy bleeding (soaking a pad every hour), or sudden severe pain need urgent care.',
      'A fever with belly pain, or signs of toxic shock syndrome while using a tampon, need urgent care.',
    ],
    sources: [SOURCES.nhsPeriodPain, SOURCES.nhsTss],
  },
  {
    key: 'safety.helplines',
    title: 'Free, confidential people to talk to',
    body: 'If someone has hurt you, made you uncomfortable, or you are not sure if something is OK, you can talk to someone. It is never your fault. In an emergency, call your local emergency number.',
    actions: [
      'Childhelp National Child Abuse Hotline (US): call or text 1-800-422-4453',
      'RAINN National Sexual Assault Hotline (US): 1-800-656-4673',
      'Outside the US: search for your national child helpline, or ask a school counsellor',
    ],
    sources: [SOURCES.childhelp, SOURCES.rainn],
  },
];

const reasons = {
  fainting: 'Fainting or nearly fainting can be a sign of significant blood loss or another problem that needs checking right away.',
  fever_with_pain: 'Fever together with belly or pelvic pain can be a sign of an infection that needs prompt treatment.',
  sudden_severe_pain: 'Sudden, severe pain that is different from your usual cramps should be checked straight away.',
  very_heavy_bleeding: 'Soaking a pad or tampon every hour for more than two hours is heavier than usual and needs prompt medical advice.',
  persistent_vomiting: 'Not being able to keep fluids down can lead to dehydration.',
  pregnancy_with_severe_pain: 'Severe pain when pregnancy is possible needs to be checked urgently.',
  severe_abdominal_pain: 'Severe belly or pelvic pain should be checked by a medical professional.',
  severe_pain: 'You rated your pain as severe (7 or more out of 10).',
  disrupts_daily_life: 'Pain that stops you doing everyday things is worth talking to a doctor about.',
  no_relief: "Pain that doesn't improve with usual care is worth checking.",
  pain_outside_period: 'Pelvic pain outside your period can have causes a doctor can look into.',
  worsening_pain: 'Pain that keeps getting worse over time is worth checking.',
  heavy_bleeding: 'Bleeding that needs a new pad or tampon every 1–2 hours, or large clots, is considered heavy.',
  possible_pregnancy: 'If pregnancy is possible, a test and a talk with a doctor or clinic can give you clear answers.',
  typical_cramps: 'Mild to moderate cramps that ease with self-care are common.',
  no_period_by_15: "Doctors usually like to check if periods haven't started by age 15.",
  over_90_days: 'Going more than 90 days (about 3 months) without a period is worth checking.',
  cycle_under_21: 'Cycles shorter than 21 days, more than 2 years after your first period, are worth checking.',
  cycle_over_45: 'Cycles longer than 45 days, more than 2 years after your first period, are worth checking.',
  unpredictable_after_2_years: 'Cycles that are still very unpredictable 2+ years after your first period are worth checking.',
  hormonal_signs: 'New thick hair growth or severe acne together with irregular periods is something doctors like to check.',
  nipple_discharge: 'Milky nipple discharge when not breastfeeding is worth checking with a doctor.',
  headache_vision: 'Frequent headaches with vision changes should be checked by a doctor.',
  early_years_irregularity: "In the first 2 years after your first period, it's common for cycles to be irregular.",
  not_started_yet: 'Most people get their first period between ages 10 and 15. Everyone develops on their own timeline.',
  lifestyle_factors: 'Stress, illness, weight changes, intense exercise, and some medicines can all shift your cycle.',
  within_typical_range: 'Teen cycles of 21–45 days are considered within the typical range.',
};

export function buildGuidanceSeed() {
  const base = { version: GUIDANCE_VERSION, reviewStatus: 'pending_clinical_review' };
  return [
    ...results.map((r) => ({ ...base, ...r, category: 'assessment_result' })),
    ...safety.map((s) => ({ ...base, ...s, category: 'safety' })),
    ...Object.entries(reasons).map(([code, body]) => ({
      ...base,
      key: `reason.${code}`,
      category: 'reason',
      title: code,
      body,
      sources: [SOURCES.acogVitalSign],
    })),
  ];
}
