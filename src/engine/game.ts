import type { ActId, StepId } from './journey';

/** The order game: eight cards, tap them in the order the trip happens. */

export interface Card {
  id: string;
  act: ActId;
  step: StepId;
  kid: string;
  pro: string;
  /** Said when someone picks a later card while this one is next. */
  hint: { kid: string; pro: string };
}

export const CARDS: Card[] = [
  {
    id: 'type',
    act: 'find',
    step: 'url',
    kid: 'Type the name',
    pro: 'Parse the URL',
    hint: { kid: 'Everything starts with you typing where to go.', pro: 'Nothing happens until the input is parsed into a URL.' },
  },
  {
    id: 'address',
    act: 'find',
    step: 'dns',
    kid: 'Find the address',
    pro: 'DNS lookup',
    hint: { kid: "You can't visit a shop until you know where it is.", pro: 'You need an IP address before you can open a connection.' },
  },
  {
    id: 'knock',
    act: 'meet',
    step: 'tcp',
    kid: 'Knock on the door',
    pro: 'TCP handshake',
    hint: { kid: 'Say hello before you share secrets.', pro: 'TLS runs on top of an open TCP connection.' },
  },
  {
    id: 'secret',
    act: 'meet',
    step: 'tls',
    kid: 'Agree on a secret code',
    pro: 'TLS handshake',
    hint: { kid: 'Lock the box before you send your note.', pro: 'The request is only sent once the channel is encrypted.' },
  },
  {
    id: 'ask',
    act: 'ask',
    step: 'request',
    kid: 'Ask for the page',
    pro: 'Send the HTTP request',
    hint: { kid: 'The shop needs your note before it can answer.', pro: 'No response without a request.' },
  },
  {
    id: 'arrive',
    act: 'ask',
    step: 'response',
    kid: 'The page arrives',
    pro: 'Receive the response',
    hint: { kid: "You can't read the instructions before they arrive.", pro: 'Parsing needs bytes from the response.' },
  },
  {
    id: 'build',
    act: 'build',
    step: 'dom',
    kid: 'Build the page',
    pro: 'Build the DOM and CSSOM',
    hint: { kid: 'The blocks must be built before they are coloured.', pro: 'Layout needs the render tree, made from the DOM and CSSOM.' },
  },
  {
    id: 'draw',
    act: 'draw',
    step: 'paint',
    kid: 'Colour it in',
    pro: 'Layout, paint, composite',
    hint: { kid: 'Colouring in comes last.', pro: 'Rendering is the last step before the page is interactive.' },
  },
];

/** Seeded shuffle, so the first deck is the same on the server and in the browser. */
export function shuffle<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let s = seed >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A deck where no card already sits in its right place, so the game never starts half-solved. */
export function deal(seed: number): Card[] {
  for (let k = 0; k < 50; k++) {
    const deck = shuffle(CARDS, seed + k * 7919);
    if (deck.every((c, i) => CARDS[i].id !== c.id)) return deck;
  }
  return [...CARDS].reverse();
}

export function isNext(placed: number, card: Card): boolean {
  return CARDS[placed]?.id === card.id;
}
