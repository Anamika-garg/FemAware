import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { CycleLog } from '../models/CycleLog.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { HealthReport } from '../models/HealthReport.js';
import { addDays, todayISO } from '../utils/dates.js';
import { buildReportSnapshot } from '../utils/reportBuilder.js';

const DEMO_EMAIL = 'demo@cyclesense.app';

const cycleBlueprint = [
  { offset: 0, startOffset: -218, duration: 5, flow: 'medium' },
  { offset: 1, startOffset: -188, duration: 4, flow: 'light' },
  { offset: 2, startOffset: -160, duration: 6, flow: 'heavy' },
  { offset: 3, startOffset: -127, duration: 5, flow: 'medium' },
  { offset: 4, startOffset: -98, duration: 4, flow: 'medium' },
  { offset: 5, startOffset: -71, duration: 5, flow: 'heavy' },
  { offset: 6, startOffset: -40, duration: 5, flow: 'medium' },
  { offset: 7, startOffset: -12, duration: 5, flow: 'medium' },
];

const addSymptom = (map, date, data) => {
  const existing = map.get(date) || {
    physical: [],
    mood: [],
    flow: 'none',
    energyLevel: 3,
    sleepHours: null,
    notes: '',
  };
  const physical = [...existing.physical];
  (data.physical || []).forEach((item) => {
    if (!physical.some((current) => current.name === item.name)) physical.push(item);
  });
  map.set(date, {
    ...existing,
    ...data,
    physical,
    mood: [...new Set([...(existing.mood || []), ...(data.mood || [])])],
    notes: data.notes ?? existing.notes,
  });
};

export const seedDatabase = async ({ silent = false } = {}) => {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  const today = todayISO();
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    await Promise.all([
      CycleLog.deleteMany({ user: existing._id }),
      SymptomLog.deleteMany({ user: existing._id }),
      HealthReport.deleteMany({ user: existing._id }),
      User.deleteOne({ _id: existing._id }),
    ]);
  }

  const user = await User.create({
    name: 'Aanya Sharma',
    email: DEMO_EMAIL,
    password: 'CycleSense123!',
    age: 29,
    lifeStages: ['general', 'pcos'],
    goals: [
      'Understand my cycle patterns',
      'Manage irregular periods',
      'Prepare for doctor visits',
      'Track symptom severity',
    ],
    onboardingComplete: true,
    cycleProfile: {
      averageCycleLength: 29,
      averagePeriodLength: 5,
      lastPeriodStart: addDays(today, -12),
    },
    clinicianQuestions: [
      'My cycles vary between 27 and 33 days. Is that worth investigating?',
      'Are there non-hormonal options for severe day-one cramps?',
    ],
  });

  const cycles = [];
  for (const entry of cycleBlueprint) {
    const startDate = addDays(today, entry.startOffset);
    const cycle = await CycleLog.create({
      user: user._id,
      startDate,
      endDate: addDays(startDate, entry.duration - 1),
      flow: entry.flow,
      notes:
        entry.offset === 7
          ? 'Started a day earlier than predicted. Cramps eased after heat pack.'
          : entry.flow === 'heavy'
            ? 'Heavier than usual on day two; changed protection every 3–4 hours.'
            : '',
    });
    cycles.push(cycle);
  }

  const symptomMap = new Map();

  // Period-day symptom patterns across the last three cycles.
  [
    { start: -40, duration: 5, flow: 'heavy' },
    { start: -71, duration: 5, flow: 'medium' },
    { start: -12, duration: 5, flow: 'medium' },
  ].forEach(({ start, duration, flow }) => {
    for (let day = 0; day < duration; day += 1) {
      const date = addDays(today, start + day);
      addSymptom(symptomMap, date, {
        physical:
          day === 0
            ? [
                { name: 'Cramps', severity: 'severe' },
                { name: 'Fatigue', severity: 'moderate' },
                { name: 'Headache', severity: 'mild' },
              ]
            : day === 1
              ? [
                  { name: 'Cramps', severity: 'moderate' },
                  { name: 'Bloating', severity: 'moderate' },
                ]
              : [{ name: 'Fatigue', severity: 'mild' }],
        mood: day === 0 ? ['Low energy', 'Irritable'] : ['Low energy', 'Calm'],
        flow: day === 0 ? flow : day === 1 ? (flow === 'heavy' ? 'heavy' : 'medium') : 'light',
        energyLevel: day === 0 ? 1 : day === 1 ? 2 : 3,
        sleepHours: day === 0 ? 7 : 6.5,
        notes:
          day === 0
            ? 'Heat pack and magnesium helped. Took it slow today.'
            : day === 1
              ? 'Bloated and tender. Wore comfortable clothes.'
              : '',
      });
    }
  });

  // PMS and luteal patterns.
  [
    [-17, ['Bloating', 'Breast tenderness'], ['Irritable', 'Mood swings'], 3, 7],
    [-15, ['Headache', 'Acne'], ['Low energy'], 2, 5.5],
    [-14, ['Food cravings'], ['Anxious'], 2, 6],
    [-46, ['Headache'], ['Irritable'], 3, 7.5],
    [-44, ['Bloating', 'Breast tenderness'], ['Mood swings', 'Low energy'], 3, 6],
    [-74, ['Acne'], ['Anxious'], 3, 7],
  ].forEach(([offset, physical, mood, energy, sleep]) => {
    addSymptom(symptomMap, addDays(today, offset), {
      physical: physical.map((name) => ({ name, severity: 'moderate' })),
      mood,
      energyLevel: energy,
      sleepHours: sleep,
      notes: offset === -15 ? 'Stressful week at work; slept less than usual.' : '',
    });
  });

  // Recent follicular and ovulation-window signals.
  [
    [-9, [{ name: 'Fatigue', severity: 'mild' }], ['Calm'], 3, 7, ''],
    [-7, [{ name: 'Headache', severity: 'moderate' }], ['Anxious'], 3, 6, 'Long screen day.'],
    [-5, [{ name: 'Acne', severity: 'mild' }], ['Energetic'], 4, 8, ''],
    [-3, [{ name: 'Breast tenderness', severity: 'mild' }, { name: 'Acne', severity: 'moderate' }], ['Energetic', 'Hopeful'], 4, 7.5, 'Feeling more myself this week.'],
    [-1, [{ name: 'Bloating', severity: 'mild' }], ['Calm'], 4, 8, 'Walked after dinner and slept well.'],
    [-20, [{ name: 'Fatigue', severity: 'moderate' }], ['Overwhelmed'], 2, 5, 'Back-to-back deadlines.'],
    [-24, [], ['Anxious'], 3, 6.5, 'Therapy day — helpful but tiring.'],
    [-55, [{ name: 'Cramps', severity: 'mild' }], ['Calm'], 3, 7, ''],
    [-80, [{ name: 'Headache', severity: 'severe' }], ['Low energy'], 1, 5, 'Migraine with light sensitivity.'],
  ].forEach(([offset, physical, mood, energy, sleep, notes]) => {
    addSymptom(symptomMap, addDays(today, offset), {
      physical,
      mood,
      energyLevel: energy,
      sleepHours: sleep,
      notes,
    });
  });

  for (const [date, entry] of symptomMap) {
    await SymptomLog.create({ user: user._id, date, ...entry });
  }

  const allCycles = await CycleLog.find({ user: user._id }).sort({ startDate: 1 });
  const allSymptoms = await SymptomLog.find({ user: user._id }).sort({ date: 1 });
  const snapshot = buildReportSnapshot({
    user,
    cycles: allCycles,
    symptoms: allSymptoms,
    rangeStart: addDays(today, -180),
    rangeEnd: today,
  });

  await HealthReport.create({
    user: user._id,
    title: 'Cycle health summary · last 6 months',
    rangeStart: addDays(today, -180),
    rangeEnd: today,
    questions: user.clinicianQuestions,
    notes:
      'I would like to understand whether my cycle variation and day-one pain are within a typical range. I am also curious about PCOS screening.',
    snapshot,
  });

  log(`🌱 Seeded demo account: ${DEMO_EMAIL} / CycleSense123!`);
  log(`   ${cycles.length} periods · ${symptomMap.size} journal entries · 1 saved report`);

  return user;
};

export { DEMO_EMAIL };
