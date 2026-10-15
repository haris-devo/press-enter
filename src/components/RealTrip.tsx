import { useEffect, useState } from 'react';
import type { Mode } from '../engine/journey';
import { readTrip, protocolName, edgeCode, type RealPhaseId, type RealTrip as Trip } from '../engine/realTrip';
import { Icon } from './icons';
import './realtrip.css';

const NAMES: Record<RealPhaseId, { kid: string; pro: string; act: string }> = {
  redirect: { kid: 'Sent somewhere else', pro: 'Redirect', act: 'find' },
  cache: { kid: 'Looked in the pocket', pro: 'Cache check', act: 'find' },
  dns: { kid: 'Found the address', pro: 'DNS', act: 'find' },
  connect: { kid: 'Knocked on the door', pro: 'TCP connect', act: 'meet' },
  tls: { kid: 'Agreed a secret code', pro: 'TLS', act: 'meet' },
  wait: { kid: 'Asked and waited', pro: 'Waiting for first byte', act: 'ask' },
  download: { kid: 'Brought it home', pro: 'Download', act: 'ask' },
  build: { kid: 'Read the instructions', pro: 'Parse until interactive', act: 'build' },
};

const OPTIONAL: RealPhaseId[] = ['redirect', 'cache'];

export function RealTrip({ mode }: { mode: Mode }) {
  const kid = mode === 'kid';
  const [trip, setTrip] = useState<Trip | null>(null);
  const [edge, setEdge] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (!nav) {
        setUnsupported(true);
        return;
      }
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null;
      setTrip(readTrip(nav, fcp));
    };
    let timer = 0;
    const onLoad = () => {
      timer = window.setTimeout(read, 50);
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    // The CDN in front of this site names the edge city it answered from.
    fetch(location.href, { method: 'HEAD', cache: 'no-store' })
      .then((r) => setEdge(edgeCode(r.headers.get('x-served-by'))))
      .catch(() => {});
    return () => {
      window.removeEventListener('load', onLoad);
      window.clearTimeout(timer);
    };
  }, []);

  const rows = trip ? trip.phases.filter((p) => !OPTIONAL.includes(p.id) || p.ms >= 1) : [];
  const end = trip ? Math.max(1, trip.firstPaint ?? 0, ...trip.phases.map((p) => p.start + p.ms)) : 1;

  return (
    <section className="section" id="yours" aria-labelledby="yours-title">
      <div className="wrap">
        <div className="head">
          <h2 id="yours-title">Your trip, for real</h2>
          <p>
            {kid
              ? 'This all happened to you a moment ago, when you opened this page. Your browser keeps a stopwatch for every step.'
              : 'Read from the Navigation Timing API for your visit to this page. No model here: these are your numbers.'}
          </p>
        </div>

        <div className="yours">
          {!trip ? (
            <div className="yours-wait">
              <p>{unsupported ? 'This browser does not share its stopwatch.' : 'Reading your stopwatch…'}</p>
            </div>
          ) : (
            <>
              <div className="yours-rows">
                {rows.map((p) => {
                  const n = NAMES[p.id];
                  const skipped = p.ms < 0.5;
                  return (
                    <div key={p.id} className="yr" data-act={n.act} data-skipped={skipped || undefined}>
                      <span className="yr-name">{kid ? n.kid : n.pro}</span>
                      <span className="yr-track">
                        <i style={{ left: `${(p.start / end) * 100}%`, width: skipped ? undefined : `${Math.max(0.8, (p.ms / end) * 100)}%` }} />
                      </span>
                      <b className="tabular">{skipped ? (kid ? 'skipped' : '0 ms') : `${Math.round(p.ms)} ms`}</b>
                    </div>
                  );
                })}
                {trip.firstPaint !== null && (
                  <div className="yr yr-moment" data-act="draw">
                    <span className="yr-name">{kid ? 'First colours on screen' : 'First Contentful Paint'}</span>
                    <span className="yr-track">
                      <i style={{ left: `${(trip.firstPaint / end) * 100}%` }} />
                    </span>
                    <b className="tabular">at {Math.round(trip.firstPaint)} ms</b>
                  </div>
                )}
              </div>
              <dl className="yours-facts">
                <div>
                  <dt>{kid ? 'Page ready after' : 'Load event end'}</dt>
                  <dd className="tabular">{Math.round(trip.done)} ms</dd>
                </div>
                <div>
                  <dt>{kid ? 'Road used' : 'Protocol'}</dt>
                  <dd>{protocolName(trip.protocol)}</dd>
                </div>
                <div>
                  <dt>{kid ? 'Copy shop' : 'CDN edge'}</dt>
                  <dd>{edge ? `${edge} (airport code)` : 'not reported'}</dd>
                </div>
                <div>
                  <dt>{kid ? 'Bytes carried' : 'Transfer size'}</dt>
                  <dd className="tabular">{trip.transferred ? `${(trip.transferred / 1024).toFixed(1)} KB` : kid ? 'none, it was saved' : '0 (cache)'}</dd>
                </div>
              </dl>
              {trip.reused && (
                <p className="yours-note">
                  {kid
                    ? 'Some steps say skipped: your browser remembered them from before, so it did not need to do them again.'
                    : 'Zero-length phases were answered from a cache or reused an existing connection.'}
                </p>
              )}
              <button type="button" className="btn btn-sm" onClick={() => location.reload()}>
                {Icon.replay}
                Reload and measure again
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
