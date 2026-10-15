import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ACTS, STEPS, TOTAL_MS, actOf, fill, type Mode } from '../engine/journey';
import type { Destination } from '../engine/url';
import { SCENES, W, H } from '../scenes';
import { useInView, useReducedMotion } from '../lib/hooks';
import { Icon } from './icons';
import './journey.css';

/** After a step finishes, linger on its last frame before the next one starts. */
const HOLD_MS = 1500;

export interface JumpRequest {
  step: number;
  /** Changes on every request, so asking for the same step twice still jumps. */
  n: number;
}

interface Pos {
  i: number;
  t: number;
}

export function Journey({ mode, dest, jump }: { mode: Mode; dest: Destination; jump: JumpRequest | null }) {
  const kid = mode === 'kid';
  const [pos, setPos] = useState<Pos>({ i: 0, t: 1 });
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [stageRef, inView] = useInView<HTMLDivElement>(0.35);
  const reduced = useReducedMotion();
  const posRef = useRef(pos);
  posRef.current = pos;

  const step = STEPS[pos.i];
  const act = actOf(pos.i);
  const Scene = SCENES[step.id];
  const done = pos.t >= 1;

  const goTo = (i: number, play = true) => {
    const next = Math.max(0, Math.min(STEPS.length - 1, i));
    setStarted(true);
    if (reduced) {
      setPos({ i: next, t: 1 });
      setPlaying(false);
      return;
    }
    setPos({ i: next, t: 0 });
    setPlaying(play);
  };

  // Dev only: ?step=3&t=0.5 freezes a frame, for reviewing the scenes.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const q = new URLSearchParams(location.search);
    const s = q.get('step');
    if (s === null) return;
    setStarted(true);
    setPos({ i: Math.max(0, Math.min(STEPS.length - 1, Number(s))), t: Number(q.get('t') ?? 1) });
  }, []);

  // Requests from outside: the address bar, the route in the hero, the game.
  useEffect(() => {
    if (jump) goTo(jump.step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jump]);

  // The clock. It only runs while the stage is on screen, so nothing is missed while scrolling.
  useEffect(() => {
    if (!playing || !inView) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(80, now - last);
      last = now;
      const p = posRef.current;
      const ms = STEPS[p.i].ms;
      let t = p.t + dt / ms;
      if (kid) {
        if (t >= 1 + HOLD_MS / ms) {
          if (p.i < STEPS.length - 1) {
            const next = { i: p.i + 1, t: 0 };
            posRef.current = next;
            setPos(next);
            raf = requestAnimationFrame(loop);
          } else {
            setPos({ i: p.i, t: 1 });
            setPlaying(false);
          }
          return;
        }
      } else if (t >= 1) {
        t = 1;
        posRef.current = { i: p.i, t };
        setPos({ i: p.i, t });
        setPlaying(false);
        return;
      }
      posRef.current = { i: p.i, t };
      setPos({ i: p.i, t });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, inView, kid]);

  const toggle = () => {
    if (!started) return goTo(0);
    if (playing) return setPlaying(false);
    if (reduced) return goTo(pos.i + 1, false);
    if (done) {
      if (pos.i === STEPS.length - 1) return goTo(0);
      if (!kid || pos.t >= 1) return goTo(pos.i + 1);
    }
    setPlaying(true);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(pos.i + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(pos.i - 1);
    } else if ((e.key === ' ' || e.key === 'k') && e.target === e.currentTarget) {
      e.preventDefault();
      toggle();
    }
  };

  const minutes = Math.round((TOTAL_MS + STEPS.length * HOLD_MS) / 60000);
  const title = kid ? step.kid.title : step.pro.title;
  const text = fill(kid ? step.kid.text : step.pro.text, dest);
  const atEnd = pos.i === STEPS.length - 1 && done && !playing;
  const playLabel = playing ? 'Pause' : atEnd ? 'Watch again' : done && started ? 'Next step' : 'Play';

  return (
    <section className="section" id="journey" aria-labelledby="journey-title">
      <div className="wrap">
        <div className="head">
          <h2 id="journey-title">The trip, step by step</h2>
          <p>
            {kid
              ? `Fifteen little steps in six parts. Press play and watch, or tap any step. It takes about ${minutes} minutes.`
              : 'Fifteen steps in six parts, each with the details and the follow-up an interviewer asks. Use the arrow keys to move between steps.'}
          </p>
        </div>

        <div className="player" id="player" data-act={act.id}>
          <div className="stage" ref={stageRef} tabIndex={0} onKeyDown={onKey} aria-label="The trip, as an animation. Arrow keys move between steps, space plays or pauses.">
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Step ${pos.i + 1}: ${title}`}>
              <Scene t={Math.min(1, pos.t)} mode={mode} d={dest} />
            </svg>
            {!started && (
              <button type="button" className="stage-start" onClick={() => goTo(0)}>
                <span className="stage-start-icon">{Icon.play}</span>
                <span>
                  Play the trip
                  <small>{`About ${minutes} minutes`}</small>
                </span>
              </button>
            )}
          </div>

          <div className="controls">
            <div className="buttons">
              <button type="button" className="btn btn-icon" onClick={() => goTo(pos.i - 1)} disabled={pos.i === 0} aria-label="Previous step">
                {Icon.prev}
              </button>
              <button type="button" className="btn btn-primary btn-play" onClick={toggle} data-ready={done && !playing && started && !atEnd ? true : undefined}>
                {playing ? Icon.pause : atEnd ? Icon.replay : done && started ? Icon.next : Icon.play}
                <span>{playLabel}</span>
              </button>
              <button type="button" className="btn btn-icon" onClick={() => goTo(pos.i + 1)} disabled={pos.i === STEPS.length - 1} aria-label="Next step">
                {Icon.next}
              </button>
            </div>

            <div className="rail" role="group" aria-label="Steps">
              {ACTS.map((a) => {
                const steps = STEPS.map((s, i) => ({ s, i })).filter(({ s }) => s.act === a.id);
                return (
                  <div key={a.id} className="rail-act" data-act={a.id} style={{ flexGrow: steps.length }}>
                    <span className="rail-name" aria-hidden="true">
                      {kid ? a.short.kid : a.short.pro}
                    </span>
                    <div className="rail-steps">
                      {steps.map(({ s, i }) => {
                        const fillPct = i < pos.i ? 100 : i > pos.i ? 0 : Math.min(1, pos.t) * 100;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            className="rail-step"
                            onClick={() => goTo(i)}
                            aria-label={`Step ${i + 1}: ${kid ? s.kid.title : s.pro.title}`}
                            aria-current={i === pos.i ? 'step' : undefined}
                          >
                            <i style={{ width: `${fillPct}%` }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cap" aria-live="polite">
            <div className="cap-main">
              <p className="cap-meta">
                <span className="cap-step tabular">
                  Step {pos.i + 1} of {STEPS.length}
                </span>
                <span className="cap-act">{kid ? act.kid : act.pro}</span>
              </p>
              <h3>{title}</h3>
              <p className="cap-text">{text}</p>
              {kid && (
                <p className="cap-name">
                  Grown-ups call this <b>{step.name}</b>.
                </p>
              )}
            </div>
            <div className="cap-side">
              {kid ? (
                <div className="fact">
                  <h4>Did you know?</h4>
                  <p>{step.kid.fact}</p>
                </div>
              ) : (
                <>
                  <ul className="points">
                    {step.pro.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  {step.pro.sample && <pre className="sample">{fill(step.pro.sample, dest)}</pre>}
                  <p className="tip">
                    <b>Say this in the interview.</b> {step.pro.tip}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
