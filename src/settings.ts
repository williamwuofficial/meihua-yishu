// User settings, kept in this browser's localStorage only.
export interface Settings {
  /** Season for 旺相休囚死: by lunar month number (default) or by solar-term month (月建). */
  seasonBasis: 'lunarMonth' | 'solarTerm';
  /** Count 23:00–24:00 as the next lunar day (子時 starts the day). */
  ziNextDay: boolean;
  /** Default for "add the hour number to the moving line" with two numbers. */
  addHour: boolean;
}

export const DEFAULTS: Settings = { seasonBasis: 'lunarMonth', ziNextDay: true, addHour: true };
const KEY = 'meihua.settings';

export function loadSettings(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Settings>;
    return {
      seasonBasis: raw.seasonBasis === 'solarTerm' ? 'solarTerm' : 'lunarMonth',
      ziNextDay: raw.ziNextDay !== false,
      addHour: raw.addHour !== false,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: Settings) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage blocked: settings last for this page only */ }
}

export function resetSettings() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
