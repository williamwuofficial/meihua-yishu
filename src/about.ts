// Method & sources page: what the app draws on, the judgement calls it makes, and its limits.
import { WORKS } from './core/sources';
import { pick, t, zh } from './i18n/lang';
import { esc } from './ui/common';
import { limitsNote, mount, REPO, SISTER } from './ui/shell';

type Text = { zh: string; en: string };
const p = (x: Text) => `<p>${esc(pick(x))}</p>`;
const li = (xs: Text[]) => `<ul>${xs.map((x) => `<li>${esc(pick(x))}</li>`).join('')}</ul>`;

const WORK_NOTES: Record<keyof typeof WORKS, Text> = {
  'meihua-0': { zh: '序、目錄與附錄；先天數與體用的定義在此。', en: 'Preface, contents and appendix; the 先天 numbers and the definition of 體 and 用 are here.' },
  'meihua-1': { zh: '起卦方法與 11 個實例（觀梅、牡丹等）。', en: 'Casting methods and 11 worked examples (plum blossom, peony and others).' },
  'meihua-2': { zh: '體用總訣、衰旺論、靜占、起卦加數例。', en: 'The 體用 rules, seasonal strength, quiet-room casting, and adding a number.' },
  'meihua-3': { zh: '體用互變、生剋與衰旺之訣。', en: 'Rules on 互 and 變, 生剋 and strength.' },
  'wuxing-2': { zh: '隋代蕭吉著。「論四時休王」提供旺相休囚死五個等級。', en: 'By Xiao Ji (Sui dynasty). Its section on the seasons gives the five grades of strength.' },
};

function body() {
  const works = (Object.keys(WORKS) as (keyof typeof WORKS)[]).map((k) =>
    `<li><a href="${WORKS[k].url}" target="_blank" rel="noopener">${esc(pick({ zh: WORKS[k].zh, en: `${WORKS[k].en} · ${WORKS[k].zh}` }))}</a>：${esc(pick(WORK_NOTES[k]))}</li>`).join('');
  return limitsNote()
    + `<section class="card"><h2>${esc(pick({ zh: '原則', en: 'Principles' }))}</h2>${li([
      { zh: '每一句解讀都來自一條有出處的古文規則；沒有 AI，沒有自由生成的文字。', en: 'Every statement in a reading comes from a cited classical rule. No AI, no free-form generated text.' },
      { zh: t('aboutSoft'), en: t('aboutSoft') },
      { zh: '不提供醫療、法律或財務建議，不提供化解、符咒或改運。', en: 'No medical, legal or financial advice; no remedies, charms or ways to change fate.' },
      { zh: '問題只在你的瀏覽器中處理，不會傳送到任何伺服器；紀錄預設關閉，開啟後也只存在本機。', en: 'Your question is handled in your browser only and never sent to a server; history is off by default and, when on, stays on this device.' },
    ])}</section>`
    + `<section class="card"><h2>${esc(pick({ zh: '古籍來源', en: 'Classical sources' }))}</h2>`
    + p({ zh: '全部使用維基文庫上的公有領域文本。網站顯示的每一句引文，都由程式逐字核對下載的原文。', en: 'All texts are public domain, from Wikisource. A script checks every quote the site shows, character by character, against the downloaded text.' })
    + `<ul>${works}<li><a href="https://zh.wikisource.org/wiki/周易" target="_blank" rel="noopener">${esc(zh('《周易》'))}</a>：${esc(pick({ zh: '六十四卦的卦辭、爻辭、彖傳與象傳。', en: 'The judgements, line texts and commentaries of the 64 hexagrams.' }))}</li></ul>`
    + p({ zh: t('aboutMeihua'), en: t('aboutMeihua') })
    + p({ zh: t('aboutWuxing'), en: t('aboutWuxing') })
    + `</section>`
    + `<section class="card"><h2>${esc(pick({ zh: '本網站的取捨', en: 'Judgement calls this site makes' }))}</h2>`
    + p({ zh: '以下幾點書中沒有明說，或有不同寫法。可在「設定」更改的已註明。', en: 'The book is silent or inconsistent on these points. The ones you can change in Settings are marked.' })
    + li([
      { zh: '時令按農曆月份（正月建寅）劃分，與書中數月份的方法一致；也可改用節氣月建（設定）。', en: 'Seasons follow the lunar month (正月 = 寅), matching how the book counts months; solar-term months are an option (Settings).' },
      { zh: '23:00 起為子時，預設算作次日；也可改為午夜換日（設定）。', en: 'From 23:00 the hour is 子 and counts as the next day by default; the day can change at midnight instead (Settings).' },
      { zh: '兩個數時，是否把時辰數加入動爻：書中兩種都有，預設加入（設定）。', en: 'With two numbers, whether to add the hour to the moving line: the book does both; it is added by default (Settings).' },
      { zh: '一個數時依「物數占例」：此數為上卦、時辰為下卦。', en: 'One number follows the object-count example: the number is the upper trigram, the hour the lower.' },
      { zh: '年份以正月初一換年，不以立春。', en: 'The year changes at the lunar new year, not at 立春.' },
      { zh: '閏月按其本月數計算。', en: 'A leap month counts as its ordinary month number.' },
      { zh: '本網站看不到身邊的徵兆（外應），因此依「靜占」只看卦內體用與時令。', en: 'The site cannot see omens around you (外應), so it follows the quiet-room rule and reads only 體用 and the season.' },
      { zh: '「簡答」：失物、行人、見人、出行、計畫、功名各依書中「失物占」「行人占」「謁見占」「出行占」「求謀占」「求名占」的五種斷語（已改寫得較溫和）；失物另依變卦指出尋找的方位。財運、疾病、官司等類別刻意不收。', en: 'Quick answers: lost items, someone away, seeing someone, travel, plans and recognition each use the book\'s own five verdicts for that kind of question, softened; for a lost item the changed trigram also says where to look. Money, illness and legal questions are left out on purpose.' },
      { zh: '「簡答」：一般問題依「人事占」只看你與所問之事的關係；天氣依「天時占」不分你我，數本卦、互卦、變卦共六個八卦。書中沒說「多」是多少，本網站以坎、離相比，多者為準；各一個時互相抵消，看其餘的卦；坎、離各兩個以上為「重坎重離」，晴雨不定。', en: 'Quick answers: general questions follow 人事占 and look only at you against the matter. Weather follows 天時占, ignores that, and counts the six trigrams of the main, nuclear and changed hexagrams. The book never says how many is "many": the site compares 坎 with 離 and takes the larger; one of each cancels out and the others decide; two or more of each is 重坎重離, changeable.' },
      { zh: '互卦只作兩個八卦看，不列卦辭。', en: 'The 互 is read as two trigrams, with no hexagram text.' },
      { zh: '卷二「起卦加數例」中「余三為初爻」與算式（餘三應為第三爻）不符；本網站按算式，測試亦據此。', en: 'In vol. 2\'s adding-a-number example the text says the remainder 3 is the first line, but the arithmetic and the resulting hexagram need the third line; the site follows the arithmetic, and so do its tests.' },
    ])
    + `</section>`
    + `<section class="card"><h2>${esc(pick({ zh: '測試', en: 'Testing' }))}</h2>`
    + p({ zh: '自動測試重現了卷一全部 11 個實例（觀梅、牡丹、借物、今日動靜、西林寺兩例、老人、少年、牛、雞、枯枝）與卷二起卦加數例的 3 個實例，並核對書中各例的體用生剋。', en: 'Automated tests reproduce all 11 worked examples in vol. 1 and the 3 in vol. 2\'s adding-a-number example, and check the book\'s 體用 readings for them.' })
    + p({ zh: '這些測試只證明計算與古書一致，不代表占卜本身有效。', en: 'These tests show only that the arithmetic matches the book. They say nothing about whether divination works.' })
    + `<p><a href="${REPO}" target="_blank" rel="noopener">${t('aboutCode')} ↗</a> · <a href="${SISTER}" target="_blank" rel="noopener">${t('sister')} ↗</a></p></section>`;
}

mount('about', 'aboutTitle', body);
