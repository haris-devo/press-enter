import { PAL, Txt, Pill, seg, lerp, easeOut, pop, fadeIn, textWidth, type SceneProps } from './kit';

/* ------------------------------------------------------------------ 15. Ready to play (event loop) */

interface Job {
  kid: string;
  pro: string;
  spawn: number;
  start: number;
  end: number;
  long?: boolean;
  tap?: boolean;
}

const JOBS: Job[] = [
  { kid: 'Tap!', pro: 'click', spawn: 0.08, start: 0.15, end: 0.22, tap: true },
  { kid: 'Big job', pro: 'long task, 300 ms', spawn: 0.26, start: 0.32, end: 0.66, long: true },
  { kid: 'Tap!', pro: 'click', spawn: 0.42, start: 0.66, end: 0.73, tap: true },
  { kid: 'Timer', pro: 'setTimeout', spawn: 0.74, start: 0.79, end: 0.84 },
];

const RING: [number, number] = [606, 196];
const QUEUE_Y = 382;
const HEAD_X = 506;

export function InteractiveScene({ t, mode }: SceneProps) {
  const kid = mode === 'kid';
  const current = JOBS.find((j) => t >= j.start && t < j.end);
  const added = JOBS.filter((j) => j.tap && t >= j.end).length;
  const waitingTap = JOBS[2];
  const stuck = t >= waitingTap.spawn + 0.04 && t < waitingTap.start;
  const spin = t * 360 * 5;
  const busy = current ? seg(t, current.start, current.end) : 0;

  // Two taps on the button.
  const taps = [0.06, 0.4].map((at) => ({ at, k: seg(t, at, at + 0.06) }));
  const press = taps.some((p) => p.k > 0 && p.k < 1);

  const chip = (j: Job, i: number) => {
    if (t < j.spawn) return null;
    const label = kid ? j.kid : j.pro;
    const w = textWidth(label, 15) + 28;
    if (t >= j.end) {
      const k = seg(t, j.end, j.end + 0.05);
      if (k >= 1) return null;
      return (
        <g key={i} transform={`translate(${RING[0]} ${RING[1] - 40 * k})`} opacity={1 - k}>
          <rect x={-w / 2} y={-16} width={w} height={32} rx={16} fill={PAL.playSoft} stroke={PAL.play} strokeWidth={2} />
          <Txt x={0} y={1} size={15} fill={PAL.play} weight={600}>
            {label}
          </Txt>
        </g>
      );
    }
    if (t >= j.start) {
      const s = pop(seg(t, j.start, j.start + 0.04));
      return (
        <g key={i} transform={`translate(${RING[0]} ${RING[1]}) scale(${0.7 + 0.3 * s})`}>
          <rect x={-w / 2} y={-18} width={w} height={36} rx={18} fill={j.long ? PAL.bad : PAL.play} />
          <Txt x={0} y={1} size={15} fill={PAL.white} weight={620}>
            {label}
          </Txt>
        </g>
      );
    }
    const ahead = JOBS.filter((o) => o.spawn < j.spawn && t < o.start).length;
    const target = HEAD_X + ahead * 120;
    const x = lerp(790, target, easeOut(seg(t, j.spawn, j.spawn + 0.06)));
    return (
      <g key={i} transform={`translate(${x} ${QUEUE_Y})`}>
        <rect x={-w / 2} y={-16} width={w} height={32} rx={16} fill={PAL.white} stroke={j.long ? PAL.bad : PAL.play} strokeWidth={2} />
        <Txt x={0} y={1} size={15} fill={PAL.ink} weight={600}>
          {label}
        </Txt>
      </g>
    );
  };

  return (
    <g>
      {/* the finished page */}
      <g>
        <rect x={40} y={70} width={330} height={340} rx={18} fill={PAL.white} stroke={PAL.ink} strokeWidth={2.5} />
        <path d="M 40 96 L 370 96" stroke={PAL.ink} strokeWidth={2.5} />
        <circle cx={56} cy={83} r={3.6} fill={PAL.draw} />
        <circle cx={68} cy={83} r={3.6} fill={PAL.build} />
        <circle cx={80} cy={83} r={3.6} fill={PAL.play} />
        <rect x={60} y={112} width={290} height={28} rx={9} fill={PAL.ink} />
        <Txt x={76} y={127} size={13} anchor="start" fill={PAL.white} weight={620}>
          Toy shop
        </Txt>
        <rect x={60} y={152} width={130} height={120} rx={12} fill={PAL.findSoft} />
        <circle cx={125} cy={204} r={26} fill={PAL.white} stroke={PAL.ink} strokeWidth={3} />
        <circle cx={116} cy={200} r={3.5} fill={PAL.ink} />
        <circle cx={134} cy={200} r={3.5} fill={PAL.ink} />
        <Txt x={206} y={166} size={19} anchor="start" fill={PAL.draw} weight={650}>
          Toy robot
        </Txt>
        <rect x={206} y={186} width={130} height={8} rx={4} fill={PAL.line2} />
        <rect x={206} y={202} width={110} height={8} rx={4} fill={PAL.line2} />
        <rect x={206} y={218} width={80} height={8} rx={4} fill={PAL.line2} />
        <g transform={`translate(205 336) scale(${press ? 0.95 : 1})`}>
          <rect x={-90} y={-24} width={180} height={48} rx={24} fill={PAL.play} />
          <Txt x={0} y={1} size={17} fill={PAL.white} weight={640}>
            {added === 0 ? 'Add to cart' : `In cart: ${added}`}
          </Txt>
        </g>
        {stuck && <Pill x={205} y={286} text={kid ? 'Hmm, nothing yet…' : 'No response: input delay'} bg={PAL.bad} color={PAL.white} size={14} />}
      </g>

      {/* a finger tapping */}
      {taps.map(({ at, k }) => {
        if (k <= 0 || t > at + 0.14) return null;
        const o = 1 - seg(t, at + 0.1, at + 0.14);
        return (
          <g key={at} transform={`translate(${250 - 10 * k} ${370 - 16 * Math.sin(k * Math.PI)})`} opacity={o}>
            <circle r={8 + 22 * k} fill="none" stroke={PAL.play} strokeWidth={3} opacity={1 - k} />
            <path d="M 0 0 C -4 -10 -2 -26 6 -26 C 14 -26 14 -12 14 -4 L 22 -2 C 30 0 32 8 30 16 L 26 30 L 2 30 L -8 12 C -12 6 -6 0 0 4 Z" fill={PAL.white} stroke={PAL.ink} strokeWidth={2.5} strokeLinejoin="round" />
          </g>
        );
      })}

      {/* the event loop */}
      <g transform={`translate(${RING[0]} ${RING[1]})`}>
        <circle r={96} fill={PAL.white} stroke={PAL.line} strokeWidth={14} />
        {current && (
          <circle
            r={96}
            fill="none"
            stroke={current.long ? PAL.bad : PAL.play}
            strokeWidth={14}
            strokeDasharray={`${busy * 603} 603`}
            transform="rotate(-90)"
            strokeLinecap="round"
          />
        )}
        <g transform={`rotate(${spin})`}>
          <circle cx={0} cy={-96} r={9} fill={current?.long ? PAL.bad : PAL.ink} />
        </g>
        {!current && (
          <Txt x={0} y={0} size={16} fill={PAL.ink3} weight={560}>
            {kid ? 'Ready' : 'Idle'}
          </Txt>
        )}
      </g>
      <Txt x={RING[0]} y={RING[1] - 124} size={15} fill={PAL.ink2} weight={600}>
        {kid ? 'The helper does one job at a time' : 'Main thread: one task at a time'}
      </Txt>

      {/* the line of jobs waiting */}
      <path d={`M ${HEAD_X - 60} ${QUEUE_Y + 26} L 790 ${QUEUE_Y + 26}`} stroke={PAL.line2} strokeWidth={3} strokeLinecap="round" />
      <Txt x={HEAD_X - 60} y={QUEUE_Y + 48} size={14} anchor="start" fill={PAL.ink3} weight={560}>
        {kid ? 'Waiting in line' : 'Task queue'}
      </Txt>
      <path d={`M ${HEAD_X - 40} ${QUEUE_Y - 10} Q ${HEAD_X - 60} ${RING[1] + 120} ${RING[0] - 70} ${RING[1] + 76}`} fill="none" stroke={PAL.line2} strokeWidth={2.5} strokeDasharray="4 7" />
      {JOBS.map(chip)}

      <Pill x={606} y={36} text={kid ? 'A big job makes everyone wait' : 'Long task (> 50 ms) blocks input: bad INP'} o={fadeIn(t, 0.36, 0.04) * (1 - seg(t, 0.66, 0.7))} bg={PAL.bad} color={PAL.white} size={15} />
      <Pill x={606} y={36} text={kid ? 'Ready to play!' : 'Keep every task under 50 ms'} o={fadeIn(t, 0.88, 0.05)} bg={PAL.ink} color={PAL.white} size={15} />
    </g>
  );
}
