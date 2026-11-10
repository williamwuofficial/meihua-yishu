// 體用 analysis: five-element relations between 體 and 用 / 互 / 變, party counts and seasonal strength.
// Each statement is a modern restatement of the rule it cites; harsh classical verdicts are softened
// here and the original wording appears only in the cited quote.
import type { Cast } from './cast';
import type { SourceId } from './sources';
import { ELEMENT_ZH, generates, overcomes, type Element, type Trigram } from './trigrams';

export type Relation = 'biHe' | 'shengTi' | 'keTi' | 'tiSheng' | 'tiKe';
export type Tone = 'good' | 'caution' | 'neutral';

export interface Statement {
  id: string;
  tone: Tone;
  /** Plain-language text, the part a newcomer reads. */
  zh: string;
  en: string;
  /** The classical term behind it, shown as a small tag (e.g. 用克體). */
  term?: { zh: string; en: string };
  sources: SourceId[];
}

/** How trigram `x` stands to 體. */
export function relationToTi(ti: Element, x: Element): Relation {
  if (ti === x) return 'biHe';
  if (generates(x, ti)) return 'shengTi';
  if (overcomes(x, ti)) return 'keTi';
  if (generates(ti, x)) return 'tiSheng';
  return 'tiKe';
}

export const RELATION_LABEL: Record<Relation, { zh: string; en: string }> = {
  biHe: { zh: '比和', en: 'same element' },
  shengTi: { zh: '生體', en: 'supports 體' },
  keTi: { zh: '克體', en: 'presses on 體' },
  tiSheng: { zh: '體生', en: '體 feeds it' },
  tiKe: { zh: '體克', en: '體 masters it' },
};

// ---- Seasons ----

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'earth';
export type Strength = '旺' | '相' | '休' | '囚' | '死';

/**
 * Season of a lunar month. 正月 is 寅; the 辰戌丑未 months (3, 6, 9, 12) are the earth months
 * (卷一「卦氣旺」「坤、艮土旺於辰戌丑未月」).
 */
export function seasonOfMonth(month: number): Season {
  const m = ((month - 1) % 12) + 1;
  if (m % 3 === 0) return 'earth';
  if (m <= 2) return 'spring';
  if (m <= 5) return 'summer';
  if (m <= 8) return 'autumn';
  return 'winter';
}

/** Season of a month branch (月建 by solar term): 寅卯 spring, 巳午 summer, 申酉 autumn, 亥子 winter, 辰未戌丑 earth. */
export function seasonOfBranch(b: string): Season {
  const i = '寅卯辰巳午未申酉戌亥子丑'.indexOf(b);
  if (i < 0) throw new RangeError(`not a branch: ${b}`);
  return seasonOfMonth(i + 1);
}

/** 《五行大義》「論四時休王」; the 六月 row is used for every earth month, as 梅花 puts 土旺 in all four. */
const STRENGTH: Record<Season, Record<Element, Strength>> = {
  spring: { wood: '旺', fire: '相', water: '休', metal: '囚', earth: '死' },
  summer: { fire: '旺', earth: '相', wood: '休', water: '囚', metal: '死' },
  earth: { earth: '旺', metal: '相', fire: '休', wood: '囚', water: '死' },
  autumn: { metal: '旺', water: '相', earth: '休', fire: '囚', wood: '死' },
  winter: { water: '旺', wood: '相', metal: '休', earth: '囚', fire: '死' },
};
export const strength = (season: Season, e: Element): Strength => STRENGTH[season][e];
export const isStrong = (s: Strength) => s === '旺' || s === '相';

export const SEASON_SOURCE: Record<Season, SourceId> = {
  spring: 'wuxingSpring',
  summer: 'wuxingSummer',
  earth: 'wuxingLateSummer',
  autumn: 'wuxingAutumn',
  winter: 'wuxingWinter',
};
export const SEASON_LABEL: Record<Season, { zh: string; en: string }> = {
  spring: { zh: '春', en: 'spring' },
  summer: { zh: '夏', en: 'summer' },
  autumn: { zh: '秋', en: 'autumn' },
  winter: { zh: '冬', en: 'winter' },
  earth: { zh: '四季土月', en: 'an earth month' },
};
export const STRENGTH_EN: Record<Strength, string> = {
  旺: 'prospering', 相: 'rising', 休: 'resting', 囚: 'confined', 死: 'dormant',
};

// ---- Per-trigram images when a trigram supports / presses on 體 ----

type T = { zh: string; en: string };
const SHENG_IMAGE: Record<number, T> = {
  1: { zh: '帶來助力的是乾卦：傳統上象徵來自公務、名聲地位、長輩或貴人的幫助。', en: 'The helping trigram is 乾: traditionally help from official matters, standing, elders or patrons.' },
  2: { zh: '帶來助力的是兌卦：傳統上象徵喜悅的消息、朋友往來，或來自西方的好處。', en: 'The helping trigram is 兌: traditionally glad news, friends and good conversation, or gain from the west.' },
  3: { zh: '帶來助力的是離卦：傳統上象徵文件、證書方面的好消息，或來自南方的好處。', en: 'The helping trigram is 離: traditionally good news about documents or papers, or gain from the south.' },
  4: { zh: '帶來助力的是震卦：傳統上象徵主動出擊會有收穫，或來自東方的好處。', en: 'The helping trigram is 震: traditionally taking action pays off, or gain from the east.' },
  5: { zh: '帶來助力的是巽卦：傳統上象徵與草木、農產相關的收益，或來自東南方的好處。', en: 'The helping trigram is 巽: traditionally gain tied to wood, tea and produce, or from the south-east.' },
  6: { zh: '帶來助力的是坎卦：傳統上象徵來自北方的好消息或收益。', en: 'The helping trigram is 坎: traditionally welcome news or gain from the north.' },
  7: { zh: '帶來助力的是艮卦：傳統上象徵穩定、有始有終，或與土地、東北方相關的好處。', en: 'The helping trigram is 艮: traditionally steadiness and seeing things through, or gain from land or the north-east.' },
  8: { zh: '帶來助力的是坤卦：傳統上象徵與土地、鄰里或日常物資相關的收益。', en: 'The helping trigram is 坤: traditionally gain through land, neighbours or everyday goods.' },
};
const KE_IMAGE: Record<number, T> = {
  1: { zh: '帶來壓力的是乾卦：傳統上提醒留意公事或家中事務的煩惱、財物損耗，與長輩、上司相處宜謹慎。', en: 'The pressing trigram is 乾: traditionally worries over official or household matters and loss of valuables; tread carefully with elders and superiors.' },
  2: { zh: '帶來壓力的是兌卦：傳統上提醒留意口角爭執，少爭辯為宜。', en: 'The pressing trigram is 兌: traditionally quarrels and disputes; argue less.' },
  3: { zh: '帶來壓力的是離卦：傳統上提醒留意文件方面的麻煩，也要注意用火安全。', en: 'The pressing trigram is 離: traditionally trouble with documents; also take care with fire.' },
  4: { zh: '帶來壓力的是震卦：傳統上提醒容易虛驚、心神不寧，宜讓自己靜下來。', en: 'The pressing trigram is 震: traditionally false alarms and unease; give yourself time to settle.' },
  5: { zh: '帶來壓力的是巽卦：傳統上提醒可能受他人牽制。', en: 'The pressing trigram is 巽: traditionally others may hold you back.' },
  6: { zh: '帶來壓力的是坎卦：傳統上提醒留意風險與財物損失，多注意安全。', en: 'The pressing trigram is 坎: traditionally hazards and risk of loss; take extra care over safety.' },
  7: { zh: '帶來壓力的是艮卦：傳統上提醒事情容易卡住、計畫中途受阻。', en: 'The pressing trigram is 艮: traditionally things get stuck and plans stall part-way.' },
  8: { zh: '帶來壓力的是坤卦：傳統上提醒留意財產方面的煩惱，並提防小人。', en: 'The pressing trigram is 坤: traditionally worries over property; be wary of petty people.' },
};

// ---- Relation statements ----

/** The classical name of each relation between 體 and another trigram. */
const TERM: Record<Relation, T> = {
  tiKe: { zh: '體克用', en: '體克用 · you master the matter' },
  shengTi: { zh: '用生體', en: '用生體 · the matter feeds you' },
  biHe: { zh: '體用比和', en: '體用比和 · same element' },
  tiSheng: { zh: '體生用', en: '體生用 · you feed the matter' },
  keTi: { zh: '用克體', en: '用克體 · the matter presses on you' },
};

const YONG_TEXT: Record<Relation, { tone: Tone; zh: string; en: string; src: SourceId }> = {
  tiKe: { tone: 'good', src: 'tiKeYong', zh: '你能掌握這件事，傳統上視為順利。', en: 'You have the upper hand in this matter; tradition reads it as going well.' },
  shengTi: { tone: 'good', src: 'yongShengTi', zh: '這件事對你有幫助，傳統上視為會有收穫、有進展。', en: 'The matter works in your favour; tradition reads it as gain and progress.' },
  biHe: { tone: 'good', src: 'biHe', zh: '你和這件事步調一致，傳統上視為諸事順遂。', en: 'You and the matter are in step; tradition reads it as things going smoothly.' },
  tiSheng: { tone: 'caution', src: 'tiShengYong', zh: '這件事需要你付出不少心力或花費，宜量力而行。', en: 'The matter draws on your energy or money, so pace yourself.' },
  keTi: { tone: 'caution', src: 'yongKeTi', zh: '這件事會帶給你壓力，阻力較大，宜審慎行事、多作準備。', en: 'The matter puts pressure on you and meets resistance, so move carefully and prepare well.' },
};

/** Short plain phrases for each relation, used in stage lines and the summary. */
const PHRASE: Record<Relation, T> = {
  shengTi: { zh: '形勢對你有利', en: 'things work in your favour' },
  biHe: { zh: '你與事情步調一致，平穩', en: 'you and the matter stay in step' },
  tiKe: { zh: '你掌握得住', en: 'you keep things under control' },
  tiSheng: { zh: '需要你多付出心力', en: 'it asks a lot of your energy' },
  keTi: { zh: '會有壓力，宜預作準備', en: 'there is pressure, so prepare ahead' },
};

const isGood = (r: Relation) => r === 'tiKe' || r === 'shengTi' || r === 'biHe';
const toneOf = (r: Relation): Tone => (isGood(r) ? 'good' : r === 'tiSheng' ? 'neutral' : 'caution');

function stageText(stage: 'huTi' | 'huYong' | 'bian', t: Trigram, r: Relation): Statement {
  const name = { huTi: '體互', huYong: '用互', bian: '變卦' }[stage];
  const when = stage === 'bian'
    ? { zh: '到最後', en: 'By the end' }
    : stage === 'huTi' ? { zh: '過程中', en: 'Along the way' } : { zh: '過程中另一面', en: 'Along the way, on the other side' };
  const sources: SourceId[] = ['stages', stage === 'bian' ? 'order' : 'huTiFirst'];
  if (stage === 'bian') sources.push(r === 'keTi' ? 'bianKeTi' : r === 'shengTi' || r === 'biHe' ? 'bianShengTi' : 'order');
  return {
    id: `stage-${stage}`,
    tone: toneOf(r),
    zh: `${when.zh}，${PHRASE[r].zh}。`,
    en: `${when.en}, ${PHRASE[r].en}.`,
    term: { zh: `${name} ${t.name}${ELEMENT_ZH[t.element]} · ${RELATION_LABEL[r].zh}`, en: `${name} ${t.name}${ELEMENT_ZH[t.element]} · ${RELATION_LABEL[r].en}` },
    sources: [...new Set(sources)],
  };
}

export interface Analysis {
  season: Season;
  relations: { yong: Relation; huTi: Relation; huYong: Relation; bian: Relation };
  strengths: { ti: Strength; yong: Strength; huTi: Strength; huYong: Strength; bian: Strength };
  shengCount: number;
  keCount: number;
  /** Three or four plain sentences: start, middle, end, overall. Each cites the rules it rests on. */
  summary: Statement[];
  statements: Statement[];
}

export function analyse(c: Cast, season: Season): Analysis {
  const te = c.ti.element;
  const relations = {
    yong: relationToTi(te, c.yong.element),
    huTi: relationToTi(te, c.huTi.element),
    huYong: relationToTi(te, c.huYong.element),
    bian: relationToTi(te, c.bianTrigram.element),
  };
  const st = (t: Trigram) => strength(season, t.element);
  const strengths = { ti: st(c.ti), yong: st(c.yong), huTi: st(c.huTi), huYong: st(c.huYong), bian: st(c.bianTrigram) };
  const out: Statement[] = [];

  // 1. 用 against 體.
  const y = YONG_TEXT[relations.yong];
  out.push({ id: 'yong', tone: y.tone, zh: y.zh, en: y.en, term: TERM[relations.yong], sources: relations.yong === 'tiSheng' ? [y.src, 'tiShengLeak'] : [y.src] });

  // 2. 互 (體互 first) and 變.
  const showHuYong = c.huYong.num !== c.huTi.num || relations.huYong !== relations.huTi;
  out.push(stageText('huTi', c.huTi, relations.huTi));
  if (showHuYong) out.push(stageText('huYong', c.huYong, relations.huYong));
  out.push(stageText('bian', c.bianTrigram, relations.bian));

  // 3. Beginning versus end: 用吉變凶 / 用凶變吉.
  const startGood = isGood(relations.yong);
  const endGood = isGood(relations.bian);
  if (startGood && !endGood) {
    out.push({ id: 'arc', tone: 'caution', sources: ['yongVsBian'], term: { zh: '用吉變凶', en: '用吉變凶 · good start, harder end' }, zh: '開頭順利，但後段宜留意變化，不要太早鬆懈。', en: 'A smooth start, but watch for changes later and do not relax too early.' });
  } else if (!startGood && endGood) {
    out.push({ id: 'arc', tone: 'good', sources: ['yongVsBian'], term: { zh: '用凶變吉', en: '用凶變吉 · hard start, better end' }, zh: '開頭較難，後段漸入佳境。', en: 'A difficult start that gets better later.' });
  }

  // 4. Party counts among 互 and 變.
  const others = [c.huTi, c.huYong, c.bianTrigram];
  const tiParty = others.filter((t) => t.element === te).length;
  const yongParty = c.yong.element === te ? 0 : others.filter((t) => t.element === c.yong.element).length;
  if (tiParty >= 2 && tiParty > yongParty) {
    out.push({ id: 'party', tone: 'good', sources: ['party'], term: { zh: `體黨多（${tiParty} 卦同屬${ELEMENT_ZH[te]}）`, en: `體黨 · ${tiParty} trigrams share your element` }, zh: '站在你這一邊的力量較多，你較有底氣。', en: 'More of the hexagram stands on your side, so you have backing.' });
  } else if (yongParty >= 2 && yongParty > tiParty) {
    out.push({ id: 'party', tone: 'caution', sources: ['party'], term: { zh: `用黨多（${yongParty} 卦同屬${ELEMENT_ZH[c.yong.element]}）`, en: `用黨 · ${yongParty} trigrams share the matter's element` }, zh: '事情那一方的力量較大，不宜硬碰。', en: 'The forces on the matter\'s side are stronger, so avoid forcing it.' });
  }

  // 5. Tally of supporting and pressing trigrams.
  const all = [c.yong, c.huTi, c.huYong, c.bianTrigram];
  const sheng = all.filter((t) => relationToTi(te, t.element) === 'shengTi');
  const ke = all.filter((t) => relationToTi(te, t.element) === 'keTi');
  const tallyTerm = { zh: `生體 ${sheng.length} · 克體 ${ke.length}`, en: `生體 ${sheng.length} · 克體 ${ke.length} (help · pressure)` };
  let tally: Statement;
  if (!sheng.length && !ke.length) {
    tally = { id: 'tally', tone: 'neutral', sources: ['noShengKe'], term: tallyTerm, zh: '卦中沒有明顯的助力或阻力，傳統上此時多參考下方的《周易》原文。', en: 'There is no clear help or pressure in the hexagram; tradition then leans on the Book of Changes text below.' };
  } else if (sheng.length !== ke.length) {
    const more = sheng.length > ke.length;
    tally = { id: 'tally', tone: more ? 'good' : 'caution', sources: ['tally'], term: tallyTerm, zh: more ? '助力多於阻力，整體偏向順利。' : '阻力多於助力，整體偏難，宜多留餘地。', en: more ? 'Help outweighs pressure: leaning favourable overall.' : 'Pressure outweighs help: leaning difficult overall, so leave yourself margin.' };
  } else {
    tally = { id: 'tally', tone: 'neutral', sources: ['tally'], term: tallyTerm, zh: '助力與阻力差不多，順逆參半。', en: 'Help and pressure are about even: a mixed picture.' };
  }
  out.push(tally);

  // 6. Seasonal strength of 體.
  const tiStrong = isStrong(strengths.ti);
  const seasonSrc = SEASON_SOURCE[season];
  const sl = SEASON_LABEL[season];
  const seasonStmt: Statement = {
    id: 'season', tone: tiStrong ? 'good' : 'neutral', sources: [seasonSrc, 'wangShuai', 'tiShouldBeStrong'],
    term: { zh: `${sl.zh} · 體${c.ti.name}${ELEMENT_ZH[te]}「${strengths.ti}」`, en: `${sl.en} · 體 ${c.ti.name}${ELEMENT_ZH[te]} 「${strengths.ti}」 ${STRENGTH_EN[strengths.ti]}` },
    zh: tiStrong ? '以時令來看，你目前狀態不錯，較有底氣。' : '以時令來看，你目前不在最有力的時候，宜先蓄力再行動。',
    en: tiStrong ? 'For the season, you are in good form and have reserves.' : 'For the season, you are not at your strongest, so build up before pushing.',
  };
  out.push(seasonStmt);
  if (tiStrong && sheng.length) {
    out.push({ id: 'season-combo', tone: 'good', sources: ['strongWithSheng'], term: { zh: '體旺逢生', en: '體旺逢生 · strong and supported' }, zh: '你狀態好，又有助力，傳統上視為吉。', en: 'You are in good form and also supported; tradition reads this as favourable.' });
  } else if (tiStrong && ke.length) {
    out.push({ id: 'season-combo', tone: 'neutral', sources: ['strongResists'], term: { zh: '體旺', en: '體旺 · in season' }, zh: '你狀態好，即使有壓力，傳統上認為影響不大。', en: 'You are in good form, so tradition holds the pressure does little harm.' });
  } else if (!tiStrong && sheng.length) {
    out.push({ id: 'season-combo', tone: 'neutral', sources: ['weakWithSheng'], term: { zh: '體衰有生', en: '體衰有生 · weak but supported' }, zh: '你狀態一般，但有助力，可以緩解。', en: 'You are not at your strongest, but help is there to ease it.' });
  } else if (!tiStrong && ke.length) {
    out.push({ id: 'season-combo', tone: 'caution', sources: ['weakWithKe'], term: { zh: '體衰逢克', en: '體衰逢克 · weak and pressed' }, zh: '你狀態一般又有壓力，宜放慢腳步、穩妥為先。', en: 'You are not at your strongest and under pressure: slow down and put safety first.' });
  }
  for (const t of uniq(ke)) {
    if (isStrong(st(t))) out.push({ id: `ke-strong-${t.num}`, tone: 'caution', sources: ['helpersStrong'], term: { zh: `克體之${t.name}「${st(t)}」`, en: `pressing ${t.name} 「${st(t)}」 ${STRENGTH_EN[st(t)]}` }, zh: '帶來壓力的一方正當旺，壓力較明顯。', en: 'The pressing side is in season, so its pressure is marked.' });
  }
  for (const t of uniq(sheng)) {
    if (isStrong(st(t))) out.push({ id: `sheng-strong-${t.num}`, tone: 'good', sources: ['helpersStrong'], term: { zh: `生體之${t.name}「${st(t)}」`, en: `helping ${t.name} 「${st(t)}」 ${STRENGTH_EN[st(t)]}` }, zh: '帶來助力的一方正當旺，助力較足。', en: 'The helping side is in season, so its help is strong.' });
  }

  // 7. What the supporting / pressing trigrams traditionally signify.
  for (const t of uniq(sheng)) out.push({ id: `sheng-${t.num}`, tone: 'good', sources: [`sheng${t.num}` as SourceId], term: { zh: `${t.name}生體`, en: `${t.name}生體 · ${t.name} supports you` }, ...SHENG_IMAGE[t.num] });
  for (const t of uniq(ke)) out.push({ id: `ke-${t.num}`, tone: 'caution', sources: [`ke${t.num}` as SourceId], term: { zh: `${t.name}克體`, en: `${t.name}克體 · ${t.name} presses on you` }, ...KE_IMAGE[t.num] });

  // ---- Summary: start, middle, end, overall, in plain words. ----
  const summary: Statement[] = [];
  summary.push({ id: 'sum-start', tone: toneOf(relations.yong), zh: `開始時，${PHRASE[relations.yong].zh}。`, en: `At the start, ${PHRASE[relations.yong].en}.`, sources: [y.src, 'tiyongDef'] });
  const midDiffers = showHuYong && isGood(relations.huYong) !== isGood(relations.huTi);
  summary.push({
    id: 'sum-middle', tone: midDiffers ? 'neutral' : toneOf(relations.huTi),
    zh: `過程中，${PHRASE[relations.huTi].zh}${midDiffers ? `；但同時${PHRASE[relations.huYong].zh}` : ''}。`,
    en: `Along the way, ${PHRASE[relations.huTi].en}${midDiffers ? `, though ${PHRASE[relations.huYong].en}` : ''}.`,
    sources: ['stages', 'huTiFirst'],
  });
  summary.push({ id: 'sum-end', tone: toneOf(relations.bian), zh: `到最後，${PHRASE[relations.bian].zh}。`, en: `By the end, ${PHRASE[relations.bian].en}.`, sources: ['stages', relations.bian === 'keTi' ? 'bianKeTi' : isGood(relations.bian) ? 'bianShengTi' : 'order'] });
  summary.push({ id: 'sum-overall', tone: tally.tone, zh: `${tally.zh}${seasonStmt.zh}`, en: `${tally.en} ${seasonStmt.en}`, sources: [...tally.sources, ...seasonStmt.sources] });

  return { season, relations, strengths, shengCount: sheng.length, keCount: ke.length, summary, statements: out };
}

const uniq = (ts: Trigram[]) => ts.filter((t, i) => ts.findIndex((u) => u.num === t.num) === i);
