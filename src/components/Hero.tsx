import { useState, type FormEvent } from 'react';
import { ACTS, STEPS, type ActId, type Mode } from '../engine/journey';
import { DEFAULT_INPUT } from '../engine/url';
import { ActIcon, Icon } from './icons';
import './hero.css';

const TRIES = ['wikipedia.org', 'github.com', 'cute puppies'];

export function Hero({ mode, onGo, onAct }: { mode: Mode; onGo: (text: string) => void; onAct: (act: ActId) => void }) {
  const [text, setText] = useState(DEFAULT_INPUT);
  const [pressed, setPressed] = useState(false);
  const kid = mode === 'kid';

  const go = (value: string) => {
    setPressed(true);
    window.setTimeout(() => setPressed(false), 180);
    onGo(value);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    go(text);
  };

  return (
    <section className="hero" id="top">
      <div className="wrap hero-in">
        <h1>What happens when you press Enter?</h1>
        <p className="hero-lead">
          {kid
            ? 'In about a second, your browser goes on a trip across the world and comes back with a page. Type any website and watch every step.'
            : 'The classic interview question, one step at a time: DNS, TCP, TLS, HTTP, parsing, layout, paint and the event loop. Type any address and watch it happen.'}
        </p>

        <form className="omni" onSubmit={submit} role="search" aria-label="Start the trip">
          <span className="omni-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </span>
          <label className="sr-only" htmlFor="omni-input">
            Website or search
          </label>
          <input
            id="omni-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="Type a website, like toyshop.com"
          />
          <button type="submit" className="keycap" aria-label="Press Enter" data-pressed={pressed || undefined}>
            <span>Enter</span>
            {Icon.enter}
          </button>
        </form>

        <div className="tries">
          <span>Or try</span>
          {TRIES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setText(t);
                go(t);
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <ol className="route" aria-label="The six parts of the trip">
          {ACTS.map((a, i) => {
            const count = STEPS.filter((s) => s.act === a.id).length;
            return (
              <li key={a.id} data-act={a.id}>
                <button type="button" onClick={() => onAct(a.id)}>
                  <span className="route-dot">
                    <ActIcon act={a.id} />
                  </span>
                  <span className="route-name">{kid ? a.kid : a.pro}</span>
                  <span className="route-meta">
                    Part {i + 1}, {count} {count === 1 ? 'step' : 'steps'}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
