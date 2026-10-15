import { describe, expect, it } from 'vitest';
import { parseInput, pretendIp, shorten, DEFAULT_INPUT, SEARCH_HOST } from './url';

describe('parseInput', () => {
  it('treats a bare domain as a site over https', () => {
    const d = parseInput('toyshop.com');
    expect(d.kind).toBe('site');
    expect(d.host).toBe('toyshop.com');
    expect(d.path).toBe('/');
    expect(d.scheme).toBe('https');
    expect(d.upgraded).toBe(false);
    expect(d.tld).toBe('.com');
    expect(d.zone).toBe('toyshop.com');
  });

  it('keeps the path and query and lowercases the host', () => {
    const d = parseInput('https://EN.Wikipedia.org/wiki/Cat?x=1');
    expect(d.host).toBe('en.wikipedia.org');
    expect(d.path).toBe('/wiki/Cat?x=1');
    expect(d.zone).toBe('wikipedia.org');
    expect(d.tld).toBe('.org');
  });

  it('upgrades http to https and says so', () => {
    const d = parseInput('http://example.com');
    expect(d.scheme).toBe('https');
    expect(d.upgraded).toBe(true);
  });

  it('handles country second-level domains', () => {
    const d = parseInput('www.bbc.co.uk');
    expect(d.tld).toBe('.co.uk');
    expect(d.zone).toBe('bbc.co.uk');
  });

  it('turns words without a dot into a search', () => {
    const d = parseInput('cute puppies');
    expect(d.kind).toBe('search');
    expect(d.host).toBe(SEARCH_HOST);
    expect(d.path).toBe('/search?q=cute+puppies');
  });

  it('turns a single word into a search', () => {
    expect(parseInput('weather').kind).toBe('search');
  });

  it('falls back to the default when empty', () => {
    expect(parseInput('   ').host).toBe(DEFAULT_INPUT);
  });

  it('treats other schemes as a search', () => {
    expect(parseInput('ftp://files.example.com').kind).toBe('search');
  });
});

describe('pretendIp', () => {
  it('is stable and stays in the documentation range', () => {
    expect(pretendIp('toyshop.com')).toBe(pretendIp('toyshop.com'));
    for (const h of ['a.com', 'b.org', 'toyshop.com', 'www.google.com']) {
      const last = Number(pretendIp(h).split('.')[3]);
      expect(pretendIp(h).startsWith('203.0.113.')).toBe(true);
      expect(last).toBeGreaterThanOrEqual(2);
      expect(last).toBeLessThanOrEqual(251);
    }
  });
});

describe('shorten', () => {
  it('leaves short text alone and trims long text to the limit', () => {
    expect(shorten('abc', 5)).toBe('abc');
    const s = shorten('averyveryverylongname.com', 14);
    expect(s.length).toBe(14);
    expect(s.endsWith('.com')).toBe(true);
  });
});
