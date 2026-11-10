// 梅花易數 casting: numbers → 本卦 / 互卦 / 變卦, and 體 / 用.
import { Solar } from 'lunar-typescript';
import { hexagram, hexagramFromLines, type Hexagram } from './hexagram';
import type { Line, Trigram } from './trigrams';

export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type Branch = (typeof BRANCHES)[number];
/** 子1 … 亥12 — 卷一「年月日時起例」「子年一數，丑年二數，直至亥年十二數」. */
export const branchNumber = (b: Branch) => BRANCHES.indexOf(b) + 1;

/** 卷一「卦以八除」: remainder after removing eights; a remainder of 0 is 坤 (8). */
export const mod8 = (n: number) => ((((n - 1) % 8) + 8) % 8) + 1;
/** 卷一「爻以六除」: remainder after removing sixes; 0 is the sixth line. */
export const mod6 = (n: number) => ((((n - 1) % 6) + 6) % 6) + 1;

/** The three raw counts before reduction. */
export interface CastNumbers {
  upper: number;
  lower: number;
  line: number;
}

export interface Cast {
  numbers: CastNumbers;
  upperNum: number;
  lowerNum: number;
  /** Moving line 1 (bottom) – 6 (top). */
  moving: number;
  ben: Hexagram;
  bian: Hexagram;
  /** 互卦: lower = lines 2–4, upper = lines 3–5 (of 變卦 when 本卦 is 乾 or 坤). */
  hu: Hexagram;
  /** True when 「乾坤無互，互其變卦」 applied. */
  huFromBian: boolean;
  /** 體: the trigram without the moving line. */
  ti: Trigram;
  /** 用: the trigram with the moving line. */
  yong: Trigram;
  tiPosition: 'upper' | 'lower';
  /** 變: the 用 trigram after its line changes. */
  bianTrigram: Trigram;
  /** 互 on the 體 side (體互), then the other one (用互) — 卷三「體用互變之訣」. */
  huTi: Trigram;
  huYong: Trigram;
}

export function castFromNumbers(n: CastNumbers): Cast {
  for (const v of [n.upper, n.lower, n.line]) {
    if (!Number.isInteger(v) || v < 1) throw new RangeError('cast numbers must be positive integers');
  }
  const upperNum = mod8(n.upper);
  const lowerNum = mod8(n.lower);
  const moving = mod6(n.line);
  const ben = hexagram(upperNum, lowerNum);
  const bianLines = ben.lines.slice() as Line[];
  bianLines[moving - 1] = bianLines[moving - 1] ? 0 : 1;
  const bian = hexagramFromLines(bianLines);
  // 卷一「互卦起例」: drop the first and sixth lines; lines 2-3-4 and 3-4-5 form two trigrams.
  // 「乾坤無互，互其變卦」: 乾 and 坤 have no 互 of their own, so take it from the 變卦.
  const huFromBian = (upperNum === 1 && lowerNum === 1) || (upperNum === 8 && lowerNum === 8);
  const src = huFromBian ? bian.lines : ben.lines;
  const hu = hexagramFromLines([...src.slice(1, 4), ...src.slice(2, 5)]);
  const tiPosition = moving <= 3 ? 'upper' : 'lower';
  const ti = tiPosition === 'upper' ? ben.upper : ben.lower;
  const yong = tiPosition === 'upper' ? ben.lower : ben.upper;
  const bianTrigram = tiPosition === 'upper' ? bian.lower : bian.upper;
  const huTi = tiPosition === 'upper' ? hu.upper : hu.lower;
  const huYong = tiPosition === 'upper' ? hu.lower : hu.upper;
  return { numbers: n, upperNum, lowerNum, moving, ben, bian, hu, huFromBian, ti, yong, tiPosition, bianTrigram, huTi, huYong };
}

export interface LunarMoment {
  yearBranch: Branch;
  /** Lunar month 1–12 (a leap month counts as its ordinary number). */
  month: number;
  leap: boolean;
  /** Lunar day 1–30. */
  day: number;
  hourBranch: Branch;
  /** Labels for display, e.g. 丙午年. */
  yearGanZhi: string;
  /** Month branch by solar term (月建, 節氣), for the optional seasonal basis. */
  monthBranchByTerm: Branch;
  /** True when 23:00–24:00 was counted as the next lunar day. */
  shifted: boolean;
  solar: { y: number; m: number; d: number; h: number; mi: number };
}

/**
 * Lunar moment for a local civil date-time.
 * From 23:00 the hour is 子. By default the lunar day is then counted as the next day
 * (the 子時 begins the day); `ziNextDay: false` keeps the calendar day until midnight.
 */
export function lunarMoment(y: number, m: number, d: number, h: number, mi: number, ziNextDay = true): LunarMoment {
  const exact = Solar.fromYmdHms(y, m, d, h, mi, 0);
  const shifted = ziNextDay && h >= 23;
  const s = shifted ? exact.next(1) : exact;
  const lunar = s.getLunar();
  const month = lunar.getMonth();
  return {
    yearBranch: lunar.getYearZhi() as Branch,
    month: Math.abs(month),
    leap: month < 0,
    day: lunar.getDay(),
    hourBranch: BRANCHES[Math.floor(((h + 1) % 24) / 2)],
    yearGanZhi: lunar.getYearInGanZhi(),
    monthBranchByTerm: exact.getLunar().getMonthZhiExact() as Branch,
    shifted,
    solar: { y, m, d, h, mi },
  };
}

/**
 * 卷一「年月日時起例」: 年+月+日 → upper; 年+月+日+時 → lower; the same total → moving line.
 * 卷二「起卦加數例」 adds an extra number (there, a surname's strokes) to every sum.
 */
export function timeNumbers(t: Pick<LunarMoment, 'yearBranch' | 'month' | 'day' | 'hourBranch'>, extra = 0): CastNumbers {
  const upper = branchNumber(t.yearBranch) + t.month + t.day + extra;
  const lower = upper + branchNumber(t.hourBranch);
  return { upper, lower, line: lower };
}

/**
 * Two numbers the asker chooses. 卷一「物數占例」: first → upper, second → lower;
 * the moving line is their sum, plus the hour number when `hourBranch` is given
 * (卷一「爻以六除」「取爻當以時加之」).
 */
export function enteredNumbers(a: number, b: number, hourBranch?: Branch): CastNumbers {
  return { upper: a, lower: b, line: a + b + (hourBranch ? branchNumber(hourBranch) : 0) };
}

/**
 * One number. 卷一「物數占例」: the number → upper, the hour number → lower,
 * number + hour → moving line.
 */
export function singleNumber(n: number, hourBranch: Branch): CastNumbers {
  const h = branchNumber(hourBranch);
  return { upper: n, lower: h, line: n + h };
}
