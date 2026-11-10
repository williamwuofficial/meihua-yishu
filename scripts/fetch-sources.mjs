// Downloads the public-domain source texts from Wikisource into .cache/sources/ (gitignored).
//   npm run fetch-sources
// 《梅花易數》 卷首 + 卷一–三, 《周易》 (64 chapter pages), 《五行大義》 卷二.
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dir = join(root, '.cache/sources');
mkdirSync(join(dir, 'zhouyi'), { recursive: true });
const UA = 'meihua-yishu/0.1 (source verification script)';

async function raw(title) {
  const url = `https://zh.wikisource.org/w/index.php?title=${encodeURIComponent(title)}&action=raw`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${title}: HTTP ${r.status}`);
  return r.text();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const t of ['梅花易數', '梅花易數/卷一', '梅花易數/卷二', '梅花易數/卷三', '五行大義/2', '周易']) {
  const f = join(dir, t.replace('/', '_') + '.wiki');
  if (!existsSync(f)) { writeFileSync(f, await raw(t)); await sleep(300); }
  console.log('ok', t);
}
const index = readFileSync(join(dir, '周易.wiki'), 'utf8');
const sect = index.slice(index.indexOf('上下經卦名次序'), index.indexOf('分宮卦象'));
const names = [...sect.matchAll(/\[\[\/([^|\]]+)/g)].map((m) => m[1]);
if (names.length !== 64) throw new Error(`expected 64 hexagram pages, got ${names.length}`);
for (const n of names) {
  const f = join(dir, 'zhouyi', n + '.wiki');
  if (!existsSync(f)) { writeFileSync(f, await raw('周易/' + n)); await sleep(300); }
}
console.log('ok 周易 × 64');
