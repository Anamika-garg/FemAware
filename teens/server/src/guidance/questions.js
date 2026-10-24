/**
 * Guided assessment questions. The UI renders these generically, so all
 * clinical wording lives server-side next to the rules that interpret it.
 *
 * kinds: "scale" (integer min..max), "single" (one option), "multi" (any options),
 *        "number" (integer min..max)
 */
const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export const QUESTIONS = {
  cramps: [
    {
      id: 'painLevel',
      kind: 'scale',
      min: 0,
      max: 10,
      prompt: 'On a usual period day, how strong is your cramp pain?',
      help: '0 means no pain, 10 means the worst pain you can imagine.',
    },
    {
      id: 'interferesWithDaily',
      kind: 'single',
      options: yesNo,
      prompt: 'Does the pain make you miss school, sports, or plans?',
    },
    {
      id: 'reliefWithMedication',
      kind: 'single',
      options: [
        { value: 'yes', label: 'Yes, it helps' },
        { value: 'no', label: "No, it doesn't help much" },
        { value: 'not_tried', label: "I haven't tried it" },
      ],
      prompt: 'Do heat, rest, or pain relievers that a parent or pharmacist approved help?',
    },
    {
      id: 'painOutsidePeriod',
      kind: 'single',
      options: yesNo,
      prompt: 'Do you get similar pelvic pain when you are NOT on your period?',
    },
    {
      id: 'gettingWorse',
      kind: 'single',
      options: yesNo,
      prompt: 'Has the pain been getting worse over the last few months?',
    },
    {
      id: 'heavyBleeding',
      kind: 'single',
      options: yesNo,
      prompt: 'Do you soak through a pad or tampon every 1–2 hours, or pass clots bigger than a coin?',
    },
    {
      id: 'redFlags',
      kind: 'multi',
      prompt: 'Are any of these happening right now? Select all that apply.',
      help: 'If none apply, leave them all unselected.',
      options: [
        { value: 'fainting', label: 'Fainting, or feeling like you might pass out' },
        { value: 'fever', label: 'Fever (38°C / 100.4°F or higher) with belly pain' },
        { value: 'sudden_severe_pain', label: 'Sudden, severe pain that feels different from usual cramps' },
        { value: 'soaking_hourly', label: 'Soaking a pad or tampon every hour for 2+ hours in a row' },
        { value: 'vomiting', label: "Vomiting so much you can't keep fluids down" },
        { value: 'possible_pregnancy', label: 'There is a chance I could be pregnant' },
      ],
    },
  ],
  irregular: [
    {
      id: 'age',
      kind: 'number',
      min: 10,
      max: 19,
      prompt: 'How old are you?',
    },
    {
      id: 'periodHistory',
      kind: 'single',
      prompt: 'When did you get your first period?',
      options: [
        { value: 'never', label: "I haven't had a period yet" },
        { value: 'under_2_years', label: 'Less than 2 years ago' },
        { value: 'over_2_years', label: '2 or more years ago' },
      ],
    },
    {
      id: 'daysSinceLastPeriod',
      kind: 'number',
      min: 0,
      max: 730,
      prompt: 'About how many days ago did your last period start?',
      help: 'If you have never had a period, enter 0.',
    },
    {
      id: 'usualCycle',
      kind: 'single',
      prompt: 'How many days are usually between the first day of one period and the first day of the next?',
      options: [
        { value: 'under_21', label: 'Fewer than 21 days' },
        { value: '21_to_45', label: '21 to 45 days' },
        { value: 'over_45', label: 'More than 45 days' },
        { value: 'varies', label: 'It changes a lot / not sure' },
        { value: 'na', label: "Doesn't apply to me yet" },
      ],
    },
    {
      id: 'pregnancyPossible',
      kind: 'single',
      prompt: 'Is there any chance you could be pregnant?',
      help: 'This answer is used only to give you guidance. It is never saved.',
      options: [
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes' },
        { value: 'unsure', label: "I'm not sure" },
      ],
    },
    {
      id: 'recentChanges',
      kind: 'multi',
      prompt: 'Have any of these happened recently? Select all that apply.',
      options: [
        { value: 'stress', label: 'A lot of stress' },
        { value: 'weight_change', label: 'Big weight change or eating much less' },
        { value: 'intense_exercise', label: 'Much more intense exercise or training' },
        { value: 'illness', label: 'Being ill' },
        { value: 'new_medication', label: 'Starting or stopping a medicine or birth control' },
      ],
    },
    {
      id: 'otherSymptoms',
      kind: 'multi',
      prompt: 'Do you also have any of these? Select all that apply.',
      options: [
        { value: 'severe_abdominal_pain', label: 'Severe belly or pelvic pain' },
        { value: 'fainting', label: 'Fainting or feeling like you might pass out' },
        { value: 'soaking_hourly', label: 'Very heavy bleeding (soaking a pad every hour)' },
        { value: 'excess_hair_acne', label: 'New thick hair growth on the face/chest, or severe acne' },
        { value: 'nipple_discharge', label: 'Milky discharge from the nipples' },
        { value: 'headache_vision', label: 'Frequent headaches with vision changes' },
      ],
    },
  ],
};

export function getQuestions(type) {
  return QUESTIONS[type] || null;
}
