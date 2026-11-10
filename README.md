# 梅花易數 · 問事起卦 — Plum Blossom question caster

Type a question, cast a hexagram by the 梅花易數 method, and read the 本卦 / 互卦 / 變卦 with a
體用 five-element analysis. Every statement cites the classical rule it comes from. There is no LLM
and no generated text.

Live: https://williamwuofficial.github.io/meihua-yishu/ · Sister tool: [紫微斗數命盤](https://williamwuofficial.github.io/ziwei-chart/)

> **Tradition, not evidence.** No controlled studies support 梅花易數. The asker chooses the numbers
> or omens, so it is hard to test at all. Use it as a reflective tool. It gives no medical, legal or financial
> advice, and no remedies.

## What it does

- **Casting:** by the time of asking (年月日時起例: lunar year branch + month + day → upper trigram;
  + hour branch → lower trigram; the same total → moving line), or by two numbers you choose (物數占例),
  with an option to add the hour number to the moving line.
- **Hexagrams:** 本卦, 互卦 (lines 2–4 and 3–5, with 「乾坤無互，互其變卦」) and 變卦. The trigram
  without the moving line is 體.
- **Analysis:** 生剋 between 體 and 用, the 體互 and 用互, and the 變 trigram; 體黨 and 用黨 counts;
  a tally of supporting and pressing trigrams; seasonal strength (旺相休囚死) by lunar month.
- **Text:** 卦辭, the moving line's 爻辭 and 小象, 大象 and 彖 from the 周易.
- **Privacy:** the question never leaves the browser. History is opt-in and kept in `localStorage` only.
- **Languages:** 繁 (default), 简 and English.

## Sources (all public domain, via Wikisource)

- 《梅花易數》, traditionally attributed to 邵雍 (1011–1077). The text we have is generally dated to the Ming.
- 《周易》: 經文, 彖傳 and 象傳.
- 《五行大義》 (隋, 蕭吉) 卷二「論四時休王」 gives the five seasonal states. 梅花 itself names only
  旺 and 衰, which match its 王 and 死.

Harsh classical verdicts are rewritten as modern cautions. The original wording appears only in the quoted source.

## Development

```bash
npm install
npm test               # Vitest: worked examples from 卷一, analysis rules, i18n map
npm run typecheck
npm run dev            # http://localhost:5173/meihua-yishu/
npm run fetch-sources  # download source texts into .cache/sources (gitignored)
npm run build-texts    # regenerate src/data/zhouyi.json from the cache
npm run verify-sources # check every quote in src/core/sources.ts against the cache
npm run t2s            # regenerate the Traditional → Simplified map after editing Chinese text
```

Pushing to `main` runs typecheck, tests and the build, then deploys to GitHub Pages
(see `.github/workflows/deploy.yml`; set Pages → Source to "GitHub Actions").
