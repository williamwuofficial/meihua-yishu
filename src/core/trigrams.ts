// The eight trigrams (八卦) with their 先天 numbers, line patterns and five elements.
// 先天 numbers: 《梅花易數》卷首「乾一、兌二、離三、震四、巽五、坎六、艮七、坤八。此先天橫圖八卦之定數也。」
// Elements: 《梅花易數》卷一「八宮所屬五行」「乾、兌，金；坤、艮，土；震、巽，木；坎，水；離，火。」

export type Element = 'metal' | 'wood' | 'water' | 'fire' | 'earth';
export type Line = 0 | 1; // 0 = yin (- -), 1 = yang (—)

export interface Trigram {
  /** 先天 number 1–8. */
  num: number;
  name: string;
  /** The image named in 卦名 such as 澤火革. */
  image: string;
  symbol: string;
  /** Lines bottom → top. */
  lines: [Line, Line, Line];
  element: Element;
  pinyin: string;
  /** Short English gloss of the image. */
  en: string;
}

export const TRIGRAMS: readonly Trigram[] = [
  { num: 1, name: '乾', image: '天', symbol: '☰', lines: [1, 1, 1], element: 'metal', pinyin: 'Qián', en: 'Heaven' },
  { num: 2, name: '兌', image: '澤', symbol: '☱', lines: [1, 1, 0], element: 'metal', pinyin: 'Duì', en: 'Lake' },
  { num: 3, name: '離', image: '火', symbol: '☲', lines: [1, 0, 1], element: 'fire', pinyin: 'Lí', en: 'Fire' },
  { num: 4, name: '震', image: '雷', symbol: '☳', lines: [1, 0, 0], element: 'wood', pinyin: 'Zhèn', en: 'Thunder' },
  { num: 5, name: '巽', image: '風', symbol: '☴', lines: [0, 1, 1], element: 'wood', pinyin: 'Xùn', en: 'Wind' },
  { num: 6, name: '坎', image: '水', symbol: '☵', lines: [0, 1, 0], element: 'water', pinyin: 'Kǎn', en: 'Water' },
  { num: 7, name: '艮', image: '山', symbol: '☶', lines: [0, 0, 1], element: 'earth', pinyin: 'Gèn', en: 'Mountain' },
  { num: 8, name: '坤', image: '地', symbol: '☷', lines: [0, 0, 0], element: 'earth', pinyin: 'Kūn', en: 'Earth' },
];

export const trigram = (num: number): Trigram => {
  const t = TRIGRAMS[num - 1];
  if (!t) throw new RangeError(`trigram number must be 1–8, got ${num}`);
  return t;
};

export const trigramFromLines = (l: readonly Line[]): Trigram => {
  const t = TRIGRAMS.find((t) => t.lines[0] === l[0] && t.lines[1] === l[1] && t.lines[2] === l[2]);
  if (!t) throw new Error(`bad lines ${l.join('')}`);
  return t;
};

export const ELEMENT_ZH: Record<Element, string> = { metal: '金', wood: '木', water: '水', fire: '火', earth: '土' };

// 《梅花易數》卷一「五行生克」「金生水，水生木，木生火，火生土，土生金；金克木，木克土，土克水，水克火，火克金。」
const GENERATES: Record<Element, Element> = { metal: 'water', water: 'wood', wood: 'fire', fire: 'earth', earth: 'metal' };
const OVERCOMES: Record<Element, Element> = { metal: 'wood', wood: 'earth', earth: 'water', water: 'fire', fire: 'metal' };
export const generates = (a: Element, b: Element) => GENERATES[a] === b;
export const overcomes = (a: Element, b: Element) => OVERCOMES[a] === b;
