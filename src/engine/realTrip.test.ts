import { describe, expect, it } from 'vitest';
import { readTrip, protocolName, edgeCode, type NavTiming } from './realTrip';

const cold: NavTiming = {
  redirectStart: 0,
  redirectEnd: 0,
  fetchStart: 2,
  domainLookupStart: 3,
  domainLookupEnd: 33,
  connectStart: 33,
  secureConnectionStart: 60,
  connectEnd: 90,
  requestStart: 91,
  responseStart: 160,
  responseEnd: 190,
  domInteractive: 260,
  domContentLoadedEventEnd: 270,
  loadEventEnd: 420,
  nextHopProtocol: 'h2',
  transferSize: 24000,
};

describe('readTrip', () => {
  it('splits a cold visit into the journey chapters', () => {
    const t = readTrip(cold, 300);
    const ms = Object.fromEntries(t.phases.map((p) => [p.id, p.ms]));
    expect(ms.dns).toBe(30);
    expect(ms.connect).toBe(27);
    expect(ms.tls).toBe(30);
    expect(ms.wait).toBe(69);
    expect(ms.download).toBe(30);
    expect(ms.build).toBe(70);
    expect(ms.paint).toBeUndefined();
    expect(t.firstPaint).toBe(300);
    expect(t.done).toBe(420);
    expect(t.reused).toBe(false);
    expect(t.protocol).toBe('h2');
  });

  it('marks a warm visit as reused and never returns negative times', () => {
    const warm: NavTiming = {
      ...cold,
      domainLookupStart: 2,
      domainLookupEnd: 2,
      connectStart: 2,
      secureConnectionStart: 0,
      connectEnd: 2,
      transferSize: 0,
    };
    const t = readTrip(warm, null);
    expect(t.reused).toBe(true);
    for (const p of t.phases) expect(p.ms).toBeGreaterThanOrEqual(0);
    expect(t.phases.find((p) => p.id === 'tls')!.ms).toBe(0);
  });

  it('handles plain http without a TLS step', () => {
    const t = readTrip({ ...cold, secureConnectionStart: 0 }, 300);
    expect(t.phases.find((p) => p.id === 'tls')!.ms).toBe(0);
    expect(t.phases.find((p) => p.id === 'connect')!.ms).toBe(57);
  });
});

describe('protocolName', () => {
  it('names the common protocols', () => {
    expect(protocolName('h3')).toBe('HTTP/3');
    expect(protocolName('h2')).toBe('HTTP/2');
    expect(protocolName('http/1.1')).toBe('HTTP/1.1');
    expect(protocolName('')).toBe('not reported');
  });
});

describe('edgeCode', () => {
  it('pulls the airport code out of the CDN header', () => {
    expect(edgeCode('cache-fra-etou8220091-FRA')).toBe('FRA');
    expect(edgeCode('cache-iad-kjyo7100045-IAD, cache-lhr7342-LHR')).toBe('LHR');
    expect(edgeCode(null)).toBe(null);
    expect(edgeCode('something-else')).toBe(null);
  });
});
