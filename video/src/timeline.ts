import { LINES, GAP, type Beat } from './script';
import { WORDS, type Word } from './words';

/**
 * When every word is spoken. Uses the recorded word timings when they exist, otherwise an estimate
 * from the script (about 2.7 words a second with the designed pauses), so the film can be built
 * before the voice is final.
 */

const LEAD = 0.3;

function estimate(): Word[] {
  const out: Word[] = [];
  let t = LEAD;
  LINES.forEach((l, i) => {
    for (const w of l.text.split(/\s+/)) {
      const d = 0.2 + w.replace(/[^a-z0-9]/gi, '').length * 0.045;
      out.push({ text: w, start: +t.toFixed(3), end: +(t + d * 0.9).toFixed(3), line: i });
      t += d + (/[.,?!:]$/.test(w) ? 0.12 : 0);
    }
    const next = LINES[i + 1];
    t += GAP[l.mood] + (next && next.beat !== l.beat ? 0.18 : 0) + (l.extra ?? 0);
  });
  return out;
}

export const ALL: Word[] = WORDS ?? estimate();
export const ESTIMATED = WORDS === null;

const byLine: Word[][] = LINES.map((_, i) => ALL.filter((w) => w.line === i));

export const lineStart = (i: number) => byLine[i][0].start;
export const lineEnd = (i: number) => byLine[i][byLine[i].length - 1].end;
export const VO_END = lineEnd(LINES.length - 1);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');

/** Start of the given word in a line. Negative indexes count from the end. */
export function wordAt(line: number, word: number): number {
  const ws = byLine[line];
  const w = ws[word < 0 ? ws.length + word : word];
  if (!w) throw new Error(`line ${line} has no word ${word}`);
  return w.start;
}

/** Start of a phrase inside a line, matched loosely ("that's dns" finds "That's DNS."). */
export function phrase(line: number, text: string, which: 'start' | 'end' = 'start'): number {
  const want = text.split(/\s+/).map(norm);
  const ws = byLine[line];
  for (let i = 0; i + want.length <= ws.length; i++) {
    if (want.every((x, k) => norm(ws[i + k].text) === x)) return which === 'start' ? ws[i].start : ws[i + want.length - 1].end;
  }
  throw new Error(`"${text}" not in line ${line}: ${LINES[line].text}`);
}

export interface BeatSpan {
  beat: Beat;
  first: number;
  last: number;
  start: number;
  end: number;
}

/** Each beat runs from just before its first word until the next beat starts. */
export const BEATS: BeatSpan[] = (() => {
  const spans: BeatSpan[] = [];
  LINES.forEach((l, i) => {
    const cur = spans[spans.length - 1];
    if (cur && cur.beat === l.beat) cur.last = i;
    else spans.push({ beat: l.beat, first: i, last: i, start: 0, end: 0 });
  });
  spans.forEach((s, k) => {
    s.start = k === 0 ? 0 : lineStart(s.first) - 0.3;
    s.end = k < spans.length - 1 ? lineStart(spans[k + 1].first) - 0.3 : lineEnd(s.last) + 0.6;
  });
  return spans;
})();

export const beatOf = (b: Beat) => BEATS.find((s) => s.beat === b)!;

/** Line index of the k-th line inside a beat. */
export const L = (b: Beat, k: number) => beatOf(b).first + k;
