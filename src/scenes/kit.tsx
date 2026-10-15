import type { ReactNode } from 'react';
import type { Destination } from '../engine/url';
import type { Mode } from '../engine/journey';

/**
 * Drawing kit for the journey scenes. Every scene is a pure function of `t` (0 to 1), so the
 * player can pause, scrub and prerender any frame. The canvas is 800 × 480.
 */

export const W = 800;
export const H = 480;

export interface SceneProps {
  t: number;
  mode: Mode;
  d: Destination;
}

/** SVG presentation attributes do not take CSS variables everywhere, so the scenes use hex. */
export const PAL = {
  ink: '#1d1b36',
  ink2: '#4d4b68',
  ink3: '#85839c',
  line: '#e6e4f0',
  line2: '#d3d0e3',
  paper: '#f6f5fb',
  paper2: '#edebf6',
  white: '#ffffff',
  find: '#2e7cf6',
  findSoft: '#e8f0ff',
  meet: '#8a5cf6',
  meetSoft: '#f1ebff',
  ask: '#0ea5a0',
  askSoft: '#def5f3',
  build: '#f2a01d',
  buildSoft: '#fff2d9',
  draw: '#f0517a',
  drawSoft: '#ffe8ee',
  play: '#22b26c',
  playSoft: '#e1f6ea',
  good: '#17a463',
  bad: '#e0424f',
  cheek: '#ffb3c4',
};

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** Local progress of `t` inside the window [a, b]. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
/** Overshoots a little, for things popping into place. */
export const pop = (x: number) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c1 = 1.7;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** Fade in over [a, a + d]. */
export const fadeIn = (t: number, a: number, d = 0.06) => seg(t, a, a + d);

/** A point on a gentle arc from `from` to `to`. */
export function along(from: [number, number], to: [number, number], p: number, lift = 40): [number, number] {
  const e = ease(clamp01(p));
  return [lerp(from[0], to[0], e), lerp(from[1], to[1], e) - lift * 4 * e * (1 - e)];
}

/** Rough text width for Google Sans Flex, good enough to size pills. */
export const textWidth = (text: string, size: number) => text.length * size * 0.54;

export function Txt({
  x,
  y,
  children,
  size = 20,
  weight = 560,
  fill = PAL.ink,
  anchor = 'middle',
  opacity = 1,
  mono = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  weight?: number;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
  mono?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={weight}
      fill={fill}
      textAnchor={anchor}
      dominantBaseline="central"
      opacity={opacity}
      className={mono ? 'k-mono' : 'k-t'}
    >
      {children}
    </text>
  );
}

/** A rounded label. `o` is its opacity; it also grows in a little as it appears. */
export function Pill({
  x,
  y,
  text,
  color = PAL.ink,
  bg = PAL.white,
  size = 19,
  o = 1,
  mono = false,
  stroke,
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
  bg?: string;
  size?: number;
  o?: number;
  mono?: boolean;
  stroke?: string;
}) {
  if (o <= 0) return null;
  const w = textWidth(text, size) * (mono ? 1.12 : 1) + size * 1.4;
  const h = size * 1.9;
  const s = 0.86 + 0.14 * easeOut(o);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} stroke={stroke ?? 'none'} strokeWidth={2} />
      <Txt x={0} y={1} size={size} fill={color} mono={mono}>
        {text}
      </Txt>
    </g>
  );
}

/** A speech bubble with a small tail pointing down (or up). */
export function Bubble({
  x,
  y,
  text,
  o = 1,
  color = PAL.ink,
  bg = PAL.white,
  tail = 'down',
  size = 19,
}: {
  x: number;
  y: number;
  text: string;
  o?: number;
  color?: string;
  bg?: string;
  tail?: 'down' | 'up' | 'none';
  size?: number;
}) {
  if (o <= 0) return null;
  const w = textWidth(text, size) + size * 1.6;
  const h = size * 2.1;
  const s = 0.8 + 0.2 * pop(o);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(o * 1.5)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={bg} stroke={PAL.line2} strokeWidth={1.5} />
      {tail === 'down' && <path d={`M -9 ${h / 2 - 1} L 0 ${h / 2 + 11} L 9 ${h / 2 - 1} Z`} fill={bg} stroke={PAL.line2} strokeWidth={1.5} strokeLinejoin="round" />}
      {tail === 'up' && <path d={`M -9 ${-h / 2 + 1} L 0 ${-h / 2 - 11} L 9 ${-h / 2 + 1} Z`} fill={bg} stroke={PAL.line2} strokeWidth={1.5} strokeLinejoin="round" />}
      {tail !== 'none' && <rect x={-11} y={tail === 'down' ? h / 2 - 3 : -h / 2} width={22} height={4} fill={bg} />}
      <Txt x={0} y={1} size={size} fill={color}>
        {text}
      </Txt>
    </g>
  );
}

/** The browser, drawn as a friendly little window. `look` moves the eyes left (-1) or right (1). */
export function Buddy({
  x,
  y,
  s = 1,
  look = 0,
  mood = 'happy',
  label,
  lock = false,
}: {
  x: number;
  y: number;
  s?: number;
  look?: number;
  mood?: 'happy' | 'wow' | 'wait';
  label?: string;
  lock?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={58} rx={56} ry={7} fill={PAL.ink} opacity={0.07} />
      <rect x={-60} y={-46} width={120} height={96} rx={20} fill={PAL.white} stroke={PAL.ink} strokeWidth={2.5} />
      <path d="M -60 -26 L 60 -26" stroke={PAL.ink} strokeWidth={2.5} />
      <circle cx={-44} cy={-36} r={3.6} fill={PAL.draw} />
      <circle cx={-32} cy={-36} r={3.6} fill={PAL.build} />
      <circle cx={-20} cy={-36} r={3.6} fill={PAL.play} />
      {lock && (
        <g transform="translate(40 -36)">
          <rect x={-6} y={-3} width={12} height={9} rx={2} fill={PAL.good} />
          <path d="M -3.6 -3 V -5.5 A 3.6 3.6 0 0 1 3.6 -5.5 V -3" fill="none" stroke={PAL.good} strokeWidth={2} />
        </g>
      )}
      <circle cx={-18 + look * 4} cy={4} r={mood === 'wow' ? 6.5 : 5.5} fill={PAL.ink} />
      <circle cx={18 + look * 4} cy={4} r={mood === 'wow' ? 6.5 : 5.5} fill={PAL.ink} />
      <circle cx={-16 + look * 4} cy={2} r={1.6} fill={PAL.white} />
      <circle cx={20 + look * 4} cy={2} r={1.6} fill={PAL.white} />
      <circle cx={-32} cy={20} r={6} fill={PAL.cheek} opacity={0.6} />
      <circle cx={32} cy={20} r={6} fill={PAL.cheek} opacity={0.6} />
      {mood === 'happy' && <path d="M -11 20 Q 0 31 11 20" fill="none" stroke={PAL.ink} strokeWidth={2.5} strokeLinecap="round" />}
      {mood === 'wow' && <ellipse cx={0} cy={24} rx={6} ry={7} fill={PAL.ink} />}
      {mood === 'wait' && <path d="M -9 24 L 9 24" stroke={PAL.ink} strokeWidth={2.5} strokeLinecap="round" />}
      {label && (
        <Txt x={0} y={84} size={18 / Math.max(s, 0.8)} fill={PAL.ink2} weight={540}>
          {label}
        </Txt>
      )}
    </g>
  );
}

/** A shop (the server). `x, y` is the middle of its floor. */
export function Shop({
  x,
  y,
  color,
  soft,
  label,
  s = 1,
  sign,
  glow = 0,
}: {
  x: number;
  y: number;
  color: string;
  soft: string;
  label?: string;
  s?: number;
  sign?: string;
  glow?: number;
}) {
  const stripes = [];
  for (let i = 0; i < 6; i++) {
    stripes.push(<rect key={i} x={-78 + i * 26} y={-132} width={13} height={26} fill={color} />);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={84} ry={8} fill={PAL.ink} opacity={0.07} />
      {glow > 0 && <circle cx={0} cy={-60} r={96} fill={color} opacity={0.12 * glow} />}
      <rect x={-68} y={-110} width={136} height={110} rx={10} fill={PAL.white} stroke={PAL.ink} strokeWidth={2.5} />
      <rect x={-78} y={-132} width={156} height={26} rx={8} fill={soft} />
      {stripes}
      <path d="M -78 -106 Q -71.5 -96 -65 -106 Q -58.5 -96 -52 -106 Q -45.5 -96 -39 -106 Q -32.5 -96 -26 -106 Q -19.5 -96 -13 -106 Q -6.5 -96 0 -106 Q 6.5 -96 13 -106 Q 19.5 -96 26 -106 Q 32.5 -96 39 -106 Q 45.5 -96 52 -106 Q 58.5 -96 65 -106 Q 71.5 -96 78 -106" fill={soft} stroke={color} strokeWidth={2} />
      <rect x={-78} y={-132} width={156} height={26} rx={8} fill="none" stroke={PAL.ink} strokeWidth={2.5} />
      <rect x={-18} y={-60} width={36} height={60} rx={8} fill={soft} stroke={PAL.ink} strokeWidth={2.5} />
      <circle cx={10} cy={-30} r={2.5} fill={PAL.ink} />
      <rect x={-56} y={-82} width={28} height={26} rx={6} fill={soft} stroke={PAL.ink} strokeWidth={2} />
      <rect x={28} y={-82} width={28} height={26} rx={6} fill={soft} stroke={PAL.ink} strokeWidth={2} />
      {sign && (
        <g transform="translate(0 -150)">
          <rect x={-(textWidth(sign, 15) / 2 + 12)} y={-14} width={textWidth(sign, 15) + 24} height={28} rx={14} fill={PAL.ink} />
          <Txt x={0} y={1} size={15} fill={PAL.white} weight={600}>
            {sign}
          </Txt>
        </g>
      )}
      {label && (
        <Txt x={0} y={30 / Math.max(s, 0.7)} size={18 / Math.max(s, 0.7)} fill={PAL.ink2} weight={540}>
          {label}
        </Txt>
      )}
    </g>
  );
}

/** An envelope. `seal` draws a small lock on it. */
export function Envelope({
  x,
  y,
  color,
  s = 1,
  o = 1,
  seal = false,
}: {
  x: number;
  y: number;
  color: string;
  s?: number;
  o?: number;
  seal?: boolean;
}) {
  if (o <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-30} y={-21} width={60} height={42} rx={8} fill={PAL.white} stroke={color} strokeWidth={2.5} />
      <path d="M -26 -16 L 0 4 L 26 -16" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {seal && (
        <g transform="translate(0 8)">
          <rect x={-7} y={-4} width={14} height={11} rx={2.5} fill={PAL.meet} />
          <path d="M -4 -4 V -7 A 4 4 0 0 1 4 -7 V -4" fill="none" stroke={PAL.meet} strokeWidth={2.2} />
        </g>
      )}
    </g>
  );
}

/** A dashed road between two places. */
export function Road({ x1, x2, y, color = PAL.line2, o = 1 }: { x1: number; x2: number; y: number; color?: string; o?: number }) {
  return <path d={`M ${x1} ${y} L ${x2} ${y}`} stroke={color} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" opacity={o} />;
}

export function Check({ x, y, o = 1, color = PAL.good, r = 16 }: { x: number; y: number; o?: number; color?: string; r?: number }) {
  if (o <= 0) return null;
  const s = pop(o);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r} fill={color} />
      <path d={`M ${-r * 0.42} 0 L ${-r * 0.1} ${r * 0.32} L ${r * 0.45} ${-r * 0.3}`} fill="none" stroke={PAL.white} strokeWidth={r * 0.2} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function Cross({ x, y, o = 1, r = 16 }: { x: number; y: number; o?: number; r?: number }) {
  if (o <= 0) return null;
  const s = pop(o);
  const k = r * 0.32;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r} fill={PAL.bad} />
      <path d={`M ${-k} ${-k} L ${k} ${k} M ${k} ${-k} L ${-k} ${k}`} stroke={PAL.white} strokeWidth={r * 0.2} strokeLinecap="round" />
    </g>
  );
}

export function Padlock({ x, y, closed, s = 1, color = PAL.meet }: { x: number; y: number; closed: number; s?: number; color?: string }) {
  // closed: 0 = shackle up and open, 1 = shut
  const lift = (1 - closed) * 12;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -14 ${-8 - lift} V ${-20 - lift} A 14 14 0 0 1 14 ${-20 - lift} V ${-8 - (1 - closed) * 0}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
      <rect x={-24} y={-10} width={48} height={40} rx={10} fill={color} />
      <circle cx={0} cy={6} r={5} fill={PAL.white} />
      <rect x={-2} y={8} width={4} height={10} rx={2} fill={PAL.white} />
    </g>
  );
}

/** Small round trip counter shown at the top of the networking scenes. */
export function TripCounter({ x, y, trips, mode, color }: { x: number; y: number; trips: number; mode: Mode; color: string }) {
  const text = mode === 'kid' ? (trips === 1 ? '1 trip there and back' : `${trips} trips there and back`) : trips === 1 ? '1 round trip (RTT)' : `${trips} round trips`;
  return <Pill x={x} y={y} text={text} color={color} bg={PAL.white} size={17} o={trips > 0 ? 1 : 0.0001} />;
}
