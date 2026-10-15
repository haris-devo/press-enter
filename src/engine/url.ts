/**
 * Turn whatever someone types into the address bar into the pieces the journey needs:
 * is it a website or a search, and which host, path and (pretend) IP address it leads to.
 */

export interface Destination {
  /** What the person typed, trimmed. */
  typed: string;
  /** 'site' when the text is an address, 'search' when the browser hands it to a search engine. */
  kind: 'site' | 'search';
  scheme: 'https';
  /** True when the person typed http:// and the browser upgrades it to https://. */
  upgraded: boolean;
  host: string;
  /** Path plus query, as sent in the request line. Always starts with '/'. */
  path: string;
  port: 443;
  /** The domain's top-level part, with a leading dot: '.com', '.org', '.co.uk'. */
  tld: string;
  /** The registrable domain whose name server answers last: 'toyshop.com' for 'www.toyshop.com'. */
  zone: string;
  /** A made-up address from the documentation range, stable for a given host. */
  ip: string;
}

export const DEFAULT_INPUT = 'toyshop.com';
export const SEARCH_HOST = 'www.google.com';

const SECOND_LEVEL = new Set(['co', 'com', 'org', 'net', 'ac', 'gov', 'edu']);

/** Small string hash (FNV-1a), so the pretend IP is stable across server and browser renders. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** An address in 203.0.113.0/24, the range reserved for documentation, so it never points at a real machine. */
export function pretendIp(host: string): string {
  return `203.0.113.${(hash(host) % 250) + 2}`;
}

function zoneOf(host: string): { tld: string; zone: string } {
  const labels = host.split('.').filter(Boolean);
  if (labels.length < 2) return { tld: `.${labels[0] ?? host}`, zone: host };
  const last = labels[labels.length - 1];
  const second = labels[labels.length - 2];
  if (last.length === 2 && SECOND_LEVEL.has(second) && labels.length >= 3) {
    return { tld: `.${second}.${last}`, zone: labels.slice(-3).join('.') };
  }
  return { tld: `.${last}`, zone: labels.slice(-2).join('.') };
}

function looksLikeAddress(text: string): boolean {
  if (/\s/.test(text)) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) return true;
  // A dot with something on both sides, like "toyshop.com" or "wikipedia.org/wiki/Cat".
  const hostPart = text.split(/[/?#]/)[0];
  return /^[^.]+(\.[^.]+)+$/.test(hostPart) || /^localhost(:\d+)?$/i.test(hostPart);
}

function search(typed: string): Destination {
  const { tld, zone } = zoneOf(SEARCH_HOST);
  return {
    typed,
    kind: 'search',
    scheme: 'https',
    upgraded: false,
    host: SEARCH_HOST,
    path: `/search?q=${encodeURIComponent(typed).replace(/%20/g, '+')}`,
    port: 443,
    tld,
    zone,
    ip: pretendIp(SEARCH_HOST),
  };
}

export function parseInput(raw: string): Destination {
  const typed = raw.trim() || DEFAULT_INPUT;
  if (!looksLikeAddress(typed)) return search(typed);

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(typed);
  let url: URL;
  try {
    url = new URL(hasScheme ? typed : `https://${typed}`);
  } catch {
    return search(typed);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return search(typed);
  if (!url.hostname) return search(typed);

  const host = url.hostname.toLowerCase();
  const { tld, zone } = zoneOf(host);
  return {
    typed,
    kind: 'site',
    scheme: 'https',
    upgraded: url.protocol === 'http:',
    host,
    path: `${url.pathname || '/'}${url.search}`,
    port: 443,
    tld,
    zone,
    ip: pretendIp(host),
  };
}

/** Shorten long text for small spaces in the illustrations: 'averyverylongname.com' → 'averyvery…me.com'. */
export function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  const keepEnd = Math.ceil((max - 1) * 0.4);
  const keepStart = max - 1 - keepEnd;
  return `${text.slice(0, keepStart)}…${text.slice(text.length - keepEnd)}`;
}
