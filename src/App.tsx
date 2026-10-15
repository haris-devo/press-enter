import { useEffect, useMemo, useState } from 'react';
import { firstStepOf, type ActId, type Mode } from './engine/journey';
import { parseInput, DEFAULT_INPUT } from './engine/url';
import { readStored, writeStored, scrollToId } from './lib/hooks';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Journey, type JumpRequest } from './components/Journey';
import { Faster } from './components/Faster';
import { RealTrip } from './components/RealTrip';
import { Game } from './components/Game';
import { Interview } from './components/Interview';
import { Footer } from './components/Footer';

const MODE_KEY = 'press-enter:mode';

export default function App() {
  const [mode, setMode] = useState<Mode>('kid');
  const [typed, setTyped] = useState(DEFAULT_INPUT);
  const [jump, setJump] = useState<JumpRequest | null>(null);
  const dest = useMemo(() => parseInput(typed), [typed]);

  // The choice is remembered per browser. Read it after hydration so the prerendered page matches.
  useEffect(() => {
    if (import.meta.env.DEV) {
      const q = new URLSearchParams(location.search);
      if (q.get('mode') === 'pro') return setMode('pro');
      if (q.get('host')) setTyped(q.get('host')!);
    }
    const stored = readStored(MODE_KEY);
    if (stored === 'pro' || stored === 'kid') setMode(stored);
  }, []);
  const changeMode = (m: Mode) => {
    setMode(m);
    writeStored(MODE_KEY, m);
  };

  const play = (step: number) => {
    setJump((j) => ({ step, n: (j?.n ?? 0) + 1 }));
    scrollToId('player');
  };

  return (
    <>
      <a className="sr-only" href="#journey">
        Skip to the trip
      </a>
      <Nav mode={mode} onMode={changeMode} />
      <main>
        <Hero
          mode={mode}
          onGo={(text) => {
            setTyped(text);
            play(0);
          }}
          onAct={(act: ActId) => play(firstStepOf(act))}
        />
        <Journey mode={mode} dest={dest} jump={jump} />
        <Faster mode={mode} />
        <RealTrip mode={mode} />
        <Game mode={mode} onWatch={() => play(0)} />
        <Interview mode={mode} />
      </main>
      <Footer />
    </>
  );
}
