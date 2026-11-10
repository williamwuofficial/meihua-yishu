import type { Topic } from './core/quick';

// Opt-in local history. Stored only in this browser's localStorage; nothing is ever sent anywhere.
const KEY_ON = 'meihua.history.on';
const KEY_DATA = 'meihua.history';

export interface Entry {
  id: string;
  at: string; // ISO time the cast was made
  question: string;
  method: 'time' | 'numbers';
  /** Kind of question and its quick answer (absent on entries saved before topics existed). */
  topic?: Topic;
  /** Quick-mode preset id; the question text is then the preset's Traditional wording. */
  presetId?: string;
  mode?: 'quick' | 'advanced';
  answer?: string;
  /** Local date-time used for the cast, yyyy-mm-ddThh:mm. */
  when: string;
  a?: number;
  b?: number;
  addHour?: boolean;
  /** Extra number added to the time sums (卷二「起卦加數例」). */
  extra?: number;
  /** Settings in force when cast, so reopening gives the same hexagrams. */
  ziNextDay?: boolean;
  seasonBasis?: 'lunarMonth' | 'solarTerm';
  /** Summary for the list: 本卦 and 變卦 full names, moving line. */
  ben?: string;
  bian?: string;
  moving?: number;
}

const safe = <T>(f: () => T, fallback: T): T => { try { return f(); } catch { return fallback; } };

export const historyOn = () => safe(() => localStorage.getItem(KEY_ON) === '1', false);
export function setHistoryOn(on: boolean) {
  safe(() => {
    if (on) localStorage.setItem(KEY_ON, '1');
    else { localStorage.removeItem(KEY_ON); localStorage.removeItem(KEY_DATA); }
  }, undefined);
}
export const loadHistory = (): Entry[] => safe(() => JSON.parse(localStorage.getItem(KEY_DATA) ?? '[]') as Entry[], []);
const save = (es: Entry[]) => safe(() => localStorage.setItem(KEY_DATA, JSON.stringify(es.slice(0, 200))), undefined);
export function addHistory(e: Omit<Entry, 'id' | 'at'>): string | null {
  if (!historyOn()) return null;
  const id = crypto.randomUUID();
  save([{ ...e, id, at: new Date().toISOString() }, ...loadHistory()]);
  return id;
}
export const deleteHistory = (id: string) => save(loadHistory().filter((e) => e.id !== id));
export const clearHistory = () => safe(() => localStorage.removeItem(KEY_DATA), undefined);
export const historyEntry = (id: string) => loadHistory().find((e) => e.id === id);
