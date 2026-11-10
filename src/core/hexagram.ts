// Hexagrams: lookup of the 64 by (upper, lower) trigram and the 周易 text for each.
import data from '../data/zhouyi.json';
import { trigram, trigramFromLines, type Line, type Trigram } from './trigrams';

export interface LineText { label: string; text: string }
export interface HexagramText {
  number: number;
  name: string;
  upper: number;
  lower: number;
  judgement: string;
  lines: LineText[];
  extra: LineText | null;
  tuan: string;
  daxiang: string;
  xiaoxiang: string[];
}

export const HEXAGRAMS = data as HexagramText[];

/** Pinyin of the 64 names in King Wen order, for the English view. */
export const PINYIN = [
  'Qián', 'Kūn', 'Zhūn', 'Méng', 'Xū', 'Sòng', 'Shī', 'Bǐ', 'Xiǎo Xù', 'Lǚ',
  'Tài', 'Pǐ', 'Tóng Rén', 'Dà Yǒu', 'Qiān', 'Yù', 'Suí', 'Gǔ', 'Lín', 'Guān',
  'Shì Kè', 'Bì', 'Bō', 'Fù', 'Wú Wàng', 'Dà Xù', 'Yí', 'Dà Guò', 'Kǎn', 'Lí',
  'Xián', 'Héng', 'Dùn', 'Dà Zhuàng', 'Jìn', 'Míng Yí', 'Jiā Rén', 'Kuí', 'Jiǎn', 'Xiè',
  'Sǔn', 'Yì', 'Guài', 'Gòu', 'Cuì', 'Shēng', 'Kùn', 'Jǐng', 'Gé', 'Dǐng',
  'Zhèn', 'Gèn', 'Jiàn', 'Guī Mèi', 'Fēng', 'Lǚ', 'Xùn', 'Duì', 'Huàn', 'Jié',
  'Zhōng Fú', 'Xiǎo Guò', 'Jì Jì', 'Wèi Jì',
];

export interface Hexagram {
  upper: Trigram;
  lower: Trigram;
  /** Six lines bottom → top. */
  lines: Line[];
  text: HexagramText;
  /** Full name in the 梅花 style: 澤火革, 乾為天. */
  fullName: string;
}

export function hexagram(upper: number, lower: number): Hexagram {
  const u = trigram(upper);
  const l = trigram(lower);
  const text = HEXAGRAMS.find((h) => h.upper === upper && h.lower === lower);
  if (!text) throw new Error(`no hexagram ${upper}/${lower}`);
  const fullName = upper === lower ? `${u.name}為${u.image}` : `${u.image}${l.image}${text.name}`;
  return { upper: u, lower: l, lines: [...l.lines, ...u.lines], text, fullName };
}

export function hexagramFromLines(lines: readonly Line[]): Hexagram {
  return hexagram(trigramFromLines(lines.slice(3, 6)).num, trigramFromLines(lines.slice(0, 3)).num);
}
