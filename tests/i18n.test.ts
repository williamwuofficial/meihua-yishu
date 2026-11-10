import { describe, expect, it } from 'vitest';
import * as OpenCC from 'opencc-js';
import t2s from '../src/i18n/t2s.json';
import { STR } from '../src/i18n/strings';
import zhouyiSrc from '../src/data/zhouyi.json?raw';

const tsSources = Object.values(import.meta.glob('../src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);

const KEEP = new Set(['乾', '著', '咸', '夬', '蒙', '鬱', '徵', '彖']);

describe('Simplified map', () => {
  it('covers every character OpenCC would convert (run npm run t2s after editing Chinese text)', () => {
    const convert = OpenCC.Converter({ from: 'tw', to: 'cn' });
    const map = t2s as Record<string, string>;
    const missing = new Set<string>();
    for (const src of [...tsSources, zhouyiSrc, JSON.stringify(STR)]) {
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

describe('toSimplified', async () => {
  const { toSimplified } = await import('../src/i18n/lang');
  it('converts words the character map would get wrong', () => {
    expect(toSimplified('這個計畫能成嗎')).toBe('这个计划能成吗');
    expect(toSimplified('筆畫')).toBe('笔画');
    expect(toSimplified('應徵或升遷')).toBe('应征或升迁');
    expect(toSimplified('乾為天')).toBe('乾为天');
  });
});
