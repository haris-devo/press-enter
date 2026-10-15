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
  Padlock,
  TripCounter,
  seg,
  lerp,
  easeOut,
  fadeIn,
  along,
  type SceneProps,
} from './kit';

const LEFT: [number, number] = [210, 236];
const RIGHT: [number, number] = [586, 236];

/* ------------------------------------------------------------------ 4. Knock on the door (TCP) */

export function TcpScene({ t, mode, d }: SceneProps) {
  const kid = mode === 'kid';
  const msgs = [
    { a: 0.06, b: 0.3, dir: 1, kid: 'Can we talk?', pro: 'SYN' },
    { a: 0.36, b: 0.6, dir: -1, kid: 'Yes! Can you hear me?', pro: 'SYN-ACK' },
    { a: 0.66, b: 0.88, dir: 1, kid: 'Yes, I can!', pro: 'ACK' },
  ];
  const linked = fadeIn(t, 0.9, 0.06);
  const trips = t >= 0.6 ? 1 : 0;

  return (
    <g>
      <TripCounter x={400} y={56} trips={trips} mode={mode} color={PAL.meet} />
      <Road x1={200} x2={600} y={336} />
      {linked > 0 && <path d={`M 200 336 L ${lerp(200, 600, easeOut(linked))} 336`} stroke={PAL.meet} strokeWidth={5} strokeLinecap="round" />}

      <Buddy x={120} y={290} look={1} mood={t > 0.88 ? 'happy' : 'wow'} label="Browser" />
      <Shop x={680} y={346} color={PAL.meet} soft={PAL.meetSoft} sign={shorten(d.host, 16)} label={kid ? 'The shop' : `Server ${d.ip}`} />

      {msgs.map((m, i) => {
        const p = seg(t, m.a, m.b);
        const from = m.dir > 0 ? LEFT : RIGHT;
        const to = m.dir > 0 ? RIGHT : LEFT;
        const [x, y] = along(from, to, p, 60);
        const speakerX = m.dir > 0 ? 120 : 680;
        const bubbleO = fadeIn(t, m.a - 0.04, 0.04) * (1 - seg(t, m.b + 0.04, m.b + 0.08));
        return (
          <g key={i}>
            <Bubble x={speakerX} y={m.dir > 0 ? 196 : 152} text={kid ? m.kid : m.pro} o={bubbleO} size={kid ? 18 : 20} />
            {p > 0 && p < 1 && (
              <g>
                <Envelope x={x} y={y} color={PAL.meet} s={0.85} />
                {!kid && <Pill x={x} y={y + 42} text={m.pro} color={PAL.meet} bg={PAL.white} size={15} stroke={PAL.meet} />}
              </g>
            )}
          </g>
        );
      })}

      <Check x={400} y={336} o={linked} r={18} />
      <Pill x={400} y={392} text={kid ? 'Now they can talk!' : 'Connection open: one round trip spent'} o={fadeIn(t, 0.93, 0.05)} bg={PAL.ink} color={PAL.white} size={16} />
    </g>
  );
}

/* ------------------------------------------------------------------ 5. Agree on a secret code (TLS) */

function IdCard({ x, y, s = 1, o = 1, host, kid, stamp }: { x: number; y: number; s?: number; o?: number; host: string; kid: boolean; stamp: number }) {
  if (o <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-84} y={-52} width={168} height={104} rx={14} fill={PAL.white} stroke={PAL.meet} strokeWidth={2.5} />
      <rect x={-84} y={-52} width={168} height={24} rx={12} fill={PAL.meetSoft} />
      <Txt x={0} y={-40} size={12} weight={650} fill={PAL.meet}>
        {kid ? 'ID card' : 'Certificate'}
      </Txt>
      <circle cx={-52} cy={6} r={16} fill={PAL.meetSoft} stroke={PAL.meet} strokeWidth={2} />
      <path d="M -60 18 Q -52 8 -44 18" fill={PAL.meet} />
      <circle cx={-52} cy={1} r={6} fill={PAL.meet} />
      <Txt x={-26} y={-6} size={13} anchor="start" weight={620}>
        {host}
      </Txt>
      <rect x={-26} y={8} width={70} height={6} rx={3} fill={PAL.line} />
      <rect x={-26} y={20} width={50} height={6} rx={3} fill={PAL.line} />
      {stamp > 0 && (
        <g transform={`translate(56 24) rotate(-14) scale(${0.6 + 0.4 * easeOut(stamp)})`} opacity={stamp}>
          <circle r={22} fill="none" stroke={PAL.good} strokeWidth={3} />
          <Txt x={0} y={1} size={11} weight={700} fill={PAL.good}>
            {kid ? 'Trusted' : 'CA ok'}
          </Txt>
        </g>
      )}
    </g>
  );
}

export function TlsScene({ t, mode, d }: SceneProps) {
  const kid = mode === 'kid';
  const host = shorten(d.host, 14);
  const hello = seg(t, 0.05, 0.25);
  const reply = seg(t, 0.3, 0.5);
  const check = seg(t, 0.52, 0.66);
  const finish = seg(t, 0.68, 0.84);
  const lock = seg(t, 0.86, 0.94);
  const trips = t >= 0.5 ? 1 : 0;

  const cardPos = reply < 1 ? along(RIGHT, [250, 132], reply, 70) : ([250, 132] as [number, number]);
  const [hx, hy] = along(LEFT, RIGHT, hello, 60);
  const [fx, fy] = along(LEFT, RIGHT, finish, 60);
  const [rx, ry] = along(RIGHT, LEFT, reply, 30);

  return (
    <g>
      <TripCounter x={400} y={56} trips={trips} mode={mode} color={PAL.meet} />
      <Road x1={200} x2={600} y={336} color={lock > 0 ? PAL.meet : PAL.line2} />

      <Buddy x={120} y={290} look={check > 0 && check < 1 ? 1 : 1} mood={lock > 0 ? 'happy' : 'wow'} label="Browser" lock={lock >= 1} />
      <Shop x={680} y={346} color={PAL.meet} soft={PAL.meetSoft} sign={shorten(d.host, 16)} label={kid ? 'The shop' : 'Server'} />

      <Bubble x={152} y={196} text={kid ? "Hi! Let's make a secret code" : 'ClientHello + key share'} o={fadeIn(t, 0.02, 0.04) * (1 - seg(t, 0.27, 0.31))} size={kid ? 17 : 18} />
      <Bubble x={680} y={152} text={kid ? "Here's my ID card!" : 'ServerHello, Certificate, Finished'} o={fadeIn(t, 0.28, 0.04) * (1 - seg(t, 0.5, 0.54))} size={kid ? 17 : 16} />
      <Bubble x={150} y={196} text={kid ? 'Great, the code is ready!' : 'Finished'} o={fadeIn(t, 0.71, 0.04) * (1 - seg(t, 0.86, 0.9))} size={kid ? 17 : 18} />

      {hello > 0 && hello < 1 && (
        <g>
          <Envelope x={hx} y={hy} color={PAL.meet} s={0.85} />
          <g transform={`translate(${hx + 30} ${hy - 22})`}>
            <circle r={11} fill={PAL.build} />
            <rect x={6} y={-3} width={14} height={6} rx={3} fill={PAL.build} />
          </g>
        </g>
      )}
      {reply > 0 && reply < 1 && <Envelope x={rx} y={ry + 40} color={PAL.meet} s={0.75} />}
      <IdCard x={cardPos[0]} y={cardPos[1]} s={reply < 1 ? 0.7 + 0.3 * reply : 1} o={reply > 0 ? Math.min(1, reply * 3) * (1 - seg(t, 0.84, 0.9)) : 0} host={host} kid={kid} stamp={seg(t, 0.6, 0.66)} />

      {/* checking the ID with a magnifying glass */}
      {check > 0 && check < 1 && (
        <g transform={`translate(${lerp(200, 300, Math.sin(check * Math.PI))} ${150 + Math.sin(check * Math.PI * 2) * 10})`}>
          <circle r={22} fill="rgba(138,92,246,0.08)" stroke={PAL.meet} strokeWidth={4.5} />
          <path d="M 16 16 L 32 32" stroke={PAL.meet} strokeWidth={7} strokeLinecap="round" />
        </g>
      )}
      <Pill x={250} y={214} text={kid ? 'Signed by someone I trust' : 'Chain ends at a trusted root CA'} o={fadeIn(t, 0.6, 0.04) * (1 - seg(t, 0.67, 0.71))} bg={PAL.good} color={PAL.white} size={15} />

      {finish > 0 && finish < 1 && <Envelope x={fx} y={fy} color={PAL.meet} s={0.85} seal />}

      {lock > 0 && (
        <g opacity={lock}>
          <Padlock x={400} y={150} closed={easeOut(lock)} s={1.4} />
        </g>
      )}
      <Pill x={400} y={392} text={kid ? 'Now nobody can peek at their notes' : 'Encrypted with session keys: padlock on'} o={fadeIn(t, 0.92, 0.05)} bg={PAL.ink} color={PAL.white} size={16} />
      <Check x={400} y={336} o={fadeIn(t, 0.9, 0.05)} r={18} color={PAL.meet} />
    </g>
  );
}
