// Common questions for quick mode. Each uses the book's rule for its topic (卷二「體用生克篇之二」).
// Every preset has a different character count (see charCount), so each gets its own hexagram.
// Money, health and legal questions are left out on purpose: the app gives no financial, medical or legal advice.
import type { Topic } from './core/quick';

export type Group = 'everyday' | 'plans' | 'people' | 'weather';
export interface Preset {
  id: string; group: Group; topic: Topic; zh: string; en: string;
  /** Ask for a number and cast by it plus the hour (卷一「物數占例」), so each round of a game differs. */
  needsNumber?: boolean;
}

/** `short` labels the one-row picker; the full name heads the question list. */
export const GROUPS: { id: Group; zh: string; en: string; short: { zh: string; en: string } }[] = [
  { id: 'everyday', zh: '生活', en: 'Everyday life', short: { zh: '生活', en: 'Life' } },
  { id: 'plans', zh: '計畫與目標', en: 'Plans and goals', short: { zh: '計畫', en: 'Plans' } },
  { id: 'people', zh: '找人、找東西、猜東西', en: 'People, lost things and guessing', short: { zh: '尋找', en: 'Finding' } },
  { id: 'weather', zh: '天氣', en: 'Weather', short: { zh: '天氣', en: 'Weather' } },
];

export const PRESETS: Preset[] = [
  { id: 'go-well', group: 'everyday', topic: 'general', zh: '這件事會順利嗎？', en: 'Will this go well?' },
  { id: 'start-today', group: 'everyday', topic: 'general', zh: '今天適合開始新的事嗎？', en: 'Is today a good day to start something new?' },
  { id: 'relationship', group: 'everyday', topic: 'marriage', zh: '這段感情有結果嗎？', en: 'Will this relationship come to something?' },
  { id: 'home', group: 'everyday', topic: 'home', zh: '最近家中大小事情都會平安順利嗎？', en: 'Will things at home go smoothly lately?' },
  { id: 'move', group: 'everyday', topic: 'dwelling', zh: '如果搬去那個新的地方住，會住得好嗎？', en: 'If I move to the new place, will it be good to live in?' },
  { id: 'meal', group: 'everyday', topic: 'meal', zh: '今天這一頓午餐、晚餐或聚餐會吃得豐盛嗎？', en: 'Will today\'s lunch, dinner or get-together be a good meal?' },
  { id: 'plan', group: 'plans', topic: 'plan', zh: '我正在進行的計畫能成功嗎？', en: 'Will the plan I am working on succeed?' },
  { id: 'job', group: 'plans', topic: 'job', zh: '如果我換一份新的工作，接下來會順利嗎？', en: 'If I change jobs, will it go well?' },
  { id: 'recognition', group: 'plans', topic: 'recognition', zh: '這次的考試、應徵或升遷有希望嗎？', en: 'Is there hope for this exam, application or promotion?' },
  { id: 'trip', group: 'plans', topic: 'travel', zh: '出行順利嗎？', en: 'Will the trip go smoothly?' },
  { id: 'lost', group: 'people', topic: 'lost', zh: '我的東西找得回來嗎？', en: 'Will I find what I lost?' },
  { id: 'traveller', group: 'people', topic: 'traveller', zh: '出門在外的人什麼時候會回來？', en: 'When will the person who is away come back?' },
  { id: 'visit', group: 'people', topic: 'visit', zh: '我能見到想見的那個人嗎？', en: 'Will I get to see the person I want to see?' },
  { id: 'guess', group: 'people', topic: 'guess', needsNumber: true, zh: '請朋友把一樣東西藏在手裡或杯下，猜猜是什麼？', en: 'Have a friend hide something in their hand or under a cup: what is it?' },
  { id: 'rain-today', group: 'weather', topic: 'weather', zh: '今天會下雨嗎？', en: 'Will it rain today?' },
  { id: 'weather-today', group: 'weather', topic: 'weather', zh: '天氣如何？', en: 'What will the weather be like?' },
];

export const preset = (id: string | undefined) => PRESETS.find((p) => p.id === id);

/**
 * The number added to a quick cast: how many characters the question has (punctuation not counted).
 * 卷二「起卦加數例」 adds a number so that people asking at the same hour do not share one hexagram,
 * and the book counts characters elsewhere (卷一「字占」). The presets are worded so no two share a count.
 */
export const charCount = (zh: string) => [...zh].filter((ch) => /[㐀-鿿]/.test(ch)).length;
