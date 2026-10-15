// Dev-only contact sheet of every scene at a few moments. Not part of the build.
import { createRoot } from 'react-dom/client';
import { STEPS, type Mode } from './engine/journey';
import { parseInput } from './engine/url';
import { SCENES } from './scenes';
import './styles/global.css';
import './components/journey.css';

const q = new URLSearchParams(location.search);
const mode = (q.get('mode') as Mode) ?? 'kid';
const ts = (q.get('t') ?? '0.3,0.6,1').split(',').map(Number);
const only = q.get('steps')?.split(',').map(Number);
const d = parseInput(q.get('host') ?? 'toyshop.com');

createRoot(document.getElementById('root')!).render(
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ts.length}, 1fr)`, gap: 12, padding: 12 }}>
    {STEPS.map((s, i) => (only && !only.includes(i) ? null : ts.map((t) => {
      const Scene = SCENES[s.id];
      return (
        <div key={`${s.id}-${t}`} className="stage" data-act={s.act}>
          <div style={{ position: 'absolute', left: 10, top: 6, fontSize: 12 }}>{i} {s.id} t={t}</div>
          <svg viewBox="0 0 800 480"><Scene t={t} mode={mode} d={d} /></svg>
        </div>
      );
    })))}
  </div>,
);
