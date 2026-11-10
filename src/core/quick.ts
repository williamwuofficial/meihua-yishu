// Quick answers: one line per question, from the book's topic rules in 卷二「體用生克篇之二」.
//  - general: 「人事占」 reads 體 against 用, which 卷三 calls the most important relation (「卦用最緊」).
//  - weather: 「天時占」 ignores 體用 and counts the trigrams across 本, 互 and 變.
//  - lost, traveller, visit, travel, plan, recognition: 「失物占」「行人占」「謁見占」「出行占」「求謀占」「求名占」,
//    each with its own wording for the five relations; 失物 also says where to look from the 變 trigram.
// The book never says how many is "many" (多). This site counts the six trigrams of 本卦, 互卦 and 變卦
// and takes 「坎多」 to mean more 坎 than 離 (and so on); the Method page says so.
import type { Analysis, Relation, Season, Tone } from './analysis';
import type { Cast } from './cast';
import type { SourceId } from './sources';
import { ELEMENT_ZH, type Trigram } from './trigrams';

export type RelationTopic = 'lost' | 'traveller' | 'visit' | 'travel' | 'plan' | 'recognition';
export type Topic = 'general' | 'weather' | RelationTopic;
type T = { zh: string; en: string };

export type GeneralAnswer = Relation;
export type WeatherAnswer = 'rain' | 'clear' | 'bright' | 'overcast' | 'grey' | 'windy' | 'thunder' | 'clearing' | 'changeable';
export type AnswerKey = GeneralAnswer | WeatherAnswer | `${RelationTopic}.${Relation}`;

export interface QuickAnswer {
  topic: Topic;
  key: AnswerKey;
  tone: Tone;
  label: T;
  /** Why: the counts or the relation, in plain words. */
  reason: T;
  /** Extra notes (seasonal weather, wind, thunder). */
  notes: { text: T; sources: SourceId[] }[];
  sources: SourceId[];
}

const BASE_LABEL: Record<GeneralAnswer | WeatherAnswer, T> = {
  tiKe: { zh: '傾向順利', en: 'Leaning yes: it should go your way' },
  shengTi: { zh: '傾向順利，且有收穫', en: 'Leaning yes, with something gained' },
  biHe: { zh: '傾向順利', en: 'Leaning yes: things go smoothly' },
  tiSheng: { zh: '可以，但要付出不少', en: 'Possible, but it will cost you' },
  keTi: { zh: '傾向不順，宜謹慎', en: 'Leaning no: expect resistance' },
  rain: { zh: '傾向下雨', en: 'Leaning rain' },
  clear: { zh: '傾向晴天', en: 'Leaning clear' },
  bright: { zh: '傾向晴朗', en: 'Leaning bright and clear' },
  overcast: { zh: '傾向陰天', en: 'Leaning overcast' },
  grey: { zh: '傾向陰天，未必下雨', en: 'Leaning grey, maybe without rain' },
  windy: { zh: '傾向有風', en: 'Leaning windy' },
  thunder: { zh: '傾向有雷', en: 'Leaning thundery' },
  clearing: { zh: '傾向雨停轉晴', en: 'Leaning towards rain easing off' },
  changeable: { zh: '晴雨不定', en: 'Changeable' },
};

export const TOPIC_LABEL: Record<Topic, T> = {
  general: { zh: '一般', en: 'General' },
  weather: { zh: '天氣', en: 'Weather' },
  lost: { zh: '失物', en: 'Lost item' },
  traveller: { zh: '行人', en: 'Someone away' },
  visit: { zh: '見人', en: 'Seeing someone' },
  travel: { zh: '出行', en: 'Travel' },
  plan: { zh: '計畫', en: 'A plan' },
  recognition: { zh: '功名', en: 'Recognition' },
};

type Ans = { tone: Tone } & T;
/** Each topic's five answers, softened from the book (the original wording is in the cited rule). */
const TOPIC_ANSWERS: Record<RelationTopic, { noun: T; rule: SourceId; answers: Record<Relation, Ans> }> = {
  lost: {
    noun: { zh: '失物', en: 'the item' }, rule: 'lostRule',
    answers: {
      shengTi: { tone: 'good', zh: '容易找到', en: 'Easy to find' },
      tiKe: { tone: 'good', zh: '找得到，但要花些時間', en: 'You will find it, but it takes time' },
      biHe: { tone: 'good', zh: '東西其實沒有丟', en: 'It is not really lost' },
      tiSheng: { tone: 'neutral', zh: '一時難以找到', en: 'Hard to spot for now' },
      keTi: { tone: 'caution', zh: '不容易找回', en: 'Hard to get back' },
    },
  },
  traveller: {
    noun: { zh: '在外的人', en: 'the person away' }, rule: 'travellerRule',
    answers: {
      shengTi: { tone: 'good', zh: '很快就回來', en: 'Back soon' },
      biHe: { tone: 'good', zh: '幾天之內就回來', en: 'Back within days' },
      tiKe: { tone: 'neutral', zh: '會回來，但會晚一些', en: 'Coming back, but late' },
      tiSheng: { tone: 'neutral', zh: '還沒有要回來', en: 'Not on the way back yet' },
      keTi: { tone: 'caution', zh: '短期內不會回來', en: 'Not coming back soon' },
    },
  },
  visit: {
    noun: { zh: '想見的人', en: 'the person you want to see' }, rule: 'visitRule',
    answers: {
      biHe: { tone: 'good', zh: '相見愉快', en: 'A glad meeting' },
      shengTi: { tone: 'good', zh: '見得到，而且有收穫', en: 'You will see them, and gain from it' },
      tiKe: { tone: 'good', zh: '見得到', en: 'You will get to see them' },
      tiSheng: { tone: 'caution', zh: '不易見到，見了收穫也不大', en: 'Hard to see them, and little gained if you do' },
      keTi: { tone: 'caution', zh: '這次見不到', en: 'You will not see them this time' },
    },
  },
  travel: {
    noun: { zh: '這趟出行', en: 'the trip' }, rule: 'travelRule',
    answers: {
      biHe: { tone: 'good', zh: '出行順利', en: 'A smooth trip' },
      tiKe: { tone: 'good', zh: '可以去，此行多半順心', en: 'Go ahead: it should go your way' },
      shengTi: { tone: 'good', zh: '此行有意外收穫', en: 'An unexpected gain on the trip' },
      tiSheng: { tone: 'neutral', zh: '此行花費較多', en: 'The trip will cost you' },
      keTi: { tone: 'caution', zh: '此行不宜，宜謹慎或改期', en: 'Not a good time: take care, or go later' },
    },
  },
  plan: {
    noun: { zh: '所謀之事', en: 'the plan' }, rule: 'planRule',
    answers: {
      biHe: { tone: 'good', zh: '如願以償', en: 'It goes as you hope' },
      shengTi: { tone: 'good', zh: '不太費力就能成', en: 'It comes together without much effort' },
      tiKe: { tone: 'good', zh: '能成，但較慢', en: 'It will work, but slowly' },
      tiSheng: { tone: 'caution', zh: '費心多、收效少', en: 'Much effort, little result' },
      keTi: { tone: 'caution', zh: '這次難成，勉強反而不利', en: 'Unlikely this time; forcing it may backfire' },
    },
  },
  recognition: {
    noun: { zh: '功名', en: 'the recognition' }, rule: 'recognitionRule',
    answers: {
      biHe: { tone: 'good', zh: '如願以償', en: 'It goes as you hope' },
      shengTi: { tone: 'good', zh: '容易達成，且有收穫', en: 'Within easy reach, with something gained' },
      tiKe: { tone: 'good', zh: '有望，但會遲一些', en: 'Within reach, but it comes late' },
      tiSheng: { tone: 'caution', zh: '不易達成，並可能有所付出', en: 'Hard to reach, and it may cost you' },
      keTi: { tone: 'caution', zh: '這次難以如願', en: 'Unlikely this time' },
    },
  },
};

/** 失物占: where to look, from the 變 trigram (「又以變卦為失物之所在」). */
export const LOST_PLACE: Record<number, T> = {
  1: { zh: '西北方；或高處、樓上、公共場所，金屬或石頭旁，圓形容器裡。', en: 'North-west; or somewhere high, upstairs or in a public building, by metal or stone, or inside something round.' },
  2: { zh: '西方；或水邊，舊牆、破牆附近，廢棄的井或水池中。', en: 'West; or by water, near an old or broken wall, or in a disused well or pond.' },
  3: { zh: '南方；或廚房、爐灶旁、明亮的窗邊、空房間、文件旁。', en: 'South; or the kitchen, by the stove, a bright window, an empty room, or next to papers.' },
  4: { zh: '東方；或樹林、草叢中，樂器旁，熱鬧的地方或大路上。', en: 'East; or among trees or bushes, by musical instruments, somewhere busy, or on a main road.' },
  5: { zh: '東南方；或樹林、廟宇、菜園、船上，或木製家具、木盒裡。', en: 'South-east; or among trees, a temple, a vegetable garden, a boat, or inside wooden furniture or a box.' },
  6: { zh: '北方；多在水邊、井或水溝附近，或酒、醋、魚、鹽旁。', en: 'North; most likely near water, a well or a drain, or near wine, vinegar, fish or salt.' },
  7: { zh: '東北方；或山林中、路邊、石頭旁，或埋在土裡。', en: 'North-east; or in the hills or woods, by a path, next to rocks, or in soil.' },
  8: { zh: '西南方；或田野、倉庫、儲物處、地窖，或陶瓷、方形容器裡。', en: 'South-west; or a field, a storeroom or cellar, or inside pottery or a square container.' },
};

export const ANSWER_LABEL: Record<string, T> = { ...BASE_LABEL };
for (const [topic, d] of Object.entries(TOPIC_ANSWERS)) {
  for (const [rel, a] of Object.entries(d.answers)) ANSWER_LABEL[`${topic}.${rel}`] = { zh: a.zh, en: a.en };
}

/** The relation in plain words, with the topic's noun for 用. */
function relationReason(r: Relation, x: string, y: string, n: T): T {
  const N = n.en.charAt(0).toUpperCase() + n.en.slice(1);
  switch (r) {
    case 'tiKe': return { zh: `你（${x}）克${n.zh}（${y}）。`, en: `You (${x}) check ${n.en} (${y}).` };
    case 'shengTi': return { zh: `${n.zh}（${y}）生你（${x}）。`, en: `${N} (${y}) feeds you (${x}).` };
    case 'biHe': return { zh: `你（${x}）與${n.zh}（${y}）五行相同。`, en: `You (${x}) and ${n.en} (${y}) share an element.` };
    case 'tiSheng': return { zh: `你（${x}）生${n.zh}（${y}）。`, en: `You (${x}) feed ${n.en} (${y}).` };
    case 'keTi': return { zh: `${n.zh}（${y}）克你（${x}）。`, en: `${N} (${y}) checks you (${x}).` };
  }
}

function byTopic(topic: RelationTopic, c: Cast, a: Analysis): QuickAnswer {
  const d = TOPIC_ANSWERS[topic];
  const r = a.relations.yong;
  const ans = d.answers[r];
  const you = `${c.ti.name}${ELEMENT_ZH[c.ti.element]}`;
  const it = `${c.yong.name}${ELEMENT_ZH[c.yong.element]}`;
  const notes: QuickAnswer['notes'] = [];
  if (topic === 'lost') {
    const b = c.bianTrigram;
    notes.push({
      text: { zh: `去哪裡找（變卦${b.name}）：${LOST_PLACE[b.num].zh}`, en: `Where to look (changed trigram ${b.name}): ${LOST_PLACE[b.num].en}` },
      sources: ['lostWhere', `lost${b.num}` as SourceId],
    });
  }
  return {
    topic, key: `${topic}.${r}`, tone: ans.tone, label: { zh: ans.zh, en: ans.en },
    reason: relationReason(r, you, it, d.noun), notes, sources: [d.rule, 'order'],
  };
}

const GENERAL_TONE: Record<Relation, Tone> = { tiKe: 'good', shengTi: 'good', biHe: 'good', tiSheng: 'neutral', keTi: 'caution' };
/** Why, in plain words: Y = the matter, X = you. */
const GENERAL_WHY: Record<Relation, (x: string, y: string) => T> = {
  tiKe: (x, y) => ({ zh: `你（${x}）克所問之事（${y}）：你壓得住它。`, en: `You (${x}) check the matter (${y}): you have the upper hand.` }),
  shengTi: (x, y) => ({ zh: `所問之事（${y}）生你（${x}）：它對你有幫助。`, en: `The matter (${y}) feeds you (${x}): it works for you.` }),
  biHe: (x, y) => ({ zh: `你（${x}）與所問之事（${y}）五行相同：步調一致。`, en: `You (${x}) and the matter (${y}) share an element: you are in step.` }),
  tiSheng: (x, y) => ({ zh: `你（${x}）生所問之事（${y}）：你要為它付出。`, en: `You (${x}) feed the matter (${y}): it draws on you.` }),
  keTi: (x, y) => ({ zh: `所問之事（${y}）克你（${x}）：它會帶來壓力。`, en: `The matter (${y}) checks you (${x}): it puts pressure on you.` }),
};

function general(c: Cast, a: Analysis): QuickAnswer {
  const r = a.relations.yong;
  const you = `${c.ti.name}${ELEMENT_ZH[c.ti.element]}`;
  const it = `${c.yong.name}${ELEMENT_ZH[c.yong.element]}`;
  return {
    topic: 'general', key: r, tone: GENERAL_TONE[r], label: BASE_LABEL[r],
    reason: GENERAL_WHY[r](you, it),
    notes: [],
    sources: ['renShi', 'order'],
  };
}

const WEATHER_TONE: Record<WeatherAnswer, Tone> = {
  rain: 'neutral', clear: 'neutral', bright: 'neutral', overcast: 'neutral', grey: 'neutral',
  windy: 'neutral', thunder: 'neutral', clearing: 'neutral', changeable: 'neutral',
};
/** Which answer each trigram points to when it is the most common (「坤乃陰晦，乾主晴明…」). */
const BY_TRIGRAM: Record<string, WeatherAnswer> = { 乾: 'bright', 坤: 'overcast', 兌: 'grey', 艮: 'clearing', 巽: 'windy', 震: 'thunder' };

/** The six trigrams the weather rule looks at: 本卦, 互卦 and 變卦, upper and lower. */
export const weatherTrigrams = (c: Cast): Trigram[] => [c.ben.upper, c.ben.lower, c.hu.upper, c.hu.lower, c.bian.upper, c.bian.lower];

export function weather(c: Cast, season: Season): QuickAnswer {
  const tris = weatherTrigrams(c);
  const count = (n: string) => tris.filter((t) => t.name === n).length;
  const kan = count('坎'), li = count('離');
  const sources: SourceId[] = ['weatherNoTiYong', 'weatherAll', 'weatherMain'];
  let key: WeatherAnswer;
  if (kan !== li) key = kan > li ? 'rain' : 'clear';
  // 「重坎重離」: both doubled. One of each cancels out, and the other trigrams decide.
  else if (kan >= 2) { key = 'changeable'; sources.push('weatherKanLi'); }
  else {
    const others = ['乾', '坤', '兌', '艮', '巽', '震'].map((n) => [n, count(n)] as const).filter(([, k]) => k > 0);
    // Six trigrams with one 坎 and one 離 always leave four others, so `others` is never empty.
    const top = Math.max(...others.map(([, k]) => k));
    const leaders = others.filter(([, k]) => k === top).map(([n]) => n);
    if (leaders.length === 1) key = BY_TRIGRAM[leaders[0]];
    else if (leaders.includes('坤') && leaders.includes('艮')) key = 'overcast';
    else key = 'changeable';
    if (leaders.length > 1) sources.push('weatherQianKun');
  }
  const present = [...new Set(tris.map((t) => t.name))];
  const counts = present.map((n) => `${n} ${count(n)}`).join('、');
  const notes: QuickAnswer['notes'] = [];
  if (key !== 'windy' && count('巽') >= 2) notes.push({ text: { zh: '巽卦多，風可能較大。', en: 'Several 巽 trigrams: it may be windy.' }, sources: ['weatherMain'] });
  if (key !== 'thunder' && count('震') >= 2 && (season === 'spring' || season === 'summer')) notes.push({ text: { zh: '春夏震卦多，可能有雷。', en: 'Several 震 trigrams in spring or summer: thunder is possible.' }, sources: ['weatherMain'] });
  if (season === 'summer' && li > 0 && kan === 0) notes.push({ text: { zh: '夏天離多而無坎：傳統上主炎熱乾燥。', en: 'Summer with 離 and no 坎: traditionally hot and dry.' }, sources: ['weatherSeason'] });
  if (season === 'winter' && kan > 0 && li === 0) notes.push({ text: { zh: '冬天坎多而無離：傳統上主雨雪。', en: 'Winter with 坎 and no 離: traditionally rain or snow.' }, sources: ['weatherSeason'] });
  return {
    topic: 'weather', key, tone: WEATHER_TONE[key], label: BASE_LABEL[key],
    reason: { zh: `本卦、互卦、變卦共六個八卦中：${counts}。`, en: `Across the six trigrams of the main, nuclear and changed hexagrams: ${counts.replace(/、/g, ', ')}.` },
    notes, sources,
  };
}

export function quickAnswer(topic: Topic, c: Cast, a: Analysis): QuickAnswer {
  if (topic === 'weather') return weather(c, a.season);
  if (topic === 'general') return general(c, a);
  return byTopic(topic, c, a);
}
