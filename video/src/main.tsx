import '../../src/styles/global.css';
import './film.css';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Film, Debug, END } from './Film';
import { SFX, AUDIO } from './sound';
import { ESTIMATED } from './timeline';

/**
 * Two modes. `?render`: a bare 1080 × 1350 film for the renderer, which calls window.seek(t) for
 * every frame and screenshots it. Otherwise a preview with a scrubber, play button and debug line.
 */

declare global {
  interface Window {
    seek: (t: number) => void;
    FILM: unknown;
    __ready: boolean;
  }
}

const params = new URLSearchParams(location.search);
const el = document.getElementById('root')!;
const root = createRoot(el);

window.FILM = { name: 'week04', duration: END, fps: 60, width: 1080, height: 1350, sfx: SFX, audio: AUDIO, estimated: ESTIMATED };

function Preview() {
  const [t, setT] = useState(() => Number(params.get('t') ?? 0));
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const start = performance.now() - t * 1000;
    const a = audio.current;
    if (a) {
      a.currentTime = t;
      void a.play().catch(() => {});
    }
    const loop = (now: number) => {
      const nt = (now - start) / 1000;
      if (nt >= END) {
        setT(END);
        setPlaying(false);
        return;
      }
      setT(nt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      a?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);
  const scale = Math.min((window.innerHeight - 70) / 1350, (window.innerWidth - 20) / 1080);
  return (
    <div className="preview">
      <div className="preview-frame" style={{ width: 1080 * scale, height: 1350 * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
          <Film t={t} />
        </div>
      </div>
      <div className="preview-bar">
        <button type="button" onClick={() => setPlaying(!playing)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <input type="range" min={0} max={END} step={0.01} value={t} onChange={(e) => setT(Number(e.target.value))} />
        <Debug t={t} />
      </div>
      {params.has('audio') && <audio ref={audio} src={params.get('audio')!} preload="auto" />}
    </div>
  );
}

async function boot() {
  await document.fonts.load('600 40px "Google Sans Flex"');
  await document.fonts.load('500 40px "Google Sans Code"');
  await document.fonts.ready;
  if (params.has('render')) {
    document.body.classList.add('render');
    window.seek = (t: number) => {
      flushSync(() => root.render(<Film t={Math.max(0, Math.min(END - 1e-6, t))} />));
    };
    window.seek(0);
  } else {
    root.render(<Preview />);
  }
  window.__ready = true;
}
void boot();
