import { computeCycleStats } from './cycleStats.js';

const SEVERITY_WEIGHT = { mild: 1, moderate: 2, severe: 3 };

const round1 = (value) => Math.round(value * 10) / 10;

const average = (values) =>
  values.length ? round1(values.reduce((sum, value) => sum + value, 0) / values.length) : null;

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
  concerns = [],
  medications = [],
  visitDate = null,
  careContext = null,
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

  const seniorLogs = symptoms.filter((log) => log.senior);
  const isSenior =
    careContext === 'senior' || user.lifeStage === 'senior' || seniorLogs.length > 0;

  const seniorLevelDays = (field) =>
    seniorLogs.filter((log) => log.senior?.[field] && log.senior[field] !== 'none').length;

  const seniorSummary = seniorLogs.length
    ? {
        checkIns: seniorLogs.length,
        hotFlashDays: seniorLogs.filter(
          (log) => log.senior.hotFlashCount > 0 || log.senior.hotFlashSeverity !== 'none'
        ).length,
        totalHotFlashes: seniorLogs.reduce((sum, log) => sum + (log.senior.hotFlashCount || 0), 0),
        nightSweatDays: seniorLevelDays('nightSweats'),
        daytimeExhaustionDays: seniorLevelDays('daytimeExhaustion'),
        vaginalDrynessDays: seniorLevelDays('vaginalDryness'),
        bladderUrgencyDays: seniorLevelDays('bladderUrgency'),
        pelvicDiscomfortDays: seniorLevelDays('pelvicComfort'),
        jointStiffnessDays: seniorLevelDays('jointStiffness'),
        boneDiscomfortDays: seniorLevelDays('boneDiscomfort'),
        bleedingReports: seniorLogs.filter((log) => log.senior.postmenopausalBleeding).length,
        averageSleepQuality: average(
          seniorLogs.map((log) => log.senior.sleepQuality).filter((value) => Number.isFinite(value))
        ),
        averageMemoryClarity: average(
          seniorLogs.map((log) => log.senior.memoryClarity).filter((value) => Number.isFinite(value))
        ),
        averageWellbeing: average(
          seniorLogs
            .map((log) => log.senior.emotionalWellbeing)
            .filter((value) => Number.isFinite(value))
        ),
        recent: seniorLogs.slice(-10).map((log) => ({
          date: log.date,
          hotFlashCount: log.senior.hotFlashCount || 0,
          hotFlashSeverity: log.senior.hotFlashSeverity || 'none',
          nightSweats: log.senior.nightSweats || 'none',
          sleepQuality: log.senior.sleepQuality ?? null,
          jointStiffness: log.senior.jointStiffness || 'none',
          bladderUrgency: log.senior.bladderUrgency || 'none',
          postmenopausalBleeding: Boolean(log.senior.postmenopausalBleeding),
        })),
      }
    : null;

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

  if (seniorSummary) {
    if (seniorSummary.bleedingReports > 0) {
      discussionPoints.unshift(
        'I noticed vaginal bleeding after menopause. I would like this checked promptly, even though it may have a benign cause.'
      );
    }
    if (seniorSummary.hotFlashDays >= 5) {
      discussionPoints.push(
        `I recorded hot flashes on ${seniorSummary.hotFlashDays} days in this period. Are there treatments that fit my health history?`
      );
    }
    if (seniorSummary.averageSleepQuality !== null && seniorSummary.averageSleepQuality < 3) {
      discussionPoints.push(
        `My sleep quality averaged ${seniorSummary.averageSleepQuality} out of 5. Could night sweats or other symptoms be affecting it?`
      );
    }
    if (seniorSummary.jointStiffnessDays >= 5) {
      discussionPoints.push(
        'Joint stiffness has been showing up often. Should we review arthritis, activity, or bone health?'
      );
    }
    if (seniorSummary.bladderUrgencyDays >= 5) {
      discussionPoints.push(
        'Bladder urgency has been more noticeable. What pelvic floor or urinary health options should I consider?'
      );
    }
  }

  if (!discussionPoints.length) {
    discussionPoints.push(
      isSenior
        ? 'What preventive checks and screenings are due for me this year?'
        : 'Are there any patterns in my logs that I should pay closer attention to?'
    );
  }

  const appointment =
    concerns.length || medications.length || visitDate
      ? { visitDate, concerns, medications }
      : null;

  return {
    generatedAt: new Date().toISOString(),
    rangeStart,
    rangeEnd,
    careContext: isSenior ? 'senior' : 'adult',
    patient: {
      name: user.name,
      age: user.age || null,
      lifeStage: user.lifeStage || null,
      lifeStages: user.lifeStages,
      goals: user.goals,
    },
    appointment,
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
    seniorSummary,
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
      postmenopausalBleeding: Boolean(seniorSummary?.bleedingReports),
    },
    discussionPoints,
    disclaimer:
      'This summary is self-reported information for discussion with a qualified clinician. It is not a diagnosis or a substitute for medical advice.',
  };
};
