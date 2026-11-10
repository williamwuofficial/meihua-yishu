// Rendering helpers shared by the pages.
import type { Hexagram } from '../core/hexagram';
import { PINYIN } from '../core/hexagram';
import { SOURCES, WORKS, type SourceId } from '../core/sources';
import { ELEMENT_ZH, type Trigram } from '../core/trigrams';
import { getLang, t, zh } from '../i18n/lang';

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** One expandable citation per work + section, listing every quote from it. */
export function cite(ids: SourceId[]): string {
  const groups = new Map<string, SourceId[]>();
  for (const id of new Set(ids)) {
    const k = `${SOURCES[id].work}|${SOURCES[id].section}`;
    groups.set(k, [...(groups.get(k) ?? []), id]);
  }
  const colon = getLang() === 'en' ? ': ' : '：';
  return [...groups.values()]
    .map((g) => {
      const s = SOURCES[g[0]];
      const w = WORKS[s.work];
      const work = getLang() === 'en' ? `${w.en} · ${zh(w.zh)}` : zh(w.zh);
      return `<details class="cite"><summary>${t('source')}${colon}${esc(work)}「${esc(zh(s.section))}」</summary>`
        + g.map((id) => `<blockquote lang="zh-Hant">${esc(zh(SOURCES[id].verse))}</blockquote>`).join('')
        + `<a href="${w.url}" target="_blank" rel="noopener">Wikisource ↗</a></details>`;
    })
    .join('');
}

export const hexName = (h: Hexagram) => {
  const n = zh(h.fullName);
  if (getLang() !== 'en') return n;
  return `${n} · ${PINYIN[h.text.number - 1]} · ${h.upper.en} over ${h.lower.en}`;
};

export const triLabel = (tr: Trigram) =>
  `${tr.symbol} ${zh(tr.name)}${zh(ELEMENT_ZH[tr.element])}${getLang() === 'en' ? ` (${tr.en})` : ''}`;
