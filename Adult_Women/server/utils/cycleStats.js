import { addDays, diffDays, todayISO } from './dates.js';

const round = (value) => Math.round(value * 10) / 10;

const stdDev = (values) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

export const regularityFromVariation = (variation) => {
  if (variation <= 2) return 'regular';
  if (variation <= 5) return 'somewhat irregular';
  return 'irregular';
};

/**
 * Derive cycle statistics, current phase and upcoming windows from raw period logs.
 * All dates are date-only strings (YYYY-MM-DD) to avoid timezone drift.
 */
export const computeCycleStats = (cycles = [], profile = {}, today = todayISO()) => {
  const ascending = [...cycles]
    .filter((cycle) => cycle?.startDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const validLengths = [];
  const history = ascending.map((cycle, index) => {
    const next = ascending[index + 1];
    const length = next ? diffDays(cycle.startDate, next.startDate) : null;
    if (length !== null && length >= 15 && length <= 90) validLengths.push(length);
    return {
      id: cycle._id,
      startDate: cycle.startDate,
      endDate: cycle.endDate || null,
      flow: cycle.flow,
      notes: cycle.notes || '',
      periodLength:
        cycle.endDate && cycle.endDate >= cycle.startDate
          ? diffDays(cycle.startDate, cycle.endDate) + 1
          : null,
      cycleLength: length,
    };
  });

  const periodLengths = history
    .map((cycle) => cycle.periodLength)
    .filter((length) => length !== null && length >= 1 && length <= 15);

  const fallbackCycle = Number(profile.averageCycleLength) || 28;
  const fallbackPeriod = Number(profile.averagePeriodLength) || 5;

  const averageCycleLength = validLengths.length
    ? Math.round(validLengths.reduce((sum, value) => sum + value, 0) / validLengths.length)
    : fallbackCycle;

  const variation = round(stdDev(validLengths));
  const regularity =
    validLengths.length >= 2 ? regularityFromVariation(variation) : 'not enough data';

  const averagePeriodLength = periodLengths.length
    ? round(periodLengths.reduce((sum, value) => sum + value, 0) / periodLengths.length)
    : fallbackPeriod;

  const lastPeriodStart = ascending.length
    ? ascending[ascending.length - 1].startDate
    : profile.lastPeriodStart || null;

  const currentCycleDay = lastPeriodStart ? diffDays(lastPeriodStart, today) + 1 : null;

  const referenceStart = lastPeriodStart || today;
  const nextPeriodStart = lastPeriodStart
    ? addDays(referenceStart, averageCycleLength)
    : addDays(referenceStart, averageCycleLength);
  const ovulationDate = addDays(nextPeriodStart, -14);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);

  const daysUntilNextPeriod = diffDays(today, nextPeriodStart);
  const daysLate = daysUntilNextPeriod < 0 ? Math.abs(daysUntilNextPeriod) : 0;

  let phase = 'unknown';
  if (lastPeriodStart && currentCycleDay !== null) {
    const inPeriod =
      currentCycleDay >= 1 &&
      currentCycleDay <= Math.max(1, Math.ceil(averagePeriodLength));
    if (today >= fertileStart && today <= fertileEnd) phase = 'ovulation';
    else if (inPeriod) phase = 'menstrual';
    else if (today < fertileStart) phase = 'follicular';
    else phase = 'luteal';
    if (currentCycleDay > averageCycleLength + 7) phase = 'late';
  }

  const phaseCopy = {
    menstrual: {
      label: 'Menstrual phase',
      tone: 'Rest and replenish',
      description:
        'Your period is here or just finishing. Iron-rich foods, warmth and gentle movement can help you feel steadier.',
    },
    follicular: {
      label: 'Follicular phase',
      tone: 'Energy is rebuilding',
      description:
        'Estrogen is rising and energy often follows. It can be a good window for strength training and bigger projects.',
    },
    ovulation: {
      label: 'Ovulation window',
      tone: 'Peak fertility window',
      description:
        'An egg is typically released around this time. Fertility is at its highest if you are trying to conceive.',
    },
    luteal: {
      label: 'Luteal phase',
      tone: 'Slow down and tune in',
      description:
        'Progesterone rises and PMS symptoms can appear. Prioritise sleep, steady meals and stress recovery.',
    },
    late: {
      label: 'Cycle running long',
      tone: 'Give yourself some grace',
      description:
        'Your period is later than predicted. Stress, travel, illness and hormonal shifts can all delay ovulation.',
    },
    unknown: {
      label: 'Getting to know your cycle',
      tone: 'Start with one log',
      description:
        'Log your next period to unlock phase insights, predictions and personalised patterns.',
    },
  }[phase];

  const alerts = [];
  if (daysLate >= 7) {
    alerts.push({
      level: 'attention',
      title: `Your period is ${daysLate} days later than predicted`,
      message:
        'One late cycle is common. If your period is consistently late, or you could be pregnant, consider a home test and a conversation with a clinician.',
    });
  }
  if (regularity === 'irregular') {
    alerts.push({
      level: 'attention',
      title: 'Your recent cycles vary noticeably',
      message:
        'A variation above 5 days can be linked to stress, PCOS, thyroid changes and other factors. Tracking a few more cycles is useful before a clinician visit.',
    });
  }
  if (averagePeriodLength >= 8) {
    alerts.push({
      level: 'attention',
      title: 'Longer-than-typical bleeding pattern',
      message:
        'Bleeding that regularly lasts 8 days or more, or soaks through protection hourly, is worth discussing with a gynecologist.',
    });
  }

  return {
    hasData: ascending.length > 0,
    cycleCount: ascending.length,
    averageCycleLength,
    averagePeriodLength,
    variation,
    regularity,
    lastPeriodStart,
    currentCycleDay,
    phase: phaseCopy,
    phaseKey: phase,
    nextPeriodStart,
    daysUntilNextPeriod,
    daysLate,
    ovulationDate,
    fertileStart,
    fertileEnd,
    history,
    alerts,
  };
};

export const buildCycleSeries = (cycles = [], limit = 6) => {
  const ascending = [...cycles]
    .filter((cycle) => cycle?.startDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return ascending
    .map((cycle, index) => {
      const next = ascending[index + 1];
      if (!next) return null;
      const length = diffDays(cycle.startDate, next.startDate);
      if (length < 15 || length > 90) return null;
      return {
        startDate: cycle.startDate,
        label: new Date(`${cycle.startDate}T00:00:00Z`).toLocaleDateString('en-US', {
          month: 'short',
          timeZone: 'UTC',
        }),
        cycleLength: length,
        periodLength:
          cycle.endDate && cycle.endDate >= cycle.startDate
            ? diffDays(cycle.startDate, cycle.endDate) + 1
            : null,
        flow: cycle.flow,
      };
    })
    .filter(Boolean)
    .slice(-limit);
};
