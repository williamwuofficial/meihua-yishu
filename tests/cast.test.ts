// Worked examples from 《梅花易數》卷一 (Wikisource text cached in .cache/sources).
// Each case lists the numbers the book uses and the hexagrams it names.
import { describe, expect, it } from 'vitest';
import { castFromNumbers, enteredNumbers, lunarMoment, mod6, mod8, singleNumber, timeNumbers } from '../src/core/cast';
import { HEXAGRAMS, hexagram } from '../src/core/hexagram';
import { TRIGRAMS } from '../src/core/trigrams';

describe('reduction', () => {
  it('卦以八除 / 爻以六除: a zero remainder is 8 / 6', () => {
    expect([1, 8, 9, 16, 34, 43].map(mod8)).toEqual([1, 8, 1, 8, 2, 3]);
    expect([1, 6, 7, 12, 43].map(mod6)).toEqual([1, 6, 1, 6, 1]);
  });
});

describe('周易 data', () => {
  it('has 64 distinct upper/lower pairs whose 爻 labels match the line pattern', () => {
    expect(HEXAGRAMS).toHaveLength(64);
    expect(new Set(HEXAGRAMS.map((h) => `${h.upper}${h.lower}`)).size).toBe(64);
    for (const h of HEXAGRAMS) {
      const lines = hexagram(h.upper, h.lower).lines;
      h.lines.forEach((l, i) => expect(l.label.includes('九') ? 1 : 0, `${h.name} ${l.label}`).toBe(lines[i]));
    }
  });
  it('trigram line patterns are all distinct', () => {
    expect(new Set(TRIGRAMS.map((t) => t.lines.join(''))).size).toBe(8);
  });
});

interface Case {
  title: string;
  numbers: { upper: number; lower: number; line: number };
  ben: string;
  moving: number;
  bian: string;
  hu: [string, string] | string; // [upper, lower] trigram names or 'same' pair
  ti: string;
}

// The book names 互 as a pair (e.g. 「互見乾巽」); order there is not always upper-first, so compare as sets.
const CASES: Case[] = [
  // 觀梅占: 辰5 + 12 + 17 = 34 → 兌; +申9 = 43 → 離; 43 ÷ 6 → 1.「是為澤火革。初爻變咸，互見乾巽。」「兌金為體」
  { title: '觀梅占', numbers: { upper: 34, lower: 43, line: 43 }, ben: '澤火革', moving: 1, bian: '澤山咸', hu: ['乾', '巽'], ti: '兌' },
  // 牡丹占: 巳6 + 3 + 16 = 25 → 乾; +卯4 = 29 → 巽; 29 → 5.「得天風姤…五爻動，變鼎卦，互見重乾」「巽木為體」
  { title: '牡丹占', numbers: { upper: 25, lower: 29, line: 29 }, ben: '天風姤', moving: 5, bian: '火風鼎', hu: ['乾', '乾'], ti: '巽' },
  // 鄰夜扣門借物占: 一聲乾, 五聲巽, 1+5+酉10 = 16 → 4.「第四爻變巽卦，互見重乾」
  { title: '鄰夜扣門借物占', numbers: { upper: 1, lower: 5, line: 16 }, ben: '天風姤', moving: 4, bian: '巽為風', hu: ['乾', '乾'], ti: '巽' },
  // 今日動靜如何: 8 坤, 5 巽, 13 → 1.「為地風升。初爻動，變泰卦，互見震、兌」
  { title: '今日動靜如何', numbers: { upper: 8, lower: 5, line: 13 }, ben: '地風升', moving: 1, bian: '地天泰', hu: ['震', '兌'], ti: '坤' },
  // 西林寺牌額占: 西7 艮, 林8 坤, 15 → 3.「是山地剝卦。第三爻動，變艮，互見重坤」
  { title: '西林寺牌額占', numbers: { upper: 7, lower: 8, line: 15 }, ben: '山地剝', moving: 3, bian: '艮為山', hu: ['坤', '坤'], ti: '艮' },
  // 同, 添兩勾: 7 艮, 10 → 兌, 17 → 5.「是為山澤損。第五爻變，動為中孚卦，互卦見坤、震」
  { title: '西林寺牌額占（添勾）', numbers: { upper: 7, lower: 10, line: 17 }, ben: '山澤損', moving: 5, bian: '風澤中孚', hu: ['坤', '震'], ti: '兌' },
  // 老人有憂色占: 乾1 巽5 + 卯4 = 10 → 4.「是為天風姤之九四」「巽木為體…互卦又見重乾」
  { title: '老人有憂色占', numbers: { upper: 1, lower: 5, line: 10 }, ben: '天風姤', moving: 4, bian: '巽為風', hu: ['乾', '乾'], ti: '巽' },
  // 少年有喜色占: 艮7 離3 + 午7 = 17 → 5.「得山火賁」「卦則賁之家人，互見震、坎，離為體」
  { title: '少年有喜色占', numbers: { upper: 7, lower: 3, line: 17 }, ben: '山火賁', moving: 5, bian: '風火家人', hu: ['震', '坎'], ti: '離' },
  // 牛哀鳴占: 坤8 坎6 + 午7 = 21 → 3.「地水師之三爻」「師變升，互坤、震，乃坤為體」
  { title: '牛哀鳴占', numbers: { upper: 8, lower: 6, line: 21 }, ben: '地水師', moving: 3, bian: '地風升', hu: ['坤', '震'], ti: '坤' },
  // 雞悲鳴占: 巽5 乾1 + 卯4 = 10 → 4.「得風天小畜…爻動變乾」「互見離、兌。乾金為體」
  { title: '雞悲鳴占', numbers: { upper: 5, lower: 1, line: 10 }, ben: '風天小畜', moving: 4, bian: '乾為天', hu: ['離', '兌'], ti: '乾' },
  // 枯枝墜地占: 離3 兌2 + 辰5 = 10 → 4.「得火澤睽…變山澤損」「互見坎、離，兌金為體」
  { title: '枯枝墜地占', numbers: { upper: 3, lower: 2, line: 10 }, ben: '火澤睽', moving: 4, bian: '山澤損', hu: ['坎', '離'], ti: '兌' },
];

describe('worked examples from 《梅花易數》卷一', () => {
  for (const c of CASES) {
    it(c.title, () => {
      const r = castFromNumbers(c.numbers);
      expect(r.ben.fullName).toBe(c.ben);
      expect(r.moving).toBe(c.moving);
      expect(r.bian.fullName).toBe(c.bian);
      expect([r.hu.upper.name, r.hu.lower.name].sort()).toEqual([...c.hu].sort());
      expect(r.ti.name).toBe(c.ti);
    });
  }

  it('觀梅占 from the time method: 辰年十二月十七日申時', () => {
    const n = timeNumbers({ yearBranch: '辰', month: 12, day: 17, hourBranch: '申' });
    expect(n).toEqual({ upper: 34, lower: 43, line: 43 });
    const r = castFromNumbers(n);
    // 「幸變為艮土，兌金得生」: the changed 用 trigram is 艮.
    expect(r.bianTrigram.name).toBe('艮');
    expect(r.yong.name).toBe('離');
  });

  it('牡丹占 from the time method: 巳年三月十六日卯時', () => {
    expect(timeNumbers({ yearBranch: '巳', month: 3, day: 16, hourBranch: '卯' })).toEqual({ upper: 25, lower: 29, line: 29 });
  });

  // 卷二「起卦加數例」: 寅年十二月初一日午時, three families add their surname's strokes.
  // 「若寅年三數、十二與一，共十六，加王姓四畫…得豐變震，互見兌、巽」 (the text says 「余三為初爻」 but
  // 27 ÷ 6 leaves 3, the third line, and 豐 → 震 only works with the third line).
  // 「田姓加以田字六畫，得水風井，變升，互見離、兌」「韓姓加入二十一畫之數，得益變中孚，互見艮、坤」
  for (const [surname, strokes, ben, bian, hu] of [
    ['王', 4, '雷火豐', '震為雷', ['兌', '巽']],
    ['田', 6, '水風井', '地風升', ['離', '兌']],
    ['韓', 21, '風雷益', '風澤中孚', ['艮', '坤']],
  ] as const) {
    it(`起卦加數例: ${surname} + ${strokes}`, () => {
      const r = castFromNumbers(timeNumbers({ yearBranch: '寅', month: 12, day: 1, hourBranch: '午' }, strokes));
      expect(r.ben.fullName).toBe(ben);
      expect(r.bian.fullName).toBe(bian);
      expect([r.hu.upper.name, r.hu.lower.name].sort()).toEqual([...hu].sort());
    });
  }

  it('one number (物數占例): the number is the upper trigram, the hour the lower', () => {
    // 7 at 午時: upper 7 艮, lower 午7 艮, line 14 → 2.
    expect(singleNumber(7, '午')).toEqual({ upper: 7, lower: 7, line: 14 });
    const r = castFromNumbers(singleNumber(7, '午'));
    expect(r.ben.fullName).toBe('艮為山');
    expect(r.moving).toBe(2);
  });

  it('entered numbers add the hour to the moving line only when asked', () => {
    expect(enteredNumbers(1, 5, '酉')).toEqual({ upper: 1, lower: 5, line: 16 });
    expect(enteredNumbers(8, 5)).toEqual({ upper: 8, lower: 5, line: 13 });
  });
});

describe('互卦 rules', () => {
  it('乾坤無互，互其變卦: 乾為天 takes its 互 from the 變卦', () => {
    const r = castFromNumbers({ upper: 1, lower: 1, line: 1 }); // 乾 → 天風姤
    expect(r.huFromBian).toBe(true);
    expect(r.bian.fullName).toBe('天風姤');
    expect(r.hu.fullName).toBe('乾為天'); // 姤's 互 is 重乾
    const k = castFromNumbers({ upper: 8, lower: 8, line: 6 }); // 坤 → 山地剝
    expect(k.bian.fullName).toBe('山地剝');
    expect(k.hu.fullName).toBe('坤為地');
  });
  it('體互 is the 互 trigram on the 體 side (卷三「體用互變之訣」)', () => {
    const r = castFromNumbers({ upper: 34, lower: 43, line: 43 }); // 革, 體 兌 above
    expect(r.tiPosition).toBe('upper');
    expect(r.huTi.name).toBe('乾');
    expect(r.huYong.name).toBe('巽');
  });
});

describe('lunar moment', () => {
  it('reads the lunar date and hour branch', () => {
    // 2024-02-10 is 甲辰年正月初一.
    const m = lunarMoment(2024, 2, 10, 15, 30);
    expect(m).toMatchObject({ yearBranch: '辰', month: 1, day: 1, hourBranch: '申', leap: false });
  });
  it('from 23:00 counts the next lunar day and 子時', () => {
    const m = lunarMoment(2024, 2, 10, 23, 10);
    expect(m).toMatchObject({ day: 2, hourBranch: '子' });
    expect(lunarMoment(2024, 2, 11, 0, 30)).toMatchObject({ day: 2, hourBranch: '子' });
    expect(lunarMoment(2024, 2, 11, 1, 0)).toMatchObject({ hourBranch: '丑' });
  });
  it('can keep the calendar day until midnight', () => {
    expect(lunarMoment(2024, 2, 10, 23, 10, false)).toMatchObject({ day: 1, hourBranch: '子', shifted: false });
  });
  it('gives the solar-term month branch', () => {
    // 2024-02-03 is before 立春 (02-04), so still 丑月; 02-05 is 寅月.
    expect(lunarMoment(2024, 2, 3, 12, 0).monthBranchByTerm).toBe('丑');
    expect(lunarMoment(2024, 2, 5, 12, 0).monthBranchByTerm).toBe('寅');
  });
  it('a leap month counts as its ordinary number', () => {
    // 2023 had a leap 2nd month (閏二月), 2023-04-01 falls in it.
    const m = lunarMoment(2023, 4, 1, 12, 0);
    expect(m).toMatchObject({ month: 2, leap: true });
  });
});
