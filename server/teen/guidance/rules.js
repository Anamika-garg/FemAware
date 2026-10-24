/**
 * Non-diagnostic triage rules for the guided assessments.
 *
 * These rules only decide which *educational guidance tier* to show:
 *   - urgent:     red-flag symptoms -> get help now
 *   - see_doctor: worth booking a visit with a doctor / nurse
 *   - self_care:  common and usually manageable; keep tracking
 *
 * They never name a condition. Thresholds follow commonly published
 * adolescent menstrual-health guidance (e.g. ACOG Committee Opinion 651:
 * "Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a
 * Vital Sign") and MUST be re-validated by a clinician before production use.
 */
import { GUIDANCE_LEVELS, SENSITIVE_REASON_CODES } from './constants.js';
import { QUESTIONS } from './questions.js';

export class AnswerValidationError extends Error {
  constructor(errors) {
    super('Invalid assessment answers');
    this.errors = errors;
  }
}

/**
 * Validate and normalise raw answers against the question definitions.
 * Unknown keys are dropped, so nothing unexpected reaches the rules.
 */
export function validateAnswers(type, raw) {
  const questions = QUESTIONS[type];
  if (!questions) throw new AnswerValidationError({ type: 'Unknown assessment type' });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new AnswerValidationError({ answers: 'answers must be an object' });
  }

  const errors = {};
  const clean = {};
  for (const q of questions) {
    const value = raw[q.id];
    const allowed = q.options?.map((o) => o.value);
    if (q.kind === 'scale' || q.kind === 'number') {
      if (!Number.isInteger(value) || value < q.min || value > q.max) {
        errors[q.id] = `Must be a whole number from ${q.min} to ${q.max}`;
      } else clean[q.id] = value;
    } else if (q.kind === 'single') {
      if (!allowed.includes(value)) errors[q.id] = 'Choose one of the options';
      else clean[q.id] = value;
    } else if (q.kind === 'multi') {
      const list = value ?? [];
      if (!Array.isArray(list) || list.some((v) => !allowed.includes(v))) {
        errors[q.id] = 'Contains an unknown option';
      } else clean[q.id] = [...new Set(list)];
    }
  }
  if (Object.keys(errors).length) throw new AnswerValidationError(errors);
  return clean;
}

function result(urgent, seeDoctor, selfCare) {
  if (urgent.length) return { level: 'urgent', reasonCodes: urgent };
  if (seeDoctor.length) return { level: 'see_doctor', reasonCodes: seeDoctor };
  return { level: 'self_care', reasonCodes: selfCare };
}

export function evaluateCramps(a) {
  const urgent = [];
  const seeDoctor = [];
  const flags = new Set(a.redFlags);

  if (flags.has('fainting')) urgent.push('fainting');
  if (flags.has('fever')) urgent.push('fever_with_pain');
  if (flags.has('sudden_severe_pain')) urgent.push('sudden_severe_pain');
  if (flags.has('soaking_hourly')) urgent.push('very_heavy_bleeding');
  if (flags.has('vomiting')) urgent.push('persistent_vomiting');
  if (flags.has('possible_pregnancy') && (a.painLevel >= 7 || flags.has('sudden_severe_pain'))) {
    urgent.push('pregnancy_with_severe_pain');
  }

  if (a.painLevel >= 7) seeDoctor.push('severe_pain');
  if (a.interferesWithDaily === 'yes') seeDoctor.push('disrupts_daily_life');
  if (a.reliefWithMedication === 'no') seeDoctor.push('no_relief');
  if (a.painOutsidePeriod === 'yes') seeDoctor.push('pain_outside_period');
  if (a.gettingWorse === 'yes') seeDoctor.push('worsening_pain');
  if (a.heavyBleeding === 'yes') seeDoctor.push('heavy_bleeding');
  if (flags.has('possible_pregnancy') && !urgent.includes('pregnancy_with_severe_pain')) {
    seeDoctor.push('possible_pregnancy');
  }

  return result(urgent, seeDoctor, ['typical_cramps']);
}

export function evaluateIrregular(a) {
  const urgent = [];
  const seeDoctor = [];
  const selfCare = [];
  const other = new Set(a.otherSymptoms);
  const pregnancyPossible = a.pregnancyPossible === 'yes' || a.pregnancyPossible === 'unsure';

  if (other.has('fainting')) urgent.push('fainting');
  if (other.has('soaking_hourly')) urgent.push('very_heavy_bleeding');
  if (other.has('severe_abdominal_pain')) {
    urgent.push(pregnancyPossible ? 'pregnancy_with_severe_pain' : 'severe_abdominal_pain');
  }

  if (a.periodHistory === 'never') {
    if (a.age >= 15) seeDoctor.push('no_period_by_15');
  } else {
    if (a.daysSinceLastPeriod > 90) seeDoctor.push('over_90_days');
    if (a.periodHistory === 'over_2_years') {
      if (a.usualCycle === 'under_21') seeDoctor.push('cycle_under_21');
      if (a.usualCycle === 'over_45') seeDoctor.push('cycle_over_45');
      if (a.usualCycle === 'varies') seeDoctor.push('unpredictable_after_2_years');
    }
  }
  if (pregnancyPossible && !urgent.includes('pregnancy_with_severe_pain')) {
    seeDoctor.push('possible_pregnancy');
  }
  if (other.has('excess_hair_acne')) seeDoctor.push('hormonal_signs');
  if (other.has('nipple_discharge')) seeDoctor.push('nipple_discharge');
  if (other.has('headache_vision')) seeDoctor.push('headache_vision');

  if (a.periodHistory === 'under_2_years') selfCare.push('early_years_irregularity');
  if (a.periodHistory === 'never') selfCare.push('not_started_yet');
  if (a.recentChanges?.length) selfCare.push('lifestyle_factors');
  if (!selfCare.length) selfCare.push('within_typical_range');

  return result(urgent, seeDoctor, selfCare);
}

export function evaluate(type, answers) {
  const clean = validateAnswers(type, answers);
  const outcome = type === 'cramps' ? evaluateCramps(clean) : evaluateIrregular(clean);
  if (!GUIDANCE_LEVELS.includes(outcome.level)) throw new Error('Rule produced an unknown level');
  return outcome;
}

/** Reason codes safe to persist (minimum necessary). */
export function storableReasonCodes(codes) {
  return codes.filter((code) => !SENSITIVE_REASON_CODES.has(code));
}
