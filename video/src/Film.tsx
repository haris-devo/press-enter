import type { ReactNode } from 'react';
import { STEPS, type ActId } from '../../src/engine/journey';
import { parseInput } from '../../src/engine/url';
import { SCENES } from '../../src/scenes';
import { clamp, map, kf, warp, drift, lerp, ease } from './anim';
import { ALL, BEATS, beatOf, VO_END } from './timeline';
import { SHOTS, CARDS, type Shot } from './shots';
import { Reveal, Route } from './parts';
import { LINES } from './script';
import { Hook, HOOK_END } from './Hook';
import { Outro, ABOUT_AT, RECAP_AT } from './Outro';

export const DEST = parseInput('toyshop.com');
export const END = ABOUT_AT + 4.2;

/** Cross-fade length between shots, in seconds. */
const XF = 0.55;

export function actAt(t: number): ActId {
  const b = BEATS.find((s) => t >= s.start && t < s.end) ?? BEATS[BEATS.length - 1];
  if (b.beat === 'intro') return 'find';
  if (b.beat === 'outro') return 'play';
  return STEPS.find((s) => s.id === b.beat)!.act;
}

/* ---------------------------------------------------------------- headlines */

function Headline({ t }: { t: number }) {
  return (
    <>
      {CARDS.map((c, i) => {
        const b = beatOf(c.beat);
        if (t < b.start - 0.1 || t > b.end + 0.1) return null;
        const at = c.lead ? c.lead.until : b.start + 0.2;
        const out = b.end - 0.32;
        const chipIn = map(t, at + 0.25, at + 0.75, 0, 1, 'spring');
        const chipOut = map(t, out, out + 0.3, 1, 0);
        const det = map(t, c.detailAt, c.detailAt + 0.9);
        const chars = Math.round(c.detail.length * ease.outCubic(det));
        return (
          <div key={c.beat} className="head" data-act={c.act}>
            <div className="head-meta" style={{ opacity: chipIn * chipOut, transform: `translateY(${(1 - chipIn) * 10}px)` }}>
              <span className="head-step">Step {i + 1} of 15</span>
              <span className="head-chip">{c.term}</span>
            </div>
            {c.lead && <Reveal text={c.lead.title} t={t} at={b.start + 0.25} out={c.lead.until - 0.35} className="head-title head-lead" />}
            <Reveal text={c.title} t={t} at={at} out={out} className="head-title" />
            {det > 0 && (
              <div className="head-detail" style={{ opacity: chipOut }}>
                {c.detail.slice(0, chars)}
                {det < 1 && <i className="caret" />}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ---------------------------------------------------------------- stage */

function camera(shot: Shot, sceneT: number, t: number) {
  let cx: number, cy: number, z: number;
  if (shot.camTime) {
    const k = shot.camTime;
    cx = kf(t, k.map(([a, x]) => [a, x]));
    cy = kf(t, k.map(([a, , y]) => [a, y]));
    z = kf(t, k.map(([a, , , zz]) => [a, zz]));
  } else {
    const k = shot.cam;
    cx = kf(sceneT, k.map(([a, x]) => [a, x]));
    cy = kf(sceneT, k.map(([a, , y]) => [a, y]));
    z = kf(sceneT, k.map(([a, , , zz]) => [a, zz]));
  }
  // a camera that breathes a little, like a hand-held move on a tripod
  z *= 1 + drift(t, 3, 0.006);
  cx += drift(t, 7, 2.2);
  cy += drift(t, 11, 1.6);
  // never show past the edge of the scene
  const hw = 400 / z;
  const hh = 240 / z;
  cx = clamp(cx, hw, 800 - hw);
  cy = clamp(cy, hh, 480 - hh);
  return `translate(400 240) scale(${z.toFixed(4)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`;
}

function ShotView({ shot, t, index }: { shot: Shot; t: number; index: number }) {
  const first = index === 0;
  const fin = first ? map(t, HOOK_END - 0.9, HOOK_END - 0.1, 0, 1, 'outCubic') : map(t, shot.start - XF / 2, shot.start + XF / 2, 0, 1, 'inOutSine');
  const fout = 1 - map(t, shot.end - XF / 2, shot.end + XF / 2, 0, 1, 'inOutSine');
  const o = Math.min(fin, fout);
  if (o <= 0.001) return null;
  const sceneT = clamp(warp(t, shot.anchors, shot.end));
  const Scene = SCENES[shot.scene];
  const blur = (1 - fin) * 12 + (1 - fout) * 9;
  const scale = lerp(0.965, 1, fin) * lerp(1, 1.045, 1 - fout);
  return (
    <div className="shot" style={{ opacity: o, filter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined, transform: `scale(${scale.toFixed(4)})` }}>
      <svg viewBox="0 0 800 480">
        <g transform={camera(shot, sceneT, t)}>
          <Scene t={sceneT} mode="kid" d={DEST} />
        </g>
      </svg>
    </div>
  );
}

function Stage({ t }: { t: number }) {
  const act = actAt(t);
  const rise = map(t, HOOK_END - 1.0, HOOK_END - 0.1, 0, 1, 'spring');
  const leave = map(t, RECAP_AT - 0.5, RECAP_AT + 0.2, 0, 1, 'inOutCubic');
  if (rise <= 0 || leave >= 1) return null;
  return (
    <div
      className="stage"
      data-act={act}
      style={{
        opacity: rise * (1 - leave),
        transform: `translateY(${((1 - rise) * 60 + leave * -30).toFixed(1)}px) scale(${(0.96 + 0.04 * rise - leave * 0.04).toFixed(4)})`,
        filter: leave > 0.01 ? `blur(${(leave * 8).toFixed(2)}px)` : undefined,
      }}
    >
      {SHOTS.map((s, i) => (
        <ShotView key={s.id} shot={s} t={t} index={i} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- captions */

interface Phrase {
  words: typeof ALL;
  a: number;
  b: number;
  next: number;
}

const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  let cur: typeof ALL = [];
  ALL.forEach((w, i) => {
    cur.push(w);
    const next = ALL[i + 1];
    const punct = /[.?!,:;]$/.test(w.text);
    const gap = next ? next.start - w.end : 99;
    const len = cur.reduce((n, x) => n + x.text.length + 1, 0);
    if (!next || next.line !== w.line || (punct && cur.length >= 2) || gap > 0.45 || cur.length >= 7 || len > 40) {
      out.push({ words: cur, a: cur[0].start, b: cur[cur.length - 1].end, next: 0 });
      cur = [];
    }
  });
  out.forEach((p, i) => (p.next = out[i + 1] ? out[i + 1].a : p.b + 1.5));
  return out;
})();

function Captions({ t }: { t: number }) {
  if (t > ABOUT_AT - 0.2) return null;
  const p = PHRASES.find((x) => t >= x.a - 0.12 && t <= Math.min(x.b + 0.9, x.next - 0.12));
  if (!p) return null;
  const a = p.a - 0.12;
  const b = Math.min(p.b + 0.9, p.next - 0.12);
  const o = map(t, a, a + 0.18) * map(t, b - 0.14, b, 1, 0);
  return (
    <div className="caption" style={{ opacity: o, transform: `translateY(${((1 - map(t, a, a + 0.18)) * 8).toFixed(1)}px)` }}>
      {p.words.map((w, i) => {
        const lit = map(t, w.start - 0.04, w.start + 0.12);
        return (
          <span key={i} style={{ color: lit >= 1 ? undefined : `color-mix(in srgb, var(--ink) ${(lit * 100).toFixed(0)}%, #c4c2d4)` }}>
            {w.text}{' '}
          </span>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- chrome */

function Chrome({ t }: { t: number }) {
  const a = map(t, 0.2, 0.8) * 0.95;
  const name = a * (1 - map(t, ABOUT_AT - 0.2, ABOUT_AT + 0.3));
  return (
    <>
      <div className="progress" style={{ width: `${((t / END) * 100).toFixed(3)}%` }} />
      <div className="series" style={{ opacity: a }}>
        Frontend Unpacked <b>04</b>
      </div>
      <div className="byline" style={{ opacity: name }}>
        Haris Ahmed
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- film */

export function Film({ t }: { t: number }) {
  const act = actAt(t);
  const routeIn = map(t, HOOK_END - 0.6, HOOK_END + 0.2, 0, 1, 'spring');
  const routeOut = map(t, RECAP_AT - 0.4, RECAP_AT + 0.1);
  return (
    <div className="film" data-act={act}>
      <Chrome t={t} />
      <Hook t={t} />
      <Headline t={t} />
      <Stage t={t} />
      {routeIn > 0 && routeOut < 1 && <Route t={t} style={{ opacity: routeIn * (1 - routeOut), transform: `translateY(${((1 - routeIn) * 24).toFixed(1)}px)` }} />}
      <Outro t={t} />
      <Captions t={t} />
    </div>
  );
}

export function Debug({ t }: { t: number }): ReactNode {
  const b = BEATS.find((s) => t >= s.start && t < s.end);
  const line = ALL.find((w) => t >= w.start - 0.1 && t <= w.end + 0.4)?.line;
  return (
    <div className="debug">
      {t.toFixed(2)}s · {b?.beat} · line {line ?? '-'} {line !== undefined ? LINES[line].text : ''} · VO ends {VO_END.toFixed(1)}s
    </div>
  );
}
