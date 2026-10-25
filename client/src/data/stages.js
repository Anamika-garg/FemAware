// How each life stage is described on the public site. Ages are a starting
// point only; every resource stays open to everyone.
export const SITE_STAGES = [
  {
    value: 'teen',
    title: 'Teenagers',
    theme: 'Learn & explore',
    ages: '13–19',
    description:
      'Clear, judgement-free answers about puberty, first periods and how your body is changing, with simple tools to start tracking.',
    features: ['First-period and puberty guides', 'A simple period calendar', 'Consent and body-safety lessons'],
    tools: [
      { label: 'Lessons and short quizzes', account: true },
      { label: 'Period calendar and symptom diary', account: true },
      { label: 'Guided symptom check', account: true },
      { label: 'Body safety and where to get help', account: false },
    ],
  },
  {
    value: 'adult',
    title: 'Adult women',
    theme: 'Track & understand',
    ages: '20–59',
    description:
      'Follow your cycle and symptoms over time, learn what patterns can mean, and walk into appointments with a clear record.',
    features: ['Cycle history and symptom journal', 'PCOS and late-period guidance', 'Doctor-ready summaries'],
    tools: [
      { label: 'Period tracker with estimated predictions', account: true },
      { label: 'Symptom journal and health insights', account: true },
      { label: 'Late period guide and PCOS reflection', account: true },
      { label: 'Contraception, fertility and pregnancy articles', account: false },
    ],
  },
  {
    value: 'senior',
    title: 'Senior women',
    theme: 'Care & wellbeing',
    ages: '60+',
    description:
      'Understand life after menopause, keep a gentle record of how you feel, and prepare for the conversations that matter.',
    features: ['Menopause and postmenopause education', 'Daily comfort check-ins', 'Appointment preparation'],
    tools: [
      { label: 'Daily comfort and symptom check-ins', account: true },
      { label: 'Health trends from your own entries', account: true },
      { label: 'Visit preparation with a printable summary', account: true },
      { label: 'Bone, heart, intimate and urinary health articles', account: false },
    ],
  },
];
