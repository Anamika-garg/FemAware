/** Display labels for API enum values. */
export const SYMPTOM_LABELS = {
  cramps: 'Cramps',
  headache: 'Headache',
  bloating: 'Bloating',
  fatigue: 'Tiredness',
  mood_changes: 'Mood changes',
  acne: 'Acne',
  breast_tenderness: 'Sore breasts',
  back_pain: 'Back pain',
  nausea: 'Nausea',
  cravings: 'Cravings',
  heavy_flow: 'Heavy flow',
  spotting: 'Spotting',
};

export const SEVERITY_LABELS = { 1: 'Barely there', 2: 'Mild', 3: 'Moderate', 4: 'Strong', 5: 'Very strong' };

export const FLOW_LABELS = { light: 'Light', medium: 'Medium', heavy: 'Heavy' };

export const LEVEL_LABELS = {
  urgent: 'Get help now',
  see_doctor: 'Talk to a doctor',
  self_care: 'Self-care & tracking',
};

export const ASSESSMENT_LABELS = {
  cramps: 'Period cramps',
  irregular: 'Late or irregular periods',
};

export const REVIEW_LABELS = {
  pending_clinical_review: 'Draft — awaiting clinician review',
  clinician_reviewed: 'Reviewed by a clinician',
  draft: 'Draft',
};

export const AGE_GROUPS = [
  { value: '13-15', label: '13–15' },
  { value: '16-17', label: '16–17' },
  { value: '18-19', label: '18–19' },
];

export const GOALS = [
  { value: 'track', label: 'Track my period' },
  { value: 'symptoms', label: 'Understand my symptoms' },
  { value: 'learn', label: 'Learn about my body' },
  { value: 'doctor', label: 'Get ready for a doctor visit' },
];

export const humanize = (s) => s.replace(/_/g, ' ');
