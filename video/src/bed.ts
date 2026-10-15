import { L, lineStart } from './timeline';

/**
 * How the music bed is cut against the film.
 *
 * Bed: seed 7, 99 BPM, F major (studio/music/beds/week04_s7.wav), extended by 8 bars
 * in its first groove and 2 bars in its second (studio/music/extend_bed.py) to 252 s.
 * - Its build plays under the hook, and its drop (36.45 s, after a short breath) lands on
 *   "Let's explain it like you're five".
 * - Its breakdown (about 135–143 s) falls under "And the first piece says: two hundred, OK",
 *   a breath before part four, and the groove returns as the page starts being built.
 * - Its final chord (fade from about 241.5 s) rings under the about card.
 */
const FIVE = lineStart(L('intro', 5));
const DROP = 36.45;
const OFFSET = DROP - FIVE;

export const BED = {
  gain: -12,
  segments: [{ from: OFFSET, to: 252.0, at: 0, fadeIn: 0.9, fadeOut: 0.6 }],
  drop: FIVE,
};
