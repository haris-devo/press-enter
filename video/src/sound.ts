import { SHOTS, CARDS, type Shot } from './shots';
import { beatOf, L, lineStart, lineEnd, wordAt, phrase, VO_END } from './timeline';
import { HOOK_END } from './Hook';
import { ABOUT_AT, RECAP_AT } from './Outro';
import { BED } from './bed';

/**
 * The soundtrack plan for the studio mixer: synthesized SFX cues ([seconds, type, gain]), the
 * voiceover, and which parts of the music bed play where. Types: click tick pop whoosh
 * whoosh-soft riser error success chime snap hit.
 */

type Cue = [number, string, number];

/** Seconds at which a shot's scene reaches sceneT (the inverse of its time warp). */
function at(id: string, sceneT: number): number {
  const s = SHOTS.find((x) => x.id === id) as Shot;
  const a = [...s.anchors].sort((x, y) => x[1] - y[1]);
  if (sceneT <= a[0][0]) return a[0][1];
  for (let i = 1; i < a.length; i++) {
    const [s0, t0] = a[i - 1];
    const [s1, t1] = a[i];
    if (sceneT <= s1) return t0 + ((sceneT - s0) / (s1 - s0 || 1e-6)) * (t1 - t0);
  }
  const [sl, tl] = a[a.length - 1];
  return tl + ((sceneT - sl) / (1 - sl || 1e-6)) * Math.max(0.3, s.end - tl);
}

const intro = (k: number) => L('intro', k);
const outro = (k: number) => L('outro', k);

export const SFX: Cue[] = (() => {
  const c: Cue[] = [];
  // hook: typing, the Enter key, the page, the fifteen dots
  const typeA = wordAt(intro(0), 0) - 0.1;
  const typeB = lineEnd(intro(0)) + 0.15;
  for (let i = 0; i < 11; i++) c.push([typeA + ((typeB - typeA) * i) / 11, 'tick', 0.26 + (i % 3) * 0.04]);
  const press = wordAt(intro(1), 2);
  c.push([press - 0.02, 'click', 0.6], [press, 'hit', 0.5]);
  c.push([lineStart(intro(2)), 'whoosh-soft', 0.5], [lineStart(intro(2)) + 0.5, 'pop', 0.35]);
  c.push([lineStart(intro(3)) - 0.1, 'riser', 0.25]);
  const fifteen = lineStart(intro(4));
  for (let i = 0; i < 15; i++) c.push([fifteen + 0.2 + i * 0.045, 'pop', 0.14]);
  c.push([lineStart(intro(5)), 'whoosh', 0.45], [HOOK_END - 0.35, 'whoosh-soft', 0.35]);

  // between shots, a soft whoosh under the rack focus
  SHOTS.slice(1).forEach((s) => c.push([s.start - 0.1, 'whoosh-soft', 0.3]));
  // each step title lands with a tick, each definition with a soft chime
  CARDS.forEach((k) => {
    c.push([beatOf(k.beat).start + 0.22, 'tick', 0.32]);
    c.push([k.detailAt, 'chime', 0.2]);
  });

  // scene moments
  [0.33, 0.53, 0.73].forEach((s) => c.push([at('dns', s), 'pop', 0.3]));
  c.push([at('dns', 0.86), 'snap', 0.35]);
  [0.06, 0.36, 0.66].forEach((s) => c.push([at('tcp', s), 'whoosh-soft', 0.35]));
  [0.3, 0.6, 0.88].forEach((s) => c.push([at('tcp', s), 'pop', 0.32]));
  c.push([at('tcp', 0.9), 'success', 0.3]);
  c.push([at('tls', 0.05), 'whoosh-soft', 0.35], [at('tls', 0.3), 'whoosh-soft', 0.35], [at('tls', 0.6), 'snap', 0.4], [at('tls', 0.88), 'success', 0.35]);
  c.push([at('request', 0.58), 'pop', 0.3], [at('request', 0.64), 'whoosh-soft', 0.4], [at('request', 0.88), 'pop', 0.35]);
  c.push([at('server', 0.16), 'error', 0.2], [at('server', 0.5), 'tick', 0.25], [at('server', 0.76), 'pop', 0.3], [at('server', 0.9), 'whoosh-soft', 0.35]);
  [0.28, 0.4, 0.54, 0.6, 0.62, 0.7].forEach((s) => c.push([at('response', s), 'pop', 0.2]));
  c.push([at('response', 0.8), 'success', 0.3]);
  [0.08, 0.17, 0.28, 0.38, 0.48, 0.58, 0.68].forEach((s) => c.push([at('dom', s), 'pop', 0.14]));
  [0.26, 0.42, 0.58].forEach((s) => c.push([at('cssom', s), 'pop', 0.25]));
  c.push([at('cssom', 0.78), 'success', 0.3]);
  c.push([at('js', 0.25), 'error', 0.18], [at('js', 0.58), 'tick', 0.25]);
  c.push([at('layout', 0.56), 'whoosh-soft', 0.4]);
  [0.04, 0.18, 0.4, 0.52, 0.68].forEach((s) => c.push([at('paint', s), 'whoosh-soft', 0.22]));
  c.push([at('composite', 0.12), 'whoosh', 0.35], [at('composite', 0.55), 'whoosh-soft', 0.3], [at('composite', 0.88), 'snap', 0.35]);
  c.push([at('interactive', 0.06), 'click', 0.45], [at('interactive', 0.4), 'click', 0.45], [at('interactive', 0.5), 'error', 0.2], [at('interactive', 0.73), 'success', 0.3]);

  // ending: the six parts light up, the numbers land, the link, the about card
  ['found', 'hello', 'asked', 'built', 'drew'].forEach((w) => c.push([phrase(outro(1), w), 'pop', 0.3]));
  c.push([phrase(outro(2), 'handed'), 'success', 0.35]);
  c.push([RECAP_AT, 'whoosh-soft', 0.4], [lineStart(outro(3)), 'hit', 0.4]);
  const link = phrase(outro(4), 'link');
  for (let i = 0; i < 8; i++) c.push([lineStart(outro(4)) + 0.2 + i * 0.2, 'tick', 0.18]);
  c.push([link, 'click', 0.5], [link + 0.02, 'hit', 0.35]);
  c.push([ABOUT_AT + 0.1, 'hit', 0.35]);
  return c.map(([t, type, g]) => [+t.toFixed(3), type, g] as Cue).sort((a, b) => a[0] - b[0]);
})();

export const AUDIO = {
  vo: { file: 'audio/vo.wav', at: 0, to: VO_END + 0.35, fadeOut: 0.3 },
  music: { file: 'audio/music.wav', gain: BED.gain, segments: BED.segments },
  sfxGain: -13,
};
