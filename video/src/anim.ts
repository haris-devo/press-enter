/** Motion helpers. Everything is a pure function of time: no state, no timers. */

export const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const ease = {
  linear: (x: number) => x,
  inOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  inCubic: (x: number) => x * x * x,
  outQuint: (x: number) => 1 - Math.pow(1 - x, 5),
  inOutQuint: (x: number) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2),
  inOutSine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
  /** A critically damped spring, settling without overshoot: calm entrances. */
  spring: (x: number) => 1 - (1 + 7 * x) * Math.exp(-7 * x),
  /** A touch of overshoot, for things that pop. */
  pop: (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
  },
};
export type EaseName = keyof typeof ease;

/** Map t from [a, b] to [from, to] with an easing. */
export function map(t: number, a: number, b: number, from = 0, to = 1, e: EaseName = 'linear'): number {
  const k = clamp((t - a) / (b - a || 1e-6));
  return from + (to - from) * ease[e](k);
}

/** Keyframes [time, value, ease?]. Holds before the first and after the last. */
export function kf(t: number, keys: [number, number, EaseName?][], def: EaseName = 'inOutCubic'): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * ease[e ?? def]((t - t0) / (t1 - t0 || 1e-6));
  }
  return keys[keys.length - 1][1];
}

/**
 * Time warp: anchors [sceneT, time] pin moments of a scene to moments of the voice.
 * Between anchors the scene runs linearly; before the first it holds, after the last it runs to 1.
 */
export function warp(time: number, anchors: [number, number][], end: number): number {
  const a = [...anchors].sort((x, y) => x[1] - y[1]);
  if (time <= a[0][1]) return a[0][0];
  for (let i = 1; i < a.length; i++) {
    if (time <= a[i][1]) return lerp(a[i - 1][0], a[i][0], (time - a[i - 1][1]) / (a[i][1] - a[i - 1][1] || 1e-6));
  }
  const [s, t] = a[a.length - 1];
  return s >= 1 ? 1 : lerp(s, 1, clamp((time - t) / Math.max(0.3, end - t)));
}

/** Small seeded noise, for idle drift that is identical on every render. */
export const drift = (t: number, seed: number, amp: number) =>
  amp * (Math.sin(t * 0.61 + seed) * 0.6 + Math.sin(t * 1.13 + seed * 2.3) * 0.4);
