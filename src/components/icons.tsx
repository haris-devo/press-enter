import type { ActId } from '../engine/journey';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const Icon = {
  play: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6.5" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
    </svg>
  ),
  prev: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" {...stroke} strokeWidth={2.4} />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" {...stroke} strokeWidth={2.4} />
    </svg>
  ),
  replay: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" {...stroke} strokeWidth={2.2} />
    </svg>
  ),
  enter: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 6v6a2 2 0 0 1-2 2H6m0 0 4-4m-4 4 4 4" {...stroke} strokeWidth={2.2} />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" {...stroke} strokeWidth={2.6} />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" {...stroke} />
      <path d="M15.5 5.5v-.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h.5" {...stroke} />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6v12M6 12h12" {...stroke} strokeWidth={2.2} />
    </svg>
  ),
};

/** One small picture per chapter of the trip. */
export function ActIcon({ act }: { act: ActId }) {
  switch (act) {
    case 'find':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" {...stroke} />
          <circle cx="12" cy="10" r="2.4" {...stroke} />
        </svg>
      );
    case 'meet':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v3A2.5 2.5 0 0 1 13.5 12H9l-3.5 3v-3.2A2.5 2.5 0 0 1 4 9.5Z" {...stroke} />
          <path d="M18.5 9.5A2.5 2.5 0 0 1 20 12v3a2.5 2.5 0 0 1-1.5 2.3V20L15 17h-3a2.5 2.5 0 0 1-2.2-1.3" {...stroke} />
        </svg>
      );
    case 'ask':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" {...stroke} />
          <path d="m4.5 7 7.5 6 7.5-6" {...stroke} />
        </svg>
      );
    case 'build':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="13" width="7" height="7" rx="1.5" {...stroke} />
          <rect x="13" y="13" width="7" height="7" rx="1.5" {...stroke} />
          <rect x="8.5" y="4" width="7" height="7" rx="1.5" {...stroke} />
        </svg>
      );
    case 'draw':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.5 4.5l5 5L9 20H4v-5Z" {...stroke} />
          <path d="M12.5 6.5l5 5" {...stroke} />
        </svg>
      );
    case 'play':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" {...stroke} />
          <circle cx="12" cy="12" r="2.6" {...stroke} />
        </svg>
      );
  }
}
