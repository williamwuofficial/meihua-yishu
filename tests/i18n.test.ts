import { describe, expect, it } from 'vitest';
import * as OpenCC from 'opencc-js';
import t2s from '../src/i18n/t2s.json';
import { STR } from '../src/i18n/strings';
import analysisSrc from '../src/core/analysis.ts?raw';
import mainSrc from '../src/main.ts?raw';
import sourcesSrc from '../src/core/sources.ts?raw';
import zhouyiSrc from '../src/data/zhouyi.json?raw';

const KEEP = new Set(['乾', '著', '咸', '夬', '蒙', '鬱', '徵', '彖']);

describe('Simplified map', () => {
  it('covers every character OpenCC would convert (run npm run t2s after editing Chinese text)', () => {
    const convert = OpenCC.Converter({ from: 'tw', to: 'cn' });
    const map = t2s as Record<string, string>;
    const missing = new Set<string>();
    for (const src of [analysisSrc, mainSrc, sourcesSrc, zhouyiSrc, JSON.stringify(STR)]) {
      for (const ch of src) if (/[㐀-鿿]/.test(ch) && !KEEP.has(ch) && convert(ch) !== ch && !map[ch]) missing.add(ch);
    }
    expect([...missing].join('')).toBe('');
  });
  it('keeps 乾 as the trigram name', () => {
    expect((t2s as Record<string, string>)['乾']).toBeUndefined();
  });
  it('every UI string has both languages', () => {
    for (const [k, v] of Object.entries(STR)) {
      expect(v.zh.length + v.en.length, k).toBeGreaterThan(0);
      if (k !== 'enTextNote') expect(v.zh.length, k).toBeGreaterThan(0);
      expect(v.en.length, k).toBeGreaterThan(0);
    }
  });
});
