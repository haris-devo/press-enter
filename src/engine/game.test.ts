import { describe, expect, it } from 'vitest';
import { CARDS, deal, isNext, shuffle } from './game';
import { STEPS } from './journey';

describe('order game', () => {
  it('cards follow the order of the journey', () => {
    const order = CARDS.map((c) => STEPS.findIndex((s) => s.id === c.step));
    expect(order.every((n) => n >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('shuffle keeps every card and is stable for a seed', () => {
    const a = shuffle(CARDS, 42);
    expect(a.map((c) => c.id).sort()).toEqual(CARDS.map((c) => c.id).sort());
    expect(shuffle(CARDS, 42).map((c) => c.id)).toEqual(a.map((c) => c.id));
  });

  it('deals a deck with no card already in place', () => {
    for (const seed of [1, 2, 3, 20261015, 99]) {
      const deck = deal(seed);
      expect(deck).toHaveLength(CARDS.length);
      deck.forEach((c, i) => expect(c.id).not.toBe(CARDS[i].id));
    }
  });

  it('knows which card comes next', () => {
    expect(isNext(0, CARDS[0])).toBe(true);
    expect(isNext(0, CARDS[1])).toBe(false);
    expect(isNext(7, CARDS[7])).toBe(true);
    expect(isNext(8, CARDS[7])).toBe(false);
  });
});
