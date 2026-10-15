import { STEPS } from '../../src/engine/journey';
import { SCENES } from '../../src/scenes';
import { parseInput } from '../../src/engine/url';
import { map, clamp, lerp } from './anim';
import { L, beatOf, lineStart, lineEnd, wordAt, phrase } from './timeline';
import { Reveal } from './parts';

/**
 * The first fifteen seconds: you type a name, press Enter, a page appears.
 * Then the question, and the promise: fifteen steps.
 */

const l = (k: number) => L('intro', k);
export const HOOK_END = beatOf('url').start + 0.5;

const T = {
  typeA: wordAt(l(0), 0) - 0.1,
  typeB: lineEnd(l(0)) + 0.15,
  press: wordAt(l(1), 2),
  page: lineStart(l(2)),
  clock0: phrase(l(2), 'about'),
  clock1: phrase(l(2), 'later'),
  question: lineStart(l(3)),
  fifteen: lineStart(l(4)),
  five: lineStart(l(5)),
};

/** The dots fall into the route bar just as the stage rises. */
const FALL = HOOK_END - 1.3;

const TYPED = 'toyshop.com';
const Paint = SCENES.paint;
const DEST = parseInput(TYPED);

export function Keycap({ pressed }: { pressed: number }) {
  return (
    <span className="keycap" style={{ transform: `translateY(${(-5 + pressed * 7).toFixed(2)}px)`, boxShadow: `0 ${(6 - pressed * 5).toFixed(2)}px 0 #3b3766, 0 ${(18 - pressed * 10).toFixed(1)}px 30px -14px rgba(29,27,54,.6)` }}>
      Enter
      <svg viewBox="0 0 24 24">
        <path d="M19 6v6a2 2 0 0 1-2 2H6m0 0 4-4m-4 4 4 4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Omnibox({ text, chars, caret, pressed, ring }: { text: string; chars: number; caret: boolean; pressed: number; ring: number }) {
  return (
    <div className="omni">
      <span className="omni-lock">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="omni-text">
        {text.slice(0, chars)}
        {caret && <i className="caret" />}
      </span>
      <span className="omni-key">
        {ring > 0 && ring < 1 && <span className="ring" style={{ transform: `translate(-50%, -50%) scale(${(0.6 + ring * 1.6).toFixed(3)})`, opacity: 1 - ring }} />}
        <Keycap pressed={pressed} />
      </span>
    </div>
  );
}

export function Hook({ t }: { t: number }) {
  if (t > HOOK_END + 0.2) return null;
  const chars = Math.round(map(t, T.typeA, T.typeB) * TYPED.length);
  const caret = t < T.press && Math.floor(t * 3) % 2 === 0;
  const pressed = map(t, T.press - 0.06, T.press, 0, 1) * (1 - map(t, T.press + 0.12, T.press + 0.3));
  const ring = map(t, T.press, T.press + 0.6);

  // the page appears under the address bar
  const page = map(t, T.page + 0.4, T.page + 1.1, 0, 1, 'spring');
  const move = map(t, T.page - 0.15, T.page + 0.45, 0, 1, 'inOutQuint');
  const omniY = lerp(560, 250, move);
  const omniS = lerp(1, 0.86, move);
  const secs = map(t, T.clock0, T.clock1 + 0.3) * 0.96;

  // the question pushes the page back into soft focus
  const q = map(t, T.question - 0.1, T.question + 0.5, 0, 1, 'inOutCubic');
  const fifteen = map(t, T.fifteen - 0.15, T.fifteen + 0.35, 0, 1, 'inOutCubic');
  const gone = map(t, HOOK_END - 0.4, HOOK_END + 0.1);

  const worldO = 1 - fifteen;
  const worldBlur = q * 7 + fifteen * 10;
  return (
    <div className="hook">
      <div className="hook-world" style={{ opacity: worldO * (1 - q * 0.4), filter: worldBlur > 0.2 ? `blur(${worldBlur.toFixed(2)}px)` : undefined, transform: `translateY(${(q * 190).toFixed(1)}px) scale(${(1 - q * 0.12).toFixed(4)})` }}>
        <div className="hook-omni" style={{ transform: `translate(-50%, -50%) translateY(${omniY.toFixed(1)}px) scale(${omniS.toFixed(4)})` }}>
          <Omnibox text={TYPED} chars={chars} caret={caret} pressed={pressed} ring={ring} />
        </div>
        {page > 0.001 && (
          <div className="hook-page" style={{ opacity: clamp(page * 1.4), transform: `translateX(-50%) translateY(${((1 - page) * 40).toFixed(1)}px) scale(${(0.92 + page * 0.08).toFixed(4)})` }}>
            <svg viewBox="100 80 600 300">
              <Paint t={1} mode="kid" d={DEST} />
            </svg>
            <span className="stopwatch" style={{ opacity: map(t, T.clock0 - 0.1, T.clock0 + 0.2) }}>
              {secs.toFixed(2)} s
            </span>
          </div>
        )}
      </div>

      {t > T.question - 0.1 && (
        <div className="hook-q" style={{ opacity: 1 - fifteen, transform: `translateY(${(-fifteen * 40).toFixed(1)}px)` }}>
          <Reveal text="What happened in that *one second?*" t={t} at={T.question} stagger={0.09} className="hook-q-text" />
        </div>
      )}

      {t > T.fifteen - 0.2 && (
        <div className="hook-15" style={{ opacity: 1 - gone }}>
          <div className="hook-15-stack">
            <Reveal text="*Fifteen* steps." t={t} at={T.fifteen} stagger={0.12} className="hook-15-text" out={T.five - 0.1} />
            <Reveal text="Like you're *five.*" t={t} at={T.five + 0.15} stagger={0.12} className="hook-15-text" out={FALL + 0.2} />
          </div>
          <div className="hook-dots">
            {STEPS.map((s, i) => {
              const p = map(t, T.fifteen + 0.15 + i * 0.045, T.fifteen + 0.5 + i * 0.045, 0, 1, 'pop');
              // on "like you're five", the dots fall into the route bar below the stage
              const fall = map(t, FALL + i * 0.02, FALL + 0.8 + i * 0.02, 0, 1, 'inOutCubic');
              return (
                <i
                  key={s.id}
                  data-act={s.act}
                  style={{
                    transform: `translateY(${(fall * 330).toFixed(1)}px) scale(${(p * (1 - fall * 0.55)).toFixed(4)})`,
                    opacity: 1 - map(fall, 0.7, 1),
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
