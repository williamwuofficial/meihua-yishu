import { describe, expect, it } from 'vitest';
import { analyse, seasonOfMonth } from '../src/core/analysis';
import { castFromNumbers } from '../src/core/cast';
import { ANSWER_LABEL, quickAnswer, weather, weatherTrigrams } from '../src/core/quick';
import { SOURCES } from '../src/core/sources';

const cast = (u: number, l: number, m: number) => castFromNumbers({ upper: u, lower: l, line: m });

describe('general quick answer (人事占: 體 against 用)', () => {
  it('觀梅占: 離火克兌金體 → leaning no', () => {
    const c = cast(34, 43, 43);
    const q = quickAnswer('general', c, analyse(c, seasonOfMonth(12)));
    expect(q.key).toBe('keTi');
    expect(q.tone).toBe('caution');
    expect(q.reason.zh).toContain('兌金');
  });
  it('maps every relation to an answer', () => {
    const seen = new Set<string>();
    for (let u = 1; u <= 8; u++) for (let l = 1; l <= 8; l++) for (let m = 1; m <= 6; m++) {
      const c = cast(u, l, m);
      seen.add(quickAnswer('general', c, analyse(c, 'spring')).key);
    }
    expect([...seen].sort()).toEqual(['biHe', 'keTi', 'shengTi', 'tiKe', 'tiSheng']);
  });
});

describe('weather quick answer (天時占: count trigrams, no 體用)', () => {
  it('looks at six trigrams: 本, 互 and 變', () => {
    expect(weatherTrigrams(cast(6, 6, 1))).toHaveLength(6);
  });
  it('坎多主雨: 坎為水 → rain', () => {
    // 坎為水 (坎/坎), 互 艮/震, 初爻 → 水澤節 (坎/兌): 坎 3, 離 0.
    expect(weather(cast(6, 6, 1), 'spring').key).toBe('rain');
  });
  it('離多主晴: 離為火 → clear', () => {
    expect(weather(cast(3, 3, 1), 'autumn').key).toBe('clear');
  });
  it('乾主晴明: 乾為天 with no 坎 or 離 → bright', () => {
    // 乾 → 天風姤 (初爻): 乾, 乾, 互 乾/乾 (from 變), 乾, 巽 → 乾 5.
    expect(weather(cast(1, 1, 1), 'spring').key).toBe('bright');
  });
  it('坤乃陰晦: 坤為地 → overcast', () => {
    expect(weather(cast(8, 8, 6), 'spring').key).toBe('overcast');
  });
  it('重坎重離 → changeable', () => {
    // 水火既濟 (坎/離), 互 離/坎; 初爻 → 水山蹇 (坎/艮): 坎 3, 離 2 → rain. Use 火水未濟 line 1 → 火澤睽.
    const all = [];
    for (let u = 1; u <= 8; u++) for (let l = 1; l <= 8; l++) for (let m = 1; m <= 6; m++) all.push(weather(cast(u, l, m), 'spring'));
    expect(all.some((q) => q.key === 'changeable')).toBe(true);
    for (const q of all) {
      expect(ANSWER_LABEL[q.key]).toBeDefined();
      for (const id of [...q.sources, ...q.notes.flatMap((n) => n.sources)]) expect(SOURCES[id]).toBeDefined();
    }
  });
  it('one 坎 and one 離 cancel out; the rest decide', () => {
    // 火雷噬嗑 line 4 → 山雷頤: 離, 震, 互 坎/艮, 艮, 震 → 坎 1, 離 1, 震 2, 艮 2: a tie, so changeable.
    // 火地晉 (離/坤) line 1 → 火雷噬嗑: 離, 坤, 互 坎/艮, 離, 震 → 離 2: clear.
    const c = cast(3, 4, 4);
    expect(weatherTrigrams(c).map((t) => t.name).sort().join('')).toBe(['離', '震', '坎', '艮', '艮', '震'].sort().join(''));
    expect(weather(c, 'spring').key).toBe('changeable');
    const k = cast(3, 8, 6); // 火地晉, 上爻 → 雷地豫: 離, 坤, 互 坎/艮, 震, 坤 → 坎 1, 離 1, 坤 2 → overcast
    expect(weather(k, 'spring').key).toBe('overcast');
  });
  it('adds the seasonal notes from 「夏占離多而無坎」 and 「冬占坎多而無離」', () => {
    expect(weather(cast(3, 3, 1), 'summer').notes.map((n) => n.sources[0])).toContain('weatherSeason');
    expect(weather(cast(6, 6, 1), 'winter').notes.map((n) => n.sources[0])).toContain('weatherSeason');
    expect(weather(cast(6, 6, 1), 'summer').notes).toHaveLength(0);
  });
});

describe('topic answers (卷二 失物、行人、謁見、出行、求謀、求名、婚姻、家宅、屋舍、飲食; job by analogy)', () => {
  const topics = ['lost', 'traveller', 'visit', 'travel', 'plan', 'recognition', 'marriage', 'home', 'dwelling', 'meal', 'job'] as const;
  const casts: ReturnType<typeof cast>[] = [];
  for (let u = 1; u <= 8; u++) for (let l = 1; l <= 8; l++) for (let m = 1; m <= 6; m++) casts.push(cast(u, l, m));

  it('every topic answers all five relations, cites its own rule, and avoids harsh verdicts', () => {
    const harsh = /凶|死|亡|殺|禍|災|害|喪|must die|death|prison/;
    for (const topic of topics) {
      const keys = new Set<string>();
      for (const c of casts) {
        const q = quickAnswer(topic, c, analyse(c, 'spring'));
        keys.add(q.key);
        expect(ANSWER_LABEL[q.key], q.key).toEqual(q.label);
        for (const id of [...q.sources, ...q.notes.flatMap((n) => n.sources)]) expect(SOURCES[id], id).toBeDefined();
        for (const text of [q.label, q.reason, ...q.notes.map((n) => n.text)]) {
          expect(text.zh).not.toMatch(harsh);
          expect(text.en).not.toMatch(harsh);
        }
      }
      expect(keys.size, topic).toBe(5);
    }
  });

  it('follows the book: 行人 用生體 → back soon, 用克體 → not soon', () => {
    const find = (rel: string) => casts.find((c) => analyse(c, 'spring').relations.yong === rel)!;
    expect(quickAnswer('traveller', find('shengTi'), analyse(find('shengTi'), 'spring')).label.en).toBe('Back soon');
    expect(quickAnswer('traveller', find('keTi'), analyse(find('keTi'), 'spring')).tone).toBe('caution');
    expect(quickAnswer('lost', find('biHe'), analyse(find('biHe'), 'spring')).label.en).toBe('It is not really lost');
  });

  it('失物 says where to look from the 變 trigram', () => {
    // 觀梅占: 革 → 咸, the 變 trigram is 艮 → north-east.
    const c = cast(34, 43, 43);
    const q = quickAnswer('lost', c, analyse(c, 'earth'));
    expect(q.notes[0].text.en).toMatch(/^Where to look \(changed trigram 艮\): North-east/);
    expect(q.notes[0].sources).toContain('lost7');
    const seen = new Set(casts.map((c) => c.bianTrigram.num));
    expect(seen.size).toBe(8);
  });
});

describe('quick-mode presets', async () => {
  const { PRESETS, charCount } = await import('../src/presets');
  const { timeNumbers } = await import('../src/core/cast');
  it('every preset has a different character count, so each gets its own hexagram in the same hour', () => {
    const counts = PRESETS.map((p) => charCount(p.zh));
    expect(new Set(counts).size).toBe(PRESETS.length);
    const at = { yearBranch: '午' as const, month: 10, day: 2, hourBranch: '酉' as const };
    const casts = PRESETS.map((p) => castFromNumbers(timeNumbers(at, charCount(p.zh))));
    expect(new Set(casts.map((c) => `${c.ben.fullName}/${c.moving}`)).size).toBe(PRESETS.length);
  });
  it('counts characters only, not punctuation', () => {
    expect(charCount('今天會下雨嗎？')).toBe(6);
    expect(charCount('這次的考試、應徵或升遷有希望嗎？')).toBe(14);
  });
});

describe('飲食 and the borrowed job question', () => {
  it('飲食: 「有坎則有酒，有兌則有食。無坎無兌，則皆無」', () => {
    // 兌為澤 (2/2) line 1 → 澤水困: 兌, 兌, 互 巽/離, 兌, 坎 → both 坎 and 兌.
    const both = cast(2, 2, 1);
    expect(quickAnswer('meal', both, analyse(both, 'spring')).notes[0].text.en).toMatch(/both appear/);
    // 乾為天 line 1 → 天風姤: no 坎, no 兌.
    const none = cast(1, 1, 1);
    expect(quickAnswer('meal', none, analyse(none, 'spring')).notes[0].text.en).toMatch(/^No 坎 or 兌/);
  });
  it('the job question says it borrows 求謀 and flags a big decision', () => {
    const c = cast(34, 43, 43);
    const q = quickAnswer('job', c, analyse(c, 'earth'));
    expect(q.sources).toContain('planRule');
    const note = q.notes.find((n) => n.sources.includes('byAnalogy'));
    expect(note?.text.zh).toContain('重大決定');
  });
});

describe('射覆: guessing a hidden object (卷三)', () => {
  it('觀物用易例 1: 地天泰之初變升，互見震、兌 → grass with roots (wood, line text 「拔茅茹」)', () => {
    const c = cast(8, 1, 1);
    expect(c.ben.fullName).toBe('地天泰');
    expect(c.bian.fullName).toBe('地風升');
    expect([c.hu.upper.name, c.hu.lower.name].sort()).toEqual(['兌', '震'].sort());
    const q = quickAnswer('guess', c, analyse(c, 'spring'));
    const all = q.notes.map((n) => n.text.zh).join('\n');
    expect(all).toContain('竹子或木頭'); // 震
    expect(all).toContain('拔茅茹');
  });
  it('觀物用易例 2: 火風鼎之雷風恒，互見乾、兌 → round, white, chipped; one or two', () => {
    const c = cast(3, 5, 6);
    expect(c.ben.fullName).toBe('火風鼎');
    expect(c.bian.fullName).toBe('雷風恆'.replace('恆', '恒'));
    const q = quickAnswer('guess', c, analyse(c, 'autumn'));
    const all = q.notes.map((n) => n.text.zh).join('\n');
    expect(all).toContain('圓形、白色、堅硬'); // 乾: 「圓」「白」
    expect(all).toContain('有缺口、破損'); // 兌: 「毀缺」
    expect(all).toContain('數量：1 或 2 件'); // 「互見乾、兌，決為一二之數」
    expect(all).toContain('鼎玉鉉');
  });
  it('a doubled 互 gives two items (「重乾…皆是兩件」)', () => {
    const c = cast(1, 5, 4); // 天風姤: 互 重乾
    expect(quickAnswer('guess', c, analyse(c, 'spring')).notes.map((n) => n.text.zh).join()).toContain('兩件');
  });
  it('every cast gives a nature, a material and a count, with known sources and no harsh words', () => {
    for (let u = 1; u <= 8; u++) for (let l = 1; l <= 8; l++) for (let m = 1; m <= 6; m++) {
      const c = cast(u, l, m);
      const q = quickAnswer('guess', c, analyse(c, 'summer'));
      expect(ANSWER_LABEL[q.key]).toEqual(q.label);
      expect(q.notes.length).toBeGreaterThanOrEqual(3);
      for (const id of [...q.sources, ...q.notes.flatMap((n) => n.sources)]) expect(SOURCES[id], id).toBeDefined();
      expect(q.label.zh).not.toMatch(/穢/);
    }
  });
});
