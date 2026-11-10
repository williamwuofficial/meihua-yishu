import { describe, expect, it } from 'vitest';
import { analyse, relationToTi, seasonOfBranch, seasonOfMonth, strength, type Analysis } from '../src/core/analysis';
import { castFromNumbers } from '../src/core/cast';
import { SOURCES } from '../src/core/sources';
import verified from './fixtures/verified-sources.json';

describe('five-element relations', () => {
  it('reads 生 and 克 from the side of 體', () => {
    expect(relationToTi('metal', 'fire')).toBe('keTi');
    expect(relationToTi('metal', 'earth')).toBe('shengTi');
    expect(relationToTi('metal', 'water')).toBe('tiSheng');
    expect(relationToTi('metal', 'wood')).toBe('tiKe');
    expect(relationToTi('metal', 'metal')).toBe('biHe');
  });
});

describe('seasons (《五行大義》 with 梅花 earth months)', () => {
  it('maps lunar months to seasons', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(seasonOfMonth)).toEqual([
      'spring', 'spring', 'earth', 'summer', 'summer', 'earth', 'autumn', 'autumn', 'earth', 'winter', 'winter', 'earth',
    ]);
  });
  it('maps solar-term month branches the same way', () => {
    expect(['寅', '辰', '午', '未', '酉', '亥', '丑'].map(seasonOfBranch)).toEqual(['spring', 'earth', 'summer', 'earth', 'autumn', 'winter', 'earth']);
  });
  it('agrees with 梅花 衰旺論: 旺 is 王 and 衰 is 死', () => {
    // 旺: 春震巽木, 夏離火, 秋乾兌金, 冬坎水, 四季坤艮土; 衰: 春坤艮, 夏乾兌, 秋震巽, 冬離, 四季坎.
    expect(strength('spring', 'wood')).toBe('旺');
    expect(strength('spring', 'earth')).toBe('死');
    expect(strength('summer', 'metal')).toBe('死');
    expect(strength('autumn', 'wood')).toBe('死');
    expect(strength('winter', 'fire')).toBe('死');
    expect(strength('earth', 'water')).toBe('死');
    expect(strength('earth', 'earth')).toBe('旺');
  });
});

describe('book examples', () => {
  it('觀梅占: 離火克兌金體, 互巽 is mastered, 變艮土生體', () => {
    const c = castFromNumbers({ upper: 34, lower: 43, line: 43 });
    const a = analyse(c, seasonOfMonth(12));
    // 「兌金為體，離火克之」「幸變為艮土，兌金得生」
    expect(a.relations).toEqual({ yong: 'keTi', huTi: 'biHe', huYong: 'tiKe', bian: 'shengTi' });
    expect(a.season).toBe('earth');
    expect(a.statements.map((s) => s.id)).toContain('arc'); // 用凶變吉
    expect(a.statements.find((s) => s.id === 'arc')!.tone).toBe('good');
  });
  it('牡丹占: 「克體之卦多矣，卦中無生意」', () => {
    const a = analyse(castFromNumbers({ upper: 25, lower: 29, line: 29 }), seasonOfMonth(3));
    expect(a.relations.yong).toBe('keTi');
    expect(a.keCount).toBe(3);
    expect(a.shengCount).toBe(0);
  });
  it('牛哀鳴占: 坤為體，互變俱克之', () => {
    const a = analyse(castFromNumbers({ upper: 8, lower: 6, line: 21 }), seasonOfMonth(1));
    expect(a.relations.huYong).toBe('keTi'); // 互震
    expect(a.relations.bian).toBe('keTi'); // 變巽
    expect(a.shengCount).toBe(0);
  });
  it('雞悲鳴占: 乾金為體，離火克之', () => {
    const c = castFromNumbers({ upper: 5, lower: 1, line: 10 });
    expect(c.ti.name).toBe('乾');
    expect(analyse(c, seasonOfMonth(1)).relations.huYong).toBe('keTi'); // 互離 is the upper 互, on the 用 side
  });
});

describe('statements', () => {
  const all: Analysis[] = [];
  for (let u = 1; u <= 8; u++) for (let l = 1; l <= 8; l++) for (let m = 1; m <= 6; m++) for (const month of [1, 3, 4, 7, 10]) {
    all.push(analyse(castFromNumbers({ upper: u, lower: l, line: m }), seasonOfMonth(month)));
  }
  it('every statement cites at least one known source and has both languages', () => {
    for (const a of all) for (const s of [...a.summary, ...a.statements]) {
      expect(s.sources.length, s.id).toBeGreaterThan(0);
      for (const id of s.sources) expect(SOURCES[id], `${s.id} → ${id}`).toBeDefined();
      expect(s.zh.length).toBeGreaterThan(4);
      expect(s.en.length).toBeGreaterThan(4);
    }
  });
  it('no statement repeats the harsh classical verdicts', () => {
    const harsh = /凶|死|亡|殺|禍|災|陰人|寇盜|must die|death|prison/;
    for (const a of all) for (const s of [...a.summary, ...a.statements]) {
      // 「死」 is allowed only as the name of a seasonal state in quotes: 「死」.
      expect(s.zh.replace(/「死」/g, ''), s.id).not.toMatch(harsh);
      expect(s.en.replace(/「死」/g, ''), s.id).not.toMatch(harsh);
    }
  });
  it('the summary always has start, middle, end and overall, in plain words', () => {
    for (const a of all) {
      expect(a.summary.map((s) => s.id)).toEqual(['sum-start', 'sum-middle', 'sum-end', 'sum-overall']);
      // Plain text carries no classical jargon; the jargon lives in `term` and the citations.
      for (const s of [...a.summary, ...a.statements]) expect(s.zh, s.id).not.toMatch(/(?<!整)體|用卦|互卦|變卦|生體|克體|比和/);
    }
  });
  it('觀梅占 summary: hard start, better end', () => {
    const a = analyse(castFromNumbers({ upper: 34, lower: 43, line: 43 }), seasonOfMonth(12));
    expect(a.summary[0].tone).toBe('caution');
    expect(a.summary[2].tone).toBe('good');
  });
  it('every quote in sources.ts has been checked against the cached source text', () => {
    for (const [id, s] of Object.entries(SOURCES)) expect((verified as Record<string, string>)[id], `${id}: run npm run verify-sources`).toBe(s.verse);
  });
});
