import './style.css';
import { analyse, RELATION_LABEL, SEASON_LABEL, STRENGTH_EN, type Analysis, type Relation } from './core/analysis';
import { branchNumber, castFromNumbers, enteredNumbers, lunarMoment, timeNumbers, type Cast, type CastNumbers, type LunarMoment } from './core/cast';
import { PINYIN, type Hexagram } from './core/hexagram';
import { SOURCES, WORKS, type SourceId } from './core/sources';
import { ELEMENT_ZH, type Trigram } from './core/trigrams';
import { addHistory, clearHistory, deleteHistory, historyOn, loadHistory, setHistoryOn, type Entry } from './history';
import { detectLang, getLang, pick, setLang, t, zh } from './i18n/lang';
import type { Lang } from './i18n/strings';
import { hexSvg } from './ui/hexsvg';

const REPO = 'https://github.com/williamwuofficial/meihua-yishu';
const SISTER = 'https://williamwuofficial.github.io/ziwei-chart/';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

interface State {
  question: string;
  method: 'time' | 'numbers';
  when: string;
  a: string;
  b: string;
  addHour: boolean;
  result: { cast: Cast; moment: LunarMoment; analysis: Analysis; method: 'time' | 'numbers' } | null;
  error: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const nowLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const state: State = { question: '', method: 'time', when: nowLocal(), a: '', b: '', addHour: true, result: null, error: '' };

function parseWhen(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  if (y < 1900 || y > 2099) return null;
  return { y, mo, d, h, mi };
}

function doCast(record: boolean) {
  state.error = '';
  const w = parseWhen(state.when);
  if (!w) { state.error = 'badTime'; state.result = null; return render(); }
  const moment = lunarMoment(w.y, w.mo, w.d, w.h, w.mi);
  let numbers: CastNumbers;
  if (state.method === 'time') numbers = timeNumbers(moment);
  else {
    const a = Number(state.a), b = Number(state.b);
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1) { state.error = 'badNumbers'; state.result = null; return render(); }
    numbers = enteredNumbers(a, b, state.addHour ? moment.hourBranch : undefined);
  }
  const cast = castFromNumbers(numbers);
  state.result = { cast, moment, analysis: analyse(cast, moment.month), method: state.method };
  if (record) {
    addHistory({
      question: state.question.trim(), method: state.method, when: state.when,
      ...(state.method === 'numbers' ? { a: Number(state.a), b: Number(state.b), addHour: state.addHour } : {}),
    });
  }
  render();
  document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- rendering helpers ----------

function cite(ids: SourceId[]): string {
  // One expandable citation per work + section, listing every quote from it.
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

const hexName = (h: Hexagram) => {
  const n = zh(h.fullName);
  if (getLang() !== 'en') return n;
  return `${n} · ${PINYIN[h.text.number - 1]} · ${h.upper.en} over ${h.lower.en}`;
};
const triLabel = (tr: Trigram) => `${tr.symbol} ${zh(tr.name)}${zh(ELEMENT_ZH[tr.element])}${getLang() === 'en' ? ` (${tr.en})` : ''}`;

function relBadge(r: Relation) {
  return `<span class="rel rel-${r}">${getLang() === 'en' ? `${zh(RELATION_LABEL[r].zh)} · ${RELATION_LABEL[r].en}` : zh(RELATION_LABEL[r].zh)}</span>`;
}

function hexCard(kind: 'ben' | 'hu' | 'bian', h: Hexagram, c: Cast): string {
  const role = t(kind === 'ben' ? 'benRole' : kind === 'hu' ? 'huRole' : 'bianRole');
  const svg = hexSvg(
    { lines: h.lines, moving: kind === 'ben' ? c.moving : undefined, tiPosition: kind === 'hu' ? undefined : c.tiPosition, label: hexName(h) },
    zh('體'), zh('用'),
  );
  const tris = kind === 'hu'
    ? `<p class="tris">${triLabel(c.huTi)} <small>${zh('體互')}</small> · ${triLabel(c.huYong)} <small>${zh('用互')}</small></p>`
    : `<p class="tris">${t('upper')}：${triLabel(h.upper)}<br>${t('lower')}：${triLabel(h.lower)}</p>`;
  const name = kind === 'hu'
    ? (getLang() === 'en' ? `${zh(c.hu.lower.name)}下${zh(c.hu.upper.name)}上 · ${c.hu.upper.en} over ${c.hu.lower.en}` : zh(`${c.hu.lower.name}下${c.hu.upper.name}上`))
    : hexName(h);
  return `<article class="hexcard ${kind}"><h3>${t(kind)} <small>${role}</small></h3>${svg}<p class="hexname" lang="zh-Hant">${esc(name)}</p>${tris}</article>`;
}

function workingHtml(c: Cast, m: LunarMoment, method: 'time' | 'numbers'): string {
  const n = c.numbers;
  const lunar = `${zh(m.yearGanZhi)}${zh('年')} ${m.leap ? t('leap') : ''}${m.month}${zh('月')} ${m.day}${zh('日')} ${zh(m.hourBranch)}${zh('時')}`;
  const rows: string[] = [];
  const r8 = (x: number) => `${x} ÷ 8 ${t('remainder')} ${x % 8 === 0 ? '0 → 8' : String(x % 8)}`;
  const r6 = (x: number) => `${x} ÷ 6 ${t('remainder')} ${x % 6 === 0 ? '0 → 6' : String(x % 6)}`;
  if (method === 'time') {
    const yb = branchNumber(m.yearBranch), hb = branchNumber(m.hourBranch);
    rows.push(`<li>${t('upper')}：${zh(m.yearBranch)}${zh('年')} ${yb} + ${m.month} + ${m.day} = ${n.upper}；${r8(n.upper)} → ${triLabel(c.ben.upper)}</li>`);
    rows.push(`<li>${t('lower')}：${n.upper} + ${zh(m.hourBranch)}${zh('時')} ${hb} = ${n.lower}；${r8(n.lower)} → ${triLabel(c.ben.lower)}</li>`);
    rows.push(`<li>${t('movingLine')}：${r6(n.line)} → ${c.moving}</li>`);
  } else {
    const extra = n.line - n.upper - n.lower;
    rows.push(`<li>${t('upper')}：${r8(n.upper)} → ${triLabel(c.ben.upper)}</li>`);
    rows.push(`<li>${t('lower')}：${r8(n.lower)} → ${triLabel(c.ben.lower)}</li>`);
    rows.push(`<li>${t('movingLine')}：${n.upper} + ${n.lower}${extra ? ` + ${zh(m.hourBranch)}${zh('時')} ${extra}` : ''} = ${n.line}；${r6(n.line)} → ${c.moving}</li>`);
  }
  const srcs: SourceId[] = method === 'time' ? ['timeMethod', 'timeCounts', 'byEight', 'bySix', 'xiantian'] : ['numberMethod', 'byEight', 'bySix', ...(n.line > n.upper + n.lower ? (['addHour'] as SourceId[]) : []), 'xiantian'];
  return `<section class="card"><h2>${t('working')}</h2>`
    + `<p>${t('lunar')}：<strong lang="zh-Hant">${esc(lunar)}</strong>${m.solar.h >= 23 ? `<br><span class="hint">${t('ziNote')}</span>` : ''}</p>`
    + `<ol class="working">${rows.join('')}</ol>`
    + `<p class="hint">${zh('互')}：${zh('二、三、四爻與三、四、五爻')}${c.huFromBian ? ` · ${zh('乾坤無互，互其變卦')}` : ''}。${zh('體')} = ${triLabel(c.ti)}，${zh('用')} = ${triLabel(c.yong)}。</p>`
    + cite([...srcs, 'flipLine', 'huMethod', ...(c.huFromBian ? (['qianKunNoHu'] as SourceId[]) : []), 'tiyongDef'])
    + `</section>`;
}

function strengthTable(c: Cast, a: Analysis): string {
  const row = (label: string, tr: Trigram, s: keyof Analysis['strengths'], rel?: Relation) =>
    `<tr><th>${label}</th><td>${triLabel(tr)}</td><td>${rel ? relBadge(rel) : '—'}</td><td><span class="st st-${a.strengths[s]}">${zh(a.strengths[s])}</span>${getLang() === 'en' ? ` ${STRENGTH_EN[a.strengths[s]]}` : ''}</td></tr>`;
  const season = pick(SEASON_LABEL[a.season]);
  return `<h3>${t('strengthTitle')} · ${esc(season)}</h3><table class="st-table"><tbody>`
    + row(zh('體'), c.ti, 'ti')
    + row(zh('用'), c.yong, 'yong', a.relations.yong)
    + row(zh('體互'), c.huTi, 'huTi', a.relations.huTi)
    + row(zh('用互'), c.huYong, 'huYong', a.relations.huYong)
    + row(zh('變'), c.bianTrigram, 'bian', a.relations.bian)
    + `</tbody></table>` + cite(['elements', 'generating', 'overcoming', 'wangShuai', 'earthMonths', 'wuxingFourSeasons']);
}

function analysisHtml(c: Cast, a: Analysis): string {
  const items = a.statements
    .map((s) => `<li class="stmt tone-${s.tone}"><p>${esc(pick(s))}</p>${cite(s.sources)}</li>`)
    .join('');
  return `<section class="card"><h2>${t('tiYongTitle')}</h2><p class="hint">${t('tiYongIntro')}</p>`
    + `<ul class="stmts">${items}</ul>`
    + `<p class="hint">${t('quietNote')}</p>${cite(['quietRoom'])}`
    + strengthTable(c, a) + `</section>`;
}

function textsHtml(c: Cast): string {
  const b = c.ben.text, v = c.bian.text;
  const line = b.lines[c.moving - 1];
  const block = (label: string, text: string) => `<div class="yi"><h4>${label}</h4><p lang="zh-Hant">${esc(zh(text))}</p></div>`;
  return `<section class="card"><h2>${t('textsTitle')}</h2><p class="hint">${t('textsIntro')}${getLang() === 'en' ? ' ' + t('enTextNote') : ''}</p>${cite(['useYiText'])}`
    + `<h3>${t('ben')} · ${esc(hexName(c.ben))}</h3>`
    + block(t('judgement'), `${b.name}：${b.judgement}`)
    + block(t('lineText'), `${line.label}：${line.text}`)
    + block(t('xiaoxiang'), b.xiaoxiang[c.moving - 1])
    + block(t('daxiang'), b.daxiang)
    + `<details class="more"><summary>${t('tuan')}</summary><p lang="zh-Hant">${esc(zh(b.tuan))}</p></details>`
    + `<h3>${t('bian')} · ${esc(hexName(c.bian))}</h3>`
    + block(t('judgement'), `${v.name}：${v.judgement}`)
    + block(t('daxiang'), v.daxiang)
    + `<h3>${t('hu')}</h3><p class="hint">${t('huTextNote')}</p>${cite(['huTrigramsOnly'])}`
    + `<p class="hint">${zh('周易經文、彖傳、象傳')}：<a href="https://zh.wikisource.org/wiki/周易/${encodeURIComponent(b.name)}" target="_blank" rel="noopener">Wikisource ${esc(zh('周易'))}/${esc(zh(b.name))} ↗</a> · <a href="https://zh.wikisource.org/wiki/周易/${encodeURIComponent(v.name)}" target="_blank" rel="noopener">${esc(zh(v.name))} ↗</a></p>`
    + `</section>`;
}

function resultHtml(): string {
  const r = state.result;
  if (!r) return '';
  const { cast: c, moment, analysis } = r;
  const q = state.question.trim();
  return `<div id="result">`
    + (q ? `<p class="asked">「${esc(q)}」</p>` : '')
    + `<section class="hexes">${hexCard('ben', c.ben, c)}${hexCard('hu', c.hu, c)}${hexCard('bian', c.bian, c)}</section>`
    + analysisHtml(c, analysis)
    + textsHtml(c)
    + workingHtml(c, moment, r.method)
    + `</div>`;
}

function historyHtml(): string {
  const on = historyOn();
  const list = on ? loadHistory() : [];
  const items = list.map((e) => {
    const desc = e.method === 'numbers' ? `${e.a}, ${e.b}` : esc(e.when.replace('T', ' '));
    return `<li><span class="hq">${esc(e.question || t('noQuestion'))}</span> <span class="hint">${desc}</span>`
      + ` <button type="button" class="link" data-open="${e.id}">${t('open')}</button>`
      + ` <button type="button" class="link" data-del="${e.id}">${t('delete')}</button></li>`;
  }).join('');
  return `<section class="card"><h2>${t('history')}</h2>`
    + `<label class="check"><input type="checkbox" id="hist-on" ${on ? 'checked' : ''}> ${t('historyOn')}</label>`
    + `<p class="hint">${t('historyHint')}</p>`
    + (on ? (list.length ? `<ul class="hist">${items}</ul><button type="button" id="hist-clear">${t('clearAll')}</button>` : `<p class="hint">${t('historyEmpty')}</p>`) : '')
    + `</section>`;
}

function methodsHtml(): string {
  return `<section class="card methods"><h2>${t('methodsTitle')}</h2>`
    + `<p>${t('aboutMeihua')}</p><p>${t('aboutWuxing')}</p><p>${t('aboutSoft')}</p>`
    + `<p><a href="${REPO}" target="_blank" rel="noopener">${t('aboutCode')} ↗</a> · <a href="${SISTER}" target="_blank" rel="noopener">${t('sister')} ↗</a></p></section>`;
}

function render() {
  const lang = getLang();
  document.documentElement.lang = lang === 'en' ? 'en' : lang === 'zh-CN' ? 'zh-Hans' : 'zh-Hant';
  document.documentElement.dataset.script = lang;
  document.title = t('title');
  const langBtn = (l: Lang, label: string) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}">${label}</button>`;
  $('#app').innerHTML = `
    <header class="site-header">
      <div class="langs" role="group" aria-label="Language">${langBtn('zh-TW', '繁')}${langBtn('zh-CN', '简')}${langBtn('en', 'EN')}</div>
      <h1>${t('title')}</h1>
      <p class="tagline">${t('subtitle')}</p>
    </header>
    <main>
      <aside class="limits" role="note"><strong>${t('limitsTitle')}</strong><p>${t('limits')}</p></aside>
      <form id="cast-form" class="card" novalidate>
        <label class="field"><span class="label">${t('question')}</span>
          <textarea id="q" rows="2" maxlength="500" placeholder="${esc(t('questionPh'))}">${esc(state.question)}</textarea>
          <span class="hint">${t('questionHint')} ${t('noReason')}</span>
        </label>
        ${cite(['noReason'])}
        <fieldset class="field"><legend class="label">${t('method')}</legend>
          <div class="seg">
            <label><input type="radio" name="method" value="time" ${state.method === 'time' ? 'checked' : ''}> ${t('byTime')}</label>
            <label><input type="radio" name="method" value="numbers" ${state.method === 'numbers' ? 'checked' : ''}> ${t('byNumbers')}</label>
          </div>
        </fieldset>
        <div class="row">
          <label class="field"><span class="label">${t('when')}</span>
            <span class="inline"><input type="datetime-local" id="when" value="${state.when}" min="1900-01-01T00:00" max="2099-12-31T23:59">
            <button type="button" id="now" class="link">${t('now')}</button></span>
          </label>
        </div>
        ${state.method === 'numbers' ? `
        <div class="row">
          <label class="field"><span class="label">${t('num1')}</span><input type="number" id="a" min="1" step="1" inputmode="numeric" value="${esc(state.a)}"></label>
          <label class="field"><span class="label">${t('num2')}</span><input type="number" id="b" min="1" step="1" inputmode="numeric" value="${esc(state.b)}"></label>
        </div>
        <p class="hint">${t('numbersHint')}</p>
        <label class="check"><input type="checkbox" id="addHour" ${state.addHour ? 'checked' : ''}> ${t('addHour')}</label>` : ''}
        ${state.error ? `<p class="error" role="alert">${t(state.error as 'badTime' | 'badNumbers')}</p>` : ''}
        <button type="submit" class="primary">${t('cast')}</button>
      </form>
      ${resultHtml()}
      ${historyHtml()}
      ${methodsHtml()}
    </main>
    <footer class="site-footer"><p>${zh('文本來源：維基文庫（公有領域）。問題不會離開你的裝置。')} · MIT</p></footer>`;
}

// ---------- events (delegated, so they survive re-render) ----------

function readForm() {
  const q = document.getElementById('q') as HTMLTextAreaElement | null;
  if (q) state.question = q.value;
  const w = document.getElementById('when') as HTMLInputElement | null;
  if (w) state.when = w.value;
  const a = document.getElementById('a') as HTMLInputElement | null;
  if (a) state.a = a.value;
  const b = document.getElementById('b') as HTMLInputElement | null;
  if (b) state.b = b.value;
  const h = document.getElementById('addHour') as HTMLInputElement | null;
  if (h) state.addHour = h.checked;
}

document.addEventListener('submit', (e) => {
  if ((e.target as HTMLElement).id !== 'cast-form') return;
  e.preventDefault();
  readForm();
  doCast(true);
});

document.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.name === 'method') { readForm(); state.method = el.value as State['method']; state.error = ''; render(); }
  if (el.id === 'hist-on') { readForm(); setHistoryOn(el.checked); render(); }
});

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest('button');
  if (!el) return;
  if (el.dataset.lang) {
    readForm();
    setLang(el.dataset.lang as Lang);
    try { localStorage.setItem('meihua.lang', el.dataset.lang); } catch { /* storage blocked */ }
    render();
  } else if (el.id === 'now') {
    readForm(); state.when = nowLocal(); render();
  } else if (el.id === 'hist-clear') {
    clearHistory(); render();
  } else if (el.dataset.del) {
    deleteHistory(el.dataset.del); render();
  } else if (el.dataset.open) {
    const h: Entry | undefined = loadHistory().find((x) => x.id === el.dataset.open);
    if (!h) return;
    Object.assign(state, { question: h.question, method: h.method, when: h.when, a: String(h.a ?? ''), b: String(h.b ?? ''), addHour: h.addHour ?? true });
    doCast(false);
  }
});

let saved: string | null = null;
try { saved = localStorage.getItem('meihua.lang'); } catch { /* storage blocked */ }
setLang(detectLang(saved));
render();
