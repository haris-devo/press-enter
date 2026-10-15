import { useMemo, useState } from 'react';
import type { Mode } from '../engine/journey';
import { simulateTrip, feeling, advice, DEFAULT_SETUP, ROAD_MS, CDN_ROAD_MS, type Distance, type Network, type PhaseId, type TripSetup } from '../engine/trip';
import './faster.css';

export const PHASE_NAMES: Record<PhaseId, { kid: string; pro: string; act: string }> = {
  dns: { kid: 'Find the address', pro: 'DNS', act: 'find' },
  connect: { kid: 'Knock on the door', pro: 'TCP', act: 'meet' },
  tls: { kid: 'Secret code', pro: 'TLS', act: 'meet' },
  wait: { kid: 'Ask and wait', pro: 'Request + server', act: 'ask' },
  download: { kid: 'Bring it home', pro: 'Download', act: 'ask' },
  build: { kid: 'Build and draw', pro: 'Parse + render', act: 'build' },
};

const DISTANCES: { id: Distance; kid: string; pro: string }[] = [
  { id: 'city', kid: 'Same city', pro: 'Same city' },
  { id: 'country', kid: 'Another country', pro: 'Same continent' },
  { id: 'world', kid: 'Other side of the world', pro: 'Across the world' },
];
const NETWORKS: { id: Network; kid: string; pro: string }[] = [
  { id: 'wifi', kid: 'Fast Wi-Fi', pro: 'Wi-Fi' },
  { id: '4g', kid: 'Phone (4G)', pro: '4G' },
  { id: '3g', kid: 'Weak signal', pro: '3G' },
];

function Choice<T extends string>({ label, value, options, onChange, mode }: { label: string; value: T; options: { id: T; kid: string; pro: string }[]; onChange: (v: T) => void; mode: Mode }) {
  return (
    <fieldset className="fs">
      <legend>{label}</legend>
      <div className="seg seg-wrap" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}>
            {mode === 'kid' ? o.kid : o.pro}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({ on, onChange, title, hint }: { on: boolean; onChange: (v: boolean) => void; title: string; hint: string }) {
  return (
    <button type="button" className="toggle" role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="toggle-track" aria-hidden="true">
        <span />
      </span>
      <span className="toggle-text">
        <b>{title}</b>
        <span>{hint}</span>
      </span>
    </button>
  );
}

/** The road from you to the shop, with one arc for every trip there and back. */
function Road({ setup, trips, kid }: { setup: TripSetup; trips: number; kid: boolean }) {
  const road = setup.cdn ? CDN_ROAD_MS : ROAD_MS[setup.distance];
  const len = 90 + (Math.min(road, 240) / 240) * 440;
  const x0 = 36;
  const x1 = x0 + len;
  const arcs = Array.from({ length: trips }, (_, i) => i);
  return (
    <svg className="road" viewBox="0 0 600 150" role="img" aria-label={`${trips} trips there and back, ${road} milliseconds of road for each one`}>
      <path d={`M ${x0} 112 L ${x1} 112`} stroke="#d3d0e3" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
      {arcs.map((i) => {
        const h = 26 + i * 18;
        return <path key={i} className="road-arc" style={{ animationDelay: `${i * 0.12}s` }} d={`M ${x0 + 6} 104 C ${x0 + 40} ${104 - h * 1.6}, ${x1 - 40} ${104 - h * 1.6}, ${x1 - 6} 104`} fill="none" stroke="#8a5cf6" strokeWidth={2.5} strokeOpacity={0.35 + i * 0.15} />;
      })}
      <g transform={`translate(${x0} 112)`}>
        <circle r={14} fill="#1d1b36" />
        <text y={38} textAnchor="middle" className="road-label">
          You
        </text>
      </g>
      <g transform={`translate(${x1} 112)`}>
        <rect x={-14} y={-14} width={28} height={28} rx={8} fill={setup.cdn ? '#0ea5a0' : '#2e7cf6'} />
        <text y={38} textAnchor="middle" className="road-label">
          {setup.cdn ? (kid ? 'Copy shop' : 'CDN edge') : kid ? 'The shop' : 'Origin'}
        </text>
      </g>
    </svg>
  );
}

export function Faster({ mode }: { mode: Mode }) {
  const kid = mode === 'kid';
  const [setup, setSetup] = useState<TripSetup>(DEFAULT_SETUP);
  const trip = useMemo(() => simulateTrip(setup), [setup]);
  const set = <K extends keyof TripSetup>(k: K, v: TripSetup[K]) => setSetup((s) => ({ ...s, [k]: v }));
  const seconds = (trip.total / 1000).toFixed(2);

  return (
    <section className="section" id="faster" aria-labelledby="faster-title">
      <div className="wrap">
        <div className="head">
          <h2 id="faster-title">Make the trip faster</h2>
          <p>
            {kid
              ? 'Move the shop, change your internet, and see what makes the trip quick or slow. The secret: counting trips there and back.'
              : 'A small model of a first page load. Change latency, bandwidth, CDN, HTTP/3 and caching, and watch which phase dominates. Round trips usually matter more than bandwidth.'}
          </p>
        </div>

        <div className="lab">
          <div className="lab-controls">
            <Choice label={kid ? 'How far away is the shop?' : 'Distance to the origin'} value={setup.distance} options={DISTANCES} onChange={(v) => set('distance', v)} mode={mode} />
            <Choice label={kid ? 'How good is your internet?' : 'Network'} value={setup.network} options={NETWORKS} onChange={(v) => set('network', v)} mode={mode} />
            <div className="toggles">
              <Toggle on={setup.cdn} onChange={(v) => set('cdn', v)} title={kid ? 'A copy shop nearby' : 'CDN'} hint={kid ? 'Keep copies close to people' : 'Serve from an edge near the user'} />
              <Toggle on={setup.h3} onChange={(v) => set('h3', v)} title={kid ? 'Hello and secret code together' : 'HTTP/3 (QUIC)'} hint={kid ? 'One trip instead of two' : 'Transport and TLS in one round trip'} />
              <Toggle on={setup.visited} onChange={(v) => set('visited', v)} title={kid ? 'Visited before' : 'Return visit'} hint={kid ? 'Address and styles remembered' : 'DNS cached, assets in the HTTP cache'} />
            </div>
          </div>

          <div className="lab-result" aria-live="polite">
            <div className="total">
              <p className="total-num tabular">
                {seconds}
                <span>s</span>
              </p>
              <p className="total-feel">{feeling(trip.total)}</p>
            </div>

            <Road setup={setup} trips={trip.roundTrips} kid={kid} />
            <p className="trips-line">
              <b className="tabular">{trip.roundTrips}</b> {kid ? (trip.roundTrips === 1 ? 'trip there and back' : 'trips there and back') : 'round trips'}, <b className="tabular">{trip.rtt} ms</b> {kid ? 'each' : 'per round trip'}
            </p>

            <div className="bar" role="img" aria-label={trip.phases.map((p) => `${kid ? PHASE_NAMES[p.id].kid : PHASE_NAMES[p.id].pro} ${p.ms} ms`).join(', ')}>
              {trip.phases
                .filter((p) => p.ms > 0)
                .map((p) => (
                  <span key={p.id} data-act={PHASE_NAMES[p.id].act} data-phase={p.id} style={{ flexGrow: p.ms }} title={`${PHASE_NAMES[p.id].pro}: ${p.ms} ms`} />
                ))}
            </div>
            <ul className="legend">
              {trip.phases.map((p) => (
                <li key={p.id} data-act={PHASE_NAMES[p.id].act} data-phase={p.id} data-skipped={p.skipped ? true : undefined} data-biggest={p.id === trip.biggest || undefined}>
                  <i />
                  <span>{kid ? PHASE_NAMES[p.id].kid : PHASE_NAMES[p.id].pro}</span>
                  <b className="tabular">{p.skipped ? (p.skipped === 'remembered' ? (kid ? 'remembered' : 'cached') : kid ? 'done together' : 'merged') : `${p.ms} ms`}</b>
                </li>
              ))}
            </ul>
            <p className="advice">{advice(trip, setup)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
