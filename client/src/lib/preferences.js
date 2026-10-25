// Starting-point preferences chosen in the public "Explore your health" flow.
// They live in this browser only, need no account, and prefill account
// onboarding if the person later decides to sign up.
import { GOALS, SENIOR_GOALS, TEEN_GOALS } from './constants';

const PREFERENCES_KEY = 'femaware_preferences';

export const START_STAGES = [
  {
    value: 'teen',
    label: 'Teenager',
    hint: 'Usually 13–19',
    description: 'Puberty, first periods, cycle basics and body safety.',
  },
  {
    value: 'adult',
    label: 'Adult woman',
    hint: 'Usually 20–59',
    description: 'Cycles, symptoms, PCOS, contraception, fertility and midlife changes.',
  },
  {
    value: 'senior',
    label: 'Senior woman',
    hint: 'Usually 60+',
    description: 'Menopause and after, bone and heart health, comfort and appointments.',
  },
  {
    value: 'everything',
    label: 'Prefer to explore everything',
    hint: 'No stage needed',
    description: 'See resources from every life stage and decide as you go.',
  },
];

const EVERYTHING_TOPICS = [
  { value: 'Understand my cycle patterns' },
  { value: 'Understand my symptoms' },
  { value: 'Learn about my body' },
  { value: 'Build a PCOS symptom record' },
  { value: 'Understand perimenopause changes' },
  { value: 'Protect my bone health' },
  { value: 'Prepare for doctor visits' },
];

export const topicsForStage = (stage) =>
  ({ teen: TEEN_GOALS, adult: GOALS, senior: SENIOR_GOALS })[stage] || EVERYTHING_TOPICS;

// Each topic points at library articles and at the app tools that support it.
// Tools marked `account` need a free account because they store personal records.
const TOOLS = {
  tracker: { label: 'Period tracker', to: '/cycle', account: true, text: 'Log period dates and see your pattern.' },
  journal: { label: 'Symptom journal', to: '/symptoms', account: true, text: 'Record symptoms, severity and notes.' },
  insights: { label: 'Health insights', to: '/insights', account: true, text: 'Charts built only from what you log.' },
  report: { label: 'Doctor-visit summary', to: '/doctor-report', account: true, text: 'A printable record for appointments.' },
  check: { label: 'Guided symptom check', to: '/check', account: true, text: 'Step-by-step questions with clear next steps.' },
  latePeriod: { label: 'Late period guide', to: '/late-period', account: true, text: 'Walk through what a late period may mean.' },
  pcos: { label: 'PCOS reflection', to: '/pcos', account: true, text: 'Note patterns to discuss with a clinician.' },
  guide: { label: 'Symptom guide', to: '/symptom-guide', account: false, text: 'Warning signs and when to get help.' },
  library: { label: 'Learning library', to: '/library', account: false, text: 'Reviewed-source articles for every stage.' },
};

const TOPIC_MAP = {
  'Track my period': { articles: ['your-first-period', 'understanding-your-cycle'], tools: ['tracker'] },
  'Understand my symptoms': { articles: ['pms-common-and-when-to-seek-help'], tools: ['guide', 'journal'] },
  'Learn about my body': { articles: ['understanding-your-cycle', 'consent-boundaries-body-safety'], tools: ['library'] },
  'Get ready for a doctor visit': { articles: ['your-first-period'], tools: ['report'] },
  'Understand my cycle patterns': { articles: ['understanding-your-cycle'], tools: ['tracker', 'insights'] },
  'Track symptom severity': { articles: ['pms-common-and-when-to-seek-help'], tools: ['journal', 'insights'] },
  'Manage irregular periods': { articles: ['understanding-your-cycle', 'pcos-awareness'], tools: ['latePeriod', 'tracker'] },
  'Prepare for doctor visits': { articles: ['midlife-bleeding'], tools: ['report', 'guide'] },
  'Improve energy and sleep': { articles: ['hot-flushes-sleep', 'pms-common-and-when-to-seek-help'], tools: ['journal'] },
  'Plan for pregnancy': { articles: ['fertile-window', 'fertility-assessment'], tools: ['tracker'] },
  'Understand perimenopause changes': { articles: ['perimenopause-101', 'menopause-changing-health-needs'], tools: ['journal'] },
  'Build a PCOS symptom record': { articles: ['pcos-awareness'], tools: ['pcos', 'journal'] },
  'Feel more in control of my body': { articles: ['understanding-your-cycle'], tools: ['library'] },
  'Protect my bone health': { articles: ['bone-health-osteoporosis'], tools: ['library'] },
  'Understand heart health': { articles: ['cardiovascular-wellness'], tools: ['library'] },
  'Sleep more comfortably': { articles: ['healthy-aging', 'hot-flushes-sleep'], tools: ['journal'] },
  'Ease hot flashes and night sweats': { articles: ['understanding-postmenopause', 'hot-flushes-sleep'], tools: ['journal'] },
  'Look after intimate and urinary health': { articles: ['intimate-urinary-health'], tools: ['guide'] },
};

const DEFAULT_ARTICLES = {
  teen: ['your-first-period', 'understanding-your-cycle', 'consent-boundaries-body-safety'],
  adult: ['understanding-your-cycle', 'pms-common-and-when-to-seek-help', 'pcos-awareness'],
  senior: ['menopause-changing-health-needs', 'bone-health-osteoporosis', 'cardiovascular-wellness'],
  everything: ['understanding-your-cycle', 'pms-common-and-when-to-seek-help', 'menopause-changing-health-needs'],
};

export const recommendationsFor = ({ stage, topics = [] }) => {
  const articles = [];
  const tools = [];
  topics.forEach((topic) => {
    const entry = TOPIC_MAP[topic];
    if (!entry) return;
    entry.articles.forEach((id) => !articles.includes(id) && articles.push(id));
    entry.tools.forEach((key) => !tools.includes(key) && tools.push(key));
  });
  (DEFAULT_ARTICLES[stage] || DEFAULT_ARTICLES.everything).forEach(
    (id) => articles.length < 4 && !articles.includes(id) && articles.push(id)
  );
  if (stage === 'teen' && !tools.includes('check')) tools.push('check');
  if (!tools.includes('guide')) tools.push('guide');
  return { articles: articles.slice(0, 5), tools: tools.slice(0, 4).map((key) => ({ key, ...TOOLS[key] })) };
};

export const loadPreferences = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || 'null');
    if (stored && START_STAGES.some((item) => item.value === stored.stage)) {
      return { stage: stored.stage, topics: Array.isArray(stored.topics) ? stored.topics : [] };
    }
  } catch {
    // Treat unreadable storage as "no preferences yet".
  }
  return null;
};

export const savePreferences = (preferences) => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ ...preferences, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
};

export const clearPreferences = () => {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch {
    // Nothing to clear.
  }
};
