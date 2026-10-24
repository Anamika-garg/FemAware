import { describe, expect, it } from 'vitest';
import { AnswerValidationError, evaluate, storableReasonCodes } from '../teen/guidance/rules.js';

const calmCramps = {
  painLevel: 3,
  interferesWithDaily: 'no',
  reliefWithMedication: 'yes',
  painOutsidePeriod: 'no',
  gettingWorse: 'no',
  heavyBleeding: 'no',
  redFlags: [],
};

const typicalIrregular = {
  age: 14,
  periodHistory: 'under_2_years',
  daysSinceLastPeriod: 40,
  usualCycle: 'varies',
  pregnancyPossible: 'no',
  recentChanges: [],
  otherSymptoms: [],
};

describe('cramps assessment', () => {
  it('returns self_care for mild, manageable cramps', () => {
    expect(evaluate('cramps', calmCramps)).toEqual({ level: 'self_care', reasonCodes: ['typical_cramps'] });
  });

  it.each([
    ['fainting', 'fainting'],
    ['fever', 'fever_with_pain'],
    ['sudden_severe_pain', 'sudden_severe_pain'],
    ['soaking_hourly', 'very_heavy_bleeding'],
    ['vomiting', 'persistent_vomiting'],
  ])('escalates the red flag "%s" to urgent', (flag, code) => {
    const out = evaluate('cramps', { ...calmCramps, redFlags: [flag] });
    expect(out.level).toBe('urgent');
    expect(out.reasonCodes).toContain(code);
  });

  it('treats possible pregnancy with severe pain as urgent', () => {
    const out = evaluate('cramps', { ...calmCramps, painLevel: 8, redFlags: ['possible_pregnancy'] });
    expect(out).toEqual({ level: 'urgent', reasonCodes: ['pregnancy_with_severe_pain'] });
  });

  it('treats possible pregnancy with mild pain as see_doctor, not urgent', () => {
    const out = evaluate('cramps', { ...calmCramps, redFlags: ['possible_pregnancy'] });
    expect(out.level).toBe('see_doctor');
  });

  it('urgent wins over see_doctor reasons', () => {
    const out = evaluate('cramps', { ...calmCramps, painLevel: 9, interferesWithDaily: 'yes', redFlags: ['fainting'] });
    expect(out.level).toBe('urgent');
    expect(out.reasonCodes).toEqual(['fainting']);
  });

  it.each([
    [{ painLevel: 7 }, 'severe_pain'],
    [{ interferesWithDaily: 'yes' }, 'disrupts_daily_life'],
    [{ reliefWithMedication: 'no' }, 'no_relief'],
    [{ painOutsidePeriod: 'yes' }, 'pain_outside_period'],
    [{ gettingWorse: 'yes' }, 'worsening_pain'],
    [{ heavyBleeding: 'yes' }, 'heavy_bleeding'],
  ])('recommends seeing a doctor for %o', (change, code) => {
    const out = evaluate('cramps', { ...calmCramps, ...change });
    expect(out).toEqual({ level: 'see_doctor', reasonCodes: [code] });
  });

  it('pain level 6 alone stays self_care (boundary)', () => {
    expect(evaluate('cramps', { ...calmCramps, painLevel: 6 }).level).toBe('self_care');
  });
});

describe('irregular period assessment', () => {
  it('reassures in the first two years after the first period', () => {
    expect(evaluate('irregular', typicalIrregular)).toEqual({ level: 'self_care', reasonCodes: ['early_years_irregularity'] });
  });

  it('flags severe abdominal pain as urgent', () => {
    const out = evaluate('irregular', { ...typicalIrregular, otherSymptoms: ['severe_abdominal_pain'] });
    expect(out).toEqual({ level: 'urgent', reasonCodes: ['severe_abdominal_pain'] });
  });

  it('flags severe pain with possible pregnancy as urgent', () => {
    const out = evaluate('irregular', { ...typicalIrregular, pregnancyPossible: 'unsure', otherSymptoms: ['severe_abdominal_pain'] });
    expect(out).toEqual({ level: 'urgent', reasonCodes: ['pregnancy_with_severe_pain'] });
  });

  it('recommends a doctor when there is no period by 15', () => {
    const out = evaluate('irregular', { ...typicalIrregular, age: 15, periodHistory: 'never', daysSinceLastPeriod: 0, usualCycle: 'na' });
    expect(out.level).toBe('see_doctor');
    expect(out.reasonCodes).toContain('no_period_by_15');
  });

  it('does not flag no period at 14', () => {
    const out = evaluate('irregular', { ...typicalIrregular, age: 14, periodHistory: 'never', daysSinceLastPeriod: 0, usualCycle: 'na' });
    expect(out.level).toBe('self_care');
  });

  it('recommends a doctor after more than 90 days without a period', () => {
    expect(evaluate('irregular', { ...typicalIrregular, daysSinceLastPeriod: 91 }).reasonCodes).toContain('over_90_days');
    expect(evaluate('irregular', { ...typicalIrregular, daysSinceLastPeriod: 90 }).level).toBe('self_care');
  });

  it('flags cycles outside 21–45 days only after two years', () => {
    const later = { ...typicalIrregular, periodHistory: 'over_2_years' };
    expect(evaluate('irregular', { ...later, usualCycle: 'over_45' }).reasonCodes).toContain('cycle_over_45');
    expect(evaluate('irregular', { ...later, usualCycle: 'under_21' }).reasonCodes).toContain('cycle_under_21');
    expect(evaluate('irregular', { ...later, usualCycle: '21_to_45' }).level).toBe('self_care');
    expect(evaluate('irregular', { ...typicalIrregular, usualCycle: 'over_45' }).level).toBe('self_care');
  });
});

describe('answer validation', () => {
  it('rejects unknown assessment types', () => {
    expect(() => evaluate('migraine', {})).toThrow(AnswerValidationError);
  });

  it('rejects out-of-range and unknown option values', () => {
    try {
      evaluate('cramps', { ...calmCramps, painLevel: 11, heavyBleeding: 'maybe', redFlags: ['alien'] });
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(AnswerValidationError);
      expect(Object.keys(err.errors).sort()).toEqual(['heavyBleeding', 'painLevel', 'redFlags']);
    }
  });

  it('rejects missing answers', () => {
    expect(() => evaluate('irregular', { age: 14 })).toThrow(AnswerValidationError);
  });
});

describe('minimum necessary storage', () => {
  it('removes pregnancy-related codes before persisting', () => {
    expect(storableReasonCodes(['possible_pregnancy', 'severe_pain', 'pregnancy_with_severe_pain'])).toEqual(['severe_pain']);
  });
});
