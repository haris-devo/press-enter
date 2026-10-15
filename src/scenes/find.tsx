import { shorten } from '../engine/url';
import {
  PAL,
  Txt,
  Pill,
  Bubble,
  Buddy,
  Envelope,
  Check,
  Cross,
  seg,
  lerp,
  easeOut,
  fadeIn,
  along,
  type SceneProps,
} from './kit';

/* ------------------------------------------------------------------ 1. Type the address */

export function UrlScene({ t, mode, d }: SceneProps) {
  const kid = mode === 'kid';
  const typed = shorten(d.typed, 30);
  const typedCount = Math.round(seg(t, 0.03, 0.3) * typed.length);
  const typing = t < 0.5;

  const scheme = 'https://';
  const host = shorten(d.host, 22);
  const path = shorten(d.path, d.kind === 'search' ? 16 : 12);
  const full = scheme + host + path;

  // The address bar text uses the monospace face, so every character is the same width.
  const x0 = 136;
  const room = 560;
  const size = Math.min(28, room / (Math.max(full.length, typed.length) * 0.6));
  const ch = size * 0.6;

  const decide = seg(t, 0.34, 0.42);
  const decided = fadeIn(t, 0.42, 0.05);
  const decideOut = 1 - seg(t, 0.5, 0.56);
  const morph = seg(t, 0.52, 0.6);
  const slides = full !== typed && full.endsWith(typed);
  const caret = t < 0.33 && Math.floor(t * 40) % 2 === 0;

  const parts = [
    { text: scheme, from: 0, color: PAL.find, kid: 'the safe road', pro: 'scheme' },
    { text: host, from: scheme.length, color: PAL.meet, kid: d.kind === 'search' ? 'the search shop' : "the shop's name", pro: 'host' },
    { text: path, from: scheme.length + host.length, color: PAL.ask, kid: d.kind === 'search' ? 'what to look for' : 'which page', pro: 'path' },
  ];
  const centers = parts.map((p) => x0 + (p.from + p.text.length / 2) * ch);
  const rows = [262, 336, 262];
  if (Math.abs(centers[2] - centers[0]) < 170) rows[2] = 410;

  const isSite = d.kind === 'site';
  const note = kid
    ? isSite
      ? d.upgraded
        ? 'Swapped http for the safe road: https'
        : 'Added the safe road: https://'
      : "That's a search, so it goes to a search shop"
    : isSite
      ? d.upgraded
        ? 'Upgraded to HTTPS (HSTS)'
        : 'No scheme typed: try HTTPS first'
      : 'Not a URL: send it to the search engine';

  return (
    <g>
      {/* address bar */}
      <g>
        <rect x={64} y={110} width={672} height={80} rx={40} fill={PAL.white} stroke={PAL.ink} strokeWidth={2.5} />
        <circle cx={100} cy={150} r={17} fill={PAL.findSoft} />
        {typing ? (
          <g stroke={PAL.find} strokeWidth={2.6} fill="none" strokeLinecap="round">
            <circle cx={98} cy={148} r={7} />
            <path d="M 103 153 L 108 158" />
          </g>
        ) : (
          <g transform="translate(100 150)">
            <rect x={-7} y={-3} width={14} height={11} rx={2.5} fill={PAL.find} />
            <path d="M -4 -3 V -6 A 4 4 0 0 1 4 -6 V -3" fill="none" stroke={PAL.find} strokeWidth={2.2} />
          </g>
        )}
        {slides ? (
          // The browser only adds what is missing: the typed text slides over and https:// appears.
          morph < 1 ? (
            <g>
              <Txt x={x0} y={151} size={size} anchor="start" mono weight={500} fill={PAL.ink3} opacity={morph}>
                {full.slice(0, full.length - typed.length)}
              </Txt>
              <Txt x={x0 + easeOut(morph) * (full.length - typed.length) * ch} y={151} size={size} anchor="start" mono weight={500}>
                {typed.slice(0, typedCount)}
              </Txt>
              {caret && <rect x={x0 + typedCount * ch + 2} y={134} width={2.5} height={34} rx={1} fill={PAL.find} />}
            </g>
          ) : null
        ) : (
          <g opacity={full === typed ? (t < 0.55 ? 1 : 0) : 1 - seg(t, 0.5, 0.54)}>
            <Txt x={x0} y={151} size={size} anchor="start" mono weight={500}>
              {typed.slice(0, typedCount)}
            </Txt>
            {caret && <rect x={x0 + typedCount * ch + 2} y={134} width={2.5} height={34} rx={1} fill={PAL.find} />}
          </g>
        )}
        <g opacity={slides ? (morph >= 1 ? 1 : 0) : full === typed ? (t < 0.55 ? 0 : 1) : seg(t, 0.55, 0.6)}>
          {parts.map((p, i) => (
            <Txt key={i} x={x0 + p.from * ch} y={151} size={size} anchor="start" mono weight={500} fill={i === 0 ? PAL.ink3 : PAL.ink}>
              {p.text}
            </Txt>
          ))}
        </g>
        {/* the Enter key */}
        <g transform="translate(696 150)" opacity={t < 0.33 ? 0.35 : 1}>
          <rect x={-26} y={-20} width={52} height={40} rx={12} fill={t > 0.31 && t < 0.36 ? PAL.find : PAL.paper2} />
          <path d="M 9 -8 V 2 H -8 M -3 -3 L -8 2 L -3 7" fill="none" stroke={t > 0.31 && t < 0.36 ? PAL.white : PAL.ink2} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* website or search? */}
      <g opacity={decideOut}>
        <Pill x={300} y={262} text={kid ? 'A website?' : 'A URL?'} o={decide} size={20} bg={isSite && decided ? PAL.findSoft : PAL.white} color={PAL.ink} />
        <Pill x={500} y={262} text={kid ? 'A search?' : 'A search query?'} o={decide} size={20} bg={!isSite && decided ? PAL.findSoft : PAL.white} color={PAL.ink} />
        <Check x={isSite ? 300 : 500} y={222} o={decided} r={14} />
      </g>

      <Pill x={400} y={66} text={note} o={fadeIn(t, 0.55, 0.06)} bg={PAL.ink} color={PAL.white} size={17} />

      {/* label every part */}
      {parts.map((p, i) => {
        const o = fadeIn(t, 0.62 + i * 0.07, 0.07);
        if (o <= 0) return null;
        const x1 = x0 + p.from * ch;
        const x2 = x1 + p.text.length * ch;
        const cx = centers[i];
        const row = rows[i];
        return (
          <g key={i} opacity={o}>
            <rect x={x1} y={174} width={(x2 - x1) * easeOut(o)} height={5} rx={2.5} fill={p.color} />
            <path d={`M ${cx} 182 L ${cx} ${row - 22}`} stroke={p.color} strokeWidth={2} strokeDasharray="3 5" />
            <Pill x={cx} y={row} text={kid ? p.kid : p.pro} color={p.color} bg={PAL.white} stroke={p.color} size={18} o={o} />
          </g>
        );
      })}
      {!kid && (
        <Pill
          x={Math.min(640, x0 + (scheme.length + host.length) * ch + 40)}
          y={rows[2] === 410 ? 336 : 410}
          text="port 443, implied"
          color={PAL.ink2}
          bg={PAL.paper2}
          size={16}
          o={fadeIn(t, 0.86, 0.06)}
        />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ 2. Look in the pocket */

export function CacheScene({ t, mode }: SceneProps) {
  const kid = mode === 'kid';
  const drawers = kid
    ? ['Back button memory', "Helper's own box", 'Saved copies']
    : ['Back/forward cache', 'Service worker', 'HTTP cache'];
  const windows: [number, number][] = [
    [0.1, 0.3],
    [0.34, 0.54],
    [0.58, 0.78],
  ];
  const active = windows.findIndex(([a, b]) => t >= a && t <= b);
  const lens = (() => {
    const ys = [130, 230, 330];
    for (let i = 0; i < 3; i++) {
      const [a, b] = windows[i];
      if (t < a) return { x: 650, y: i === 0 ? 70 : ys[i - 1] };
      if (t <= b) return { x: lerp(560, 690, Math.sin(seg(t, a, b) * Math.PI)), y: ys[i] };
    }
    return { x: 650, y: 330 };
  })();
  const missed = (i: number) => fadeIn(t, windows[i][1] - 0.02, 0.05);
  const out = fadeIn(t, 0.82, 0.06);

  return (
    <g>
      <Buddy x={170} y={250} look={t > 0.82 ? -1 : 1} mood={t > 0.82 ? 'happy' : 'wow'} label={kid ? 'Browser' : 'Browser'} />
      <Bubble x={170} y={150} text={kid ? 'Do I have it already?' : 'Any cached copy?'} o={fadeIn(t, 0.02, 0.06) * (1 - seg(t, 0.78, 0.82))} />
      <Bubble x={170} y={150} text={kid ? "Not yet. Let's go get it!" : 'Miss: go to the network'} o={out} />

      {/* the cabinet */}
      <rect x={440} y={74} width={300} height={316} rx={22} fill={PAL.white} stroke={PAL.ink} strokeWidth={2.5} />
      {drawers.map((label, i) => {
        const y = 92 + i * 100;
        const pull = active === i ? Math.sin(seg(t, windows[i][0], windows[i][1]) * Math.PI) * 14 : 0;
        return (
          <g key={label} transform={`translate(${-pull} 0)`}>
            <rect x={460} y={y} width={260} height={78} rx={14} fill={active === i ? PAL.findSoft : PAL.paper} stroke={PAL.line2} strokeWidth={2} />
            <rect x={566} y={y + 60} width={48} height={7} rx={3.5} fill={PAL.line2} />
            <Txt x={590} y={y + 32} size={18} weight={560} fill={PAL.ink}>
              {label}
            </Txt>
            <Cross x={700} y={y + 14} r={12} o={missed(i)} />
          </g>
        );
      })}

      {/* magnifying glass */}
      {t > 0.06 && t < 0.82 && (
        <g transform={`translate(${lens.x} ${lens.y})`}>
          <circle r={26} fill="rgba(46,124,246,0.08)" stroke={PAL.find} strokeWidth={5} />
          <path d="M 19 19 L 38 38" stroke={PAL.find} strokeWidth={8} strokeLinecap="round" />
        </g>
      )}

      <g opacity={out}>
        <path d={`M 250 ${330} Q 330 ${430} 420 ${420}`} fill="none" stroke={PAL.find} strokeWidth={3} strokeDasharray="4 8" strokeLinecap="round" />
        <Pill x={590} y={432} text={kid ? 'First visit: nothing saved' : 'First visit: cold cache'} bg={PAL.findSoft} color={PAL.find} size={17} o={out} />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ 3. Find the address (DNS) */

export function DnsScene({ t, mode, d }: SceneProps) {
  const kid = mode === 'kid';
  const host = shorten(d.host, 18);
  const zone = shorten(d.zone, 14);
  const buddy: [number, number] = [96, 320];
  const resolver: [number, number] = [300, 320];
  const servers = [
    { at: [640, 100] as [number, number], name: kid ? 'The big index' : 'Root server  .', reply: kid ? `Ask the ${d.tld} list` : `Try the ${d.tld} servers`, short: '.' },
    { at: [640, 222] as [number, number], name: kid ? `The ${d.tld} list` : `${d.tld} TLD server`, reply: kid ? `Ask ${zone}'s book` : `Try ns1.${zone}`, short: d.tld },
    { at: [640, 344] as [number, number], name: kid ? `${zone}'s own book` : `ns1.${zone}`, reply: d.ip, short: zone },
  ];

  // Who is talking when: each pair is [ask window, reply window].
  const legs: [number, number][] = [
    [0.15, 0.24],
    [0.25, 0.33],
    [0.35, 0.44],
    [0.45, 0.53],
    [0.55, 0.64],
    [0.65, 0.73],
  ];
  const envelopes: { from: [number, number]; to: [number, number]; p: number }[] = [
    { from: [buddy[0] + 50, buddy[1] - 10], to: [resolver[0] - 46, resolver[1] - 10], p: seg(t, 0.03, 0.13) },
  ];
  servers.forEach((s, i) => {
    const [ask, reply] = [legs[i * 2], legs[i * 2 + 1]];
    const left: [number, number] = [s.at[0] - 122, s.at[1]];
    envelopes.push({ from: [resolver[0] + 40, resolver[1] - 20], to: left, p: seg(t, ask[0], ask[1]) });
    envelopes.push({ from: left, to: [resolver[0] + 40, resolver[1] - 20], p: seg(t, reply[0], reply[1]) });
  });
  envelopes.push({ from: [resolver[0] - 46, resolver[1] - 10], to: [buddy[0] + 50, buddy[1] - 10], p: seg(t, 0.75, 0.85) });

  const card = fadeIn(t, 0.86, 0.07);
  const asking = t < 0.16;

  return (
    <g>
      {/* lines from the helper to each server */}
      {servers.map((s, i) => (
        <path key={i} d={`M ${resolver[0] + 30} ${resolver[1] - 24} L ${s.at[0] - 122} ${s.at[1]}`} stroke={PAL.line2} strokeWidth={2} strokeDasharray="3 7" />
      ))}
      <path d={`M ${buddy[0] + 60} ${buddy[1] - 10} L ${resolver[0] - 46} ${resolver[1] - 10}`} stroke={PAL.line2} strokeWidth={2} strokeDasharray="3 7" />

      <Buddy x={buddy[0]} y={buddy[1]} s={0.82} look={1} mood={t > 0.85 ? 'happy' : 'wow'} label="Browser" />
      <Bubble x={buddy[0] + 40} y={buddy[1] - 92} text={kid ? `Where is ${host}?` : `A record for ${host}?`} o={fadeIn(t, 0.0, 0.05) * (asking ? 1 : 1 - seg(t, 0.16, 0.2))} size={17} />

      {/* the helper: a recursive resolver */}
      <g transform={`translate(${resolver[0]} ${resolver[1]})`}>
        <ellipse cx={0} cy={56} rx={44} ry={6} fill={PAL.ink} opacity={0.07} />
        <circle r={46} fill={PAL.findSoft} stroke={PAL.ink} strokeWidth={2.5} />
        <path d="M -20 -14 Q -10 -20 0 -14 Q 10 -20 20 -14 V 16 Q 10 10 0 16 Q -10 10 -20 16 Z" fill={PAL.white} stroke={PAL.find} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M 0 -14 V 16" stroke={PAL.find} strokeWidth={2} />
        <Txt x={0} y={78} size={18} fill={PAL.ink2} weight={540}>
          {kid ? 'Phone book helper' : 'Recursive resolver'}
        </Txt>
      </g>

      {/* the three servers the helper asks */}
      {servers.map((s, i) => {
        const lit = t >= legs[i * 2][0] && t <= legs[i * 2 + 1][1];
        const done = t > legs[i * 2 + 1][1];
        return (
          <g key={i} transform={`translate(${s.at[0]} ${s.at[1]})`}>
            <rect x={-122} y={-32} width={244} height={64} rx={16} fill={lit ? PAL.findSoft : PAL.white} stroke={lit ? PAL.find : PAL.ink} strokeWidth={2.5} />
            <rect x={-108} y={-12} width={8} height={24} rx={4} fill={done || lit ? PAL.find : PAL.line2} />
            <Txt x={8} y={1} size={16} weight={570}>
              {s.name}
            </Txt>
            <Bubble x={-20} y={-58} text={s.reply} o={fadeIn(t, legs[i * 2 + 1][0], 0.03) * (1 - seg(t, legs[i * 2 + 1][1] + 0.04, legs[i * 2 + 1][1] + 0.08))} size={16} tail="down" />
          </g>
        );
      })}

      {envelopes.map((e, i) => {
        if (e.p <= 0 || e.p >= 1) return null;
        const [x, y] = along(e.from, e.to, e.p, 26);
        return <Envelope key={i} x={x} y={y} color={PAL.find} s={0.62} />;
      })}

      {/* the answer, written in the phone book */}
      {card > 0 && (
        <g transform={`translate(210 120) scale(${0.85 + 0.15 * easeOut(card)})`} opacity={card}>
          <rect x={-150} y={-56} width={300} height={112} rx={20} fill={PAL.white} stroke={PAL.find} strokeWidth={2.5} />
          <Txt x={0} y={-22} size={18} fill={PAL.ink2}>
            {host}
          </Txt>
          <Txt x={0} y={18} size={27} weight={650} fill={PAL.find} mono>
            {d.ip}
          </Txt>
        </g>
      )}
      <Pill x={210} y={208} text={kid ? 'Names for people, numbers for computers' : 'Cached for the TTL: 300 s'} o={fadeIn(t, 0.92, 0.05)} bg={PAL.ink} color={PAL.white} size={15} />
    </g>
  );
}
