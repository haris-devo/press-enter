import { describe, expect, it } from 'vitest';
import {
  simulateTrip,
  rttOf,
  feeling,
  advice,
  blinks,
  DEFAULT_SETUP,
  PHASE_ORDER,
  type Distance,
  type Network,
  type TripSetup,
} from './trip';

const DISTANCES: Distance[] = ['city', 'country', 'world'];
const NETWORKS: Network[] = ['wifi', '4g', '3g'];
const BOOLS = [false, true];

function* allSetups(): Generator<TripSetup> {
  for (const distance of DISTANCES)
    for (const network of NETWORKS)
      for (const cdn of BOOLS)
        for (const h3 of BOOLS) for (const visited of BOOLS) yield { distance, network, cdn, h3, visited };
}

describe('simulateTrip', () => {
  it('returns every phase in order and sums them', () => {
    const t = simulateTrip(DEFAULT_SETUP);
    expect(t.phases.map((p) => p.id)).toEqual(PHASE_ORDER);
    expect(t.total).toBe(t.phases.reduce((s, p) => s + p.ms, 0));
  });

  it('pays four round trips on a first visit over TCP and TLS', () => {
    expect(simulateTrip(DEFAULT_SETUP).roundTrips).toBe(4);
  });

  it('HTTP/3 saves exactly one round trip', () => {
    for (const s of allSetups()) {
      if (s.h3) continue;
      const a = simulateTrip(s);
      const b = simulateTrip({ ...s, h3: true });
      expect(a.roundTrips - b.roundTrips).toBe(1);
      expect(a.total - b.total).toBe(a.rtt);
    }
  });

  it('a return visit skips the address lookup and is never slower', () => {
    for (const s of allSetups()) {
      if (s.visited) continue;
      const again = simulateTrip({ ...s, visited: true });
      expect(again.phases[0].skipped).toBe('remembered');
      expect(again.total).toBeLessThan(simulateTrip(s).total);
    }
  });

  it('a copy shop nearby is never slower', () => {
    for (const s of allSetups()) {
      if (s.cdn) continue;
      expect(simulateTrip({ ...s, cdn: true }).total).toBeLessThan(simulateTrip(s).total);
    }
  });

  it('a farther shop is never faster', () => {
    for (const s of allSetups()) {
      const times = DISTANCES.map((distance) => simulateTrip({ ...s, distance }).total);
      expect(times[1]).toBeGreaterThanOrEqual(times[0]);
      expect(times[2]).toBeGreaterThanOrEqual(times[1]);
    }
  });

  it('a worse network is never faster', () => {
    for (const s of allSetups()) {
      const times = NETWORKS.map((network) => simulateTrip({ ...s, network }).total);
      expect(times[1]).toBeGreaterThan(times[0]);
      expect(times[2]).toBeGreaterThan(times[1]);
    }
  });

  it('with a copy shop, distance stops mattering', () => {
    const near = simulateTrip({ ...DEFAULT_SETUP, cdn: true, distance: 'city' });
    const far = simulateTrip({ ...DEFAULT_SETUP, cdn: true, distance: 'world' });
    expect(far.total).toBe(near.total);
  });

  it('on good Wi-Fi, distance hurts more than a slower connection', () => {
    // The lesson: latency (round trips) usually matters more than bandwidth.
    const base: TripSetup = { ...DEFAULT_SETUP, network: 'wifi', distance: 'city' };
    const farther = simulateTrip({ ...base, distance: 'world' }).total - simulateTrip(base).total;
    const slower = simulateTrip({ ...base, network: '4g' }).total - simulateTrip(base).total;
    expect(farther).toBeGreaterThan(slower);
  });

  it('round trip time is the road plus the last mile', () => {
    expect(rttOf({ distance: 'world', network: 'wifi', cdn: false })).toBe(245);
    expect(rttOf({ distance: 'world', network: 'wifi', cdn: true })).toBe(17);
  });

  it('names the biggest phase', () => {
    for (const s of allSetups()) {
      const t = simulateTrip(s);
      const max = Math.max(...t.phases.map((p) => p.ms));
      expect(t.phases.find((p) => p.id === t.biggest)!.ms).toBe(max);
      expect(advice(t, s).length).toBeGreaterThan(20);
    }
  });
});

describe('feeling', () => {
  it('turns milliseconds into something a child understands', () => {
    expect(feeling(200)).toBe('Faster than a blink');
    expect(feeling(900)).toBe('About 3 blinks');
    expect(feeling(8000)).toMatch(/give up/);
    expect(blinks(100)).toBe(1);
  });
});
