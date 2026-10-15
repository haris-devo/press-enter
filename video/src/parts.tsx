import type { CSSProperties } from 'react';
import { ACTS, STEPS, type ActId } from '../../src/engine/journey';
import { ActIcon } from '../../src/components/icons';
import { clamp, map } from './anim';
import { BEATS, beatOf } from './timeline';

/** Splits "Find the *address*" into words, marking the emphasised ones. */
function rich(text: string) {
  const out: { w: string; em: boolean }[] = [];
  let em = false;
  for (const part of text.split(/(\*)/)) {
    if (part === '*') em = !em;
    else for (const w of part.split(/\s+/).filter(Boolean)) out.push({ w, em });
  }
  return out;
}

/** Words that blur in one after another, and blur out together. */
export function Reveal({ text, t, at, out, stagger = 0.07, className, style }: { text: string; t: number; at: number; out?: number; stagger?: number; className?: string; style?: CSSProperties }) {
  const exit = out === undefined ? 1 : map(t, out, out + 0.3, 1, 0, 'inCubic');
  if (exit <= 0 || t < at - 0.05) return null;
  return (
    <div className={className} style={style}>
      {rich(text).map((x, i) => {
        const p = map(t, at + i * stagger, at + i * stagger + 0.55, 0, 1, 'outCubic');
        return (
          <span
            key={i}
            className={x.em ? 'em' : undefined}
            style={{
              opacity: p * exit,
              filter: p < 0.999 || exit < 1 ? `blur(${((1 - p) * 10 + (1 - exit) * 6).toFixed(2)}px)` : undefined,
              transform: `translateY(${((1 - p) * 18 - (1 - exit) * 12).toFixed(2)}px)`,
            }}
          >
            {x.w}{' '}
          </span>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- route bar */

/** The six parts of the trip, with one tick per step, filling as the film goes. */
export function Route({ t, style, lit, long = false }: { t: number; style?: CSSProperties; lit?: (act: ActId) => number; long?: boolean }) {
  const cur = BEATS.findIndex((b) => t >= b.start && t < b.end);
  const curBeat = BEATS[cur]?.beat;
  const stepIdx = STEPS.findIndex((s) => s.id === curBeat);
  return (
    <div className="route" style={style}>
      {ACTS.map((a) => {
        const steps = STEPS.map((s, i) => ({ s, i })).filter(({ s }) => s.act === a.id);
        const active = stepIdx >= 0 && STEPS[stepIdx].act === a.id;
        const done = stepIdx >= 0 ? steps[steps.length - 1].i < stepIdx : curBeat === 'outro';
        const glow = lit ? lit(a.id) : active ? 1 : done ? 0.55 : 0;
        return (
          <div key={a.id} className="route-part" data-act={a.id} style={{ flexGrow: steps.length + 1.2 }}>
            <span className="route-icon" style={{ '--g': glow.toFixed(3) } as CSSProperties}>
              <ActIcon act={a.id} />
            </span>
            <span className="route-name" style={{ opacity: 0.45 + 0.55 * glow }}>
              {long ? a.kid : a.short.kid}
            </span>
            <span className="route-ticks">
              {steps.map(({ s, i }) => {
                const b = beatOf(s.id);
                const fill = lit ? glow : i < stepIdx ? 1 : i > stepIdx ? (curBeat === 'outro' ? 1 : 0) : clamp((t - b.start) / (b.end - b.start));
                return (
                  <i key={s.id}>
                    <b style={{ width: `${(fill * 100).toFixed(1)}%` }} />
                  </i>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

