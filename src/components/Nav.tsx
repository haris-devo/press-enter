import type { Mode } from '../engine/journey';
import { useActiveSection } from '../lib/hooks';
import { Icon } from './icons';
import './nav.css';

const LINKS = [
  { id: 'journey', label: 'The trip' },
  { id: 'faster', label: 'Speed lab' },
  { id: 'yours', label: 'Your trip' },
  { id: 'game', label: 'Game' },
  { id: 'interview', label: 'Interview' },
];
const IDS = LINKS.map((l) => l.id);

export function ModeSwitch({ mode, onMode, compact = false }: { mode: Mode; onMode: (m: Mode) => void; compact?: boolean }) {
  return (
    <div className="seg mode-switch" role="radiogroup" aria-label="How to explain it">
      <button type="button" role="radio" aria-checked={mode === 'kid'} onClick={() => onMode('kid')}>
        {compact ? 'Simple' : "Like I'm 5"}
      </button>
      <button type="button" role="radio" aria-checked={mode === 'pro'} onClick={() => onMode('pro')}>
        {compact ? 'Engineer' : 'Like an engineer'}
      </button>
    </div>
  );
}

export function Nav({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  const active = useActiveSection(IDS);
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <a className="brand" href="#top" aria-label="Press Enter, back to the top">
          <span className="brand-key">{Icon.enter}</span>
          <span>Press Enter</span>
        </a>
        <nav className="nav-links" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} aria-current={active === l.id ? 'true' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-mode">
          <ModeSwitch mode={mode} onMode={onMode} compact />
        </div>
      </div>
    </header>
  );
}
