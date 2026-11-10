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

export type RelationTopic = 'lost' | 'traveller' | 'visit' | 'travel' | 'plan' | 'recognition' | 'marriage' | 'home' | 'dwelling' | 'meal' | 'job';
export type Topic = 'general' | 'weather' | 'guess' | RelationTopic;
type T = { zh: string; en: string };

export type GeneralAnswer = Relation;
export type WeatherAnswer = 'rain' | 'clear' | 'bright' | 'overcast' | 'grey' | 'windy' | 'thunder' | 'clearing' | 'changeable';
export type AnswerKey = GeneralAnswer | WeatherAnswer | `${RelationTopic | 'guess'}.${Relation}`;

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
  guess: { zh: '猜物', en: 'Guess the object' },
  lost: { zh: '失物', en: 'Lost item' },
  traveller: { zh: '行人', en: 'Someone away' },
  visit: { zh: '見人', en: 'Seeing someone' },
  travel: { zh: '出行', en: 'Travel' },
  plan: { zh: '計畫', en: 'A plan' },
  recognition: { zh: '功名', en: 'Recognition' },
  marriage: { zh: '感情', en: 'Relationship' },
  home: { zh: '家宅', en: 'Home' },
  dwelling: { zh: '住處', en: 'A place to live' },
  meal: { zh: '飲食', en: 'A meal' },
  job: { zh: '換工作', en: 'Changing jobs' },
};

type Ans = { tone: Tone } & T;
/** Each topic's five answers, softened from the book (the original wording is in the cited rule). */
/** `borrowed`: not one of the book's eighteen; it uses the named rule by analogy (「以類而推」). */
const TOPIC_ANSWERS: Record<RelationTopic, { noun: T; rule: SourceId; borrowed?: boolean; answers: Record<Relation, Ans> }> = {
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
  marriage: {
    noun: { zh: '這段感情', en: 'the relationship' }, rule: 'marriageRule',
    answers: {
      biHe: { tone: 'good', zh: '彼此相合，是好緣分', en: 'A good match: you suit each other' },
      shengTi: { tone: 'good', zh: '容易有結果', en: 'Likely to come together' },
      tiKe: { tone: 'good', zh: '能成，但會慢一些', en: 'It can work, but slowly' },
      tiSheng: { tone: 'caution', zh: '不易有結果，你付出較多', en: 'Hard to come together; you give more than you get' },
      keTi: { tone: 'caution', zh: '這次較難有結果，不宜勉強', en: 'Unlikely to come together this time; do not force it' },
    },
  },
  home: {
    noun: { zh: '家宅', en: 'the home' }, rule: 'homeRule',
    answers: {
      biHe: { tone: 'good', zh: '家中安穩', en: 'Home is settled and calm' },
      tiKe: { tone: 'good', zh: '家中平安順利', en: 'Home life goes well' },
      shengTi: { tone: 'good', zh: '家中有進益，或有人送禮', en: 'Gains at home, or a gift arriving' },
      tiSheng: { tone: 'caution', zh: '開銷較多，留意門戶與財物', en: 'More outgoings; keep doors and valuables secure' },
      keTi: { tone: 'caution', zh: '家中近來多波折，宜多留心', en: 'A bumpy time at home; pay extra attention' },
    },
  },
  dwelling: {
    noun: { zh: '住處', en: 'the place' }, rule: 'dwellingRule',
    answers: {
      biHe: { tone: 'good', zh: '住得安穩', en: 'A settled place to live' },
      tiKe: { tone: 'good', zh: '住得好', en: 'Good to live in' },
      shengTi: { tone: 'good', zh: '住進去會越來越興旺', en: 'Things look up after you move in' },
      tiSheng: { tone: 'caution', zh: '住進去開銷會變大', en: 'Living there costs you more' },
      keTi: { tone: 'caution', zh: '這裡不太適合，宜再考慮', en: 'Not a good fit; think it over again' },
    },
  },
  meal: {
    noun: { zh: '飲食', en: 'the meal' }, rule: 'mealRule',
    answers: {
      shengTi: { tone: 'good', zh: '豐盛', en: 'A generous meal' },
      biHe: { tone: 'good', zh: '吃得豐足', en: 'Plenty to eat' },
      tiKe: { tone: 'neutral', zh: '吃得到，但有些阻滯', en: 'You will eat, after some hold-up' },
      tiSheng: { tone: 'neutral', zh: '不太容易吃成', en: 'Hard to arrange' },
      keTi: { tone: 'neutral', zh: '恐怕吃不成', en: 'It may not happen' },
    },
  },
  job: {
    noun: { zh: '換工作這件事', en: 'the job change' }, rule: 'planRule', borrowed: true,
    answers: {
      biHe: { tone: 'good', zh: '換得如願', en: 'The change goes as you hope' },
      shengTi: { tone: 'good', zh: '換得順利，不太費力', en: 'The change comes easily' },
      tiKe: { tone: 'good', zh: '能換成，但較慢', en: 'It works out, but slowly' },
      tiSheng: { tone: 'caution', zh: '要花很多心力，收效有限', en: 'Much effort for a modest result' },
      keTi: { tone: 'caution', zh: '現在換不太順，宜再想想', en: 'Not a smooth time to change; think it over' },
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

// ---- 射覆: guess a hidden object (卷三「占物類例」「物數為體訣」「觀物趣時訣」「萬物戲驗」) ----

/** What kind of thing, from 體 against 用 (「生體者，為可食之物…」). 「穢物」 is softened. */
const GUESS_NATURE: Record<Relation, T> = {
  shengTi: { zh: '可以吃的，或貴重的東西', en: 'Something you can eat, or something valuable' },
  keTi: { zh: '平常、不值錢的隨身小物', en: 'An everyday, low-value thing kept close at hand' },
  tiSheng: { zh: '還沒做好、或已經用不上的東西', en: 'Something unfinished, or no longer of use' },
  tiKe: { zh: '破損、有缺口的東西', en: 'Something broken, chipped or damaged' },
  biHe: { zh: '完整、好用的器物', en: 'A whole, usable object' },
};
/** Material, colour and shape by trigram (「萬物戲驗」, 離 also 「中虛」 from 「占物類例」). */
const GUESS_TRIGRAM: Record<number, T> = {
  1: { zh: '乾：圓形、白色、堅硬，像金屬或值錢的東西', en: '乾: round, white and hard, like metal or something valuable' },
  2: { zh: '兌：有缺口、破損，或有開口的東西', en: '兌: chipped or broken, or something with an opening' },
  3: { zh: '離：質地柔、中空，或燒過的東西（像炭）', en: '離: soft or hollow, or something burnt, like charcoal' },
  4: { zh: '震：竹子或木頭做的東西', en: '震: something of bamboo or wood' },
  5: { zh: '巽：竹子或木頭做的東西', en: '巽: something of bamboo or wood' },
  6: { zh: '坎：黑色、柔軟、跟水有關的東西', en: '坎: black and soft, to do with water' },
  7: { zh: '艮：泥土、陶瓦或石頭類，黃色', en: '艮: clay, pottery or stone, yellowish' },
  8: { zh: '坤：從土裡來的東西，黃色，質地溫和', en: '坤: something from the earth, yellow and mild in texture' },
};

export function guess(c: Cast, a: Analysis): QuickAnswer {
  const r = a.relations.yong;
  const you = `${c.ti.name}${ELEMENT_ZH[c.ti.element]}`;
  const it = `${c.yong.name}${ELEMENT_ZH[c.yong.element]}`;
  const notes: QuickAnswer['notes'] = [];
  // Material and colour from the 互 trigrams; the number from their 先天 numbers, two if doubled.
  const hu = c.huTi.num === c.huYong.num ? [c.huTi] : [c.huTi, c.huYong];
  notes.push({
    text: { zh: `材質與顏色（互卦）：${hu.map((t) => GUESS_TRIGRAM[t.num].zh).join('；')}。`, en: `Material and colour (nuclear trigrams): ${hu.map((t) => GUESS_TRIGRAM[t.num].en).join('; ')}.` },
    sources: ['guessHu', ...hu.map((t) => `guess${t.num}` as SourceId)],
  });
  const nums = [...new Set([c.huTi.num, c.huYong.num])].sort((x, y) => x - y);
  notes.push({
    text: hu.length === 1
      ? { zh: `數量：兩件（互卦重${hu[0].name}）。`, en: `How many: two (the nuclear trigram ${hu[0].name} is doubled).` }
      : { zh: `數量：${nums.join(' 或 ')} 件左右。`, en: `How many: about ${nums.join(' or ')}.` },
    sources: ['guessHu'],
  });
  if (c.huTi.num === 3 || c.huYong.num === 3) notes.push({ text: { zh: '互卦見離：可能是中空的東西，甚至手裡根本沒東西。', en: '離 in the nuclear trigrams: it may be hollow, or the hand may even be empty.' }, sources: ['guessLiEmpty'] });
  // Hard or soft from the yang and yin lines of the main hexagram.
  const yang = c.ben.lines.filter((l) => l === 1).length;
  if (yang !== 3) notes.push({ text: yang > 3 ? { zh: '軟硬：陽爻多，偏硬。', en: 'Hard or soft: more yang lines, so on the hard side.' } : { zh: '軟硬：陰爻多，偏軟。', en: 'Hard or soft: more yin lines, so on the soft side.' }, sources: ['guessHardSoft'] });
  if (c.moving >= 5) notes.push({ text: { zh: '動爻在第五、六爻：多半是會動、會飛的東西。', en: 'The moving line is the fifth or sixth: often something that can move or fly.' }, sources: ['guessFlying'] });
  // Season hints from the main hexagram's trigrams (「觀物趣時訣」).
  const has = (n: string) => c.ben.upper.name === n || c.ben.lower.name === n;
  const seasonal: T | null =
    a.season === 'spring' && (has('震') || has('離')) ? { zh: '春天見震或離：可能是花。', en: 'Spring with 震 or 離: perhaps a flower.' }
    : a.season === 'summer' && has('震') ? { zh: '夏天見震：可能是會發出聲音的東西。', en: 'Summer with 震: perhaps something that makes a sound.' }
    : a.season === 'autumn' && has('兌') ? { zh: '秋天見兌：可能是有破損的器物。', en: 'Autumn with 兌: perhaps a damaged utensil.' }
    : a.season === 'winter' && has('坤') ? { zh: '冬天見坤：可能是沒什麼用的土石之物。', en: 'Winter with 坤: perhaps some useless bit of earth or stone.' }
    : null;
  if (seasonal) notes.push({ text: seasonal, sources: ['guessSeason'] });
  // The moving line's text, as the book reads 「潛龍勿用」 as an unusable thing.
  const line = c.ben.text.lines[c.moving - 1];
  notes.push({ text: { zh: `爻辭線索：${c.ben.text.name}${line.label}「${line.text}」`, en: `Line-text clue: ${c.ben.text.name} ${line.label} 「${line.text}」` }, sources: ['guessLineText'] });
  return {
    topic: 'guess', key: `guess.${r}`, tone: 'neutral', label: GUESS_NATURE[r],
    reason: relationReason(r, you, it, { zh: '所藏之物', en: 'the hidden object' }), notes,
    sources: ['guessTiYong', 'guessExample1', 'guessExample2'],
  };
}

export const ANSWER_LABEL: Record<string, T> = { ...BASE_LABEL };
for (const [rel, t] of Object.entries(GUESS_NATURE)) ANSWER_LABEL[`guess.${rel}`] = t;
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
  if (topic === 'meal') {
    // 「卦中有坎則有酒，有兌則有食。無坎無兌，則皆無。」
    const names = weatherTrigrams(c).map((t) => t.name);
    const kan = names.includes('坎'), dui = names.includes('兌');
    const text: T = kan && dui ? { zh: '卦中有坎有兌：有酒也有好菜。', en: '坎 and 兌 both appear: drinks and good food.' }
      : kan ? { zh: '卦中有坎：席上有酒。', en: '坎 appears: there will be drinks.' }
      : dui ? { zh: '卦中有兌：有好吃的。', en: '兌 appears: there will be good food.' }
      : { zh: '卦中無坎無兌：傳統上主酒菜都不多。', en: 'No 坎 or 兌: traditionally, not much to eat or drink.' };
    notes.push({ text, sources: ['mealKanDui'] });
  }
  if (d.borrowed) {
    notes.push({
      text: { zh: '書中沒有這一類，依「以類而推」借用「求謀占」的規則。這是重大決定：以上只是傳統占法的看法，請依實際情況衡量。', en: 'The book has no such category, so this borrows its rule for plans, as the book allows. It is a big decision: this is only the tradition\'s reading, so weigh it on its real merits.' },
      sources: ['byAnalogy'],
    });
  }
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
  if (topic === 'guess') return guess(c, a);
  return byTopic(topic, c, a);
}
