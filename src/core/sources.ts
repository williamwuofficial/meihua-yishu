// Every classical quote the app shows. `npm run verify-sources` checks each `verse` is an exact
// substring of the cached Wikisource text for its `work`, so nothing here is written from memory.
// Keep this file self-contained (no imports): the verify script loads it with Node's type stripping.

export type Work = 'meihua-0' | 'meihua-1' | 'meihua-2' | 'meihua-3' | 'wuxing-2';

export interface Source {
  work: Work;
  /** Section heading inside the work, as on Wikisource. */
  section: string;
  /** Exact text from the source (Traditional, as on Wikisource). */
  verse: string;
}

export const WORKS: Record<Work, { zh: string; en: string; file: string; url: string }> = {
  'meihua-0': { zh: '《梅花易數》卷首', en: 'Meihua Yishu, front matter', file: '梅花易數.wiki', url: 'https://zh.wikisource.org/wiki/梅花易數' },
  'meihua-1': { zh: '《梅花易數》卷一', en: 'Meihua Yishu, vol. 1', file: '梅花易數_卷一.wiki', url: 'https://zh.wikisource.org/wiki/梅花易數/卷一' },
  'meihua-2': { zh: '《梅花易數》卷二', en: 'Meihua Yishu, vol. 2', file: '梅花易數_卷二.wiki', url: 'https://zh.wikisource.org/wiki/梅花易數/卷二' },
  'meihua-3': { zh: '《梅花易數》卷三', en: 'Meihua Yishu, vol. 3', file: '梅花易數_卷三.wiki', url: 'https://zh.wikisource.org/wiki/梅花易數/卷三' },
  'wuxing-2': { zh: '《五行大義》卷二', en: 'Wuxing Dayi (Sui, Xiao Ji), vol. 2', file: '五行大義_2.wiki', url: 'https://zh.wikisource.org/wiki/五行大義/2' },
};

export const SOURCES = {
  // --- Casting ---
  xiantian: { work: 'meihua-0', section: '附錄', verse: '乾一、兌二、離三、震四、巽五、坎六、艮七、坤八。此先天橫圖八卦之定數也。' },
  tiyongDef: { work: 'meihua-0', section: '附錄', verse: '凡上下二卦無動爻者為體，有動爻者為用，體卦為主，用卦為事，互卦為事之中應，變卦為事之末應' },
  timeMethod: { work: 'meihua-1', section: '年月日時起例', verse: '年月日為上卦。年月日加時總數為下卦。又以年月日時總數取爻。' },
  timeCounts: { work: 'meihua-1', section: '年月日時起例', verse: '如子年一數，丑年二數，直至亥年十二數。月如正月一數，直至十二月，亦作十二數。日數如初一一數，直至三十日，為三十數。' },
  numberMethod: { work: 'meihua-1', section: '物數占例', verse: '凡見有可數之物，即以此數起作上卦，以時數配作下卦。即以卦數並時數總除六取動爻。' },
  byEight: { work: 'meihua-1', section: '卦以八除', verse: '以餘數作卦。如得八數整，即坤卦，更不必除也。' },
  bySix: { work: 'meihua-1', section: '爻以六除', verse: '以重卦總數除六，以餘數作動爻。' },
  zhangChi: { work: 'meihua-1', section: '丈尺占', verse: '丈尺之物，以丈數為上卦，尺數為下卦。合丈尺之數取爻。' },
  chiCun: { work: 'meihua-1', section: '尺寸占', verse: '以尺數為上卦，寸數為下卦。合尺寸之數加時取爻。' },
  soundMethod: { work: 'meihua-1', section: '聲音占例', verse: '凡聞聲音，數得幾數，起作上卦，加時數配作下卦。' },
  addNumber: { work: 'meihua-2', section: '起卦加數例', verse: '若同一卦，則吉凶莫辨矣。先生以各姓而加數，遂斷之而皆驗。' },
  addNumberWorked: { work: 'meihua-2', section: '起卦加數例', verse: '若寅年三數、十二與一，共十六，加王姓四畫，得二十數，去八一十六，得四，震為上卦；又加午時，七數，總二十七數，去三八二十四，得三，離為下卦。' },
  plumExample: { work: 'meihua-1', section: '觀梅占', verse: '辰年五數，十二月十二數，十七日十七數，共三十四數，除四八三十二，餘二，屬兌，為上卦，加申時九數，總得四十三數，五八除四十，餘得三數，為離，作下卦。又上下總四十三數，以六除，六七四十二，餘一為動爻，是為澤火革。初爻變咸，互見乾巽。' },
  plumTiYong: { work: 'meihua-1', section: '觀梅占', verse: '右兌金為體，離火克之。' },
  plumBian: { work: 'meihua-1', section: '觀梅占', verse: '幸變為艮土，兌金得生' },
  trigramShapes: { work: 'meihua-1', section: '八卦象例', verse: '乾三連，坤六斷，震仰盂，艮覆碗，離中虛，坎中滿，兌上缺，巽下斷。' },
  addHour: { work: 'meihua-1', section: '爻以六除', verse: '取爻當以時加之。' },
  flipLine: { work: 'meihua-1', section: '爻以六除', verse: '若一爻動，則看此一爻，是陽爻則變陰爻，陰爻則變陽爻。' },
  huMethod: { work: 'meihua-1', section: '互卦起例', verse: '互卦以重卦去了初爻及第六爻，以中間四爻分作兩卦，看得何卦。' },
  huTrigramsOnly: { work: 'meihua-1', section: '互卦起例', verse: '互卦只用八卦，不必取六十四卦名。' },
  qianKunNoHu: { work: 'meihua-1', section: '互卦起例', verse: '乾坤無互，互其變卦。' },
  noReason: { work: 'meihua-2', section: '動靜', verse: '不動不占，不因事不占。' },
  quietRoom: { work: 'meihua-2', section: '靜占', verse: '凡占在靜室，無所聞見，則無外卦，即不論外卦。但以全卦年月日值五行衰旺之氣，以體用決之。' },
  useYiText: { work: 'meihua-2', section: '遺論', verse: '若得《易》卦爻，觀其爻辭，以斷吉凶悔吝，更為妙也' },

  // --- Topic rules (卷二「體用生克篇之二」) ---
  renShi: { work: 'meihua-2', section: '人事占第二', verse: '人事之占，詳觀體用。體卦為主，用卦為賓。用克體不宜，體克用則吉。用生體有進益之喜，體生用有耗失之患。體用比和，謀為吉利。' },
  lostRule: { work: 'meihua-2', section: '失物占第十五', verse: '占失物，以體為主，用為失物。體克用，可尋遲得；用克體，不可尋。體生用，物難見；用生體，物易尋。體用比和，物不失矣。' },
  lostWhere: { work: 'meihua-2', section: '失物占第十五', verse: '又以變卦為失物之所在。' },
  lost1: { work: 'meihua-2', section: '失物占第十五', verse: '如變是乾，則覓於西北或公榭樓閣之所，或金石之傍，或圓器之中，或高亢之地。' },
  lost2: { work: 'meihua-2', section: '失物占第十五', verse: '兌則尋於西方，或居澤畔，或敗垣破壁之內，或廢井缺沼之中。' },
  lost3: { work: 'meihua-2', section: '失物占第十五', verse: '離則尋於南方，或皰廚之間，或爐冶之傍，或在明窗，或遺虛室，或在文書之側，或在煙火之地。' },
  lost4: { work: 'meihua-2', section: '失物占第十五', verse: '震則尋於東方，或山林之所，或叢棘之內，鐘鼓之傍，或鬧市之地，或大途之所。' },
  lost5: { work: 'meihua-2', section: '失物占第十五', verse: '巽則尋於東南方，或山林之所，或寺觀之地，或菜蔬之園，或舟居之間，或木器之內。' },
  lost6: { work: 'meihua-2', section: '失物占第十五', verse: '坎則尋於北方，多藏於水邊或溪井溝渠之處，或酒醋之邊，或魚鹽之地。' },
  lost7: { work: 'meihua-2', section: '失物占第十五', verse: '艮則尋於東北方，或山林之內，或近路邊，或岩石傍，或藏土穴。' },
  lost8: { work: 'meihua-2', section: '失物占第十五', verse: '變卦是坤，則覓于西南方，或田野之所，或倉稟之處，或稼穡之處，或土窖穴藏之所，或瓦器方器之中。' },
  travellerRule: { work: 'meihua-2', section: '行人占第十三', verse: '占行人，以體為主，用為行人。體克用，行人歸遲；用克體，行人不歸。體生用，行人未歸；用生體，行人即歸。體用比和，歸期不日矣。' },
  visitRule: { work: 'meihua-2', section: '謁見占第十四', verse: '占謁見，以體為主，用為所見之人。體克用，可見；用克體，不見。體生用，難見，見之而無益；用生體，可見，見之且有得。體用比和，歡然相見。' },
  travelRule: { work: 'meihua-2', section: '出行占第十二', verse: '占出行，以體為主，用為所行之應。體克用，可行，所至多得意。用克體，出則有禍。體生用，出行有破耗之失；用生體，有意外之財。體用比和，出行順快。' },
  planRule: { work: 'meihua-2', section: '求謀占第八', verse: '占求謀，以體為主，用為所謀之事。體克用，謀雖可成，但成遲。用克體，求謀不成，謀亦有害。用生體。不謀而成；體生用，多謀少遂。體用比和，求謀稱意。' },
  recognitionRule: { work: 'meihua-2', section: '求名占第九', verse: '凡占求名，以體為主，用為名。體克用，名可成，但成遲。用克體，名不可成。體生用，名不可就，或因名有喪。用生體，名易成，或因名有得。體用比和，功名稱意。' },
  weatherNoTiYong: { work: 'meihua-2', section: '天時占第一', verse: '凡占天時，不分體用，全觀諸卦，詳推五行。' },
  weatherMain: { work: 'meihua-2', section: '天時占第一', verse: '離多主晴，坎多主雨，坤乃陰晦，乾主晴明，震多則春夏雷轟，巽多則四時風烈，艮多則久雨必晴，兌多則不雨亦陰。' },
  weatherSeason: { work: 'meihua-2', section: '天時占第一', verse: '夏占離多而無坎，則亢旱炎炎。冬占坎多而無離，則雨雪飄飄。' },
  weatherAll: { work: 'meihua-2', section: '天時占第一', verse: '全觀諸卦者，謂互變卦。' },
  weatherQianKun: { work: 'meihua-2', section: '天時占第一', verse: '乾、坤兩同，晴雨時變。坤、艮兩並，陰晦不常。' },
  weatherKanLi: { work: 'meihua-2', section: '天時占第一', verse: '若逢重坎重離，亦日時晴時雨。' },

  // --- Five elements ---
  elements: { work: 'meihua-1', section: '八宮所屬五行', verse: '乾、兌，金；坤、艮，土；震、巽，木；坎，水；離，火。' },
  generating: { work: 'meihua-1', section: '五行生克', verse: '金生水，水生木，木生火，火生土，土生金；' },
  overcoming: { work: 'meihua-1', section: '五行生克', verse: '金克木，木克土，土克水，水克火，火克金。' },

  // --- 體用 relations (卷二「體用總訣」) ---
  tiKeYong: { work: 'meihua-2', section: '體用總訣', verse: '體克用，諸事吉' },
  yongKeTi: { work: 'meihua-2', section: '體用總訣', verse: '用克體，諸事凶' },
  tiShengYong: { work: 'meihua-2', section: '體用總訣', verse: '體生用，有耗失之患' },
  yongShengTi: { work: 'meihua-2', section: '體用總訣', verse: '用生體，有進益之喜' },
  biHe: { work: 'meihua-2', section: '體用總訣', verse: '體用比和，則百事順遂' },
  tiShengLeak: { work: 'meihua-2', section: '體用總訣', verse: '體生用，為之洩氣' },
  stages: { work: 'meihua-2', section: '體用總訣', verse: '互乃中間之應，變乃末後之期。' },
  yongVsBian: { work: 'meihua-2', section: '體用總訣', verse: '用吉變凶者，先吉後凶；用凶變吉者，先凶後吉。' },
  party: { work: 'meihua-2', section: '體用總訣', verse: '體党多而體勢盛，用黨多則體勢衰。' },
  noShengKe: { work: 'meihua-2', section: '體用總訣', verse: '生克不逢，則止以本卦而論之。' },
  tally: { work: 'meihua-2', section: '體用', verse: '生體多者則愈吉，克體多者則愈凶。' },
  order: { work: 'meihua-3', section: '體用互變之訣', verse: '卦用最緊，互次之，變卦又次之。' },
  huTiFirst: { work: 'meihua-3', section: '體用互變之訣', verse: '體互最緊，用互次之。' },
  bianKeTi: { work: 'meihua-3', section: '體用互變之訣', verse: '變卦克體，事於末後，必有不吉。' },
  bianShengTi: { work: 'meihua-3', section: '體用互變之訣', verse: '變生體及比和，則事事臨終有吉利。' },

  // --- Seasonal strength ---
  wangShuai: { work: 'meihua-2', section: '衰旺論', verse: '旺者，如春震、巽木，夏離火，秋乾、兌金，冬坎水，四季之月坤、艮土是也。衰者，如春坤、艮，夏乾、兌，秋震、巽，冬離，四季之月坎是也。' },
  earthMonths: { work: 'meihua-1', section: '卦氣旺', verse: '坤、艮土旺於辰戌丑未月' },
  tiShouldBeStrong: { work: 'meihua-2', section: '衰旺論', verse: '凡占卜，體卦宜盛旺。' },
  strongWithSheng: { work: 'meihua-2', section: '衰旺論', verse: '氣旺而又逢生則吉，重遇克則凶。' },
  weakWithKe: { work: 'meihua-2', section: '衰旺論', verse: '若體衰而逢克，則其凶甚矣。' },
  weakWithSheng: { work: 'meihua-2', section: '衰旺論', verse: '體衰而有生體之卦，則衰稍解。' },
  helpersStrong: { work: 'meihua-2', section: '衰旺論', verse: '生體之卦氣亦宜旺。克體之卦氣宜衰。' },
  strongResists: { work: 'meihua-3', section: '體用衰旺之訣', verse: '此得令之卦，乘旺之氣，雖有他卦克之，亦無大害。' },
  wuxingSpring: { work: 'wuxing-2', section: '論四時休王', verse: '春則木王。火相。水休。金囚。土死。' },
  wuxingSummer: { work: 'wuxing-2', section: '論四時休王', verse: '夏則火王。土相。木休。水囚。金死。' },
  wuxingLateSummer: { work: 'wuxing-2', section: '論四時休王', verse: '六月則土王。金相。火休。木囚。水死。' },
  wuxingAutumn: { work: 'wuxing-2', section: '論四時休王', verse: '秋則金王。水相。土休。火囚。木死。' },
  wuxingWinter: { work: 'wuxing-2', section: '論四時休王', verse: '冬則水王。木相。金休。土囚。火死。' },
  wuxingFourSeasons: { work: 'wuxing-2', section: '論生死所', verse: '凡五行之王。各七十二日。土居四季。季十八日。' },

  // --- Which trigram supports / presses on 體 (卷二「體用總訣」) ---
  sheng1: { work: 'meihua-2', section: '體用總訣', verse: '乾卦生體，則主公門中有喜益，或功名上有喜' },
  sheng2: { work: 'meihua-2', section: '體用總訣', verse: '兌卦生體，有西方之財，或喜悅事' },
  sheng3: { work: 'meihua-2', section: '體用總訣', verse: '離卦生體，主有南方之財，或有文書之喜' },
  sheng4: { work: 'meihua-2', section: '體用總訣', verse: '震卦生體，則主山林之益，或因山林得財，或進東方之財，或因動中有喜' },
  sheng5: { work: 'meihua-2', section: '體用總訣', verse: '巽卦生體，亦主山林之益，或因山林得財，或于東南得財' },
  sheng6: { work: 'meihua-2', section: '體用總訣', verse: '坎卦生體，有北方之喜，或受北方之財' },
  sheng7: { work: 'meihua-2', section: '體用總訣', verse: '艮卦生體，有東北方之財，或山田之喜' },
  sheng8: { work: 'meihua-2', section: '體用總訣', verse: '坤卦生體，主有田土之喜，或有田土進財' },
  ke1: { work: 'meihua-2', section: '體用總訣', verse: '乾卦克體，主有公事之憂，或門戶之憂，或有財寶之失' },
  ke2: { work: 'meihua-2', section: '體用總訣', verse: '兌卦克體，不利西方，主口舌事之紛爭。' },
  ke3: { work: 'meihua-2', section: '體用總訣', verse: '離卦克體，主文書之憂，或失火之驚' },
  ke4: { work: 'meihua-2', section: '體用總訣', verse: '震卦克體，主有虛驚，常多恐懼，或身心不能安靜' },
  ke5: { work: 'meihua-2', section: '體用總訣', verse: '巽卦克體，亦有草木姓人相害，或于山林上生憂。' },
  ke6: { work: 'meihua-2', section: '體用總訣', verse: '坎卦克體，主有險陷之事，或寇盜之憂' },
  ke7: { work: 'meihua-2', section: '體用總訣', verse: '艮卦克體，諸事多違，百謀中阻。' },
  ke8: { work: 'meihua-2', section: '體用總訣', verse: '坤卦克體，主有田土之憂，或于田土有損' },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;
