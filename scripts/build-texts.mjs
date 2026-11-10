// Extracts 卦辭, 爻辭, 彖 and 象 from the cached Wikisource 《周易》 pages into src/data/zhouyi.json.
//   npm run fetch-sources && npm run build-texts
// The JSON is committed (public domain) so the site and tests need no network.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dir = join(root, '.cache/sources');
const index = readFileSync(join(dir, '周易.wiki'), 'utf8');
const sect = index.slice(index.indexOf('上下經卦名次序'), index.indexOf('分宮卦象'));
const names = [...sect.matchAll(/\[\[\/([^|\]]+)/g)].map((m) => m[1]);

export const clean = (s) =>
  s
    .replace(/-\{T\|[^}]*\}-/g, '')
    .replace(/-\{([^}]*)\}-/g, '$1')
    .replace(/\{\{\*\|[^}]*\}\}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/'''/g, '')
    .trim();

const TRI = { 乾: 1, 兌: 2, 離: 3, 震: 4, 巽: 5, 坎: 6, 艮: 7, 坤: 8 };
const out = [];
names.forEach((name, i) => {
  const text = readFileSync(join(dir, 'zhouyi', name + '.wiki'), 'utf8');
  const lines = text.split('\n');
  const head = clean(lines.find((l) => /^\[\[(File|Image):/.test(l)).replace(/\[\[[^\]]+\]\]/, ''));
  const m = head.match(/^(.)下(.)上$/);
  if (!m) throw new Error(`${name}: cannot read trigrams from "${head}"`);
  let sec = '';
  const h = { number: i + 1, name, lower: TRI[m[1]], upper: TRI[m[2]], judgement: '', lines: [], extra: null, tuan: [], daxiang: '', xiaoxiang: [] };
  for (const l of lines) {
    if (l.includes('易經：')) { sec = 'jing'; continue; }
    if (l.includes('彖曰：')) { sec = 'tuan'; continue; }
    if (l.includes('象曰：')) { sec = 'xiang'; continue; }
    if (l.includes('文言曰：')) { sec = 'wenyan'; continue; }
    const c = clean(l.replace(/^[*#]+/, ''));
    if (!c) continue;
    if (sec === 'jing') {
      if (l.startsWith('**')) h.judgement = c.replace(/^[^：]+：/, '');
      else if (l.startsWith('*#')) {
        const [label, ...rest] = c.split('：');
        const entry = { label, text: rest.join('：') };
        if (/^用[九六]$/.test(label)) h.extra = entry; else h.lines.push(entry);
      }
    } else if (sec === 'tuan' && l.startsWith('**')) h.tuan.push(c);
    else if (sec === 'xiang') {
      if (l.startsWith('**')) h.daxiang = c;
      else if (l.startsWith('*#')) h.xiaoxiang.push(c);
    }
  }
  if (h.lines.length !== 6) throw new Error(`${name}: ${h.lines.length} lines`);
  if (h.xiaoxiang.length < 6) throw new Error(`${name}: ${h.xiaoxiang.length} 小象`);
  if (!h.judgement || !h.daxiang || !h.tuan.length) throw new Error(`${name}: missing text`);
  h.tuan = h.tuan.join('');
  out.push(h);
});
writeFileSync(join(root, 'src/data/zhouyi.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`zhouyi.json: ${out.length} hexagrams`);
