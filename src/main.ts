// The cast page: question → cast → three hexagrams, 體用 analysis, 周易 text.
import { RELATION_LABEL, SEASON_LABEL, STRENGTH_EN, type Analysis, type Relation, type Statement } from './core/analysis';
import { branchNumber, lunarMoment, type Cast } from './core/cast';
import { computeCast, type CastInput, type CastResult, type Method } from './compute';
import { TOPIC_LABEL, type Topic } from './core/quick';
import { charCount, GROUPS, PRESETS, preset } from './presets';
import type { Hexagram } from './core/hexagram';
import type { SourceId } from './core/sources';
import type { Trigram } from './core/trigrams';
import { addHistory, historyEntry, historyOn } from './history';
import { getLang, pick, t, zh } from './i18n/lang';
import { loadSettings } from './settings';
import { cite, esc, hexName, triLabel } from './ui/common';
import { glossaryHtml, termBtn } from './ui/glossary';
import { hexSvg } from './ui/hexsvg';
import { limitsLink, mount, onBeforeLangChange } from './ui/shell';
import type { Group } from './presets';

type Mode = 'quick' | 'advanced';

interface State {
  mode: Mode;
  /** Quick mode: the chosen preset question. */
  presetId: string | null;
  /** Quick mode: a preset waiting for its number (the guessing game). */
  pendingPreset: string | null;
  /** Quick mode: which group of questions is showing. */
  group: Group;
  /** Advanced mode: whether the time / extra-number section is open. */
  optsOpen: boolean;
  question: string;
  topic: Topic;
  method: Method;
  count: 1 | 2;
  when: string;
  a: string;
  b: string;
  extra: string;
  addHour: boolean;
  result: CastResult | null;
  /** Set when this result was saved to, or opened from, history. */
  savedId: string | null;
  error: '' | 'badTime' | 'badNumbers' | 'needQuestion';
}

const settings = loadSettings();
const pad = (n: number) => String(n).padStart(2, '0');
const nowLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

let savedMode: Mode = 'quick';
try { if (localStorage.getItem('meihua.mode') === 'advanced') savedMode = 'advanced'; } catch { /* storage blocked */ }

const state: State = { mode: savedMode, presetId: null, pendingPreset: null, group: 'everyday', optsOpen: false, question: '', topic: 'general', method: 'time', count: 2, when: nowLocal(), a: '', b: '', extra: '', addHour: settings.addHour, result: null, savedId: null, error: '' };

const posInt = (s: string) => { const n = Number(s); return s.trim() !== '' && Number.isInteger(n) && n >= 1 ? n : undefined; };

function inputFromState(): CastInput | 'badNumbers' {
  const input: CastInput = { topic: state.topic, method: state.method, count: state.count, when: state.when, addHour: state.addHour, extra: 0 };
  if (state.method === 'time') {
    if (state.extra.trim()) {
      const e = posInt(state.extra);
      if (e === undefined) return 'badNumbers';
      input.extra = e;
    }
  } else {
    input.a = posInt(state.a);
    if (state.count === 2) input.b = posInt(state.b);
  }
  return input;
}

function show(r: CastResult | State['error'], savedId: string | null) {
  state.error = typeof r === 'string' ? r : '';
  state.result = typeof r === 'string' ? null : r;
  state.savedId = state.result ? savedId : null;
  render();
  if (state.result) document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function doCast() {
  if (state.mode === 'advanced') {
    state.topic = 'general';
    state.presetId = null;
    if (!state.question.trim()) return show('needQuestion', null);
  }
  const input = inputFromState();
  if (input === 'badNumbers') return show(input, null);
  const r = computeCast(input, settings);
  let id: string | null = null;
  // Only casts with a question go into history: a bare cast has nothing to look back on.
  if (typeof r !== 'string' && state.question.trim()) {
    id = addHistory({
      question: state.question.trim(), mode: state.mode, ...(state.presetId ? { presetId: state.presetId } : {}), topic: input.topic, answer: r.quick.key, method: input.method, when: input.when,
      ...(input.method === 'numbers' ? { a: input.a, b: input.count === 2 ? input.b : undefined, addHour: input.addHour } : {}),
      ...(input.extra ? { extra: input.extra } : {}),
      ziNextDay: settings.ziNextDay, seasonBasis: settings.seasonBasis,
      ben: r.cast.ben.fullName, bian: r.cast.bian.fullName, moving: r.cast.moving,
    });
  }
  show(r, id);
}

/** Quick mode: cast a preset question by the time method at this moment. */
function castPreset(id: string) {
  const p = preset(id);
  if (!p) return;
  if (p.needsNumber) { state.pendingPreset = state.pendingPreset === id ? null : id; render(); document.getElementById('guess-n')?.focus(); return; }
  // The question's character count is added to the time numbers (卷二「起卦加數例」), so different questions
  // asked in the same 時辰 get different hexagrams.
  Object.assign(state, { presetId: p.id, group: p.group, question: p.zh, topic: p.topic, method: 'time', when: nowLocal(), extra: String(charCount(p.zh)) });
  doCast();
}

/** Guessing game: one number plus the hour (卷一「物數占例」). */
function castPresetNumber(id: string, raw: string) {
  const p = preset(id);
  const n = posInt(raw);
  if (!p) return;
  if (n === undefined) { state.error = 'badNumbers'; return render(); }
  Object.assign(state, { presetId: p.id, pendingPreset: null, group: p.group, question: p.zh, topic: p.topic, method: 'numbers', count: 1, a: String(n), b: '', when: nowLocal(), extra: '' });
  doCast();
}

/** Open a saved entry (history page links here with ?open=<id>; the id is local, never the question). */
function openSaved(id: string) {
  const h = historyEntry(id);
  if (!h) return;
  const count: 1 | 2 = h.method === 'numbers' && h.b === undefined ? 1 : 2;
  Object.assign(state, {
    mode: h.mode ?? (h.presetId ? 'quick' : 'advanced'), presetId: h.presetId ?? null,
    topic: h.topic ?? 'general',
    question: h.question, method: h.method, when: h.when, count,
    a: h.a !== undefined ? String(h.a) : '', b: h.b !== undefined ? String(h.b) : '',
    extra: h.extra ? String(h.extra) : '', addHour: h.addHour ?? settings.addHour,
  });
  const input: CastInput = { topic: h.topic ?? 'general', method: h.method, count, when: h.when, a: h.a, b: h.b, addHour: h.addHour ?? false, extra: h.extra ?? 0 };
  show(computeCast(input, { ziNextDay: h.ziNextDay ?? settings.ziNextDay, seasonBasis: h.seasonBasis ?? settings.seasonBasis }), id);
}

// ---------- result rendering ----------

function relBadge(r: Relation) {
  return `<span class="rel rel-${r}">${getLang() === 'en' ? `${zh(RELATION_LABEL[r].zh)} · ${RELATION_LABEL[r].en}` : zh(RELATION_LABEL[r].zh)}</span>`;
}

function hexCard(kind: 'ben' | 'hu' | 'bian', h: Hexagram, c: Cast): string {
  const plain = t(kind === 'ben' ? 'plainBen' : kind === 'hu' ? 'plainHu' : 'plainBian');
  const svg = hexSvg(
    { lines: h.lines, moving: kind === 'ben' ? c.moving : undefined, tiPosition: kind === 'hu' ? undefined : c.tiPosition, label: hexName(h) },
    t('svgYou'), t('svgMatter'),
  );
  const you = c.tiPosition === 'upper' ? h.upper : h.lower;
  const other = c.tiPosition === 'upper' ? h.lower : h.upper;
  const tris = kind === 'hu'
    ? `<p class="tris">${triLabel(c.huTi)} · ${triLabel(c.huYong)}</p>`
    : `<p class="tris">${t('plainYou')} ${termBtn('ti')}：${triLabel(you)}<br>${t('plainMatter')} ${termBtn('yong')}：${triLabel(other)}</p>`;
  const name = kind === 'hu'
    ? (getLang() === 'en' ? `${c.hu.lower.name}下${c.hu.upper.name}上 · ${c.hu.upper.en} over ${c.hu.lower.en}` : zh(`${c.hu.lower.name}下${c.hu.upper.name}上`))
    : hexName(h);
  return `<article class="hexcard ${kind}"><h3>${plain} ${termBtn(kind)}</h3>${svg}<p class="hexname" lang="zh-Hant">${esc(name)}</p>${tris}</article>`;
}

function workingHtml(r: CastResult): string {
  const { cast: c, moment: m } = r;
  const { method, count, extra } = r.input;
  const n = c.numbers;
  const lunar = `${zh(m.yearGanZhi)}${zh('年')} ${m.leap ? t('leap') : ''}${m.month}${zh('月')} ${m.day}${zh('日')} ${zh(m.hourBranch)}${zh('時')}`;
  const rows: string[] = [];
  const r8 = (x: number) => `${x} ÷ 8 ${t('remainder')} ${x % 8 === 0 ? '0 (= 8)' : String(x % 8)}`;
  const r6 = (x: number) => `${x} ÷ 6 ${t('remainder')} ${x % 6 === 0 ? '0 (= 6)' : String(x % 6)}`;
  const hb = branchNumber(m.hourBranch);
  const hour = `${zh(m.hourBranch)}${zh('時')} ${hb}`;
  let srcs: SourceId[];
  if (method === 'time') {
    const yb = branchNumber(m.yearBranch);
    const ex = extra ? ` + ${t(state.presetId ? 'charCountLabel' : 'extra')} ${extra}` : '';
    rows.push(`<li>${t('upper')}：${zh(m.yearBranch)}${zh('年')} ${yb} + ${m.month} + ${m.day}${ex} = ${n.upper}；${r8(n.upper)} → ${triLabel(c.ben.upper)}</li>`);
    rows.push(`<li>${t('lower')}：${n.upper} + ${hour} = ${n.lower}；${r8(n.lower)} → ${triLabel(c.ben.lower)}</li>`);
    rows.push(`<li>${t('movingLine')}：${r6(n.line)} → ${c.moving}</li>`);
    srcs = ['timeMethod', 'timeCounts', ...(extra ? (['addNumber'] as SourceId[]) : [])];
  } else if (count === 1) {
    rows.push(`<li>${t('upper')}：${r8(n.upper)} → ${triLabel(c.ben.upper)}</li>`);
    rows.push(`<li>${t('lower')}：${hour} → ${triLabel(c.ben.lower)}</li>`);
    rows.push(`<li>${t('movingLine')}：${n.upper} + ${hb} = ${n.line}；${r6(n.line)} → ${c.moving}</li>`);
    srcs = ['numberMethod'];
  } else {
    const added = n.line - n.upper - n.lower;
    rows.push(`<li>${t('upper')}：${r8(n.upper)} → ${triLabel(c.ben.upper)}</li>`);
    rows.push(`<li>${t('lower')}：${r8(n.lower)} → ${triLabel(c.ben.lower)}</li>`);
    rows.push(`<li>${t('movingLine')}：${n.upper} + ${n.lower}${added ? ` + ${hour}` : ''} = ${n.line}；${r6(n.line)} → ${c.moving}</li>`);
    srcs = added ? ['chiCun', 'addHour'] : ['zhangChi'];
  }
  const seasonLine = `${t('seasonBy')}：${settings.seasonBasis === 'solarTerm' ? `${t('seasonByTerm')} ${zh(m.monthBranchByTerm)}${zh('月')}` : `${t('seasonByLunar')} ${m.month}${zh('月')}`} → ${pick(SEASON_LABEL[r.analysis.season])}`;
  return `<section class="working-block"><h3>${t('working')}</h3>`
    + `<p>${t('lunar')}：<strong lang="zh-Hant">${esc(lunar)}</strong>${m.shifted ? `<br><span class="hint">${t('ziNote')}</span>` : ''}</p>`
    + `<ol class="working">${rows.join('')}</ol>`
    + `<p class="hint">${zh('互')}：${zh('二、三、四爻與三、四、五爻')}${c.huFromBian ? ` · ${zh('乾坤無互，互其變卦')}` : ''}。${zh('體')} = ${triLabel(c.ti)}，${zh('用')} = ${triLabel(c.yong)}。<br>${seasonLine}</p>`
    + cite([...srcs, 'byEight', 'bySix', 'xiantian', 'flipLine', 'huMethod', ...(c.huFromBian ? (['qianKunNoHu'] as SourceId[]) : []), 'tiyongDef'])
    + `</section>`;
}

function strengthTable(c: Cast, a: Analysis): string {
  const row = (label: string, tr: Trigram, s: keyof Analysis['strengths'], rel?: Relation) =>
    `<tr><th>${label}</th><td>${triLabel(tr)}</td><td>${rel ? relBadge(rel) : '—'}</td><td><span class="st st-${a.strengths[s]}">${zh(a.strengths[s])}</span>${getLang() === 'en' ? ` ${STRENGTH_EN[a.strengths[s]]}` : ''}</td></tr>`;
  return `<h3>${t('strengthTitle')} · ${esc(pick(SEASON_LABEL[a.season]))}</h3><div class="scroll"><table class="st-table"><tbody>`
    + row(zh('體'), c.ti, 'ti')
    + row(zh('用'), c.yong, 'yong', a.relations.yong)
    + row(zh('體互'), c.huTi, 'huTi', a.relations.huTi)
    + row(zh('用互'), c.huYong, 'huYong', a.relations.huYong)
    + row(zh('變'), c.bianTrigram, 'bian', a.relations.bian)
    + `</tbody></table></div>` + cite(['elements', 'generating', 'overcoming', 'wangShuai', 'earthMonths', 'wuxingFourSeasons']);
}

function stmtHtml(st: Statement) {
  const term = st.term ? `<span class="tag">${esc(pick(st.term))}</span>` : '';
  return `<li class="stmt tone-${st.tone}"><p>${esc(pick(st))}</p>${term}${cite(st.sources)}</li>`;
}

function summaryHtml(a: Analysis): string {
  const lines = a.summary.map((s) => `<li class="tone-${s.tone}">${esc(pick(s))}</li>`).join('');
  return `<section class="card brief"><h2>${t('inBrief')}</h2><ul class="brief-list">${lines}</ul>`
    + `<p class="hint">${t('inBriefHint')}</p></section>`;
}

function analysisHtml(a: Analysis): string {
  return `<section class="card"><h2>${t('closerLook')}</h2><p class="hint">${t('closerLookHint')}</p>`
    + `<ul class="stmts">${a.statements.map(stmtHtml).join('')}</ul>`
    + glossaryHtml(t('termsTitle')) + `</section>`;
}

function textsHtml(c: Cast): string {
  const b = c.ben.text, v = c.bian.text;
  const line = b.lines[c.moving - 1];
  const block = (label: string, text: string) => `<div class="yi"><h4>${label}</h4><p lang="zh-Hant">${esc(zh(text))}</p></div>`;
  const link = (name: string) => `<a href="https://zh.wikisource.org/wiki/周易/${encodeURIComponent(name)}" target="_blank" rel="noopener">${esc(zh('周易'))}/${esc(zh(name))} ↗</a>`;
  return `<section class="card"><h2>${t('textsTitle')}</h2><p class="hint">${t('textsIntro')}${getLang() === 'en' ? ' ' + t('enTextNote') : ''}</p>`
    + `<h3>${t('plainBen')} · ${esc(hexName(c.ben))}</h3>`
    + block(t('judgementPlain'), `${b.name}：${b.judgement}`)
    + block(t('lineTextPlain'), `${line.label}：${line.text}`)
    + block(t('daxiangPlain'), b.daxiang)
    + `<h3>${t('plainBian')} · ${esc(hexName(c.bian))}</h3>`
    + block(t('judgementPlain'), `${v.name}：${v.judgement}`)
    + block(t('daxiangPlain'), v.daxiang)
    + `<details class="more"><summary>${t('moreText')}</summary>`
    + block(`${t('xiaoxiang')} · ${esc(zh(b.name))} ${esc(zh(line.label))}`, b.xiaoxiang[c.moving - 1])
    + block(`${t('tuan')} · ${esc(zh(b.name))}`, b.tuan)
    + `<p class="hint">${t('huTextNote')}</p>${cite(['huTrigramsOnly'])}</details>`
    + cite(['useYiText'])
    + `<p class="hint">Wikisource：${link(b.name)} · ${link(v.name)}</p></section>`;
}

function detailsHtml(r: CastResult): string {
  return `<details class="card details"><summary><strong>${t('showDetails')}</strong></summary>`
    + `<p class="hint">${t('quietNote')}</p>${cite(['quietRoom'])}`
    + strengthTable(r.cast, r.analysis)
    + workingHtml(r) + `</details>`;
}

function quickHtml(r: CastResult): string {
  const q = r.quick;
  const notes = q.notes.map((n) => `<li>${esc(pick(n.text))}${cite(n.sources)}</li>`).join('');
  return `<section class="card quick tone-${q.tone}">`
    + `<p class="quick-topic">${t('quickAnswer')} · ${esc(pick(TOPIC_LABEL[q.topic]))}</p>`
    + `<p class="quick-answer">${esc(pick(q.label))}</p>`
    + `<p class="quick-why"><strong>${t('why')}</strong>${getLang() === 'en' ? ': ' : '：'}${esc(pick(q.reason))}</p>`
    + (notes ? `<ul class="quick-notes">${notes}</ul>` : '')
    + cite(q.sources)
    + (q.topic === 'weather' ? `<p class="hint">${t('forecastNote')}</p>` : '')
    + (q.topic === 'guess' ? `<p class="hint"><strong>${t('guessReveal')}</strong></p>` : '')
    + limitsLink()
    + `</section>`;
}

function resultHtml(): string {
  const r = state.result;
  if (!r) return '';
  const p = preset(state.presetId ?? undefined);
  const q = p ? pick(p) : state.question.trim();
  return `<div id="result">`
    + (q ? `<p class="asked">「${esc(q)}」</p>` : '')
    + quickHtml(r)
    + `<details class="full-reading"${state.mode === 'advanced' ? ' open' : ''}><summary>${t('fullReading')}</summary>`
    + (r.input.topic === 'weather' ? `<p class="hint">${t('weatherFullNote')}</p>${cite(['weatherNoTiYong'])}` : '')
    + summaryHtml(r.analysis)
    + `<section class="hexes">${hexCard('ben', r.cast.ben, r.cast)}${hexCard('hu', r.cast.hu, r.cast)}${hexCard('bian', r.cast.bian, r.cast)}</section>`
    + analysisHtml(r.analysis) + textsHtml(r.cast) + detailsHtml(r) + `</details></div>`;
}

function savedNote(): string {
  if (!state.result) return '';
  if (state.savedId) return `<p class="hint center">${t('savedToHistory')} · <a href="./history.html">${t('navHistory')} →</a></p>`;
  if (!historyOn()) return `<p class="hint center">${t('historyOffNote')} <a href="./history.html">${t('navHistory')} →</a></p>`;
  return '';
}

// ---------- form ----------

/** One-line summary of the folded time / extra-number section. */
function optsSummary(): string {
  const when = state.when.replace('T', ' ');
  if (state.method === 'numbers') return when;
  return `${when} · ${t('extra')} ${state.extra.trim() || t('optionsNone')}`;
}

function formHtml(): string {
  const timeRole = state.method === 'time' ? t('timeRoleTime') : state.count === 1 ? t('timeRoleOne') : t('timeRoleTwo');
  const extraField = state.method !== 'numbers' ? `
    <label class="field narrow"><span class="label">${t('extraNum')}</span>
      <input type="number" id="extra" min="1" step="1" inputmode="numeric" value="${esc(state.extra)}">
      <span class="hint">${t('extraHint')}</span></label>
    ${cite(['addNumber', 'addNumberWorked'])}` : '';
  const numbers = state.method !== 'numbers' ? '' : `
    <fieldset class="field"><legend class="label">${t('howMany')}</legend>
      <div class="seg">
        <label><input type="radio" name="count" value="1" ${state.count === 1 ? 'checked' : ''}> ${t('oneNum')}</label>
        <label><input type="radio" name="count" value="2" ${state.count === 2 ? 'checked' : ''}> ${t('twoNums')}</label>
      </div>
    </fieldset>
    <div class="row">
      <label class="field"><span class="label">${state.count === 1 ? t('num') : t('num1')}</span><input type="number" id="a" min="1" step="1" inputmode="numeric" value="${esc(state.a)}"></label>
      ${state.count === 2 ? `<label class="field"><span class="label">${t('num2')}</span><input type="number" id="b" min="1" step="1" inputmode="numeric" value="${esc(state.b)}"></label>` : ''}
    </div>
    <p class="hint">${t('numbersHint')}${state.count === 1 ? ' ' + t('oneNumHint') : ''}</p>
    ${state.count === 2 ? `<label class="check"><input type="checkbox" id="addHour" ${state.addHour ? 'checked' : ''}> ${t('addHour')}</label>` : ''}
    ${cite(state.count === 1 ? ['numberMethod', 'soundMethod'] : ['zhangChi', 'chiCun', 'addHour'])}`;
  return `<form id="cast-form" class="card" novalidate>
    <p class="hint">${t('advancedIntro')}</p>
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
    ${numbers}
    <details class="opts"${state.optsOpen || state.error === 'badTime' ? ' open' : ''}>
      <summary>${t('optionsTitle')} <span class="hint inline-hint">· ${esc(optsSummary())}</span></summary>
      <label class="field narrow"><span class="label">${t('when')}</span>
        <span class="inline"><input type="datetime-local" id="when" value="${state.when}" min="1900-01-01T00:00" max="2099-12-31T23:59">
        <button type="button" id="now" class="link">${t('now')}</button></span>
        <span class="hint">${timeRole}</span>
      </label>
      ${extraField}
    </details>
    ${state.error ? `<p class="error" role="alert">${t(state.error)}</p>` : ''}
    <button type="submit" class="primary">${t('cast')}</button>
  </form>`;
}

function quickModeHtml(): string {
  // After a cast the answer takes the list's place, so there is nothing to scroll past.
  if (state.result) return `<p class="back-row"><button type="button" class="link" id="change-q">${t('changeQuestion')}</button></p>`;
  const now = new Date();
  const m = lunarMoment(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), settings.ziNextDay);
  const lunar = `${zh(m.yearGanZhi)}${zh('年')} ${m.leap ? t('leap') : ''}${m.month}${zh('月')} ${m.day}${zh('日')} ${zh(m.hourBranch)}${zh('時')}`;
  const chips = GROUPS.map((g) => `<button type="button" class="chip" data-group="${g.id}" aria-pressed="${state.group === g.id}" title="${esc(pick(g))}">${esc(pick(g.short))}</button>`).join('');
  const current = GROUPS.find((g) => g.id === state.group)!;
  const list = PRESETS.filter((p) => p.group === state.group).map((p) =>
    `<button type="button" class="preset" data-preset="${p.id}" aria-expanded="${p.needsNumber ? state.pendingPreset === p.id : ''}">${esc(pick(p))}</button>`
    + (p.needsNumber && state.pendingPreset === p.id ? `<form class="number-row" data-number-for="${p.id}" novalidate>
        <label class="field"><span class="label">${t('guessNumber')}</span>
          <span class="inline"><input type="number" id="guess-n" min="1" step="1" inputmode="numeric" value="${esc(state.a)}">
          <button type="submit" class="primary small">${t('cast')}</button></span></label>
        <span class="hint">${t('guessHint')}</span>
        ${state.error === 'badNumbers' ? `<p class="error" role="alert">${t('badNumbers')}</p>` : ''}
      </form>` : '')).join('');
  return `<section class="card quick-mode"><h2>${t('pickQuestion')}</h2>`
    + `<p class="hint">${t('quickIntro')} <strong lang="zh-Hant">${esc(lunar)}</strong></p>`
    + `<div class="chips" role="group">${chips}</div>`
    + (pick(current) !== pick(current.short) ? `<p class="group-name">${esc(pick(current))}</p>` : '')
    + `<div class="presets">${list}</div>`
    + `<details class="more"><summary>${t('howItWorks')}</summary><p class="hint">${t('quickRuleNote')} ${t('charCountNote')}</p>${cite(['addNumber'])}</details>`
    + `</section>`;
}

function tabsHtml(): string {
  const tab = (m: Mode, label: string) => `<button type="button" role="tab" class="mode-tab" data-mode="${m}" aria-selected="${state.mode === m}">${label}</button>`;
  return `<div class="mode-tabs" role="tablist" aria-label="${t('modeLabel')}">${tab('quick', t('modeQuick'))}${tab('advanced', t('modeAdvanced'))}</div>`;
}

function readForm() {
  const el = (id: string) => document.getElementById(id) as HTMLInputElement | null;
  const q = document.getElementById('q') as HTMLTextAreaElement | null;
  if (q) state.question = q.value;
  if (el('when')) state.when = el('when')!.value;
  if (el('a')) state.a = el('a')!.value;
  if (el('b')) state.b = el('b')!.value;
  if (el('extra')) state.extra = el('extra')!.value;
  if (el('addHour')) state.addHour = el('addHour')!.checked;
}

const render = mount('cast', 'title', () => tabsHtml() + (state.mode === 'quick' ? quickModeHtml() : formHtml()) + resultHtml() + savedNote());
onBeforeLangChange(readForm);

document.addEventListener('submit', (e) => {
  const f = e.target as HTMLFormElement;
  if (f.dataset.numberFor) {
    e.preventDefault();
    castPresetNumber(f.dataset.numberFor, (document.getElementById('guess-n') as HTMLInputElement).value);
    return;
  }
  if (f.id !== 'cast-form') return;
  e.preventDefault();
  readForm();
  doCast();
});

document.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.name === 'method') { readForm(); state.method = el.value as Method; state.error = ''; render(); }
  if (el.name === 'count') { readForm(); state.count = el.value === '1' ? 1 : 2; state.error = ''; render(); }
});

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest('button');
  if (!el) return;
  if (el.id === 'now') { readForm(); state.when = nowLocal(); render(); }
  else if (el.dataset.preset) castPreset(el.dataset.preset);
  else if (el.dataset.group) { state.group = el.dataset.group as Group; state.pendingPreset = null; render(); }
  else if (el.id === 'change-q') { Object.assign(state, { result: null, savedId: null, presetId: null, pendingPreset: null, error: '' }); render(); window.scrollTo({ top: 0 }); }
  else if (el.dataset.mode) {
    readForm();
    const mode = el.dataset.mode === 'advanced' ? 'advanced' : 'quick';
    if (mode === state.mode) return;
    try { localStorage.setItem('meihua.mode', mode); } catch { /* storage blocked */ }
    // A fresh tab: the other mode's result and question do not carry over.
    Object.assign(state, { mode, result: null, savedId: null, error: '', presetId: null, topic: 'general' as Topic, question: mode === 'advanced' ? '' : state.question, extra: '', when: nowLocal() });
    render();
  }
});

const openId = new URLSearchParams(location.search).get('open');
if (openId) {
  window.history.replaceState(null, '', location.pathname);
  openSaved(openId);
}

// Remember whether the advanced options are open across re-renders.
document.addEventListener('toggle', (e) => {
  const el = e.target as HTMLDetailsElement;
  if (el.classList?.contains('opts')) state.optsOpen = el.open;
}, true);
