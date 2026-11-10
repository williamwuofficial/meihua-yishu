// Opt-in local history. Stored only in this browser's localStorage; nothing is ever sent anywhere.
const KEY_ON = 'meihua.history.on';
const KEY_DATA = 'meihua.history';

export interface Entry {
  id: string;
  at: string; // ISO time the cast was made
  question: string;
  method: 'time' | 'numbers';
  /** Local date-time used for the cast, yyyy-mm-ddThh:mm. */
  when: string;
  a?: number;
  b?: number;
  addHour?: boolean;
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
export function addHistory(e: Omit<Entry, 'id' | 'at'>) {
  if (!historyOn()) return;
  save([{ ...e, id: crypto.randomUUID(), at: new Date().toISOString() }, ...loadHistory()]);
}
export const deleteHistory = (id: string) => save(loadHistory().filter((e) => e.id !== id));
export const clearHistory = () => safe(() => localStorage.removeItem(KEY_DATA), undefined);
