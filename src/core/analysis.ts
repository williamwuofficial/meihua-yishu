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
  zh: string;
  en: string;
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

const SHENG_IMAGE: Record<number, { zh: string; en: string }> = {
  1: { zh: '乾生體：傳統取象為公務、名位、長輩或貴人方面的助益。', en: '乾 supports 體: traditionally help through official matters, standing, elders or patrons.' },
  2: { zh: '兌生體：傳統取象為西方之利、喜悅之事、朋友往來。', en: '兌 supports 體: traditionally gain from the west, glad news, friends and conversation.' },
  3: { zh: '離生體：傳統取象為南方之利、文書方面的喜訊。', en: '離 supports 體: traditionally gain from the south and good news in documents or papers.' },
  4: { zh: '震生體：傳統取象為東方之利、行動中得到好處。', en: '震 supports 體: traditionally gain from the east and good come from taking action.' },
  5: { zh: '巽生體：傳統取象為東南方之利、山林草木相關的收益。', en: '巽 supports 體: traditionally gain from the south-east, or from trade in wood, tea and produce.' },
  6: { zh: '坎生體：傳統取象為北方之喜、北方而來的收益。', en: '坎 supports 體: traditionally welcome news or gain from the north.' },
  7: { zh: '艮生體：傳統取象為東北方之利、田土之喜，事情穩定有始有終。', en: '艮 supports 體: traditionally gain from the north-east or land; matters stay steady and see their end.' },
  8: { zh: '坤生體：傳統取象為田土、鄉里、布帛穀物方面的收益。', en: '坤 supports 體: traditionally gain through land, neighbours, cloth or grain.' },
};
const KE_IMAGE: Record<number, { zh: string; en: string }> = {
  1: { zh: '乾克體：傳統取象為公事或家門方面的煩惱、財物上的損耗，宜謹慎對待長輩與上司。', en: '乾 presses on 體: traditionally worries over official or household matters and loss of valuables; tread carefully with elders and superiors.' },
  2: { zh: '兌克體：傳統取象為口舌爭執，西方之事不利，宜少爭辯。', en: '兌 presses on 體: traditionally quarrels and disputes, and matters to the west go less well; argue less.' },
  3: { zh: '離克體：傳統取象為文書上的煩惱，並宜留意用火安全。', en: '離 presses on 體: traditionally trouble with documents; also take care with fire.' },
  4: { zh: '震克體：傳統取象為虛驚與不安，身心難以安靜。', en: '震 presses on 體: traditionally false alarms and unease; hard to settle body and mind.' },
  5: { zh: '巽克體：傳統取象為他人掣肘、山林草木相關之憂。', en: '巽 presses on 體: traditionally others hold you back, or worries tied to wood and growing things.' },
  6: { zh: '坎克體：傳統取象為險阻與財物損失之憂，宜多留意安全。', en: '坎 presses on 體: traditionally hazards and risk of loss; take extra care over safety.' },
  7: { zh: '艮克體：傳統取象為諸事多阻、計畫中途受阻。', en: '艮 presses on 體: traditionally many obstacles; plans stall part-way.' },
  8: { zh: '坤克體：傳統取象為田土方面的煩惱或損失，宜防小人。', en: '坤 presses on 體: traditionally worries or losses over land or property; be wary of petty people.' },
};

// ---- Relation statements ----

const YONG_TEXT: Record<Relation, { tone: Tone; zh: string; en: string; src: SourceId }> = {
  tiKe: { tone: 'good', src: 'tiKeYong', zh: '體克用：你能掌握此事，傳統視為順利之象。', en: '體 masters 用: you have the upper hand in this matter; tradition reads it as going well.' },
  shengTi: { tone: 'good', src: 'yongShengTi', zh: '用生體：事情對你有所助益，傳統視為有進益之喜。', en: '用 supports 體: the matter feeds you; tradition reads it as gain and progress.' },
  biHe: { tone: 'good', src: 'biHe', zh: '體用比和：你與此事同氣相合，傳統視為諸事順遂。', en: '體 and 用 share an element: you and the matter are in step; tradition reads it as things going smoothly.' },
  tiSheng: { tone: 'caution', src: 'tiShengYong', zh: '體生用：你為此事付出較多，傳統視為有耗損之慮，宜量力而行。', en: '體 feeds 用: the matter draws on you; tradition warns of drain or expense, so pace yourself.' },
  keTi: { tone: 'caution', src: 'yongKeTi', zh: '用克體：此事對你形成壓力，傳統視為阻力較大，宜審慎行事、多作準備。', en: '用 presses on 體: the matter weighs on you; tradition reads strong resistance, so move carefully and prepare well.' },
};

/** Relation wording when the subject is the other trigram: 「互艮為體所克」. */
const STAGE_LABEL: Record<Relation, { zh: string; en: string }> = {
  biHe: { zh: '與體比和', en: 'shares 體\'s element' },
  shengTi: { zh: '生體', en: 'supports 體' },
  keTi: { zh: '克體', en: 'presses on 體' },
  tiSheng: { zh: '為體所生', en: 'is fed by 體' },
  tiKe: { zh: '為體所克', en: 'is mastered by 體' },
};

const isGood = (r: Relation) => r === 'tiKe' || r === 'shengTi' || r === 'biHe';

function stageText(stage: 'huTi' | 'huYong' | 'bian', t: Trigram, r: Relation): Statement {
  const name = { huTi: '體互', huYong: '用互', bian: '變卦' }[stage];
  const en = { huTi: 'The 互 on the 體 side', huYong: 'The 互 on the 用 side', bian: 'The 變 trigram' }[stage];
  const when = stage === 'bian' ? { zh: '事情的結局', en: 'how the matter ends' } : { zh: '事情的中段', en: 'the middle of the matter' };
  const lab = STAGE_LABEL[r];
  const verdict: Record<Relation, { zh: string; en: string }> = {
    shengTi: { zh: '有助於你', en: 'is in your favour' },
    biHe: { zh: '與你同氣，平穩', en: 'is in step with you and steady' },
    tiKe: { zh: '你能掌握', en: 'stays within your control' },
    tiSheng: { zh: '需要你多付出', en: 'asks more of you' },
    keTi: { zh: '對你形成壓力，宜預作準備', en: 'presses on you, so prepare ahead' },
  };
  const sources: SourceId[] = ['stages', stage === 'bian' ? 'order' : 'huTiFirst'];
  if (stage === 'bian') sources.push(r === 'keTi' ? 'bianKeTi' : r === 'shengTi' || r === 'biHe' ? 'bianShengTi' : 'order');
  return {
    id: `stage-${stage}`,
    tone: isGood(r) ? 'good' : r === 'tiSheng' ? 'neutral' : 'caution',
    zh: `${name}${t.name}（${ELEMENT_ZH[t.element]}）${lab.zh}，${when.zh}${verdict[r].zh}。`,
    en: `${en}, ${t.name} (${ELEMENT_ZH[t.element]}), ${lab.en}: ${when.en} ${verdict[r].en}.`,
    sources: [...new Set(sources)],
  };
}

export interface Analysis {
  season: Season;
  relations: { yong: Relation; huTi: Relation; huYong: Relation; bian: Relation };
  strengths: { ti: Strength; yong: Strength; huTi: Strength; huYong: Strength; bian: Strength };
  shengCount: number;
  keCount: number;
  statements: Statement[];
}

export function analyse(c: Cast, lunarMonth: number): Analysis {
  const season = seasonOfMonth(lunarMonth);
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
  out.push({ id: 'yong', tone: y.tone, zh: y.zh, en: y.en, sources: relations.yong === 'tiSheng' ? [y.src, 'tiShengLeak'] : [y.src] });

  // 2. 互 (體互 first) and 變.
  out.push(stageText('huTi', c.huTi, relations.huTi));
  if (c.huYong.num !== c.huTi.num || relations.huYong !== relations.huTi) out.push(stageText('huYong', c.huYong, relations.huYong));
  out.push(stageText('bian', c.bianTrigram, relations.bian));

  // 3. Beginning versus end: 用吉變凶 / 用凶變吉.
  const startGood = isGood(relations.yong);
  const endGood = isGood(relations.bian);
  if (startGood && !endGood) {
    out.push({ id: 'arc', tone: 'caution', sources: ['yongVsBian'], zh: '用吉而變不吉：開頭順利，後段宜留意變化，不要鬆懈。', en: 'Good at 用 but not at 變: a smooth start, but watch for changes later and do not relax too early.' });
  } else if (!startGood && endGood) {
    out.push({ id: 'arc', tone: 'good', sources: ['yongVsBian'], zh: '用不吉而變吉：開頭較難，後段漸入佳境。', en: 'Hard at 用 but good at 變: a difficult start that improves later.' });
  }

  // 4. Party counts among 互 and 變.
  const others = [c.huTi, c.huYong, c.bianTrigram];
  const tiParty = others.filter((t) => t.element === te).length;
  const yongParty = c.yong.element === te ? 0 : others.filter((t) => t.element === c.yong.element).length;
  if (tiParty >= 2 && tiParty > yongParty) {
    out.push({ id: 'party', tone: 'good', sources: ['party'], zh: `互、變之中有 ${tiParty} 卦與體同屬${ELEMENT_ZH[te]}：體黨多，你這一方較有力。`, en: `${tiParty} of the 互 and 變 trigrams share 體's element (${ELEMENT_ZH[te]}): 體's side is stronger.` });
  } else if (yongParty >= 2 && yongParty > tiParty) {
    out.push({ id: 'party', tone: 'caution', sources: ['party'], zh: `互、變之中有 ${yongParty} 卦與用同屬${ELEMENT_ZH[c.yong.element]}：用黨多，事情一方的力量較大。`, en: `${yongParty} of the 互 and 變 trigrams share 用's element (${ELEMENT_ZH[c.yong.element]}): the matter's side is stronger.` });
  }

  // 5. Tally of supporting and pressing trigrams.
  const all = [c.yong, c.huTi, c.huYong, c.bianTrigram];
  const sheng = all.filter((t) => relationToTi(te, t.element) === 'shengTi');
  const ke = all.filter((t) => relationToTi(te, t.element) === 'keTi');
  if (!sheng.length && !ke.length) {
    out.push({ id: 'tally', tone: 'neutral', sources: ['noShengKe'], zh: '卦中沒有生體或克體之卦：傳統上此時主要依本卦的卦辭來體會。', en: 'No trigram supports or presses on 體: tradition then reads mainly from the 本卦 text.' });
  } else if (sheng.length !== ke.length) {
    const more = sheng.length > ke.length;
    out.push({
      id: 'tally', tone: more ? 'good' : 'caution', sources: ['tally'],
      zh: `生體之卦 ${sheng.length}、克體之卦 ${ke.length}：整體${more ? '偏向有助' : '偏向有阻，宜多留餘地'}。`,
      en: `${sheng.length} trigram(s) support 體 and ${ke.length} press on it: overall ${more ? 'leaning favourable' : 'leaning difficult, so leave yourself margin'}.`,
    });
  } else {
    out.push({ id: 'tally', tone: 'neutral', sources: ['tally'], zh: `生體與克體之卦各 ${ke.length}：助力與阻力並存。`, en: `${ke.length} trigram(s) support 體 and as many press on it: help and resistance are mixed.` });
  }

  // 6. Seasonal strength of 體.
  const tiStrong = isStrong(strengths.ti);
  const seasonSrc = SEASON_SOURCE[season];
  const sl = SEASON_LABEL[season];
  out.push({
    id: 'season', tone: tiStrong ? 'good' : 'neutral', sources: [seasonSrc, 'wangShuai', 'tiShouldBeStrong'],
    zh: `時值${sl.zh}，體卦${c.ti.name}屬${ELEMENT_ZH[te]}，為「${strengths.ti}」：${tiStrong ? '體得時令，較有底氣。' : '體不當令，宜蓄力而行。'}`,
    en: `It is ${sl.en}; 體 ${c.ti.name} (${ELEMENT_ZH[te]}) is 「${strengths.ti}」 (${STRENGTH_EN[strengths.ti]}): ${tiStrong ? '體 is in season and has reserves.' : '體 is out of season, so build strength before pushing.'}`,
  });
  if (tiStrong && sheng.length) {
    out.push({ id: 'season-combo', tone: 'good', sources: ['strongWithSheng'], zh: '體得時令而又有生體之卦：傳統視為吉。', en: '體 is in season and also supported: tradition reads this as favourable.' });
  } else if (tiStrong && ke.length) {
    out.push({ id: 'season-combo', tone: 'neutral', sources: ['strongResists'], zh: '體得時令，雖有克體之卦，傳統認為影響不大。', en: '體 is in season, so tradition holds the pressing trigrams do little harm.' });
  } else if (!tiStrong && sheng.length) {
    out.push({ id: 'season-combo', tone: 'neutral', sources: ['weakWithSheng'], zh: '體雖不當令，但有生體之卦相助，弱勢可得緩解。', en: '體 is out of season, but a supporting trigram eases the weakness.' });
  } else if (!tiStrong && ke.length) {
    out.push({ id: 'season-combo', tone: 'caution', sources: ['weakWithKe'], zh: '體不當令而又有克體之卦：傳統視為壓力加重的時候，宜放慢腳步、穩妥為先。', en: '體 is out of season and also pressed: tradition reads extra strain, so slow down and put safety first.' });
  }
  for (const t of uniq(ke)) {
    if (isStrong(st(t))) out.push({ id: `ke-strong-${t.num}`, tone: 'caution', sources: ['helpersStrong'], zh: `克體之${t.name}正值「${st(t)}」，壓力較明顯。`, en: `The pressing trigram ${t.name} is 「${st(t)}」 (${STRENGTH_EN[st(t)]}), so its pressure is marked.` });
  }
  for (const t of uniq(sheng)) {
    if (isStrong(st(t))) out.push({ id: `sheng-strong-${t.num}`, tone: 'good', sources: ['helpersStrong'], zh: `生體之${t.name}正值「${st(t)}」，助力較足。`, en: `The supporting trigram ${t.name} is 「${st(t)}」 (${STRENGTH_EN[st(t)]}), so its help is strong.` });
  }

  // 7. What the supporting / pressing trigrams traditionally signify.
  for (const t of uniq(sheng)) out.push({ id: `sheng-${t.num}`, tone: 'good', sources: [`sheng${t.num}` as SourceId], ...SHENG_IMAGE[t.num] });
  for (const t of uniq(ke)) out.push({ id: `ke-${t.num}`, tone: 'caution', sources: [`ke${t.num}` as SourceId], ...KE_IMAGE[t.num] });

  return { season, relations, strengths, shengCount: sheng.length, keCount: ke.length, statements: out };
}

const uniq = (ts: Trigram[]) => ts.filter((t, i) => ts.findIndex((u) => u.num === t.num) === i);
