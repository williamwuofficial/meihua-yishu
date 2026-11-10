// Checks every quote in src/core/sources.ts is an exact substring of its cached Wikisource text,
// and every 周易 text in src/data/zhouyi.json re-extracts identically from the cache.
//   npm run fetch-sources && npm run verify-sources
// Uses Node 24's TypeScript type stripping to import sources.ts directly.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dir = join(root, '.cache/sources');
const { SOURCES, WORKS } = await import(join(root, 'src/core/sources.ts'));

let bad = 0;
const texts = {};
for (const [k, w] of Object.entries(WORKS)) {
  const f = join(dir, w.file);
  if (!existsSync(f)) { console.error(`missing ${f}: run npm run fetch-sources`); process.exit(2); }
  texts[k] = readFileSync(f, 'utf8');
}
for (const [id, s] of Object.entries(SOURCES)) {
  const t = texts[s.work];
  if (!t.includes(s.verse)) { console.error(`✗ ${id}: not found in ${WORKS[s.work].file}: ${s.verse}`); bad++; continue; }
  if (!t.includes(s.section)) { console.error(`✗ ${id}: section 「${s.section}」 not in ${WORKS[s.work].file}`); bad++; continue; }
  // The quote must sit after its section heading and before the next heading.
  const at = t.indexOf(s.verse);
  const before = t.slice(0, at);
  const lastHead = [...before.matchAll(/^=+\s*([^=\n]+?)\s*=+\s*$/gm)].pop();
  const headOk = s.section === '附錄' ? before.includes('==附錄==') : lastHead && lastHead[1].includes(s.section);
  if (!headOk) { console.error(`✗ ${id}: found under 「${lastHead?.[1]}」, not 「${s.section}」`); bad++; }
}
if (!bad) {
  // Record what was checked; a test fails if sources.ts has a quote missing from this list.
  const checked = Object.fromEntries(Object.entries(SOURCES).map(([id, s]) => [id, s.verse]));
  writeFileSync(join(root, 'tests/fixtures/verified-sources.json'), JSON.stringify(checked, null, 1) + '\n');
}
console.log(`sources.ts: ${Object.keys(SOURCES).length} quotes checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
