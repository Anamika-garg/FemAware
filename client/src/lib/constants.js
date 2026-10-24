export const LIFE_STAGES = [
  {
    value: 'general',
    label: 'General cycle tracking',
    short: 'Everyday tracking',
    description: 'Understand your rhythm, symptoms and energy across the month.',
    icon: 'sparkles',
  },
  {
    value: 'pcos',
    label: 'PCOS awareness',
    short: 'PCOS awareness',
    description: 'Notice irregular patterns and learn what is worth discussing with a clinician.',
    icon: 'activity',
  },
  {
    value: 'perimenopause',
    label: 'Perimenopause & menopause',
    short: 'Perimenopause',
    description: 'Track changing cycles, sleep, mood and vasomotor symptoms through midlife.',
    icon: 'flower',
  },
  {
    value: 'fertility',
    label: 'Fertility & pregnancy planning',
    short: 'Fertility planning',
    description: 'Learn your fertile window and build a clearer record for preconception care.',
    icon: 'heart',
  },
];

export const GOALS = [
  { value: 'Understand my cycle patterns', icon: 'lineChart' },
  { value: 'Track symptom severity', icon: 'activity' },
  { value: 'Manage irregular periods', icon: 'calendar' },
  { value: 'Prepare for doctor visits', icon: 'stethoscope' },
  { value: 'Improve energy and sleep', icon: 'moon' },
  { value: 'Plan for pregnancy', icon: 'baby' },
  { value: 'Understand perimenopause changes', icon: 'flower' },
  { value: 'Build a PCOS symptom record', icon: 'heartPulse' },
  { value: 'Feel more in control of my body', icon: 'shield' },
];

// The product space a user sees. Saved as `lifeStage` on the account.
export const STAGE_OPTIONS = [
  {
    value: 'teen',
    label: 'Teen space',
    ages: 'Ages 13–19',
    description: 'Puberty and first-period guides, period tracking, quizzes, myth-busting and body-safety lessons.',
    icon: 'sprout',
    ageRange: [13, 19],
  },
  {
    value: 'adult',
    label: 'Adult women',
    ages: 'Periods to perimenopause',
    description: 'Cycle and symptom tracking, late-period guidance, PCOS awareness, fertility and doctor-ready reports.',
    icon: 'heart',
    ageRange: [18, 110],
  },
  {
    value: 'senior',
    label: 'Senior care',
    ages: 'After menopause',
    description: 'Daily comfort check-ins, bone and heart health, intimate and urinary health, and visit preparation.',
    icon: 'flower',
    ageRange: [40, 110],
  },
];

export const TEEN_GOALS = [
  { value: 'Track my period' },
  { value: 'Understand my symptoms' },
  { value: 'Learn about my body' },
  { value: 'Get ready for a doctor visit' },
];

export const SENIOR_GOALS = [
  { value: 'Protect my bone health' },
  { value: 'Understand heart health' },
  { value: 'Sleep more comfortably' },
  { value: 'Ease hot flashes and night sweats' },
  { value: 'Look after intimate and urinary health' },
  { value: 'Prepare for doctor visits' },
];

export const SENIOR_FOCUS_AREAS = ['postmenopause', 'bone-health', 'heart-health', 'intimate-health'];

export const PHYSICAL_SYMPTOM_GROUPS = [
  {
    title: 'Pain & body',
    symptoms: [
      'Cramps',
      'Headache',
      'Back pain',
      'Breast tenderness',
      'Bloating',
      'Acne',
      'Joint pain',
      'Dizziness',
    ],
  },
  {
    title: 'Energy & digestion',
    symptoms: [
      'Fatigue',
      'Nausea',
      'Food cravings',
      'Constipation',
      'Diarrhoea',
      'Insomnia',
      'Hot flushes',
      'Brain fog',
    ],
  },
];

export const PHYSICAL_SYMPTOMS = PHYSICAL_SYMPTOM_GROUPS.flatMap((group) => group.symptoms);

export const MOODS = [
  'Calm',
  'Anxious',
  'Irritable',
  'Energetic',
  'Low energy',
  'Mood swings',
  'Hopeful',
  'Overwhelmed',
];

export const FLOW_OPTIONS = [
  {
    value: 'spotting',
    label: 'Spotting',
    description: 'Just a trace',
    dots: 1,
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Changing 3–4×/day',
    dots: 2,
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Changing every 4–6h',
    dots: 3,
  },
  {
    value: 'heavy',
    label: 'Heavy',
    description: 'Changing every 1–3h',
    dots: 4,
  },
];

export const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

export const SEVERITY_STYLES = {
  mild: 'bg-white/80 text-deep-rose border-blush-pink',
  moderate: 'bg-blush-pink/80 text-deep-rose border-pink-glow/30',
  severe: 'bg-pink-glow text-white border-pink-glow',
};

export const ENERGY_LABELS = {
  1: 'Running on empty',
  2: 'Low',
  3: 'Steady',
  4: 'Good',
  5: 'Bright',
};

export const REPORT_RANGES = [
  { value: '3', label: 'Last 3 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
];

export const CATEGORY_STYLES = {
  Contraception: {
    badge: 'bg-blush-pink/70 text-deep-rose',
    accent: 'bg-pink-glow',
  },
  Fertility: {
    badge: 'bg-soft-petal text-deep-rose',
    accent: 'bg-deep-rose',
  },
  'Sexual Health': {
    badge: 'bg-rose-mist text-rose-pink',
    accent: 'bg-rose-pink',
  },
  'Pregnancy & Postpartum': {
    badge: 'bg-[#FDE7EF] text-deep-rose',
    accent: 'bg-pink-glow',
  },
  Perimenopause: {
    badge: 'bg-[#F9D8E5] text-deep-rose',
    accent: 'bg-[#B03A6E]',
  },
};
