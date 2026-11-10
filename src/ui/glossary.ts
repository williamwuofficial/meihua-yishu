// Tap-to-explain terms. Each term is a button that opens a native popover; the full list also
// appears in a "What the terms mean" section, so browsers without popover support still get it.
import { esc } from './common';
import { pick, zh } from '../i18n/lang';

type T = { zh: string; en: string };
export const GLOSSARY: Record<string, { term: string; text: T }> = {
  ti: { term: '體', text: { zh: '代表你自己，也就是問事的人。卦中沒有變動的那一半。', en: 'You, the person asking: the half of the hexagram that does not change.' } },
  yong: { term: '用', text: { zh: '代表你所問的事。卦中有變動（動爻）的那一半。', en: 'The matter you ask about: the half that holds the moving line.' } },
  ben: { term: '本卦', text: { zh: '起出的卦，代表事情的開始與現況。', en: 'The hexagram you cast: how things start and stand now.' } },
  hu: { term: '互卦', text: { zh: '從本卦中間四爻取出的兩個八卦，代表事情發展的過程。', en: 'Two trigrams taken from the middle four lines: how things unfold.' } },
  bian: { term: '變卦', text: { zh: '把動爻陰陽互換後得到的卦，代表事情的結果。', en: 'The hexagram after the moving line flips: where things end up.' } },
  moving: { term: '動爻', text: { zh: '六條爻中「會變」的那一條（圖中紅色），由起卦的數字決定。', en: 'The one line of six that changes (red in the drawing), set by the cast numbers.' } },
  sheng: { term: '生', text: { zh: '五行相生：一方滋養另一方，例如木生火。「生體」就是有助力。', en: 'One element feeds another, as wood feeds fire. Something that feeds 體 is help.' } },
  ke: { term: '克', text: { zh: '五行相克：一方壓制另一方，例如水克火。「克體」就是有壓力。', en: 'One element checks another, as water puts out fire. Something that checks 體 is pressure.' } },
  bihe: { term: '比和', text: { zh: '兩者五行相同，同氣相合，平穩順遂。', en: 'Both share an element: in step and steady.' } },
  wang: { term: '旺相休囚死', text: { zh: '五行在不同季節的強弱，由強到弱。你的卦當令（旺、相）較有底氣。', en: 'How strong an element is in the current season, strongest to weakest. When your trigram is in season (旺 or 相) you have more reserves.' } },
};

/** A term chip that opens its explanation. `label` defaults to the term itself. */
export function termBtn(key: keyof typeof GLOSSARY, label?: string) {
  const g = GLOSSARY[key];
  return `<button type="button" class="term" popovertarget="g-${key}" title="${esc(pick(g.text))}">${esc(label ?? zh(g.term))}</button>`;
}

/** The popovers (once per page) and the visible list. */
export function glossaryHtml(title: string) {
  const items = Object.entries(GLOSSARY);
  const pops = items.map(([k, g]) => `<div popover id="g-${k}" class="pop"><strong>${esc(zh(g.term))}</strong> ${esc(pick(g.text))}</div>`).join('');
  const list = items.map(([, g]) => `<dt>${esc(zh(g.term))}</dt><dd>${esc(pick(g.text))}</dd>`).join('');
  return `${pops}<details class="more glossary"><summary>${esc(title)}</summary><dl>${list}</dl></details>`;
}
