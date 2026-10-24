import { computeCycleStats } from './cycleStats.js';

const SEVERITY_WEIGHT = { mild: 1, moderate: 2, severe: 3 };

const topEntries = (map, limit = 6) =>
  [...map.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, value]) => ({ name, ...value }));

export const buildReportSnapshot = ({
  user,
  cycles,
  symptoms,
  rangeStart,
  rangeEnd,
}) => {
  const stats = computeCycleStats(cycles, user.cycleProfile);
  const cyclesInRange = stats.history
    .filter((cycle) => cycle.startDate >= rangeStart && cycle.startDate <= rangeEnd)
    .slice()
    .reverse();

  const physicalMap = new Map();
  const moodMap = new Map();
  const flowMap = new Map();

  symptoms.forEach((log) => {
    (log.physical || []).forEach((item) => {
      const existing = physicalMap.get(item.name) || {
        count: 0,
        severity: 'mild',
        severityScore: 0,
      };
      existing.count += 1;
      existing.severityScore += SEVERITY_WEIGHT[item.severity] || 1;
      if ((SEVERITY_WEIGHT[item.severity] || 1) > (SEVERITY_WEIGHT[existing.severity] || 1)) {
        existing.severity = item.severity;
      }
      physicalMap.set(item.name, existing);
    });
    (log.mood || []).forEach((mood) => {
      moodMap.set(mood, { count: (moodMap.get(mood)?.count || 0) + 1, severity: null });
    });
    if (log.flow && log.flow !== 'none') {
      flowMap.set(log.flow, { count: (flowMap.get(log.flow)?.count || 0) + 1, severity: null });
    }
  });

  const topPhysical = topEntries(physicalMap).map((item) => ({
    name: item.name,
    count: item.count,
    averageSeverity: Math.round((item.severityScore / item.count) * 10) / 10,
    worstSeverity: item.severity,
  }));
  const topMood = topEntries(moodMap);
  const flowDistribution = topEntries(flowMap);

  const severeSymptoms = topPhysical.filter((item) => item.worstSeverity === 'severe');
  const heavyFlowCount = cyclesInRange.filter((cycle) => cycle.flow === 'heavy').length;

  const discussionPoints = [];
  if (stats.regularity === 'irregular') {
    discussionPoints.push(
      `My recent cycle lengths vary by about ${Math.round(stats.variation)} days. Could something else be contributing?`
    );
  }
  if (stats.daysLate >= 7) {
    discussionPoints.push(
      `My most recent period is ${stats.daysLate} days later than predicted. What should I check first?`
    );
  }
  if (stats.averagePeriodLength >= 7) {
    discussionPoints.push(
      'My periods often last longer than a week. Should I be checked for anemia or other causes?'
    );
  }
  if (severeSymptoms.length) {
    discussionPoints.push(
      `I regularly rate ${severeSymptoms
        .slice(0, 2)
        .map((item) => item.name.toLowerCase())
        .join(' and ')} as severe. What options could help?`
    );
  }
  if (heavyFlowCount >= 2) {
    discussionPoints.push(
      'I have logged heavy flow more than once in this period. Could this affect my iron levels?'
    );
  }
  if (!discussionPoints.length) {
    discussionPoints.push('Are there any patterns in my logs that I should pay closer attention to?');
  }

  return {
    generatedAt: new Date().toISOString(),
    rangeStart,
    rangeEnd,
    patient: {
      name: user.name,
      age: user.age || null,
      lifeStages: user.lifeStages,
      goals: user.goals,
    },
    summary: {
      averageCycleLength: stats.averageCycleLength,
      averagePeriodLength: stats.averagePeriodLength,
      variation: stats.variation,
      regularity: stats.regularity,
      cyclesLogged: stats.cycleCount,
      cyclesInRange: cyclesInRange.length,
      symptomsLogged: symptoms.length,
      lastPeriodStart: stats.lastPeriodStart,
    },
    phase: stats.phase,
    cycles: cyclesInRange,
    flowDistribution,
    topPhysical,
    topMood,
    flags: {
      irregularCycles: stats.regularity === 'irregular',
      longCycles: stats.averageCycleLength > 35,
      shortCycles: stats.averageCycleLength < 21,
      prolongedBleeding: stats.averagePeriodLength >= 7,
      heavyFlowReports: heavyFlowCount,
      severeSymptoms: severeSymptoms.map((item) => item.name),
    },
    discussionPoints,
    disclaimer:
      'This summary is self-reported information for discussion with a qualified clinician. It is not a diagnosis or a substitute for medical advice.',
  };
};
