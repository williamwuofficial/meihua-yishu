import { describe, expect, it } from 'vitest';
import { computeCast } from '../src/compute';

const opts = { ziNextDay: true, seasonBasis: 'lunarMonth' as const };

describe('computeCast (shared by the cast and history pages)', () => {
  it('one number uses the hour for the lower trigram', () => {
    const r = computeCast({ topic: 'general', method: 'numbers', count: 1, when: '2026-11-10T12:00', a: 7, addHour: false, extra: 0 }, opts);
    expect(typeof r).not.toBe('string');
    if (typeof r !== 'string') expect(r.cast.ben.fullName).toBe('艮為山');
  });
  it('rejects bad input', () => {
    expect(computeCast({ topic: 'general', method: 'numbers', count: 2, when: '2026-11-10T12:00', a: 3, addHour: true, extra: 0 }, opts)).toBe('badNumbers');
    expect(computeCast({ topic: 'general', method: 'time', count: 2, when: 'nope', addHour: true, extra: 0 }, opts)).toBe('badTime');
    expect(computeCast({ topic: 'general', method: 'numbers', count: 1, when: '2026-11-10T12:00', a: 0, addHour: true, extra: 0 }, opts)).toBe('badNumbers');
  });
  it('the 子時 setting changes the day, so history must store it to reopen the same cast', () => {
    const input = { topic: 'general' as const, method: 'time' as const, count: 2 as const, when: '2026-11-10T23:30', addHour: true, extra: 0 };
    const a = computeCast(input, opts);
    const b = computeCast(input, { ...opts, ziNextDay: false });
    if (typeof a === 'string' || typeof b === 'string') throw new Error('cast failed');
    expect(a.moment.day).toBe(b.moment.day + 1);
  });
});
