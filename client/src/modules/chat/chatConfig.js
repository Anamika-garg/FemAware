export const resolveChatStage = (lifeStage) => {
  if (lifeStage === 'teen' || lifeStage === 'adolescent') return 'teen';
  if (lifeStage === 'senior') return 'senior';
  return 'adult';
};

/**
 * Used for the first paint and while the server config loads. The server is the
 * source of truth for the guide's copy; these fallbacks keep the page from
 * flashing a generic heading.
 */
export const CHAT_FALLBACKS = {
  teen: {
    id: 'teen',
    label: 'Teen space',
    guideName: 'Bloom',
    tagline: 'A private place to ask about your body, periods and feelings.',
    description:
      'Bloom answers in plain, teen-friendly language. It never judges you and never shares what you write.',
    suggestions: [
      'Why is my period late?',
      'What can help with bad cramps?',
      'Is it normal to feel moody before my period?',
      'How do I talk to a trusted adult about my body?',
    ],
    disclaimer:
      'Bloom gives education, not a diagnosis. If something feels urgent, tell a trusted adult and get medical help.',
  },
  adult: {
    id: 'adult',
    label: 'Adult women',
    guideName: 'Ava',
    tagline: 'Practical, evidence-informed answers about your cycle and health.',
    description:
      'Ava helps you understand symptoms, compare options and prepare for a clinician conversation — without diagnosing you.',
    suggestions: [
      'My cycles vary from 27 to 33 days. Is that a problem?',
      'What could be causing my heavy periods?',
      'How can I tell if this is PMS or PMDD?',
      'What should I ask my doctor about PCOS?',
    ],
    disclaimer:
      'Ava gives health education, not a diagnosis or prescription. Bring persistent or severe symptoms to a clinician.',
  },
  senior: {
    id: 'senior',
    label: 'Senior women',
    guideName: 'Mira',
    tagline: 'Calm, plain-language support for life after menopause.',
    description:
      'Mira helps you make sense of changes after menopause, prepare for appointments and decide when to ask for help.',
    suggestions: [
      'What can I do about night sweats?',
      'Should I be worried about joint stiffness?',
      'How can I prepare for my next appointment?',
      'What changes in bleeding should I report?',
    ],
    disclaimer:
      'Mira gives health education, not a diagnosis. New bleeding after menopause should always be checked by a clinician.',
  },
};

export const getFallbackGuide = (stage) => CHAT_FALLBACKS[stage] || CHAT_FALLBACKS.adult;
