// Draws a hexagram as inline SVG, lines bottom → top, with optional moving-line mark and 體/用 bands.
import type { Line } from '../core/trigrams';

export interface HexDrawing {
  lines: Line[];
  moving?: number; // 1–6
  /** Which trigram (if any) is 體; the other is 用. */
  tiPosition?: 'upper' | 'lower';
  label: string;
}

export function hexSvg(d: HexDrawing, tiLabel: string, yongLabel: string): string {
  const W = 120, LH = 12, GAP = 9, GROUP = 8;
  const y = (i: number) => 8 + (5 - i) * (LH + GAP) + (i < 3 ? GROUP : 0); // i = 0 bottom
  const H = y(0) + LH + 8;
  const parts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const yy = y(i);
    const cls = d.moving === i + 1 ? 'ln moving' : 'ln';
    if (d.lines[i]) parts.push(`<rect class="${cls}" x="10" y="${yy}" width="${W - 20}" height="${LH}" rx="2"/>`);
    else {
      parts.push(`<rect class="${cls}" x="10" y="${yy}" width="${(W - 20) / 2 - 7}" height="${LH}" rx="2"/>`);
      parts.push(`<rect class="${cls}" x="${W / 2 + 7}" y="${yy}" width="${(W - 20) / 2 - 7}" height="${LH}" rx="2"/>`);
    }
    if (d.moving === i + 1) parts.push(`<circle class="dot" cx="${W - 2}" cy="${yy + LH / 2}" r="3.5"/>`);
  }
  let tags = '';
  if (d.tiPosition) {
    const up = d.tiPosition === 'upper';
    tags = `<text class="tag ${up ? 'ti' : 'yong'}" x="${W + 8}" y="${y(4) + LH}">${up ? tiLabel : yongLabel}</text>`
      + `<text class="tag ${up ? 'yong' : 'ti'}" x="${W + 8}" y="${y(1) + LH}">${up ? yongLabel : tiLabel}</text>`;
  }
  const tagW = Math.max(tiLabel.length, yongLabel.length) > 2 ? 60 : 34;
  const width = d.tiPosition ? W + tagW : W;
  return `<svg class="hex" viewBox="0 0 ${width} ${H}" width="${width}" height="${H}" role="img" aria-label="${d.label}">${parts.join('')}${tags}</svg>`;
}

/** A single trigram, lines bottom → top. */
export function trigramSvg(lines: readonly Line[], label: string): string {
  const W = 48, LH = 7, GAP = 5;
  const y = (i: number) => 2 + (2 - i) * (LH + GAP);
  const parts = lines.map((l, i) => l
    ? `<rect class="ln" x="0" y="${y(i)}" width="${W}" height="${LH}" rx="1.5"/>`
    : `<rect class="ln" x="0" y="${y(i)}" width="${W / 2 - 4}" height="${LH}" rx="1.5"/><rect class="ln" x="${W / 2 + 4}" y="${y(i)}" width="${W / 2 - 4}" height="${LH}" rx="1.5"/>`);
  const H = y(0) + LH + 2;
  return `<svg class="hex tri" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">${parts.join('')}</svg>`;
}
