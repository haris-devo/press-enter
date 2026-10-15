/**
 * Read the browser's own stopwatch (Navigation Timing) for the visit to this very page and
 * map it onto the same chapters the journey uses.
 */

export type RealPhaseId = 'redirect' | 'cache' | 'dns' | 'connect' | 'tls' | 'wait' | 'download' | 'build';

export interface RealPhase {
  id: RealPhaseId;
  start: number;
  ms: number;
}

export interface RealTrip {
  phases: RealPhase[];
  /** First Contentful Paint, a moment rather than a span. Null when the browser has not painted (a hidden tab). */
  firstPaint: number | null;
  /** When the page finished loading (loadEventEnd), or when it became interactive if load is not done yet. */
  done: number;
  protocol: string;
  /** True when the browser answered from its own cache or kept connections from earlier. */
  reused: boolean;
  /** Bytes that crossed the network for the page itself (0 when it came from a cache). */
  transferred: number;
}

/** The subset of PerformanceNavigationTiming we read, so tests can pass plain objects. */
export interface NavTiming {
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  secureConnectionStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domInteractive: number;
  domContentLoadedEventEnd: number;
  loadEventEnd: number;
  nextHopProtocol: string;
  transferSize: number;
}

const nonNeg = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function readTrip(t: NavTiming, firstPaint: number | null): RealTrip {
  const phases: RealPhase[] = [];
  const add = (id: RealPhaseId, start: number, end: number) => {
    phases.push({ id, start: nonNeg(start), ms: nonNeg(end - start) });
  };

  add('redirect', t.redirectStart, t.redirectEnd);
  add('cache', t.fetchStart, t.domainLookupStart || t.fetchStart);
  add('dns', t.domainLookupStart, t.domainLookupEnd);
  const tlsStart = t.secureConnectionStart > 0 ? t.secureConnectionStart : t.connectEnd;
  add('connect', t.connectStart, tlsStart);
  add('tls', tlsStart, t.connectEnd);
  add('wait', t.requestStart, t.responseStart);
  add('download', t.responseStart, t.responseEnd);
  add('build', t.responseEnd, t.domInteractive);

  const done = Math.max(t.loadEventEnd, t.domContentLoadedEventEnd, t.domInteractive, firstPaint ?? 0);
  const dns = t.domainLookupEnd - t.domainLookupStart;
  const connect = t.connectEnd - t.connectStart;
  return {
    phases,
    firstPaint,
    done,
    protocol: t.nextHopProtocol || 'unknown',
    reused: t.transferSize === 0 || (dns <= 0 && connect <= 0),
    transferred: nonNeg(t.transferSize),
  };
}

export function protocolName(p: string): string {
  if (p === 'h3' || p.startsWith('h3-')) return 'HTTP/3';
  if (p === 'h2') return 'HTTP/2';
  if (p === 'http/1.1') return 'HTTP/1.1';
  return p === 'unknown' || !p ? 'not reported' : p;
}

/** Fastly and other CDNs name the edge by its nearest airport: 'cache-fra-etou8220091-FRA' → 'FRA'. */
export function edgeCode(servedBy: string | null): string | null {
  if (!servedBy) return null;
  const last = servedBy.split(',').pop()!.trim();
  const m = /-([A-Z]{3})$/.exec(last) ?? /cache-([a-z]{3})\d*-/.exec(last);
  return m ? m[1].toUpperCase() : null;
}
