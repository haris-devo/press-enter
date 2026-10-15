/**
 * The narration, one beat per line. This file is the source of truth: `scripts/write-script.ts`
 * turns it into narration.txt (for the voice) and direction.json (how each line is delivered),
 * and the film reads it to know which step each line belongs to.
 *
 * mood: Q question (rises) · R reveal · D definition · S story · C conclusion
 * ref:  clone this line from a different reference take (r1_question for questions)
 */
import type { StepId } from '../../src/engine/journey';

export type Beat = StepId | 'intro' | 'outro';
export type Mood = 'Q' | 'R' | 'D' | 'S' | 'C';

export interface Line {
  text: string;
  mood: Mood;
  beat: Beat;
  ref?: 'r1_question' | 'r4_calm';
  /** Extra silence after the line, on top of the mood's default. */
  extra?: number;
}

export const LINES: Line[] = [
  // hook
  { beat: 'intro', mood: 'S', text: 'You type a name.' },
  { beat: 'intro', mood: 'S', text: 'You press Enter.' },
  { beat: 'intro', mood: 'R', text: "And about one second later, there's a page." },
  { beat: 'intro', mood: 'Q', ref: 'r1_question', text: 'But what really happened in that one second?', extra: 0.2 },
  { beat: 'intro', mood: 'R', text: 'Fifteen steps.' },
  { beat: 'intro', mood: 'S', text: "Let's explain it like you're five.", extra: 0.4 },

  // part 1: find the shop
  { beat: 'url', mood: 'S', text: 'Picture the website as a toy shop, far away.' },
  { beat: 'url', mood: 'S', text: 'First, your browser reads what you typed.' },
  { beat: 'url', mood: 'Q', ref: 'r1_question', text: 'Is it a website, or a search?' },
  { beat: 'url', mood: 'D', text: "A website. So it adds the safe road, HTTPS. That's the URL." },
  { beat: 'cache', mood: 'S', text: 'Next, it checks its pocket.' },
  { beat: 'cache', mood: 'S', text: 'If it saved a copy last time, the trip is already over.' },
  { beat: 'cache', mood: 'D', text: "Not this time. That's the browser cache." },
  { beat: 'dns', mood: 'S', text: "Now, computers don't find shops by name. Only by number." },
  { beat: 'dns', mood: 'S', text: 'So the browser asks a giant phone book.' },
  { beat: 'dns', mood: 'S', text: "The root. Then the dot-com list. Then the shop's own book." },
  { beat: 'dns', mood: 'D', text: "Until it gets the number. That's DNS.", extra: 0.4 },

  // part 2: say hello
  { beat: 'tcp', mood: 'S', text: 'Now it knocks on the door.' },
  { beat: 'tcp', mood: 'Q', ref: 'r1_question', text: 'Can we talk?' },
  { beat: 'tcp', mood: 'S', text: 'Yes! Can you hear me?' },
  { beat: 'tcp', mood: 'S', text: 'Yes, I can!' },
  { beat: 'tcp', mood: 'D', text: "That's the TCP handshake. One trip there and back." },
  { beat: 'tls', mood: 'S', text: 'Then they agree on a secret code, so nobody in the middle can read their notes.' },
  { beat: 'tls', mood: 'S', text: 'The shop shows an ID card, signed by someone the browser already trusts.' },
  { beat: 'tls', mood: 'D', text: "That's TLS. And that's your padlock.", extra: 0.4 },

  // part 3: ask and get
  { beat: 'request', mood: 'S', text: 'Now the browser sends a polite note. Please send me your front page.' },
  { beat: 'request', mood: 'D', text: "That's the HTTP request." },
  { beat: 'server', mood: 'S', text: 'A copy shop near you checks if it has the page.' },
  { beat: 'server', mood: 'S', text: 'Not yet. So the main shop makes it, and the copy shop keeps one for the next person.' },
  { beat: 'server', mood: 'D', text: "That's a CDN." },
  { beat: 'response', mood: 'S', text: 'The page travels back in small numbered pieces, called packets.' },
  { beat: 'response', mood: 'S', text: 'Number four can beat number three, so the browser puts them back in order.' },
  { beat: 'response', mood: 'R', text: 'And the first piece says: two hundred, OK.', extra: 0.4 },

  // part 4: build the page
  { beat: 'dom', mood: 'S', text: "Now the browser reads the page's instructions, top to bottom." },
  { beat: 'dom', mood: 'S', text: 'It even spots the pictures and scripts early, and starts fetching them.' },
  { beat: 'dom', mood: 'D', text: "And it builds a family tree of blocks. That's the DOM." },
  { beat: 'cssom', mood: 'S', text: 'Next come the style rules. Big and pink. Round corners. Green.' },
  { beat: 'cssom', mood: 'S', text: 'It waits for them before drawing anything, so you never see a messy page.' },
  { beat: 'cssom', mood: 'D', text: "That's the CSSOM." },
  { beat: 'js', mood: 'S', text: 'Then the scripts. The magic that makes buttons work.' },
  { beat: 'js', mood: 'R', text: 'A plain script makes the builder stop, and wait.' },
  { beat: 'js', mood: 'S', text: 'Add defer, and the builder keeps reading.', extra: 0.4 },

  // part 5: draw it
  { beat: 'layout', mood: 'Q', ref: 'r1_question', text: 'Now, where does everything go?' },
  { beat: 'layout', mood: 'D', text: "The browser measures every block. That's layout." },
  { beat: 'layout', mood: 'S', text: 'Shrink the window, and it measures again.' },
  { beat: 'paint', mood: 'S', text: 'Then it colours everything in.' },
  { beat: 'paint', mood: 'D', text: "The words, the colours, the pictures. That's paint." },
  { beat: 'composite', mood: 'S', text: 'Some parts get their own see-through sheet.' },
  { beat: 'composite', mood: 'S', text: 'The graphics chip stacks the sheets, and sliding one is almost free.' },
  { beat: 'composite', mood: 'D', text: "That's compositing. It's why smooth animations use transform.", extra: 0.4 },

  // part 6: ready to play
  { beat: 'interactive', mood: 'R', text: 'And now, the page is ready to play.' },
  { beat: 'interactive', mood: 'S', text: 'Every tap waits in line, and the browser does one job at a time.' },
  { beat: 'interactive', mood: 'R', text: 'Give it one giant job, and your tap has to wait.' },
  { beat: 'interactive', mood: 'D', text: "That's the event loop. Remember the one chef?", extra: 0.4 },

  // outro
  { beat: 'outro', mood: 'S', text: 'So. You pressed Enter.' },
  { beat: 'outro', mood: 'S', text: 'Your browser found the shop, said hello, asked for the page, built it, and drew it,' },
  { beat: 'outro', mood: 'R', text: 'and handed it to you.' },
  { beat: 'outro', mood: 'C', text: 'Fifteen steps. About one second.' },
  { beat: 'outro', mood: 'C', ref: 'r4_calm', text: 'You can play with every step yourself. The link is in the comments.' },
];

/** Silence after a line, by what the line is for. Questions and definitions get room to land. */
export const GAP: Record<Mood, number> = { S: 0.34, Q: 0.85, R: 0.5, D: 0.62, C: 0.7 };
