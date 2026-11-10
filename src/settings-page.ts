// Settings page: language, calendar choices, defaults, and the opt-in local history.
import { getLang, t } from './i18n/lang';
import type { Lang } from './i18n/strings';
import { DEFAULTS, loadSettings, resetSettings, saveSettings, type Settings } from './settings';
import { cite } from './ui/common';
import { mount } from './ui/shell';

let s: Settings = loadSettings();

const radio = (name: string, value: string, checked: boolean, label: string) =>
  `<label><input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''}> ${label}</label>`;

function body() {
  const lang = getLang();
  return `
  <section class="card settings">
    <fieldset class="field"><legend class="label">${t('setLanguage')}</legend>
      <div class="seg col">${radio('lang', 'zh-TW', lang === 'zh-TW', '繁體中文')}${radio('lang', 'zh-CN', lang === 'zh-CN', '简体中文')}${radio('lang', 'en', lang === 'en', 'English')}</div>
    </fieldset>
    <fieldset class="field"><legend class="label">${t('setSeason')}</legend>
      <div class="seg col">${radio('season', 'lunarMonth', s.seasonBasis === 'lunarMonth', t('seasonLunar'))}${radio('season', 'solarTerm', s.seasonBasis === 'solarTerm', t('seasonTerm'))}</div>
      <span class="hint">${t('seasonHint')}</span>
      ${cite(['wangShuai', 'earthMonths', 'timeCounts'])}
    </fieldset>
    <fieldset class="field"><legend class="label">${t('setZi')}</legend>
      <div class="seg col">${radio('zi', 'next', s.ziNextDay, t('ziAt23'))}${radio('zi', 'same', !s.ziNextDay, t('ziAt0'))}</div>
    </fieldset>
    <fieldset class="field"><legend class="label">${t('byNumbers')}</legend>
      <label class="check"><input type="checkbox" id="addHour" ${s.addHour ? 'checked' : ''}> ${t('setAddHour')}</label>
      <span class="hint">${t('setAddHourHint')}</span>
      ${cite(['zhangChi', 'chiCun', 'addHour'])}
    </fieldset>
    <p class="hint">${t('savedNote')}</p>
    <button type="button" id="reset" class="secondary">${t('resetSettings')}</button>
  </section>
  <section class="card">
    <h2>${t('history')}</h2>
    <p>${t('historySettings')} <a href="./history.html">${t('navHistory')} →</a></p>
  </section>`;
}

const render = mount('settings', 'settingsTitle', body);

document.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.name === 'lang') {
    document.querySelector<HTMLButtonElement>(`button[data-lang="${el.value as Lang}"]`)?.click();
    return;
  }
  if (el.name === 'season') s = { ...s, seasonBasis: el.value === 'solarTerm' ? 'solarTerm' : 'lunarMonth' };
  else if (el.name === 'zi') s = { ...s, ziNextDay: el.value === 'next' };
  else if (el.id === 'addHour') s = { ...s, addHour: el.checked };
  else return;
  saveSettings(s);
});

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest('button');
  if (el?.id === 'reset') { resetSettings(); s = { ...DEFAULTS }; render(); }
});
