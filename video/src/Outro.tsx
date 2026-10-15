import type { ActId } from '../../src/engine/journey';
import { map } from './anim';
import { L, beatOf, lineStart, phrase, VO_END } from './timeline';
import { Reveal, Route } from './parts';
import { Omnibox } from './Hook';

/**
 * The ending: "You pressed Enter", the six parts lighting up as they are named, fifteen steps in
 * about one second, the link, and the about card.
 */

const l = (k: number) => L('outro', k);
export const RECAP_AT = lineStart(l(1)) - 0.3;
export const ABOUT_AT = VO_END + 0.7;

const T = {
  start: beatOf('outro').start,
  found: phrase(l(1), 'found'),
  hello: phrase(l(1), 'hello'),
  asked: phrase(l(1), 'asked'),
  built: phrase(l(1), 'built'),
  drew: phrase(l(1), 'drew'),
  handed: phrase(l(2), 'handed'),
  fifteen: lineStart(l(3)),
  second: phrase(l(3), 'about'),
  play: lineStart(l(4)),
  link: phrase(l(4), 'link'),
};

const LIT: Record<ActId, number> = { find: T.found, meet: T.hello, ask: T.asked, build: T.built, draw: T.drew, play: T.handed };
const URL_TEXT = 'haris-devo.github.io/press-enter';

export function Outro({ t }: { t: number }) {
  if (t < T.start - 0.2) return null;
  const recapIn = map(t, RECAP_AT - 0.2, RECAP_AT + 0.6, 0, 1, 'spring');
  const recapOut = map(t, T.fifteen - 0.3, T.fifteen + 0.3, 0, 1, 'inOutCubic');
  const numIn = map(t, T.fifteen - 0.1, T.fifteen + 0.4);
  const numOut = map(t, T.play - 0.3, T.play + 0.2);
  const ringP = map(t, T.second, T.second + 1.1, 0, 1, 'inOutCubic');
  const ctaIn = map(t, T.play - 0.1, T.play + 0.6, 0, 1, 'spring');
  const ctaOut = map(t, ABOUT_AT - 0.4, ABOUT_AT + 0.1);
  const chars = Math.round(map(t, T.play + 0.2, T.play + 1.8) * URL_TEXT.length);
  const press = map(t, T.link - 0.05, T.link + 0.05) * (1 - map(t, T.link + 0.15, T.link + 0.35));
  const ring = map(t, T.link, T.link + 0.6);
  const headOut = map(t, T.fifteen - 0.35, T.fifteen);

  return (
    <div className="outro">
      {headOut < 1 && (
        <div className="head" data-act="play">
          <Reveal text="You pressed *Enter*" t={t} at={T.start + 0.2} out={T.fifteen - 0.35} className="head-title" />
        </div>
      )}

      {recapIn > 0 && recapOut < 1 && (
        <div className="recap" style={{ opacity: recapIn * (1 - recapOut), transform: `translateY(${((1 - recapIn) * 40 - recapOut * 40).toFixed(1)}px)` }}>
          <Route t={t} long lit={(a) => map(t, LIT[a] - 0.08, LIT[a] + 0.3, 0, 1, 'outCubic')} />
        </div>
      )}

      {numIn > 0 && numOut < 1 && (
        <div className="numbers" style={{ opacity: 1 - numOut, transform: `scale(${(1 + numOut * 0.04).toFixed(4)})` }}>
          <Reveal text="*Fifteen* steps." t={t} at={T.fifteen} stagger={0.12} className="num-a" />
          <div className="num-b-row">
            <svg className="clock" viewBox="0 0 120 120" style={{ opacity: map(t, T.second - 0.1, T.second + 0.3) }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--line)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--play)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(ringP * 314).toFixed(1)} 314`} transform="rotate(-90 60 60)" />
              <text x="60" y="66" textAnchor="middle">{(ringP * 1).toFixed(1)}s</text>
            </svg>
            <Reveal text="About *one second.*" t={t} at={T.second} stagger={0.1} className="num-b" />
          </div>
        </div>
      )}

      {ctaIn > 0 && ctaOut < 1 && (
        <div className="cta" style={{ opacity: ctaIn * (1 - ctaOut), transform: `translateY(${((1 - ctaIn) * 30).toFixed(1)}px)` }}>
          <Reveal text="Play with *every step* yourself" t={t} at={T.play + 0.1} className="cta-title" />
          <div className="cta-omni">
            <Omnibox text={URL_TEXT} chars={chars} caret={chars < URL_TEXT.length} pressed={press} ring={ring} />
          </div>
          <p className="cta-note" style={{ opacity: map(t, T.link, T.link + 0.4) }}>
            Link in the comments
          </p>
        </div>
      )}

      <About t={t} />
    </div>
  );
}

function About({ t }: { t: number }) {
  const s = ABOUT_AT;
  if (t < s - 0.1) return null;
  const av = map(t, s + 0.1, s + 0.8, 0, 1, 'spring');
  const ring = map(t, s + 0.25, s + 1.3, 0, 1, 'inOutCubic');
  const r1 = map(t, s + 0.8, s + 1.3, 0, 1, 'outCubic');
  const r2 = map(t, s + 1.0, s + 1.5, 0, 1, 'outCubic');
  const ln = map(t, s + 1.2, s + 1.9, 0, 1, 'inOutCubic');
  const push = 1 + 0.025 * map(t, s, s + 4.2);
  return (
    <div className="about" style={{ transform: `scale(${push.toFixed(4)})` }}>
      <div className="about-avatar" style={{ opacity: Math.min(1, av * 1.3), transform: `scale(${(0.9 + 0.1 * av).toFixed(4)})` }}>
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="92" fill="#fff" stroke="var(--line)" strokeWidth="2" />
          <circle cx="100" cy="100" r="92" fill="none" stroke="var(--meet)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(ring * 578).toFixed(1)} 578`} transform="rotate(-90 100 100)" />
        </svg>
        <span>HA</span>
      </div>
      <Reveal text="Haris Ahmed" t={t} at={s + 0.45} stagger={0.1} className="about-name" />
      <p className="about-role" style={{ opacity: r1, transform: `translateY(${((1 - r1) * 10).toFixed(1)}px)`, filter: r1 < 1 ? `blur(${((1 - r1) * 6).toFixed(2)}px)` : undefined }}>
        Senior Frontend Engineer, Tech Lead
      </p>
      <p className="about-org" style={{ opacity: r2, transform: `translateY(${((1 - r2) * 10).toFixed(1)}px)`, filter: r2 < 1 ? `blur(${((1 - r2) * 6).toFixed(2)}px)` : undefined }}>
        Code Huddle, Islamabad
      </p>
      <span className="about-line" style={{ transform: `scaleX(${ln.toFixed(4)})` }} />
    </div>
  );
}
