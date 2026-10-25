import { CycleLog } from '../models/CycleLog.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { TeenCycleEntry, TeenSymptomLog } from '../teen/models/index.js';
import { buildInsights } from '../teen/services/insights.js';
import { computeCycleStats } from '../utils/cycleStats.js';
import { todayISO } from '../utils/dates.js';

const clean = (value, max = 220) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const label = (value) => clean(value, 80).replace(/_/g, ' ');

const firstName = (name) => clean(name, 80).split(' ')[0] || 'there';

const formatDate = (value) => {
  if (!value) return 'not recorded';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'not recorded';
  return date.toISOString().slice(0, 10);
};

const average = (values) => {
  const numbers = values.filter((value) => Number.isFinite(value));
  if (!numbers.length) return null;
  return Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 10) / 10;
};

const countBy = (items) => {
  const counts = new Map();
  items.filter(Boolean).forEach((item) => counts.set(item, (counts.get(item) || 0) + 1));
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

const profileBlock = (user, module) => {
  const lines = [
    'PROFILE',
    `- First name: ${firstName(user.name)}`,
    `- Age: ${Number.isFinite(user.age) ? user.age : 'not recorded'}`,
    `- FemAware space: ${module}`,
    `- Focus areas: ${user.focusAreas?.length ? user.focusAreas.join(', ') : 'not recorded'}`,
    `- Goals: ${user.goals?.length ? user.goals.join(', ') : 'not recorded'}`,
  ];

  if (module !== 'teen' && user.clinicianQuestions?.length) {
    lines.push(
      `- Questions they saved for a clinician: ${user.clinicianQuestions
        .slice(0, 4)
        .map((question) => `"${clean(question, 160)}"`)
        .join('; ')}`
    );
  }

  return lines.join('\n');
};

const teenContext = async (user) => {
  const [cycles, logs] = await Promise.all([
    TeenCycleEntry.find({ owner: user._id }).sort({ startDate: -1 }).limit(12).lean(),
    TeenSymptomLog.find({ owner: user._id }).sort({ date: -1 }).limit(30).lean(),
  ]);

  const insights = buildInsights(cycles, logs);
  const cycle = insights.cycle;
  const symptoms = insights.symptoms;
  const lines = ['CYCLE AND SYMPTOMS (from their teen space)'];

  if (!cycles.length && !logs.length) {
    lines.push('- No periods or symptoms have been logged yet. Do not invent data.');
    return lines.join('\n');
  }

  lines.push(
    `- Periods logged: ${cycle.periodsLogged}`,
    `- Last period started: ${formatDate(cycle.lastPeriodStart)}`,
    `- Average cycle length: ${cycle.averageCycleLength ?? 'not enough data'} days`,
    `- Average period length: ${cycle.averagePeriodLength ?? 'not enough data'} days`,
    `- Cycle regularity: ${label(cycle.regularity)}`,
    `- Estimated next period: ${formatDate(cycle.predictedNextStart)}`,
    `- Symptom logs: ${symptoms.totalLogs}; average severity ${symptoms.averageSeverity ?? '—'} out of 5`,
    `- Most logged symptoms: ${
      symptoms.frequency
        .slice(0, 5)
        .map((item) => `${label(item.symptom)} (${item.count})`)
        .join(', ') || 'none recorded'
    }`
  );

  if (insights.flags.length) {
    lines.push(`- Patterns worth mentioning to a clinician: ${insights.flags.map((flag) => flag.message).join(' ')}`);
  }

  const notes = logs.map((log) => clean(log.notes, 180)).filter(Boolean).slice(0, 2);
  if (notes.length) lines.push(`- Recent notes: ${notes.map((note) => `"${note}"`).join('; ')}`);

  return lines.join('\n');
};

const adultContext = async (user) => {
  const [cycles, logs] = await Promise.all([
    CycleLog.find({ user: user._id }).sort({ startDate: -1 }).limit(12).lean(),
    SymptomLog.find({ user: user._id }).sort({ date: -1 }).limit(30).lean(),
  ]);

  const stats = computeCycleStats(cycles, user.cycleProfile || {}, todayISO());
  const lines = ['CYCLE AND SYMPTOMS (from their adult space)'];

  if (!cycles.length && !logs.length) {
    lines.push('- No periods or symptoms have been logged yet. Do not invent data.');
    return lines.join('\n');
  }

  lines.push(
    `- Periods logged: ${stats.cycleCount}`,
    `- Last period started: ${stats.lastPeriodStart || 'not recorded'}`,
    `- Current cycle day: ${stats.currentCycleDay ?? 'not recorded'}`,
    `- Average cycle length: ${stats.averageCycleLength} days`,
    `- Average period length: ${stats.averagePeriodLength} days`,
    `- Cycle variation: ${stats.variation} days (${stats.regularity})`,
    `- Estimated phase: ${stats.phase.label}`,
    `- Estimated next period: ${stats.nextPeriodStart} (${stats.daysUntilNextPeriod} days)`,
    `- Days late (if any): ${stats.daysLate}`
  );

  const physical = countBy(logs.flatMap((log) => (log.physical || []).map((item) => item.name)));
  const mood = countBy(logs.flatMap((log) => log.mood || []));
  const avgEnergy = average(logs.map((log) => log.energyLevel));
  const avgSleep = average(logs.map((log) => log.sleepHours));

  lines.push(
    `- Most logged physical symptoms: ${
      physical.slice(0, 6).map((item) => `${label(item.name)} (${item.count})`).join(', ') || 'none recorded'
    }`,
    `- Most logged moods: ${
      mood.slice(0, 4).map((item) => `${label(item.name)} (${item.count})`).join(', ') || 'none recorded'
    }`,
    `- Average energy: ${avgEnergy ?? 'not recorded'} out of 5`,
    `- Average sleep: ${avgSleep ?? 'not recorded'} hours`
  );

  if (stats.alerts.length) {
    lines.push(`- Patterns flagged by FemAware: ${stats.alerts.map((alert) => alert.message).join(' ')}`);
  }

  const notes = logs.map((log) => clean(log.notes, 180)).filter(Boolean).slice(0, 2);
  if (notes.length) lines.push(`- Recent notes: ${notes.map((note) => `"${note}"`).join('; ')}`);

  return lines.join('\n');
};

const seniorContext = async (user) => {
  const logs = await SymptomLog.find({ user: user._id }).sort({ date: -1 }).limit(30).lean();
  const seniorLogs = logs.filter((log) => log.senior);
  const lines = ['SENIOR CHECK-INS (from their care space)'];

  if (!seniorLogs.length) {
    lines.push('- No senior check-ins have been logged yet. Do not invent data.');
    return lines.join('\n');
  }

  const latest = seniorLogs[0];
  const details = latest.senior || {};
  const hotFlashDays = seniorLogs.filter(
    (log) => log.senior?.hotFlashCount > 0 || log.senior?.hotFlashSeverity !== 'none'
  ).length;
  const totalHotFlashes = seniorLogs.reduce((sum, log) => sum + (log.senior?.hotFlashCount || 0), 0);
  const nightSweatDays = seniorLogs.filter(
    (log) => log.senior?.nightSweats && log.senior.nightSweats !== 'none'
  ).length;
  const jointDays = seniorLogs.filter(
    (log) => log.senior?.jointStiffness && log.senior.jointStiffness !== 'none'
  ).length;
  const bleedingReports = seniorLogs.filter((log) => log.senior?.postmenopausalBleeding).length;
  const avgSleep = average(seniorLogs.map((log) => log.senior?.sleepQuality));
  const avgWellbeing = average(seniorLogs.map((log) => log.senior?.emotionalWellbeing));
  const avgMemory = average(seniorLogs.map((log) => log.senior?.memoryClarity));
  const physical = countBy(logs.flatMap((log) => (log.physical || []).map((item) => item.name)));

  lines.push(
    `- Check-ins in this window: ${seniorLogs.length}`,
    `- Latest check-in: ${formatDate(latest.date)}`,
    `- Hot flash days: ${hotFlashDays}; total hot flashes: ${totalHotFlashes}`,
    `- Night sweat days: ${nightSweatDays}`,
    `- Joint stiffness days: ${jointDays}`,
    `- Bleeding after menopause reported: ${bleedingReports ? 'yes' : 'no'}`,
    `- Average sleep quality: ${avgSleep ?? 'not recorded'} out of 5`,
    `- Average emotional wellbeing: ${avgWellbeing ?? 'not recorded'} out of 5`,
    `- Average memory clarity: ${avgMemory ?? 'not recorded'} out of 5`,
    `- Most logged physical symptoms: ${
      physical.slice(0, 6).map((item) => `${label(item.name)} (${item.count})`).join(', ') || 'none recorded'
    }`,
    `- Latest check-in details: sleep ${details.sleepQuality ?? 'not recorded'}/5, hot flashes ${details.hotFlashCount ?? 0}, night sweats ${label(details.nightSweats || 'none')}, joint stiffness ${label(details.jointStiffness || 'none')}, bladder urgency ${label(details.bladderUrgency || 'none')}, vaginal dryness ${label(details.vaginalDryness || 'none')}`
  );

  const notes = logs
    .flatMap((log) => [log.notes, log.senior?.mobilityNotes, log.senior?.memoryNotes])
    .map((note) => clean(note, 180))
    .filter(Boolean)
    .slice(0, 3);
  if (notes.length) lines.push(`- Recent notes: ${notes.map((note) => `"${note}"`).join('; ')}`);

  return lines.join('\n');
};

/**
 * Build a compact, non-identifying context block from the person's own logs.
 * The prompt treats this as data, never as instructions. If a query fails we
 * still return the profile so the chat remains usable.
 */
export const buildHealthContext = async (user, module) => {
  const header = [
    profileBlock(user, module),
    `- Today’s date: ${todayISO()}`,
    '- This context comes from the person’s own FemAware records. If something is not listed, say you do not have it. Do not invent dates, symptoms, results or diagnoses.',
  ].join('\n');

  try {
    const details =
      module === 'teen'
        ? await teenContext(user)
        : module === 'senior'
          ? await seniorContext(user)
          : await adultContext(user);

    return `${header}\n\n${details}`;
  } catch (error) {
    console.error('Could not build chat health context:', error?.message || error);
    return `${header}\n\n- Their detailed logs could not be loaded for this message. Ask them what they would like to focus on, and do not invent data.`;
  }
};
