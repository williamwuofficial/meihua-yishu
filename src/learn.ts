// Learn page: the trigrams, the casting methods, 體用, 生剋 and the seasons, with the 觀梅 example worked through.
import { SEASON_LABEL, STRENGTH_EN, strength, type Season } from './core/analysis';
import { castFromNumbers, timeNumbers } from './core/cast';
import type { SourceId } from './core/sources';
import { ELEMENT_ZH, TRIGRAMS, type Element } from './core/trigrams';
import { getLang, pick, t, zh } from './i18n/lang';
import { cite, esc, hexName } from './ui/common';
import { hexSvg, trigramSvg } from './ui/hexsvg';
import { mount } from './ui/shell';

type Text = { zh: string; en: string };
const p = (x: Text) => `<p>${esc(pick(x))}</p>`;
const section = (title: Text, body: string, sources: SourceId[] = []) =>
  `<section class="card learn"><h2>${esc(pick(title))}</h2>${body}${cite(sources)}</section>`;

const SHAPES: Record<number, Text> = {
  1: { zh: '三連', en: 'three solid' },
  2: { zh: '上缺', en: 'open on top' },
  3: { zh: '中虛', en: 'hollow middle' },
  4: { zh: '仰盂', en: 'upturned bowl' },
  5: { zh: '下斷', en: 'broken below' },
  6: { zh: '中滿', en: 'full middle' },
  7: { zh: '覆碗', en: 'overturned bowl' },
  8: { zh: '六斷', en: 'six broken' },
};

function trigramTable() {
  const rows = TRIGRAMS.map((tr) => {
    const svg = trigramSvg(tr.lines, tr.name);
    return `<tr><td class="num">${tr.num}</td><td>${tr.symbol}</td><td lang="zh-Hant"><strong>${zh(tr.name)}</strong> ${zh(tr.image)}${getLang() === 'en' ? ` · ${tr.pinyin} · ${tr.en}` : ''}</td>`
      + `<td>${zh(ELEMENT_ZH[tr.element])}${getLang() === 'en' ? ` ${tr.element}` : ''}</td><td>${esc(pick(SHAPES[tr.num]))}</td><td class="mini">${svg}</td></tr>`;
  }).join('');
  const head = getLang() === 'en'
    ? '<th>先天 no.</th><th></th><th>Trigram</th><th>Element</th><th>Shape</th><th></th>'
    : `<th>${zh('先天數')}</th><th></th><th>${zh('卦')}</th><th>${zh('五行')}</th><th>${zh('卦象')}</th><th></th>`;
  return `<div class="scroll"><table class="tbl"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function seasonTable() {
  const seasons: Season[] = ['spring', 'summer', 'earth', 'autumn', 'winter'];
  const els: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const head = `<th></th>${els.map((e) => `<th>${zh(ELEMENT_ZH[e])}</th>`).join('')}`;
  const rows = seasons.map((s) => `<tr><th>${esc(pick(SEASON_LABEL[s]))}</th>${els.map((e) => {
    const st = strength(s, e);
    return `<td><span class="st st-${st}">${zh(st)}</span>${getLang() === 'en' ? `<br><small>${STRENGTH_EN[st]}</small>` : ''}</td>`;
  }).join('')}</tr>`).join('');
  return `<div class="scroll"><table class="tbl center"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

const RELATIONS: { name: string; text: Text; src: SourceId }[] = [
  { name: '體克用', src: 'tiKeYong', text: { zh: '你能掌握此事，傳統視為順利。', en: '體 masters 用: you have the upper hand; read as going well.' } },
  { name: '用生體', src: 'yongShengTi', text: { zh: '事情助益於你，傳統視為有進益。', en: '用 supports 體: the matter feeds you; read as gain.' } },
  { name: '體用比和', src: 'biHe', text: { zh: '同氣相合，傳統視為順遂。', en: 'Same element: in step; read as smooth.' } },
  { name: '體生用', src: 'tiShengYong', text: { zh: '你付出較多，傳統提醒有耗損。', en: '體 feeds 用: the matter draws on you; read as drain or expense.' } },
  { name: '用克體', src: 'yongKeTi', text: { zh: '事情對你形成壓力，傳統提醒宜審慎。', en: '用 presses on 體: the matter weighs on you; read as resistance, so take care.' } },
];

function example() {
  const n = timeNumbers({ yearBranch: '辰', month: 12, day: 17, hourBranch: '申' });
  const c = castFromNumbers(n);
  const card = (label: string, h: typeof c.ben, moving?: number, ti?: 'upper' | 'lower', name = hexName(h)) =>
    `<figure class="mini-hex">${hexSvg({ lines: h.lines, moving, tiPosition: ti, label: name }, zh('體'), zh('用'))}<figcaption>${label}<br><strong lang="zh-Hant">${esc(name)}</strong></figcaption></figure>`;
  const steps: Text[] = [
    { zh: `辰年 5 + 十二月 12 + 十七日 17 = ${n.upper}，除去 8 的倍數餘 2 → 兌，為上卦。`, en: `辰 year 5 + 12th month 12 + 17th day 17 = ${n.upper}; take away eights, remainder 2 → 兌, the upper trigram.` },
    { zh: `再加申時 9 = ${n.lower}，餘 3 → 離，為下卦：澤火革。`, en: `Add the 申 hour, 9: ${n.lower}, remainder 3 → 離, the lower trigram: 澤火革.` },
    { zh: `${n.line} 除去 6 的倍數餘 1 → 初爻動，變為澤山咸；互卦得乾、巽。`, en: `${n.line} less sixes leaves 1 → the bottom line moves, giving 澤山咸; the 互 trigrams are 乾 and 巽.` },
    { zh: '動爻在下卦，所以上卦兌（金）為體，下卦離（火）為用：火克金，用克體。', en: 'The moving line is in the lower trigram, so the upper 兌 (metal) is 體 and the lower 離 (fire) is 用: fire overcomes metal, so 用 presses on 體.' },
    { zh: '變卦下卦成艮（土），土生金：結局轉而生體。書中據此推斷有人受驚跌傷，但不至有大礙。', en: 'The changed lower trigram is 艮 (earth), and earth feeds metal, so the end turns to support 體. From this the book infers someone takes a fright and a minor injury, but nothing serious.' },
  ];
  return `<div class="hex-row">${card(t('ben'), c.ben, c.moving, c.tiPosition)}${card(t('hu'), c.hu, undefined, undefined, zh(`${c.hu.lower.name}下${c.hu.upper.name}上`))}${card(t('bian'), c.bian, undefined, c.tiPosition)}</div>`
    + `<ol>${steps.map((s) => `<li>${esc(pick(s))}</li>`).join('')}</ol>`
    + `<p class="hint">${esc(pick({ zh: '本網站的測試重現了卷一全部 11 個實例與卷二「起卦加數例」的 3 個實例。', en: 'The site\'s tests reproduce all 11 worked examples in vol. 1 and the 3 in vol. 2\'s 起卦加數例.' }))}</p>`;
}

function body() {
  const yong = RELATIONS.map((r) => `<li><strong lang="zh-Hant">${zh(r.name)}</strong>：${esc(pick(r.text))}</li>`).join('');
  return ''
    + section({ zh: '梅花易數是什麼', en: 'What is Plum Blossom Numerology?' },
      p({ zh: '梅花易數是一種用數字起卦、再以五行生剋解讀的占法。傳說北宋邵雍觀梅時見二雀爭枝墜地而起卦，故名。現存《梅花易數》一般認為成書於明代，作者歸屬並不可靠。', en: 'Plum Blossom Numerology casts a hexagram from numbers and reads it through the five elements. Legend says Shao Yong (Northern Song) first used it when he saw two sparrows fight and fall from a plum branch, hence the name. The book we have is generally dated to the Ming, so the attribution is unreliable.' })
      + p({ zh: '它與《易經》共用六十四卦，但解讀重心不同：梅花主要看「體」與「用」兩個八卦之間的五行關係，再參看卦爻辭。', en: 'It shares the 64 hexagrams of the Book of Changes, but reads them differently: the focus is the five-element relation between two trigrams, 體 and 用, with the hexagram and line texts as a further layer.' }),
      ['useYiText'])
    + section({ zh: '八卦與先天數', en: 'The eight trigrams and their numbers' },
      p({ zh: '每個八卦由三條爻組成（陽爻為實線，陰爻為斷線，由下往上數）。梅花用「先天數」把數字對應到八卦，並給每卦一個五行。', en: 'Each trigram has three lines, read from the bottom up: solid lines are yang, broken lines yin. Meihua maps numbers to trigrams with the 先天 numbers below, and gives each trigram an element.' })
      + trigramTable(), ['xiantian', 'elements', 'trigramShapes'])
    + section({ zh: '起卦方法', en: 'How a hexagram is cast' },
      `<ul>
        <li>${esc(pick({ zh: '以時間：年支數（子 1 … 亥 12）＋農曆月＋農曆日 → 上卦；再加時支數 → 下卦；同一總數除 6 → 動爻。', en: 'By time: year branch (子 1 … 亥 12) + lunar month + lunar day → upper trigram; add the hour branch → lower trigram; the same total divided by 6 → moving line.' }))}</li>
        <li>${esc(pick({ zh: '以一個數：此數 → 上卦；時支數 → 下卦；兩者相加除 6 → 動爻。', en: 'One number: the number → upper; the hour branch → lower; their sum divided by 6 → moving line.' }))}</li>
        <li>${esc(pick({ zh: '以兩個數：第一數 → 上卦；第二數 → 下卦；兩數相加（可再加時支數）除 6 → 動爻。', en: 'Two numbers: first → upper; second → lower; their sum (optionally plus the hour) divided by 6 → moving line.' }))}</li>
        <li>${esc(pick({ zh: '加數：以時間起卦時，可在每個總數中加一個數（書中用姓氏筆畫），讓同時問事的人得到不同的卦。', en: 'Extra number: with the time method you may add a number to every sum (the book uses surname strokes), so people asking at the same hour get different hexagrams.' }))}</li>
      </ul>`
      + p({ zh: '除以 8 的餘數決定八卦（整除即為坤 8）；除以 6 的餘數決定動爻（整除即為第 6 爻）。無論哪一種方法，起卦的日期都會用來判斷時令旺衰。', en: 'The remainder after dividing by 8 gives the trigram (no remainder means 坤, 8); after dividing by 6, the moving line (no remainder means line 6). Whichever method you use, the date of asking sets the season for strength.' })
      + p({ zh: '書中「聲音占例」的寫法是「加時數配作下卦」，與「物數占例」以時數為下卦略有不同；本網站的一個數方法依「物數占例」。', en: 'The book\'s sound example says to add the hour to the count for the lower trigram, which differs slightly from the object-count example where the hour alone is the lower trigram; this site\'s one-number method follows the object-count example.' }),
      ['timeMethod', 'timeCounts', 'numberMethod', 'soundMethod', 'zhangChi', 'chiCun', 'addNumber', 'byEight', 'bySix'])
    + section({ zh: '本卦、互卦、變卦', en: 'Main, nuclear and changed hexagrams' },
      p({ zh: '本卦是起出的卦，代表事情的開始。互卦取本卦第二至四爻與第三至五爻組成兩個八卦，代表過程。變卦把動爻陰陽互換，代表結果。乾、坤兩卦自身沒有互卦，取其變卦的互卦。', en: 'The main hexagram is what you cast: the start of the matter. The nuclear (互) takes lines 2–4 and 3–5 as two trigrams: the course of events. The changed hexagram flips the moving line: the outcome. 乾 and 坤 have no 互 of their own, so theirs is taken from the changed hexagram.' }),
      ['huMethod', 'qianKunNoHu', 'flipLine', 'stages', 'order'])
    + section({ zh: '體與用', en: '體 and 用' },
      p({ zh: '沒有動爻的八卦為「體」，代表問事的你；有動爻的為「用」，代表所問之事。互卦中靠近體的一個為「體互」，較為重要。', en: 'The trigram without the moving line is 體, standing for you; the one with it is 用, the matter you ask about. Of the two 互 trigrams, the one on 體\'s side, 體互, weighs more.' })
      + `<p>${esc(pick({ zh: '體用之間的五種關係：', en: 'The five relations between 體 and 用:' }))}</p><ul>${yong}</ul>`
      + p({ zh: '同樣的五種關係也用來看體與互卦、變卦。生體之卦多則偏吉，克體之卦多則偏難。', en: 'The same five relations are read between 體 and the 互 and changed trigrams. More supporting trigrams lean favourable; more pressing ones lean difficult.' }),
      ['tiyongDef', 'huTiFirst', 'tiKeYong', 'yongShengTi', 'biHe', 'tiShengYong', 'yongKeTi', 'generating', 'overcoming', 'tally'])
    + section({ zh: '時令旺衰', en: 'Seasonal strength' },
      p({ zh: '五行在不同季節強弱不同。體卦當令（旺、相）較有底氣；克體之卦當令則壓力較大。梅花本書只說「旺」與「衰」，五個等級出自《五行大義》，其「王」「死」與梅花的「旺」「衰」完全一致。辰、未、戌、丑四個月為土旺之月。', en: 'Each element is stronger in some seasons than others. A 體 in season (旺 or 相) has reserves; a pressing trigram in season presses harder. Meihua itself names only "strong" and "weak"; the five grades come from the Wuxing Dayi, whose strongest and weakest match Meihua exactly. The 辰, 未, 戌 and 丑 months are earth months.' })
      + seasonTable(), ['wangShuai', 'earthMonths', 'wuxingSpring', 'wuxingSummer', 'wuxingLateSummer', 'wuxingAutumn', 'wuxingWinter', 'wuxingFourSeasons', 'tiShouldBeStrong'])
    + section({ zh: '實例：觀梅占', en: 'Worked example: watching the plum blossom' }, example(), ['plumExample', 'plumTiYong', 'plumBian'])
    + section({ zh: '怎樣問', en: 'How to ask' },
      `<ul>${[
        { zh: '只問真實、當下掛心的一件事；書中說「不動不占，不因事不占」。', en: 'Ask about one real matter that is on your mind now; the book says not to cast without cause.' },
        { zh: '問題具體，例如「這個月開始新計畫是否順利」，而不是「我的將來如何」。', en: 'Be specific: "will starting the project this month go smoothly", not "what is my future".' },
        { zh: '同一問題不要反覆起卦直到得到想要的答案。', en: 'Do not recast the same question until you get the answer you want.' },
        { zh: '把解讀當作思考的切入點：它提出的是值得留意的面向，不是對未來的判斷。', en: 'Treat the reading as a prompt for reflection: it points to things worth weighing, not a verdict on the future.' },
      ].map((x) => `<li>${esc(pick(x))}</li>`).join('')}</ul>`, ['noReason'])
    + `<p class="center"><a class="button" href="./">${t('navCast')} →</a></p>`;
}

mount('learn', 'learnTitle', body);
