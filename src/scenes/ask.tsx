import { shorten } from '../engine/url';
import {
  PAL,
  Txt,
  Pill,
  Bubble,
  Buddy,
  Shop,
  Envelope,
  Road,
  Check,
  Cross,
  seg,
  easeOut,
  pop,
  fadeIn,
  along,
  type SceneProps,
} from './kit';

/* ------------------------------------------------------------------ 6. Ask for the page (HTTP request) */

export function RequestScene({ t, mode, d }: SceneProps) {
  const kid = mode === 'kid';
  const host = shorten(d.host, kid ? 18 : 22);
  const path = shorten(d.path, 18);
  const lines = kid
    ? [`Dear ${host},`, d.path === '/' ? 'May I have your front page?' : `May I have ${shorten(d.path, 14)}?`, 'I can read English.', 'Thank you! Your browser']
    : [`GET ${path} HTTP/2`, `Host: ${host}`, 'Accept: text/html', 'Accept-Language: en', 'Accept-Encoding: br, gzip', 'Cookie: cart=3'];
  const fold = seg(t, 0.56, 0.64);
  const fly = seg(t, 0.64, 0.88);
  const [ex, ey] = fly > 0 ? along([400, 230], [626, 300], fly, 60) : [400, 230];
  const arrived = fadeIn(t, 0.88, 0.05);

  return (
    <g>
      <Road x1={180} x2={600} y={346} color={PAL.meet} o={0.5} />
      <Buddy x={110} y={300} look={1} mood="happy" label="Browser" lock />
      <Shop x={690} y={350} color={PAL.ask} soft={PAL.askSoft} sign={shorten(d.host, 16)} label={kid ? 'The shop' : 'Server'} glow={arrived} />

      {/* the note */}
      {fold < 1 && (
        <g transform={`translate(400 190) scale(${1 - 0.85 * easeOut(fold)}) rotate(${-2 + fold * 6})`} opacity={1 - fold * 0.6}>
          <rect x={-184} y={-118} width={368} height={236} rx={18} fill={PAL.white} stroke={PAL.ask} strokeWidth={2.5} />
          <rect x={-184} y={-118} width={368} height={34} rx={18} fill={PAL.askSoft} />
          <rect x={-184} y={-100} width={368} height={16} fill={PAL.askSoft} />
          <Txt x={-162} y={-101} size={14} anchor="start" weight={620} fill={PAL.ask}>
            {kid ? 'A polite note' : 'HTTP request'}
          </Txt>
          {lines.map((line, i) => {
            const o = fadeIn(t, 0.06 + i * (kid ? 0.1 : 0.07), 0.05);
            return (
              <Txt key={i} x={-162} y={-58 + i * (kid ? 40 : 30)} size={kid ? 19 : 15} anchor="start" mono={!kid} weight={i === 0 && !kid ? 650 : 500} opacity={o} fill={!kid && i > 0 && line.includes(':') ? PAL.ink2 : PAL.ink}>
                {line}
              </Txt>
            );
          })}
        </g>
      )}

      {fold > 0.6 && fly < 1 && <Envelope x={ex} y={ey} color={PAL.ask} s={0.9 * pop(seg(t, 0.58, 0.66))} seal />}
      <Bubble x={690} y={150} text={kid ? 'Got your note!' : 'Request received'} o={arrived} />
      <Check x={626} y={300} o={arrived} r={16} color={PAL.ask} />
    </g>
  );
}

/* ------------------------------------------------------------------ 7. The shop gets it ready (CDN and origin) */

function Gear({ x, y, r, angle, color }: { x: number; y: number; r: number; angle: number; color: string }) {
  const teeth = [];
  for (let i = 0; i < 8; i++) {
    teeth.push(<rect key={i} x={-r * 0.18} y={-r * 1.28} width={r * 0.36} height={r * 0.42} rx={2} fill={color} transform={`rotate(${i * 45})`} />);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {teeth}
      <circle r={r} fill={color} />
      <circle r={r * 0.4} fill={PAL.white} />
    </g>
  );
}

function PageSheet({ x, y, s = 1, lines = 4, o = 1 }: { x: number; y: number; s?: number; lines?: number; o?: number }) {
  if (o <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-26} y={-34} width={52} height={68} rx={8} fill={PAL.white} stroke={PAL.ask} strokeWidth={2.5} />
      {Array.from({ length: lines }, (_, i) => (
        <rect key={i} x={-16} y={-22 + i * 12} width={i === 0 ? 32 : 24 + ((i * 7) % 10)} height={5} rx={2.5} fill={i === 0 ? PAL.ask : PAL.line2} />
      ))}
    </g>
  );
}

export function ServerScene({ t, mode, d }: SceneProps) {
  const kid = mode === 'kid';
  const buddy: [number, number] = [76, 330];
  const edge: [number, number] = [296, 360];
  const origin: [number, number] = [640, 360];

  const toEdge = seg(t, 0.02, 0.14);
  const miss = fadeIn(t, 0.16, 0.04);
  const toOrigin = seg(t, 0.26, 0.4);
  const cook = seg(t, 0.4, 0.64);
  const back = seg(t, 0.64, 0.76);
  const store = fadeIn(t, 0.76, 0.05);
  const home = seg(t, 0.84, 0.96);

  const [ax, ay] = along([buddy[0] + 40, 300], [edge[0] - 40, 300], toEdge, 40);
  const [bx, by] = along([edge[0] + 40, 280], [origin[0] - 60, 280], toOrigin, 60);
  const [cx, cy] = along([origin[0] - 60, 270], [edge[0] + 40, 270], back, 60);
  const [hx, hy] = along([edge[0] - 40, 280], [buddy[0] + 46, 290], home, 40);

  return (
    <g>
      <Road x1={120} x2={240} y={372} />
      <Road x1={360} x2={560} y={372} />
      <Buddy x={buddy[0]} y={buddy[1]} s={0.72} look={1} mood={home >= 1 ? 'happy' : 'wait'} label="Browser" />
      <Shop x={edge[0]} y={edge[1]} s={0.66} color={PAL.ask} soft={PAL.askSoft} label={kid ? 'Copy shop near you' : 'CDN edge'} glow={store} />
      <Shop x={origin[0]} y={origin[1]} s={0.96} color={PAL.ask} soft={PAL.askSoft} sign={shorten(d.host, 16)} label={kid ? 'Main shop, far away' : 'Origin server'} />

      {toEdge > 0 && toEdge < 1 && <Envelope x={ax} y={ay} color={PAL.ask} s={0.7} seal />}
      <Bubble x={edge[0]} y={196} text={kid ? 'Do I have a copy?' : 'Cache lookup'} o={fadeIn(t, 0.13, 0.03) * (1 - seg(t, 0.22, 0.26))} size={17} />
      <g opacity={1 - seg(t, 0.74, 0.78)}>
        <Cross x={edge[0] + 50} y={250} o={miss} r={15} />
        <Pill x={edge[0]} y={196} text={kid ? 'Not yet' : 'Cache MISS'} o={fadeIn(t, 0.22, 0.03) * (1 - seg(t, 0.36, 0.4))} bg={PAL.bad} color={PAL.white} size={16} />
      </g>
      {toOrigin > 0 && toOrigin < 1 && <Envelope x={bx} y={by} color={PAL.ask} s={0.7} seal />}

      {/* the kitchen inside the main shop */}
      {(() => {
        const o = fadeIn(t, 0.38, 0.04) * (1 - seg(t, 0.66, 0.72));
        if (o <= 0) return null;
        return (
          <g opacity={o} transform="translate(640 112)">
            <rect x={-150} y={-62} width={300} height={124} rx={20} fill={PAL.white} stroke={PAL.ask} strokeWidth={2.5} />
            <Gear x={-92} y={-6} r={18} angle={t * 900} color={PAL.ask} />
            <Txt x={-92} y={40} size={13} fill={PAL.ink2}>
              {kid ? 'Helpers' : 'App server'}
            </Txt>
            <g transform="translate(-10 -6)">
              <ellipse cx={0} cy={-18} rx={22} ry={8} fill={PAL.askSoft} stroke={PAL.ask} strokeWidth={2.5} />
              <path d="M -22 -18 V 18 A 22 8 0 0 0 22 18 V -18" fill={PAL.askSoft} stroke={PAL.ask} strokeWidth={2.5} />
              <path d="M -22 0 A 22 8 0 0 0 22 0" fill="none" stroke={PAL.ask} strokeWidth={2} opacity={0.6 + 0.4 * Math.sin(t * 40)} />
            </g>
            <Txt x={-10} y={40} size={13} fill={PAL.ink2}>
              {kid ? 'Toy list' : 'Database'}
            </Txt>
            <PageSheet x={84} y={-8} s={0.75} lines={Math.round(1 + cook * 4)} o={fadeIn(t, 0.46, 0.04)} />
            <Txt x={84} y={40} size={13} fill={PAL.ink2}>
              HTML
            </Txt>
            <rect x={-130} y={52} width={260} height={4} rx={2} fill={PAL.line} />
            <rect x={-130} y={52} width={260 * cook} height={4} rx={2} fill={PAL.ask} />
          </g>
        );
      })()}

      {back > 0 && back < 1 && <PageSheet x={cx} y={cy} s={0.8} />}
      <g opacity={store * (1 - seg(t, 0.97, 1))}>
        <PageSheet x={edge[0] + 58} y={238} s={0.55} />
        <Pill x={edge[0]} y={180} text={kid ? 'Kept a copy for next time' : 'Stored at the edge, max-age=60'} o={store} bg={PAL.askSoft} color={PAL.ask} size={15} />
      </g>
      {home > 0 && <PageSheet x={hx} y={hy} s={0.8} o={home < 1 ? 1 : 0} />}
      <Pill x={buddy[0] + 40} y={226} text={kid ? 'Here it comes!' : 'First byte back: TTFB'} o={fadeIn(t, 0.92, 0.05)} bg={PAL.ink} color={PAL.white} size={15} />
    </g>
  );
}

/* ------------------------------------------------------------------ 8. The page arrives in pieces (response) */

export function ResponseScene({ t, mode, d }: SceneProps) {
  const kid = mode === 'kid';
  const cols = 3;
  const tile = 46;
  const slotOrigin: [number, number] = [214, 120];
  const pieces = Array.from({ length: 6 }, (_, i) => {
    const start = 0.08 + i * 0.075;
    const dur = i === 2 ? 0.38 : 0.2;
    return {
      i,
      start,
      end: start + dur,
      slot: [slotOrigin[0] + (i % cols) * tile, slotOrigin[1] + Math.floor(i / cols) * tile] as [number, number],
      lift: i === 2 ? 150 : 60 + (i % 2) * 20,
    };
  });
  const allIn = t >= Math.max(...pieces.map((p) => p.end));
  const merge = seg(t, 0.74, 0.82);
  const outOfOrder = t >= pieces[3].end && t < pieces[2].end;

  return (
    <g>
      <Road x1={180} x2={600} y={346} color={PAL.meet} o={0.5} />
      <Buddy x={110} y={300} look={-0.4} mood={outOfOrder ? 'wait' : allIn ? 'happy' : 'wow'} label="Browser" lock />
      <Shop x={690} y={350} color={PAL.ask} soft={PAL.askSoft} sign={shorten(d.host, 16)} label={kid ? 'The shop' : 'Server'} />

      {/* the empty slots */}
      <g opacity={1 - merge}>
        {pieces.map((p) => (
          <g key={p.i}>
            <rect x={p.slot[0]} y={p.slot[1]} width={tile - 6} height={tile - 6} rx={9} fill="none" stroke={PAL.line2} strokeWidth={2} strokeDasharray="4 5" />
            <Txt x={p.slot[0] + (tile - 6) / 2} y={p.slot[1] + (tile - 6) / 2} size={15} fill={PAL.ink3}>
              {p.i + 1}
            </Txt>
          </g>
        ))}
      </g>

      {pieces.map((p) => {
        const k = seg(t, p.start, p.end);
        if (k <= 0) return null;
        const from: [number, number] = [640, 230];
        const [x, y] = k < 1 ? along(from, p.slot, k, p.lift) : p.slot;
        const color = p.i === 0 ? PAL.ask : PAL.white;
        return (
          <g key={p.i} transform={`translate(${x} ${y})`} opacity={1 - merge}>
            <rect width={tile - 6} height={tile - 6} rx={9} fill={color} stroke={PAL.ask} strokeWidth={2.5} />
            <Txt x={(tile - 6) / 2} y={(tile - 6) / 2} size={16} weight={650} fill={p.i === 0 ? PAL.white : PAL.ask}>
              {p.i + 1}
            </Txt>
          </g>
        );
      })}

      {/* the first piece carries the status line */}
      <Pill x={302} y={84} text={kid ? '200 OK: here you go!' : 'HTTP/2 200  text/html'} o={fadeIn(t, pieces[0].end, 0.04)} bg={PAL.ask} color={PAL.white} size={16} mono={!kid} />
      <Bubble x={110} y={196} text={kid ? 'Wait for number 3!' : 'Out of order: hold 4'} o={outOfOrder ? 1 : 0} size={17} />

      {/* reassembled page */}
      {merge > 0 && (
        <g transform={`translate(${slotOrigin[0] - 4} ${slotOrigin[1] - 4})`} opacity={merge}>
          <rect width={tile * cols + 2} height={tile * 2 + 2} rx={14} fill={PAL.white} stroke={PAL.ask} strokeWidth={2.5} />
          <rect x={14} y={14} width={70} height={9} rx={4.5} fill={PAL.ask} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={14} y={34 + i * 14} width={[112, 96, 104, 72][i]} height={6} rx={3} fill={PAL.line2} />
          ))}
        </g>
      )}
      <Check x={slotOrigin[0] + tile * cols} y={slotOrigin[1] + tile * 2} o={fadeIn(t, 0.82, 0.05)} r={16} color={PAL.ask} />
      <Pill x={302} y={262} text={kid ? 'All the pieces, in order' : 'Reassembled: parsing can start'} o={fadeIn(t, 0.86, 0.05)} bg={PAL.ink} color={PAL.white} size={15} />
      {!kid && (
        <g opacity={fadeIn(t, 0.3, 0.05) * (1 - merge)}>
          <Txt x={480} y={420} size={14} fill={PAL.ink3} mono>
            packets of about 1.4 KB each
          </Txt>
        </g>
      )}
    </g>
  );
}
