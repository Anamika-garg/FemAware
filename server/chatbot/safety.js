/**
 * Deterministic safety net.
 *
 * The model is good at nuance, but a keyword screen makes the urgent path
 * predictable: certain messages never wait for a model response. The screen is
 * deliberately conservative and only covers clear red flags. It is not a
 * diagnosis and it never replaces clinical judgement.
 */

export const URGENCY_ORDER = {
  routine: 0,
  soon: 1,
  urgent: 2,
  emergency: 3,
  crisis: 4,
};

const RULES = [
  {
    level: 'crisis',
    category: 'self-harm',
    pattern:
      /\b(kill myself|killing myself|suicid\w*|end my life|ending my life|self[- ]?harm\w*|cut myself|cutting myself|overdose|don'?t want to live|do not want to live|no reason to live)\b/i,
    instruction:
      'The person may be describing suicidal thoughts or self-harm. Respond with compassion and without judgement. Put immediate safety first: tell them to contact a local crisis line or emergency services now, and to tell a trusted person nearby. Do not provide methods, instructions or graphic detail. Do not leave them with only general advice.',
  },
  {
    level: 'emergency',
    category: 'medical-emergency',
    pattern:
      /\b(chest pain|can'?t breathe|cannot breathe|trouble breathing|shortness of breath|passed out|passing out|fainted|fainting|unconscious|seizure|slurred speech|one[- ]sided weakness|face drooping|severe abdominal pain|shoulder[- ]tip pain|soaking through|bleeding through|heavy bleeding.{0,40}(dizz|faint)|(dizz|faint)\w*.{0,40}heavy bleeding)\b/i,
    instruction:
      'The person may be describing a medical emergency. Tell them clearly and early to call their local emergency number or go to the nearest emergency department now, and to ask someone to stay with them. Do not suggest waiting to see if it settles.',
  },
  {
    level: 'urgent',
    category: 'pregnancy-red-flag',
    pattern:
      /\b(pregnan\w*.{0,60}(bleed|pain|dizz|faint)|(bleed|pain|dizz|faint)\w*.{0,60}pregnan\w*|positive (pregnancy )?test.{0,60}(pain|bleed))\b/i,
    instruction:
      'Pregnancy with bleeding, pain, dizziness or fainting needs urgent assessment. Advise same-day medical care and mention ectopic pregnancy red flags without diagnosing.',
  },
  {
    level: 'urgent',
    category: 'postmenopausal-bleeding',
    pattern:
      /\b(bleed\w*.{0,40}after menopause|post[- ]?menopausal bleed\w*|bleeding after menopause|period after menopause)\b/i,
    instruction:
      'Any vaginal bleeding after menopause needs prompt assessment. Advise contacting a clinician the same week, sooner if heavy or painful. Do not suggest watchful waiting.',
  },
  {
    level: 'urgent',
    category: 'possible-infection',
    pattern:
      /\b(fever.{0,50}(pelvic|urine|urinary|back pain|kidney)|(pelvic|urine|urinary|back pain|kidney).{0,50}fever)\b/i,
    instruction:
      'Fever with pelvic, urinary or back pain can indicate infection. Advise same-day medical care.',
  },
  {
    level: 'urgent',
    category: 'abuse-or-safety',
    pattern:
      /\b(hits me|hitting me|hurts me|touches me|touched me|molest\w*|sexual abuse|raped|rape|unsafe at home|afraid of (him|her|them|my (dad|father|uncle|brother|cousin|partner)))\b/i,
    instruction:
      'The person may be describing abuse or an unsafe situation. Believe them, say it is not their fault, and put safety first. If they are in immediate danger, tell them to call emergency services. Encourage one trusted adult or a local support service. Do not pressure them to share details or confront anyone.',
  },
  {
    level: 'soon',
    category: 'heavy-period',
    pattern:
      /\b(soak\w*.{0,30}(pad|tampon|protection)|change protection.{0,20}(hour|hourly)|large clots?|bleeding for (more than )?(8|nine|ten|\d{2,}) days)\b/i,
    instruction:
      'Heavy or prolonged bleeding is worth a clinician visit soon. Mention same-day care if they feel dizzy, faint or breathless.',
  },
];

const FOOTERS = {
  soon: 'Keep a note of this and mention it at your next clinician visit.',
  urgent:
    'This is worth checking with a clinician promptly. If symptoms worsen, seek same-day care.',
  emergency:
    'If you are in immediate danger or your symptoms are severe, call your local emergency number now.',
  crisis:
    'If you are in immediate danger, call your local emergency number now. You deserve support from a real person.',
};

const SAFETY_REPLY_COPY = {
  crisis: {
    lead:
      'I’m really glad you told me. You deserve support right now, and you do not have to handle this alone.',
    steps: [
      'If you are in immediate danger, call your local emergency number (for example 911, 112 or 999) or go to the nearest emergency department.',
      'Contact a crisis line in your country and ask to speak to someone now. A local service can stay with you while you get help.',
      'If you can, tell a trusted person nearby that you need company and support right now.',
    ],
    close:
      'I can share information, but a real person can help keep you safe. Who is one person you could contact today?',
    reasoning: [
      'You described thoughts or feelings that may involve self-harm or suicide.',
      'A chat cannot keep you safe in a crisis, and you should not have to wait.',
      'The safest next step is immediate support from a crisis line, emergency services or a trusted person nearby.',
    ],
    followUps: ['How can I get support right now?', 'What can I say when I call a crisis line?'],
  },
  emergency: {
    lead:
      'What you are describing needs urgent in-person care, not a chat. Please get help now.',
    steps: [
      'Call your local emergency number or go to the nearest emergency department now.',
      'If you can, ask someone to stay with you and help you get there.',
      'Do not wait to see if it settles. If you feel faint, lie down and call for help.',
    ],
    close:
      'Once you are safe, a clinician can work out what is causing this. Would you like help writing down what to tell them?',
    reasoning: [
      'Your message included symptoms that can need emergency care.',
      'A chat cannot assess or treat an emergency safely.',
      'The safest next step is to contact emergency services or a trusted adult now.',
    ],
    followUps: ['What should I tell the emergency team?', 'How can I get help getting there?'],
  },
};

export const screenMessage = (text = '') => {
  const message = String(text);
  const matches = RULES.filter((rule) => rule.pattern.test(message));

  if (!matches.length) {
    return {
      level: 'none',
      categories: [],
      instruction: '',
      footer: '',
    };
  }

  const level = matches.reduce(
    (highest, rule) =>
      URGENCY_ORDER[rule.level] > URGENCY_ORDER[highest] ? rule.level : highest,
    'routine'
  );

  return {
    level,
    categories: [...new Set(matches.map((rule) => rule.category))],
    instruction: matches.map((rule) => rule.instruction).join(' '),
    footer: FOOTERS[level] || '',
  };
};

export const maxUrgency = (a = 'routine', b = 'routine') =>
  (URGENCY_ORDER[a] ?? 0) >= (URGENCY_ORDER[b] ?? 0) ? a : b;

export const safetyFooterFor = (level) => FOOTERS[level] || '';

/**
 * Fixed responses for the two levels where waiting for a model would be
 * inappropriate. The guide's voice still varies slightly by module.
 */
export const buildSafetyReply = ({ module, screen }) => {
  const copy = SAFETY_REPLY_COPY[screen.level] || SAFETY_REPLY_COPY.emergency;
  const teenLine =
    module === 'teen'
      ? '\n\nIf you can, tell a trusted adult nearby right now — a parent, guardian, school nurse or another adult you trust.'
      : '';

  const answer = [
    copy.lead,
    '',
    '**Please get help now**',
    ...copy.steps.map((step) => `- ${step}`),
    copy.close,
  ].join('\n');

  return {
    content: `${answer}${teenLine}`,
    reasoning: copy.reasoning,
    urgency: screen.level,
    followUps: copy.followUps,
    safetyLevel: screen.level,
    safetyNotice: FOOTERS[screen.level] || '',
  };
};
