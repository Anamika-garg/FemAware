/**
 * Turns cycle and symptom history into plain-language, non-diagnostic
 * insights. Thresholds mirror the adolescent ranges in ACOG CO 651
 * (cycles 21–45 days, bleeding ≤7 days) and need clinician review.
 */
const DAY = 86_400_000;
const TYPICAL_MIN_CYCLE = 21;
const TYPICAL_MAX_CYCLE = 45;
const TYPICAL_MAX_PERIOD = 7;
const IRREGULAR_VARIATION = 9;

const toDay = (d) => Math.floor(new Date(d).getTime() / DAY);
const round1 = (n) => Math.round(n * 10) / 10;
const avg = (list) => (list.length ? round1(list.reduce((a, b) => a + b, 0) / list.length) : null);

export function computeCycleStats(cycles, today = new Date()) {
  const sorted = [...cycles].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const cycleLengths = [];
  for (let i = 1; i < sorted.length; i++) {
    cycleLengths.push(toDay(sorted[i].startDate) - toDay(sorted[i - 1].startDate));
  }
  const periodLengths = sorted
    .filter((c) => c.endDate)
    .map((c) => toDay(c.endDate) - toDay(c.startDate) + 1);

  const averageCycleLength = avg(cycleLengths);
  const variation = cycleLengths.length >= 2 ? Math.max(...cycleLengths) - Math.min(...cycleLengths) : null;
  const last = sorted.at(-1);
  const daysSinceLastPeriod = last ? toDay(today) - toDay(last.startDate) : null;

  let predictedNextStart = null;
  if (last && averageCycleLength) {
    predictedNextStart = new Date((toDay(last.startDate) + Math.round(averageCycleLength)) * DAY);
  }

  let regularity = 'not_enough_data';
  if (variation !== null) regularity = variation <= IRREGULAR_VARIATION ? 'regular' : 'irregular';

  return {
    periodsLogged: sorted.length,
    cycleLengths,
    periodLengths,
    averageCycleLength,
    shortestCycle: cycleLengths.length ? Math.min(...cycleLengths) : null,
    longestCycle: cycleLengths.length ? Math.max(...cycleLengths) : null,
    averagePeriodLength: avg(periodLengths),
    variation,
    regularity,
    daysSinceLastPeriod,
    lastPeriodStart: last ? last.startDate : null,
    predictedNextStart,
    history: sorted.slice(1).map((c, i) => ({
      startDate: c.startDate,
      cycleLength: cycleLengths[i],
    })),
  };
}

export function computeSymptomStats(logs) {
  const counts = {};
  const byMonth = {};
  for (const log of logs) {
    for (const s of log.symptoms) counts[s] = (counts[s] || 0) + 1;
    const month = new Date(log.date).toISOString().slice(0, 7);
    (byMonth[month] ||= []).push(log.severity);
  }
  const frequency = Object.entries(counts)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count);
  const severityTrend = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({ month, averageSeverity: avg(values), logs: values.length }));
  return {
    totalLogs: logs.length,
    frequency,
    severityTrend,
    severeLogs: logs.filter((l) => l.severity >= 4).length,
    averageSeverity: avg(logs.map((l) => l.severity)),
  };
}

/**
 * Observations that may be worth raising with a clinician.
 * Each has a stable code so the UI and summary can render it.
 */
export function computeFlags(cycle, symptoms) {
  const flags = [];
  const add = (code, message) => flags.push({ code, message });

  if (cycle.averageCycleLength !== null) {
    if (cycle.averageCycleLength < TYPICAL_MIN_CYCLE) {
      add('short_cycles', `Your average cycle (${cycle.averageCycleLength} days) is shorter than the typical teen range of 21–45 days.`);
    } else if (cycle.averageCycleLength > TYPICAL_MAX_CYCLE) {
      add('long_cycles', `Your average cycle (${cycle.averageCycleLength} days) is longer than the typical teen range of 21–45 days.`);
    }
  }
  if (cycle.averagePeriodLength !== null && cycle.averagePeriodLength > TYPICAL_MAX_PERIOD) {
    add('long_periods', `Your periods average ${cycle.averagePeriodLength} days. Bleeding for more than 7 days is worth mentioning to a doctor.`);
  }
  if (cycle.regularity === 'irregular') {
    add('variable_cycles', `Your cycle length varies by ${cycle.variation} days. Some variation is common in teens; keep tracking and share this with a doctor if it continues.`);
  }
  if (cycle.daysSinceLastPeriod !== null && cycle.daysSinceLastPeriod > 90) {
    add('over_90_days', `It has been ${cycle.daysSinceLastPeriod} days since your last logged period. Going 3 months without a period is worth checking.`);
  }
  if (symptoms.totalLogs >= 3 && symptoms.severeLogs / symptoms.totalLogs >= 0.5) {
    add('frequent_severe_symptoms', 'Half or more of your symptom logs are rated severe (4–5). Symptoms that strong are worth talking to a doctor about.');
  }
  if (symptoms.frequency.some((f) => f.symptom === 'heavy_flow' && f.count >= 3)) {
    add('recurring_heavy_flow', 'You have logged heavy flow several times. Heavy periods are worth discussing with a doctor.');
  }
  return flags;
}

export function buildInsights(cycles, logs, today = new Date()) {
  const cycle = computeCycleStats(cycles, today);
  const symptoms = computeSymptomStats(logs);
  return { cycle, symptoms, flags: computeFlags(cycle, symptoms), generatedAt: today };
}

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '—');
const label = (s) => s.replace(/_/g, ' ');

/** Plain-text summary a teen can download and bring to an appointment. */
export function renderSummary(insights, assessments = []) {
  const { cycle, symptoms, flags } = insights;
  const lines = [
    'FemAware Health Summary',
    '=======================',
    `Generated: ${fmtDate(insights.generatedAt)}`,
    '',
    'IMPORTANT: FemAware is an educational tool. This summary is not a diagnosis.',
    'It was created from what you logged in FemAware.',
    '',
    'CYCLE OVERVIEW',
    `- Periods logged: ${cycle.periodsLogged}`,
    `- Last period started: ${fmtDate(cycle.lastPeriodStart)}`,
    `- Average cycle length: ${cycle.averageCycleLength ?? '—'} days (range ${cycle.shortestCycle ?? '—'}–${cycle.longestCycle ?? '—'})`,
    `- Average period length: ${cycle.averagePeriodLength ?? '—'} days`,
    `- Cycle regularity: ${label(cycle.regularity)}`,
    `- Estimated next period: ${fmtDate(cycle.predictedNextStart)}`,
    '',
    'SYMPTOMS',
    `- Symptom logs: ${symptoms.totalLogs} (average severity ${symptoms.averageSeverity ?? '—'}/5)`,
    ...symptoms.frequency.slice(0, 6).map((f) => `- ${label(f.symptom)}: logged ${f.count} time(s)`),
    '',
    'THINGS TO DISCUSS WITH A DOCTOR',
    ...(flags.length ? flags.map((f) => `- ${f.message}`) : ['- No patterns flagged from the data logged so far.']),
    '',
    'RECENT GUIDED CHECKS',
    ...(assessments.length
      ? assessments.slice(0, 5).map((a) => `- ${fmtDate(a.createdAt)}: ${a.type} check -> ${label(a.result.level)}`)
      : ['- None']),
    '',
    'QUESTIONS I MIGHT ASK',
    '- Is my cycle length typical for my age?',
    '- What can I do to manage my symptoms?',
    '- Is there anything in my history you would like to check?',
  ];
  return lines.join('\n');
}
