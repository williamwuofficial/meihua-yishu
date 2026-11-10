import t2s from './t2s.json';
import { STR, type Lang, type StrKey } from './strings';

const MAP = t2s as Record<string, string>;
let current: Lang = 'zh-TW';

export const getLang = () => current;
export const setLang = (l: Lang) => { current = l; };

/** Convert Traditional text for the current script (no-op unless Simplified). */
export const zh = (s: string) => (current === 'zh-CN' ? toSimplified(s) : s);
/** Words a character-by-character map gets wrong: 計畫 → 计划 (not 计画), 應徵 → 应征 (徵 is kept elsewhere for the note 徵). */
const PHRASES: [string, string][] = [['計畫', '计划'], ['應徵', '应征']];
export const toSimplified = (s: string) =>
  PHRASES.reduce((acc, [tw, cn]) => acc.split(tw).join(cn), s).replace(/[㐀-鿿]/g, (c) => MAP[c] ?? c);

/** A UI string in the current language. */
export const t = (k: StrKey) => (current === 'en' ? STR[k].en : zh(STR[k].zh));
/** Pick between authored zh / en text. */
export const pick = (o: { zh: string; en: string }) => (current === 'en' ? o.en : zh(o.zh));

export function detectLang(saved: string | null): Lang {
  if (saved === 'zh-TW' || saved === 'zh-CN' || saved === 'en') return saved;
  const nav = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase();
  if (nav.startsWith('zh-cn') || nav.startsWith('zh-sg') || nav === 'zh-hans') return 'zh-CN';
  if (nav.startsWith('en')) return 'en';
  return 'zh-TW';
}
