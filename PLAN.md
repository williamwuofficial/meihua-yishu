# 梅花易數 · Plum Blossom question app — plan

A sister project to [ziwei-chart](https://williamwuofficial.github.io/ziwei-chart/), but standalone.
You type a question, cast a hexagram, and read the 本卦 / 互卦 / 變卦 with a 體用 analysis.
Every reading statement comes from a cited rule or a classical text. No LLM and no free-form generated text.

Target: static Vite + TypeScript site, Vitest tests, GitHub Pages at
`williamwuofficial.github.io/<repo>/`.

## Principles (inherited from ziwei-chart)

- **Cited readings only.** Each statement links to its rule (e.g. 《梅花易數》 卷一「體用總訣」) or to the 易經 text.
- **Softened verdicts.** Harsh classical verdicts (death, prison, illness, gendered slurs) are rewritten as
  modern cautions. The harsh wording stays only in the quoted citation.
- **No advice.** No medical, legal or financial advice. No remedies, charms or 化解.
- **Public-domain sources only.** Downloaded into a gitignored `.cache/`. Every quoted verse is checked
  against the cached source by a script (`npm run verify-sources`); none is written from memory.
- **Privacy.** The question never leaves the device. No analytics, no server.
- **Honest framing.** There are no controlled studies of 梅花易數, and because the asker chooses the numbers
  or omens it is hard to test at all. The app presents itself as a reflective tool grounded in tradition,
  with a visible "tradition, not evidence" note.

## Sources

| Text | Used for | Where | Note |
|---|---|---|---|
| 《周易》 經文 + 彖傳 + 象傳 | 卦辭, 爻辭, 彖, 大象, 小象 | Wikisource 周易 / ctext.org | Public domain |
| 《梅花易數》 (attributed to 邵雍) | Casting methods, 體用 rules, worked examples (觀梅占 etc.) | Wikisource / ctext | Traditionally attributed to 邵雍 (1011–1077); the text as we have it is generally dated to the Ming. The app says so. |

## Method (梅花 core)

1. Numbers → upper trigram = a mod 8, lower trigram = b mod 8 (0 → 8), changing line = c mod 6 (0 → 6),
   using 先天 numbers 乾1 兌2 離3 震4 巽5 坎6 艮7 坤8.
   - 年月日時起卦: a = 年支數 + 月 + 日; b = a + 時支數; c = b.
   - 數字起卦: per the book's 物數 / 聲音 / 字占 rules where applicable.
2. 本卦 from (upper, lower). 互卦: lines 2-3-4 (lower) and 3-4-5 (upper). 變卦: flip the changing line.
3. 體 = the trigram without the changing line; 用 = the one with it.
4. Five-element 生剋 between 體 and 用, and between 體 and 互 / 變 trigrams (乾兌金, 震巽木, 坎水, 離火, 艮坤土).
5. Seasonal strength 旺相休囚死 of 體 by the month of asking.
6. Show 卦辭 for all three, plus the changing line's 爻辭 (and 小象).

Tests reproduce worked examples from 《梅花易數》 (e.g. 觀梅占: 辰年十二月十七日申時 → 澤火革, 初爻動, 變澤山咸).
The exact example data is checked against the downloaded source before it goes in a test.

## Decisions (user, 2026-11-10)

- **梅花 only** for v1. No 六爻 coin casting.
- **Casting inputs:** the time of asking (editable, defaults to now) and two numbers the user enters.
  No random draw.
- **Languages:** 繁 by default, plus 简 (character map via OpenCC, with 乾 etc. protected) and English.
  Classical quotes stay in Chinese.
- **History:** opt-in, in localStorage only. Turning it off deletes it.
- **Repo:** `meihua-yishu` (williamwuofficial/meihua-yishu, Pages `/meihua-yishu/`).

## Implementation choices (open to change)

- **Seasonal strength:** 旺相休囚死 from 《五行大義》卷二「論四時休王」. Its 六月 row is used for all four
  earth months (辰戌丑未), because 梅花 卷一「卦氣旺」 puts 土旺 in all four. 梅花's own 旺 / 衰 lists
  match 王 / 死 exactly, and a test checks this. Season is by **lunar month number** (正月 = 寅), the way
  the book counts months. The alternative is 節氣 month (月建), which could become a setting.
- **Year:** the lunar year (it changes at 正月初一, not at 立春).
- **Leap months** count as their ordinary month number. The book does not say.
- **23:00–24:00** is 子時 of the next lunar day.
- **Entered numbers:** first → upper, second → lower; the moving line is their sum, plus the hour number
  when the 「取爻當以時加之」 box is ticked (default on). The book's own examples do it both ways
  (今日動靜 omits the hour; 物數 / 端法 examples add it).
- **No 外應:** the app cannot see omens, so it follows 卷二「靜占」 and reads 體用 plus the season only.
- **互卦** is shown as two trigrams with no 卦辭 (卷一「互卦起例」「互卦只用八卦」).
- **Bundle** ~410 KB, mostly lunar-typescript (pinned to 1.8.6; 1.8.7 was less than two weeks old).

## Status

- [x] Phase 0: scaffold, sources cached, `fetch-sources` / `build-texts` / `verify-sources` scripts.
- [x] Phase 1: casting maths. All 11 worked examples in 卷一 reproduce (觀梅, 牡丹, 借物, 今日動靜,
  西林寺 ×2, 老人, 少年, 牛, 雞, 枯枝), plus the 觀梅 / 牡丹 time sums.
- [x] Phase 2: UI with citations, limits note, history, 繁/简/EN.
- [x] Phase 3: Pages workflow, launch.json entries `meihua-yishu` (5179) / `meihua-yishu-prod` (4179).
- [ ] The user creates the GitHub repo, then commit and push.

## Ideas for later

- 節氣 month as a setting for seasonal strength.
- Timing of the response (卷三「占卜克應之訣」, 卷一 老人占 「行則應速」), carefully framed.
- English translation of the 周易 text (Legge 1882 is public domain; it would need verifying like the rest).
- 外應 input (what you saw or heard), per 卷二「三要」「十應」.

## Phases

- **0** Scaffold, PLAN, sources cached, verify-sources script.
- **1** Casting maths + tests (worked examples reproduce).
- **2** UI: question → cast → three hexagrams + 體用 analysis, citations, limits note.
- **3** Pages deploy workflow, launch.json preview entry.
