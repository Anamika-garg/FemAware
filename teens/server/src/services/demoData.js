/**
 * Synthetic, clearly-fake health data so the dashboard and insights can be
 * explored without entering anything real. Deterministic per call so tests
 * and demos are reproducible.
 */
const DAY = 86_400_000;

function startOfDayUTC(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function generateDemoData(today = new Date()) {
  const base = startOfDayUTC(today);
  // Six cycles with realistic teen variation (oldest first).
  const cycleLengths = [33, 27, 38, 29, 31];
  const periodLengths = [5, 6, 4, 5, 6, 5];
  const totalSpan = cycleLengths.reduce((a, b) => a + b, 0);
  let cursor = new Date(base.getTime() - (totalSpan + 9) * DAY);

  const cycles = [];
  periodLengths.forEach((len, i) => {
    cycles.push({
      startDate: new Date(cursor),
      endDate: new Date(cursor.getTime() + (len - 1) * DAY),
      flow: ['medium', 'heavy', 'light', 'medium', 'heavy', 'medium'][i],
    });
    if (i < cycleLengths.length) cursor = new Date(cursor.getTime() + cycleLengths[i] * DAY);
  });

  const symptoms = [];
  const patterns = [
    { offset: 0, symptoms: ['cramps', 'fatigue'], severity: 4, notes: 'Heat pack helped a little.' },
    { offset: 1, symptoms: ['cramps', 'back_pain'], severity: 3 },
    { offset: -2, symptoms: ['bloating', 'mood_changes'], severity: 2 },
    { offset: -1, symptoms: ['acne', 'cravings'], severity: 2 },
  ];
  for (const cycle of cycles) {
    for (const p of patterns) {
      const date = new Date(cycle.startDate.getTime() + p.offset * DAY);
      if (date > base) continue;
      symptoms.push({ date, symptoms: p.symptoms, severity: p.severity, notes: p.notes });
    }
  }
  return { cycles, symptoms };
}
