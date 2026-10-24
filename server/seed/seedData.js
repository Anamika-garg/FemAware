import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { CycleLog } from '../models/CycleLog.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { HealthReport } from '../models/HealthReport.js';
import { addDays, todayISO } from '../utils/dates.js';
import { buildReportSnapshot } from '../utils/reportBuilder.js';
import { deleteTeenData } from '../teen/index.js';
import { TeenCycleEntry, TeenSymptomLog } from '../teen/models/index.js';
import { generateDemoData } from '../teen/services/demoData.js';

const DEMO_EMAIL = 'demo@femaware.app';
const SENIOR_EMAIL = 'senior@femaware.app';
const TEEN_EMAIL = 'teen@femaware.app';

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
    senior: data.senior
      ? { ...(existing.senior || {}), ...data.senior }
      : existing.senior,
    notes: data.notes ?? existing.notes,
  });
};

export const seedDatabase = async ({ silent = false } = {}) => {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  const today = todayISO();
  const existingUsers = await User.find({ email: { $in: [DEMO_EMAIL, SENIOR_EMAIL, TEEN_EMAIL] } });
  for (const existing of existingUsers) {
    await Promise.all([
      CycleLog.deleteMany({ user: existing._id }),
      SymptomLog.deleteMany({ user: existing._id }),
      HealthReport.deleteMany({ user: existing._id }),
      deleteTeenData(existing._id),
      User.deleteOne({ _id: existing._id }),
    ]);
  }

  const user = await User.create({
    name: 'Aanya Sharma',
    email: DEMO_EMAIL,
    password: 'FemAware123!',
    age: 29,
    lifeStage: 'adult',
    lifeStages: ['general', 'pcos'],
    focusAreas: ['general', 'pcos', 'irregular-periods'],
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

  log(`🌱 Seeded demo account: ${DEMO_EMAIL} / FemAware123!`);
  log(`   ${cycles.length} periods · ${symptomMap.size} journal entries · 1 saved report`);

  // -------------------------------------------------------------------------
  // Senior care demo account
  // -------------------------------------------------------------------------

  const seniorUser = await User.create({
    name: 'Meera Iyer',
    email: SENIOR_EMAIL,
    password: 'FemAware123!',
    age: 58,
    lifeStage: 'senior',
    lifeStages: ['postmenopause'],
    focusAreas: ['postmenopause', 'bone-health', 'heart-health', 'intimate-health'],
    goals: [
      'Protect my bone health',
      'Sleep more comfortably',
      'Prepare for doctor visits',
      'Understand heart health',
    ],
    onboardingComplete: true,
    cycleProfile: {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      lastPeriodStart: null,
    },
    clinicianQuestions: [
      'Am I due for a bone density scan?',
      'What can I do about night sweats that disturb my sleep?',
    ],
  });

  const seniorMap = new Map();
  const physicalForSenior = (details) => {
    const items = [];
    if (details.hotFlashCount > 0) {
      items.push({
        name: 'Hot flashes',
        severity:
          details.hotFlashCount >= 3 ? 'severe' : details.hotFlashCount === 2 ? 'moderate' : 'mild',
      });
    }
    const pairs = [
      ['Night sweats', details.nightSweats],
      ['Fatigue', details.daytimeExhaustion],
      ['Vaginal dryness', details.vaginalDryness],
      ['Bladder urgency', details.bladderUrgency],
      ['Pelvic discomfort', details.pelvicComfort],
      ['Joint stiffness', details.jointStiffness],
      ['Bone discomfort', details.boneDiscomfort],
    ];
    pairs.forEach(([name, level]) => {
      if (level && level !== 'none') items.push({ name, severity: level });
    });
    if (details.memoryClarity !== null && details.memoryClarity <= 2) {
      items.push({ name: 'Brain fog', severity: details.memoryClarity === 1 ? 'severe' : 'moderate' });
    }
    return items;
  };

  const seniorNotes = [
    'Slept better after keeping the bedroom cool. Hot flashes were brief.',
    'A busy day. I noticed more warmth in the afternoon and felt tired by evening.',
    'Walked for 20 minutes and did light strength exercises. Joints felt looser afterwards.',
    'Night sweats woke me twice. I kept water by the bed and used a lighter blanket.',
    'Felt steady today. Memory and mood both felt clearer after a good night.',
    'Some bladder urgency in the morning, but it settled during the day.',
  ];

  for (let offset = 88; offset >= 0; offset -= 2) {
    const date = addDays(today, -offset);
    const recent = offset <= 28;
    const middle = offset > 28 && offset <= 60;

    const hotFlashCount = recent
      ? offset % 8 === 4
        ? 1
        : 0
      : middle
        ? offset % 4 === 0
          ? 3
          : offset % 2 === 0
            ? 2
            : 1
        : offset % 4 === 0
          ? 4
          : offset % 2 === 0
            ? 3
            : 2;

    const sleepQuality = recent
      ? offset % 4 === 0
        ? 4
        : 3
      : middle
        ? offset % 4 === 0
          ? 3
          : 2
        : offset % 4 === 0
          ? 2
          : 1;

    const nightSweats = recent
      ? offset % 6 === 0
        ? 'mild'
        : 'none'
      : middle
        ? offset % 4 === 0
          ? 'moderate'
          : 'mild'
        : offset % 2 === 0
          ? 'severe'
          : 'moderate';

    const jointStiffness = recent
      ? offset % 6 === 0
        ? 'mild'
        : 'none'
      : middle
        ? offset % 4 === 0
          ? 'moderate'
          : 'mild'
        : offset % 2 === 0
          ? 'severe'
          : 'moderate';

    const details = {
      sleepQuality,
      nightSweats,
      daytimeExhaustion: recent ? (offset % 8 === 2 ? 'mild' : 'none') : middle ? 'mild' : 'moderate',
      hotFlashCount,
      hotFlashSeverity:
        hotFlashCount === 0 ? 'none' : hotFlashCount >= 3 ? 'severe' : hotFlashCount === 2 ? 'moderate' : 'mild',
      vaginalDryness: offset % 6 === 0 ? 'moderate' : 'mild',
      bladderUrgency: offset % 8 === 0 ? 'moderate' : offset % 4 === 0 ? 'mild' : 'none',
      pelvicComfort: offset % 10 === 0 ? 'mild' : 'none',
      jointStiffness,
      boneDiscomfort: recent ? 'none' : middle ? 'mild' : 'moderate',
      memoryClarity: recent ? (offset % 6 === 0 ? 3 : 4) : middle ? 3 : offset % 4 === 0 ? 2 : 3,
      emotionalWellbeing: recent ? (offset % 6 === 0 ? 3 : 4) : middle ? 3 : offset % 4 === 0 ? 2 : 3,
      postmenopausalBleeding: false,
      mobilityNotes: recent
        ? 'Morning walk and gentle stretching helped loosen stiff joints.'
        : middle
          ? 'Stairs felt harder today; I paced myself and rested between tasks.'
          : 'Joint stiffness made getting moving slower this morning.',
      memoryNotes: recent
        ? 'Word-finding felt steadier after a full night of sleep.'
        : 'Wrote things down to help with a busy week.',
    };

    addSymptom(seniorMap, date, {
      physical: physicalForSenior(details),
      mood:
        details.emotionalWellbeing >= 4
          ? ['Calm', 'Hopeful']
          : details.emotionalWellbeing === 3
            ? ['Calm']
            : ['Low energy'],
      energyLevel: recent ? 4 : middle ? 3 : 2,
      sleepHours: recent ? 7 : middle ? 6.5 : 5.5,
      notes: seniorNotes[Math.floor(Math.abs(offset) / 2) % seniorNotes.length],
      senior: details,
    });
  }

  for (const [date, entry] of seniorMap) {
    await SymptomLog.create({ user: seniorUser._id, date, ...entry });
  }

  const seniorSymptomLogs = await SymptomLog.find({ user: seniorUser._id }).sort({ date: 1 });
  const seniorRangeStart = addDays(today, -90);
  const seniorSnapshot = buildReportSnapshot({
    user: seniorUser,
    cycles: [],
    symptoms: seniorSymptomLogs,
    rangeStart: seniorRangeStart,
    rangeEnd: today,
    careContext: 'senior',
    visitDate: addDays(today, 9),
    concerns: [
      'Am I due for a bone density scan, and how often should it be repeated?',
      'Hot flashes are less frequent, but night sweats still interrupt my sleep. What options fit my health history?',
      'Should I adjust my calcium or vitamin D intake?',
    ],
    medications: [
      'Vitamin D3 1000 IU daily',
      'Calcium citrate 500 mg twice daily',
      'Atorvastatin 10 mg nightly',
    ],
  });

  await HealthReport.create({
    user: seniorUser._id,
    title: 'Postmenopause care summary · last 3 months',
    rangeStart: seniorRangeStart,
    rangeEnd: today,
    questions: [
      'Am I due for a bone density scan?',
      'What can I do about night sweats that disturb my sleep?',
    ],
    notes:
      'I have been walking for 20 minutes most mornings and doing light strength exercises twice a week. I would like to discuss sleep, joint stiffness, and bone health.',
    snapshot: seniorSnapshot,
  });

  log(`🌱 Seeded senior demo account: ${SENIOR_EMAIL} / FemAware123!`);
  log(`   ${seniorMap.size} senior check-ins · 1 saved appointment summary`);

  // -------------------------------------------------------------------------
  // Teen demo account
  // -------------------------------------------------------------------------

  const teenUser = await User.create({
    name: 'Riya Kapoor',
    email: TEEN_EMAIL,
    password: 'FemAware123!',
    age: 15,
    lifeStage: 'teen',
    lifeStages: ['general'],
    focusAreas: ['general'],
    goals: ['Track my period', 'Learn about my body'],
    onboardingComplete: true,
  });

  const teenSample = generateDemoData();
  await Promise.all([
    TeenCycleEntry.insertMany(teenSample.cycles.map((item) => ({ ...item, owner: teenUser._id }))),
    TeenSymptomLog.insertMany(teenSample.symptoms.map((item) => ({ ...item, owner: teenUser._id }))),
  ]);

  log(`🌱 Seeded teen demo account: ${TEEN_EMAIL} / FemAware123!`);
  log(`   ${teenSample.cycles.length} periods · ${teenSample.symptoms.length} symptom logs`);

  return user;
};

export { DEMO_EMAIL, SENIOR_EMAIL, TEEN_EMAIL };
