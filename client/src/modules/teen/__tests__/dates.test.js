import { describe, expect, it } from 'vitest';
import { addDays, buildMonthGrid, diffDays, entryCoversDay } from '../lib/dates';

describe('date helpers', () => {
  it('builds a Monday-first 6-week grid', () => {
    const grid = buildMonthGrid(2026, 9); // October 2026 starts on a Thursday
    expect(grid).toHaveLength(42);
    expect(grid[0]).toMatchObject({ iso: '2026-09-28', inMonth: false });
    expect(grid[3]).toMatchObject({ iso: '2026-10-01', inMonth: true, day: 1 });
  });

  it('adds and diffs days across month boundaries', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(diffDays('2026-11-02', '2026-10-30')).toBe(3);
  });

  it('checks whether a day is inside a period entry', () => {
    const entry = { startDate: '2026-10-01T00:00:00.000Z', endDate: '2026-10-05T00:00:00.000Z' };
    expect(entryCoversDay(entry, '2026-10-05')).toBe(true);
    expect(entryCoversDay(entry, '2026-10-06')).toBe(false);
    expect(entryCoversDay({ startDate: '2026-10-01T00:00:00.000Z' }, '2026-10-02')).toBe(false);
  });
});
