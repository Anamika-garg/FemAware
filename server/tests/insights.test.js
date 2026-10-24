import { describe, expect, it } from 'vitest';
import { buildInsights, computeCycleStats, renderSummary } from '../teen/services/insights.js';

const d = (s) => new Date(`${s}T00:00:00Z`);
const today = d('2026-10-24');

describe('computeCycleStats', () => {
  it('computes lengths, averages, regularity and prediction', () => {
    const stats = computeCycleStats(
      [
        { startDate: d('2026-07-01'), endDate: d('2026-07-05') },
        { startDate: d('2026-07-29'), endDate: d('2026-08-02') },
        { startDate: d('2026-08-28'), endDate: d('2026-09-03') },
      ],
      today,
    );
    expect(stats.cycleLengths).toEqual([28, 30]);
    expect(stats.periodLengths).toEqual([5, 5, 7]);
    expect(stats.averageCycleLength).toBe(29);
    expect(stats.averagePeriodLength).toBe(5.7);
    expect(stats.regularity).toBe('regular');
    expect(stats.predictedNextStart.toISOString().slice(0, 10)).toBe('2026-09-26');
    expect(stats.daysSinceLastPeriod).toBe(57);
  });

  it('handles empty and single-entry histories', () => {
    expect(computeCycleStats([], today)).toMatchObject({ periodsLogged: 0, averageCycleLength: null, regularity: 'not_enough_data' });
    expect(computeCycleStats([{ startDate: d('2026-10-01') }], today)).toMatchObject({ periodsLogged: 1, predictedNextStart: null });
  });
});

describe('buildInsights flags', () => {
  it('flags long, variable cycles, long periods and 90+ days without a period', () => {
    const { flags } = buildInsights(
      [
        { startDate: d('2026-01-01'), endDate: d('2026-01-09') },
        { startDate: d('2026-02-25'), endDate: d('2026-03-05') },
        { startDate: d('2026-04-10'), endDate: d('2026-04-18') },
        { startDate: d('2026-06-30'), endDate: d('2026-07-02') },
      ],
      [],
      today,
    );
    expect(flags.map((f) => f.code).sort()).toEqual(['long_cycles', 'long_periods', 'over_90_days', 'variable_cycles']);
  });

  it('flags frequent severe symptoms and recurring heavy flow', () => {
    const logs = [1, 2, 3].map((i) => ({ date: d(`2026-10-0${i}`), symptoms: ['heavy_flow', 'cramps'], severity: 5 }));
    const { flags, symptoms } = buildInsights([], logs, today);
    expect(flags.map((f) => f.code).sort()).toEqual(['frequent_severe_symptoms', 'recurring_heavy_flow']);
    expect(symptoms.frequency[0]).toEqual({ symptom: 'heavy_flow', count: 3 });
    expect(symptoms.severityTrend).toEqual([{ month: '2026-10', averageSeverity: 5, logs: 3 }]);
  });

  it('raises no flags for a typical history', () => {
    const { flags } = buildInsights(
      [
        { startDate: d('2026-08-01'), endDate: d('2026-08-05') },
        { startDate: d('2026-08-30'), endDate: d('2026-09-03') },
        { startDate: d('2026-09-29'), endDate: d('2026-10-03') },
      ],
      [{ date: d('2026-09-29'), symptoms: ['cramps'], severity: 2 }],
      today,
    );
    expect(flags).toEqual([]);
  });
});

describe('renderSummary', () => {
  it('includes the disclaimer, data note and flags', () => {
    const insights = buildInsights([], [], today);
    insights.flags.push({ code: 'x', message: 'Test flag message' });
    const text = renderSummary(insights, [{ createdAt: today, type: 'cramps', result: { level: 'see_doctor' } }]);
    expect(text).toContain('not a diagnosis');
    expect(text).toContain('what you logged in FemAware');
    expect(text).toContain('Test flag message');
    expect(text).toContain('cramps check -> see doctor');
  });
});
