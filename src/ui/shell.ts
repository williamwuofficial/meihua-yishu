// Shared page frame: nav, language switch, limits note, footer.
import '../style.css';
import { detectLang, getLang, setLang, t } from '../i18n/lang';
import type { Lang, StrKey } from '../i18n/strings';

export type Page = 'cast' | 'history' | 'learn' | 'about' | 'settings';
// Small line icons for the mobile bottom bar (stroke = currentColor).
const ICON: Record<Page, string> = {
  cast: '<path d="M4 6h16M4 12h6m4 0h6M4 18h16"/>',
  history: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  learn: '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/>',
  about: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
};
const PAGES: { id: Page; href: string; label: StrKey }[] = [
  { id: 'cast', href: './', label: 'navCast' },
  { id: 'history', href: './history.html', label: 'navHistory' },
  { id: 'learn', href: './learn.html', label: 'navLearn' },
  { id: 'about', href: './about.html', label: 'navAbout' },
  { id: 'settings', href: './settings.html', label: 'navSettings' },
];

export const REPO = 'https://github.com/williamwuofficial/meihua-yishu';
export const SISTER = 'https://williamwuofficial.github.io/ziwei-chart/';

/** The full limits note: lives on the 須知 / About page. */
export function limitsNote() {
  return `<aside class="limits" role="note" id="limits"><strong>${t('limitsTitle')}</strong><p>${t('limits')}</p></aside>`;
}

/** One line that keeps the limits visible wherever an answer is shown, linking to the full note. */
export function limitsLink() {
  return `<p class="limits-line">${t('limitsTitle')} · <a href="./about.html#limits">${t('readMore')}</a></p>`;
}

/** Mount a page. `body` is re-run on every language change; `after` wires page-specific bits. */
export function mount(page: Page, title: StrKey, body: () => string, after?: () => void) {
  let saved: string | null = null;
  try { saved = localStorage.getItem('meihua.lang'); } catch { /* storage blocked */ }
  setLang(detectLang(saved));

  const render = () => {
    const lang = getLang();
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'zh-CN' ? 'zh-Hans' : 'zh-Hant';
    document.documentElement.dataset.script = lang;
    document.title = page === 'cast' ? t('title') : `${t(title)} · ${t('siteName')}`;
    const btn = (l: Lang, label: string) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}">${label}</button>`;
    const nav = PAGES.map((p) => `<a href="${p.href}"${p.id === page ? ' aria-current="page"' : ''}>`
      + `<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">${ICON[p.id]}</svg><span>${t(p.label)}</span></a>`).join('');
    document.getElementById('app')!.innerHTML = `
      <header class="site-header">
        <div class="topbar">
          <nav class="site-nav" aria-label="${t('navLabel')}">${nav}</nav>
          <div class="langs" role="group" aria-label="Language">${btn('zh-TW', '繁')}${btn('zh-CN', '简')}${btn('en', 'EN')}</div>
        </div>
        <h1>${t(title)}</h1>
        ${page === 'cast' ? `<p class="tagline">${t('subtitle')}</p>` : ''}
      </header>
      <main>${body()}</main>
      <footer class="site-footer"><p>${t('footer')} · <a href="${REPO}" target="_blank" rel="noopener">GitHub</a> · MIT</p></footer>`;
    after?.();
  };

  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-lang]');
    if (!el) return;
    beforeLangChange?.();
    setLang(el.dataset.lang as Lang);
    try { localStorage.setItem('meihua.lang', el.dataset.lang!); } catch { /* storage blocked */ }
    render();
  });
  render();
  return render;
}

let beforeLangChange: (() => void) | undefined;
/** Let a page save form state before a language switch re-renders it. */
export const onBeforeLangChange = (f: () => void) => { beforeLangChange = f; };
