// Common questions for quick mode. Each uses the book's rule for its topic (卷二「體用生克篇之二」).
// Every preset has a different character count (see charCount), so each gets its own hexagram.
// Money, health and legal questions are left out on purpose: the app gives no financial, medical or legal advice.
import type { Topic } from './core/quick';

export type Group = 'everyday' | 'plans' | 'people' | 'weather';
export interface Preset { id: string; group: Group; topic: Topic; zh: string; en: string }

export const GROUPS: { id: Group; zh: string; en: string }[] = [
  { id: 'everyday', zh: '一般', en: 'Everyday' },
  { id: 'plans', zh: '計畫與目標', en: 'Plans and goals' },
  { id: 'people', zh: '找人、找東西', en: 'People and lost things' },
  { id: 'weather', zh: '天氣', en: 'Weather' },
];

export const PRESETS: Preset[] = [
  { id: 'go-well', group: 'everyday', topic: 'general', zh: '這件事會順利嗎？', en: 'Will this go well?' },
  { id: 'start-today', group: 'everyday', topic: 'general', zh: '今天適合開始新的事嗎？', en: 'Is today a good day to start something new?' },
  { id: 'relationship', group: 'everyday', topic: 'general', zh: '這段關係會順利嗎？', en: 'Will this relationship go well?' },
  { id: 'plan', group: 'plans', topic: 'plan', zh: '我正在進行的計畫能成功嗎？', en: 'Will the plan I am working on succeed?' },
  { id: 'recognition', group: 'plans', topic: 'recognition', zh: '這次的考試、應徵或升遷有希望嗎？', en: 'Is there hope for this exam, application or promotion?' },
  { id: 'trip', group: 'plans', topic: 'travel', zh: '出行順利嗎？', en: 'Will the trip go smoothly?' },
  { id: 'lost', group: 'people', topic: 'lost', zh: '我的東西找得回來嗎？', en: 'Will I find what I lost?' },
  { id: 'traveller', group: 'people', topic: 'traveller', zh: '出門在外的人什麼時候會回來？', en: 'When will the person who is away come back?' },
  { id: 'visit', group: 'people', topic: 'visit', zh: '我能見到想見的那個人嗎？', en: 'Will I get to see the person I want to see?' },
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
