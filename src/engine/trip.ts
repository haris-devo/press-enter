/**
 * A small, honest model of how long the trip takes. It is not a browser: it counts round trips
 * and bytes with round numbers, so the lessons are visible.
 *
 * - Every handshake costs one round trip, and a round trip costs the road plus your last mile.
 * - A copy shop nearby (CDN) shortens the road and answers quickly.
 * - HTTP/3 does the hello and the secret code in one round trip instead of two.
 * - A return visit remembers the address and keeps the styles and scripts.
 */

export type Distance = 'city' | 'country' | 'world';
export type Network = 'wifi' | '4g' | '3g';

export interface TripSetup {
  distance: Distance;
  network: Network;
  cdn: boolean;
  h3: boolean;
  visited: boolean;
}

export type PhaseId = 'dns' | 'connect' | 'tls' | 'wait' | 'download' | 'build';

export interface Phase {
  id: PhaseId;
  ms: number;
  /** Round trips this phase pays for. */
  trips: number;
  /** Why the phase costs nothing, when it is skipped. */
  skipped?: 'remembered' | 'merged';
}

export interface Trip {
  phases: Phase[];
  total: number;
  roundTrips: number;
  /** One round trip in milliseconds for this setup. */
  rtt: number;
  biggest: PhaseId;
}

export const DEFAULT_SETUP: TripSetup = { distance: 'country', network: '4g', cdn: false, h3: false, visited: false };

/** The road: one round trip to the shop, in milliseconds. */
export const ROAD_MS: Record<Distance, number> = { city: 20, country: 90, world: 240 };
/** A copy shop is always in a city near you. */
export const CDN_ROAD_MS = 12;
/** Your last mile: the extra time each round trip spends on your own connection. */
export const LAST_MILE_MS: Record<Network, number> = { wifi: 5, '4g': 45, '3g': 160 };
/** How fast bytes flow, in megabits per second. */
export const MBPS: Record<Network, number> = { wifi: 50, '4g': 9, '3g': 1.6 };

/** Your DNS helper is close by; when it does not know the name it asks root, TLD and the domain. */
export const RESOLVER_ROAD_MS = 10;
export const RESOLVER_WORK_MS = 60;

/** How long the shop takes to get the page ready. */
export const ORIGIN_WORK_MS = 150;
export const CDN_WORK_MS = 8;

/** Page plus styles and scripts on a first visit; only the page on a return visit. */
export const FIRST_VISIT_KB = 300;
export const RETURN_VISIT_KB = 30;

/** Reading, styling, measuring and painting on a typical phone. */
export const BUILD_MS = 150;

export const PHASE_ORDER: PhaseId[] = ['dns', 'connect', 'tls', 'wait', 'download', 'build'];

export function rttOf(s: Pick<TripSetup, 'distance' | 'network' | 'cdn'>): number {
  return LAST_MILE_MS[s.network] + (s.cdn ? CDN_ROAD_MS : ROAD_MS[s.distance]);
}

export function simulateTrip(s: TripSetup): Trip {
  const rtt = rttOf(s);
  const phases: Phase[] = [];

  phases.push(
    s.visited
      ? { id: 'dns', ms: 0, trips: 0, skipped: 'remembered' }
      : { id: 'dns', ms: LAST_MILE_MS[s.network] + RESOLVER_ROAD_MS + RESOLVER_WORK_MS, trips: 1 },
  );

  phases.push(s.h3 ? { id: 'connect', ms: 0, trips: 0, skipped: 'merged' } : { id: 'connect', ms: rtt, trips: 1 });
  phases.push({ id: 'tls', ms: rtt, trips: 1 });
  phases.push({ id: 'wait', ms: rtt + (s.cdn ? CDN_WORK_MS : ORIGIN_WORK_MS), trips: 1 });

  const kb = s.visited ? RETURN_VISIT_KB : FIRST_VISIT_KB;
  phases.push({ id: 'download', ms: Math.round((kb * 8) / MBPS[s.network]), trips: 0 });
  phases.push({ id: 'build', ms: BUILD_MS, trips: 0 });

  const total = phases.reduce((sum, p) => sum + p.ms, 0);
  const roundTrips = phases.reduce((sum, p) => sum + p.trips, 0);
  const biggest = phases.reduce((a, b) => (b.ms > a.ms ? b : a)).id;
  return { phases, total, roundTrips, rtt, biggest };
}

/** A blink takes about 300 ms. Kids know blinks better than milliseconds. */
export const BLINK_MS = 300;

export function blinks(ms: number): number {
  return Math.max(1, Math.round(ms / BLINK_MS));
}

export function feeling(ms: number): string {
  if (ms <= BLINK_MS) return 'Faster than a blink';
  if (ms < 1000) return `About ${blinks(ms)} blinks`;
  if (ms < 2500) return 'Quick, but you notice the wait';
  if (ms < 5000) return 'Long enough to start tapping your foot';
  return 'Long enough that many people give up and leave';
}

/** What to try next, for the phase that costs the most. */
export function advice(t: Trip, s: TripSetup): string {
  switch (t.biggest) {
    case 'dns':
      return 'Finding the address is the slow part. A return visit remembers it, and sites can ask for it early with dns-prefetch.';
    case 'connect':
    case 'tls':
      return s.h3
        ? 'Saying hello still costs a trip down a long road. A copy shop nearby makes every trip shorter.'
        : 'Each hello is a trip down the road and back. HTTP/3 merges two of them, and a copy shop nearby makes every trip shorter.';
    case 'wait':
      return s.cdn
        ? 'Waiting for the answer is the slow part. On a slow connection, every round trip costs a lot.'
        : 'The shop is far away and slow to cook the page. A copy shop nearby (CDN) can answer from down the road.';
    case 'download':
      return s.visited
        ? 'Even the page alone is slow on this connection. Smaller pages and compression help most here.'
        : 'The page is heavy for this connection. Send fewer bytes: compress, split the code, and let return visits use saved copies.';
    case 'build':
      return 'The trip is short now. The phone spends most of the time building and drawing, so less JavaScript helps most.';
  }
}
