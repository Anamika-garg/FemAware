import { addDays, parseISO, toISODate, todayISO } from '../../lib/dates';

// Health dates are stored as YYYY-MM-DD strings, so every date helper must
// return the same shape. date-fns addDays returns a Date object, which cannot
// be compared directly with the stored strings.
export const shiftISO = (iso, days) => toISODate(addDays(parseISO(iso), days));
export const daysAgoISO = (days) => shiftISO(todayISO(), -Math.abs(days));

export const SENIOR_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

export const SENIOR_LEVEL_LABELS = {
  none: 'None',
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
};

export const SLEEP_LABELS = {
  1: 'Very poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Restful',
};

export const MEMORY_LABELS = {
  1: 'Very foggy',
  2: 'Foggy',
  3: 'Fair',
  4: 'Clear',
  5: 'Very clear',
};

export const WELLBEING_LABELS = {
  1: 'Struggling',
  2: 'Low',
  3: 'Steady',
  4: 'Good',
  5: 'Bright',
};

export const ENERGY_LABELS = {
  1: 'Running on empty',
  2: 'Low',
  3: 'Steady',
  4: 'Good',
  5: 'Bright',
};

export const SENIOR_MOOD_OPTIONS = [
  'Calm',
  'Hopeful',
  'Anxious',
  'Irritable',
  'Low energy',
  'Overwhelmed',
];

export const FREQUENCY_LABELS = {
  hotFlashes: 'Hot flashes',
  nightSweats: 'Night sweats',
  jointStiffness: 'Joint stiffness',
  bladderUrgency: 'Bladder urgency',
  vaginalDryness: 'Vaginal dryness',
  sleep: 'Poor sleep',
  exhaustion: 'Daytime fatigue',
  memory: 'Memory fog',
  pelvic: 'Pelvic discomfort',
  bone: 'Bone discomfort',
};

export const createSeniorForm = (date = todayISO()) => ({
  date,
  sleepHours: '',
  sleepQuality: 3,
  nightSweats: 'none',
  daytimeExhaustion: 'none',
  hotFlashCount: 0,
  hotFlashSeverity: 'none',
  vaginalDryness: 'none',
  bladderUrgency: 'none',
  pelvicComfort: 'none',
  jointStiffness: 'none',
  boneDiscomfort: 'none',
  mobilityNotes: '',
  energyLevel: 3,
  emotionalWellbeing: 3,
  memoryClarity: 3,
  memoryNotes: '',
  mood: [],
  postmenopausalBleeding: false,
  notes: '',
});

export const formFromLog = (log) => {
  if (!log) return createSeniorForm();
  const details = log.senior || {};
  return {
    date: log.date,
    sleepHours: log.sleepHours ?? '',
    sleepQuality: details.sleepQuality ?? 3,
    nightSweats: details.nightSweats || 'none',
    daytimeExhaustion: details.daytimeExhaustion || 'none',
    hotFlashCount: details.hotFlashCount ?? 0,
    hotFlashSeverity: details.hotFlashSeverity || 'none',
    vaginalDryness: details.vaginalDryness || 'none',
    bladderUrgency: details.bladderUrgency || 'none',
    pelvicComfort: details.pelvicComfort || 'none',
    jointStiffness: details.jointStiffness || 'none',
    boneDiscomfort: details.boneDiscomfort || 'none',
    mobilityNotes: details.mobilityNotes || '',
    energyLevel: log.energyLevel ?? 3,
    emotionalWellbeing: details.emotionalWellbeing ?? 3,
    memoryClarity: details.memoryClarity ?? 3,
    memoryNotes: details.memoryNotes || '',
    mood: log.mood || [],
    postmenopausalBleeding: Boolean(details.postmenopausalBleeding),
    notes: log.notes || '',
  };
};

const severityFor = (level) => {
  if (level === 'severe') return 'severe';
  if (level === 'moderate') return 'moderate';
  return 'mild';
};

export const physicalFromSenior = (details) => {
  const physical = [];
  if (details.hotFlashCount > 0 || details.hotFlashSeverity !== 'none') {
    physical.push({
      name: 'Hot flashes',
      severity:
        details.hotFlashCount >= 3 || details.hotFlashSeverity === 'severe'
          ? 'severe'
          : details.hotFlashCount === 2 || details.hotFlashSeverity === 'moderate'
            ? 'moderate'
            : 'mild',
    });
  }

  const mapped = [
    ['Night sweats', details.nightSweats],
    ['Fatigue', details.daytimeExhaustion],
    ['Vaginal dryness', details.vaginalDryness],
    ['Bladder urgency', details.bladderUrgency],
    ['Pelvic discomfort', details.pelvicComfort],
    ['Joint stiffness', details.jointStiffness],
    ['Bone discomfort', details.boneDiscomfort],
  ];

  mapped.forEach(([name, level]) => {
    if (level && level !== 'none') physical.push({ name, severity: severityFor(level) });
  });

  if (details.memoryClarity !== null && details.memoryClarity <= 2) {
    physical.push({
      name: 'Brain fog',
      severity: details.memoryClarity === 1 ? 'severe' : 'moderate',
    });
  }

  return physical;
};

export const buildSeniorPayload = (form) => {
  const details = {
    sleepQuality: Number(form.sleepQuality) || null,
    nightSweats: form.nightSweats,
    daytimeExhaustion: form.daytimeExhaustion,
    hotFlashCount: Math.max(0, Math.min(30, Number(form.hotFlashCount) || 0)),
    hotFlashSeverity: form.hotFlashSeverity,
    vaginalDryness: form.vaginalDryness,
    bladderUrgency: form.bladderUrgency,
    pelvicComfort: form.pelvicComfort,
    jointStiffness: form.jointStiffness,
    boneDiscomfort: form.boneDiscomfort,
    memoryClarity: Number(form.memoryClarity) || null,
    emotionalWellbeing: Number(form.emotionalWellbeing) || null,
    postmenopausalBleeding: Boolean(form.postmenopausalBleeding),
    mobilityNotes: form.mobilityNotes.trim().slice(0, 500),
    memoryNotes: form.memoryNotes.trim().slice(0, 500),
  };

  return {
    date: form.date,
    physical: physicalFromSenior(details),
    mood: form.mood,
    flow: 'none',
    energyLevel: Number(form.energyLevel) || 3,
    sleepHours: form.sleepHours === '' ? null : Number(form.sleepHours),
    notes: form.notes.trim().slice(0, 1200),
    senior: details,
  };
};

export const isLevelLogged = (level) => Boolean(level && level !== 'none');

export const getSymptomFrequency = (logs) => {
  const counts = {
    hotFlashes: 0,
    nightSweats: 0,
    jointStiffness: 0,
    bladderUrgency: 0,
    vaginalDryness: 0,
    sleep: 0,
    exhaustion: 0,
    memory: 0,
    pelvic: 0,
    bone: 0,
  };

  logs.forEach((log) => {
    const details = log.senior || {};
    if (details.hotFlashCount > 0 || isLevelLogged(details.hotFlashSeverity)) counts.hotFlashes += 1;
    if (isLevelLogged(details.nightSweats)) counts.nightSweats += 1;
    if (isLevelLogged(details.jointStiffness)) counts.jointStiffness += 1;
    if (isLevelLogged(details.bladderUrgency)) counts.bladderUrgency += 1;
    if (isLevelLogged(details.vaginalDryness)) counts.vaginalDryness += 1;
    if (Number(details.sleepQuality) <= 2) counts.sleep += 1;
    if (isLevelLogged(details.daytimeExhaustion)) counts.exhaustion += 1;
    if (Number(details.memoryClarity) <= 2) counts.memory += 1;
    if (isLevelLogged(details.pelvicComfort)) counts.pelvic += 1;
    if (isLevelLogged(details.boneDiscomfort)) counts.bone += 1;
  });

  return Object.entries(counts)
    .map(([key, count]) => ({ key, name: FREQUENCY_LABELS[key], count }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
};

export const averageRating = (logs, field) => {
  const values = logs
    .map((log) => Number(log.senior?.[field]))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
};

export const sumHotFlashes = (logs) =>
  logs.reduce((sum, log) => sum + (Number(log.senior?.hotFlashCount) || 0), 0);

export const hotFlashDays = (logs) =>
  logs.filter(
    (log) => Number(log.senior?.hotFlashCount) > 0 || isLevelLogged(log.senior?.hotFlashSeverity)
  ).length;

export const logsInRange = (logs, startDate, endDate) =>
  logs.filter((log) => log.date >= startDate && log.date <= endDate);

export const lastNDays = (logs, days) => {
  const end = todayISO();
  return logsInRange(logs, shiftISO(end, -(days - 1)), end);
};

export const previousNDays = (logs, days) => {
  const end = shiftISO(todayISO(), -days);
  return logsInRange(logs, shiftISO(end, -(days - 1)), end);
};

export const countBleeding = (logs) =>
  logs.filter((log) => Boolean(log.senior?.postmenopausalBleeding)).length;

export const summaryLabel = (value, labels) => labels[value] || 'Not recorded';
