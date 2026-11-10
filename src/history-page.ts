// History page: the questions asked on this device, newest first. Everything stays in localStorage.
import { clearHistory, deleteHistory, historyOn, loadHistory, setHistoryOn, type Entry } from './history';
import { ANSWER_LABEL, TOPIC_LABEL } from './core/quick';
import { getLang, pick, t, zh } from './i18n/lang';
import { preset } from './presets';
import { esc } from './ui/common';
import { mount } from './ui/shell';

let query = '';

/** The time the cast was made for (the form's date-time), shown in the reader's locale. */
function when(e: Entry) {
  const d = new Date(e.when);
  const locale = getLang() === 'en' ? 'en' : getLang() === 'zh-CN' ? 'zh-CN' : 'zh-TW';
  return Number.isNaN(d.getTime()) ? e.when.replace('T', ' ') : d.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}

function methodLabel(e: Entry) {
  if (e.mode === 'quick') return t('modeQuick');
  if (e.method === 'time') return `${t('methodTime')}${e.extra ? ` + ${e.extra}` : ''}`;
  return e.b === undefined ? `${t('methodOne')} ${e.a}` : `${t('methodTwo')} ${e.a}, ${e.b}`;
}

function item(e: Entry) {
  const ans = e.answer && e.answer in ANSWER_LABEL
    ? `<p class="hist-answer">${esc(pick(TOPIC_LABEL[e.topic ?? 'general'] ?? TOPIC_LABEL.general))} · <strong>${esc(pick(ANSWER_LABEL[e.answer]))}</strong></p>` : '';
  const hex = e.ben ? `<span class="hx" lang="zh-Hant">${esc(zh(e.ben))} → ${esc(zh(e.bian ?? ''))}</span>` : '';
  return `<li class="hist-item">
    <p class="hq">${esc(preset(e.presetId) ? pick(preset(e.presetId)!) : e.question || t('noQuestion'))}</p>${ans}
    <p class="meta">${esc(when(e))} · ${esc(methodLabel(e))}${hex ? ` · ${hex}` : ''}</p>
    <p class="actions"><a href="./?open=${encodeURIComponent(e.id)}">${t('open')}</a>
      <button type="button" class="link" data-del="${esc(e.id)}">${t('delete')}</button></p>
  </li>`;
}

function listHtml() {
  const all = loadHistory();
  const q = query.trim().toLowerCase();
  const shown = q ? all.filter((e) => e.question.toLowerCase().includes(q) || zh(e.question).toLowerCase().includes(q)) : all;
  if (!all.length) return `<p class="hint">${t('historyEmpty')} <a href="./">${t('navCast')} →</a></p>`;
  return `<p class="hint">${t('count').replace('{n}', String(all.length))}</p>`
    + (shown.length ? `<ul class="hist-list">${shown.map(item).join('')}</ul>` : `<p class="hint">${t('noMatch')}</p>`);
}

function body() {
  if (!historyOn()) {
    return `<section class="card"><p>${t('historyOffIntro')}</p>
      <button type="button" id="turn-on" class="primary">${t('turnOn')}</button></section>`;
  }
  return `<section class="card">
      <p class="hint">${t('historyIntro')}</p>
      <label class="field narrow"><span class="label">${t('search')}</span>
        <input type="search" id="search" value="${esc(query)}" autocomplete="off"></label>
      <div id="list">${listHtml()}</div>
    </section>
    <section class="card danger-zone">
      ${loadHistory().length ? `<button type="button" id="clear" class="secondary">${t('clearAll')}</button>` : ''}
      <button type="button" id="turn-off" class="secondary">${t('turnOff')}</button>
    </section>`;
}

const render = mount('history', 'historyTitle', body);

document.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.id !== 'search') return;
  query = el.value;
  document.getElementById('list')!.innerHTML = listHtml();
});

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest('button');
  if (!el) return;
  if (el.id === 'turn-on') { setHistoryOn(true); render(); }
  else if (el.id === 'turn-off') { if (!loadHistory().length || confirm(t('confirmOff'))) { setHistoryOn(false); render(); } }
  else if (el.id === 'clear') { if (confirm(t('confirmClear'))) { clearHistory(); render(); } }
  else if (el.dataset.del) { deleteHistory(el.dataset.del); document.getElementById('list')!.innerHTML = listHtml(); }
});

// Another tab may add a cast while this page is open.
window.addEventListener('storage', (e) => { if (e.key?.startsWith('meihua.history')) render(); });
