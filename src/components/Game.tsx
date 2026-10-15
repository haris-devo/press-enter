import { useState } from 'react';
import type { Mode } from '../engine/journey';
import { CARDS, deal, isNext, type Card } from '../engine/game';
import { Icon } from './icons';
import './game.css';

const FIRST_SEED = 20261015;

export function Game({ mode, onWatch }: { mode: Mode; onWatch: () => void }) {
  const kid = mode === 'kid';
  const [seed, setSeed] = useState(FIRST_SEED);
  const [deck, setDeck] = useState(() => deal(FIRST_SEED));
  const [placed, setPlaced] = useState(0);
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'hint' | 'good'; text: string } | null>(null);
  const done = placed === CARDS.length;
  const left = deck.filter((c) => CARDS.findIndex((k) => k.id === c.id) >= placed);

  const pick = (card: Card) => {
    if (isNext(placed, card)) {
      setPlaced(placed + 1);
      setMessage(placed + 1 === CARDS.length ? null : { kind: 'good', text: kid ? 'Yes! What comes next?' : 'Correct. Next?' });
      setShake(null);
    } else {
      setMisses(misses + 1);
      const expected = CARDS[placed];
      setMessage({ kind: 'hint', text: kid ? `Not yet! ${expected.hint.kid}` : `Not yet. ${expected.hint.pro}` });
      setShake(card.id);
      window.setTimeout(() => setShake((s) => (s === card.id ? null : s)), 450);
    }
  };

  const again = () => {
    const next = seed + 1;
    setSeed(next);
    setDeck(deal(next));
    setPlaced(0);
    setMisses(0);
    setMessage(null);
  };

  return (
    <section className="section" id="game" aria-labelledby="game-title">
      <div className="wrap">
        <div className="head">
          <h2 id="game-title">Put the trip in order</h2>
          <p>{kid ? 'Can you remember the trip? Tap the cards in the order they happen.' : 'Eight stages, shuffled. Tap them in order; a wrong pick tells you why it is too early.'}</p>
        </div>

        <div className="game">
          <ol className="slots" aria-label="Your order so far">
            {CARDS.map((c, i) => {
              const filled = i < placed;
              return (
                <li key={c.id} data-act={filled ? c.act : undefined} data-state={filled ? 'filled' : i === placed ? 'next' : 'empty'}>
                  <span className="slot-n tabular">{i + 1}</span>
                  <span className="slot-name">{filled ? (kid ? c.kid : c.pro) : i === placed && !done ? (kid ? 'What comes next?' : 'Next') : ''}</span>
                </li>
              );
            })}
          </ol>

          {!done ? (
            <>
              <div className="hand" role="group" aria-label="Cards left">
                {left.map((c) => (
                  <button key={c.id} type="button" className="card" data-act={c.act} data-shake={shake === c.id || undefined} onClick={() => pick(c)}>
                    {kid ? c.kid : c.pro}
                  </button>
                ))}
              </div>
              <p className="game-msg" data-kind={message?.kind} aria-live="polite">
                {message?.text ?? (kid ? 'Start with the very first thing that happens.' : 'Start with the first thing the browser does.')}
              </p>
            </>
          ) : (
            <div className="game-done">
              <span className="game-done-icon">{Icon.check}</span>
              <div>
                <h3>{kid ? 'You know the whole trip!' : 'All eight, in order.'}</h3>
                <p>{misses === 0 ? (kid ? 'No wrong guesses at all. Amazing!' : 'No wrong picks.') : `${misses} wrong ${misses === 1 ? 'guess' : 'guesses'} on the way.`}</p>
              </div>
              <div className="game-done-actions">
                <button type="button" className="btn btn-primary" onClick={again}>
                  {Icon.replay}
                  Play again
                </button>
                <button type="button" className="btn" onClick={onWatch}>
                  Watch the trip again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
