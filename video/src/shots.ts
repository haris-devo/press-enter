import type { StepId, ActId } from '../../src/engine/journey';
import { beatOf, L, lineStart, lineEnd, wordAt, phrase } from './timeline';

/**
 * The shot list. Each shot plays one of the site's scenes, pins the scene's own moments to the
 * narrator's words (anchors: [sceneT, seconds]) and moves a virtual camera over it
 * (cam: [sceneT, centerX, centerY, zoom] on the 800 × 480 scene).
 */

export interface Shot {
  id: string;
  beat: StepId;
  scene: StepId;
  start: number;
  end: number;
  anchors: [number, number][];
  cam: [number, number, number, number][];
  /** Camera keyed on seconds instead of scene time, for shots whose scene is frozen. */
  camTime?: [number, number, number, number][];
}

export interface StepCard {
  beat: StepId;
  act: ActId;
  /** Headline with *emphasis* on the word that carries the idea. */
  title: string;
  /** The grown-up name, as a chip. */
  term: string;
  /** One line of what really happens, in monospace, for the engineers watching. */
  detail: string;
  /** When the detail line appears. */
  detailAt: number;
  /** An optional title shown before the step proper starts (the step meta waits for it). */
  lead?: { title: string; until: number };
}

const WIDE: [number, number, number] = [400, 240, 1];

function shots(): Shot[] {
  const list: Shot[] = [];
  const add = (s: Omit<Shot, 'start' | 'end'> & { start?: number; end?: number }) => {
    const b = beatOf(s.beat);
    list.push({ start: b.start, end: b.end, ...s });
  };

  // ---- url: first the toy shop far away, then the address bar
  {
    const b = beatOf('url');
    const split = lineStart(L('url', 1)) - 0.25;
    add({
      id: 'url-shop',
      beat: 'url',
      scene: 'tcp',
      end: split,
      anchors: [
        [0, b.start],
        [0, split + 5],
      ],
      cam: [],
      // start close on the browser, then pull back to reveal the shop down the road
      camTime: [
        [b.start, 130, 280, 2.1],
        [b.start + 0.6, 140, 280, 2.0],
        [split - 0.2, 420, 270, 1.05],
      ],
    });
    add({
      id: 'url-bar',
      beat: 'url',
      scene: 'url',
      start: split,
      anchors: [
        [0.03, wordAt(L('url', 1), 0)],
        [0.3, lineEnd(L('url', 1))],
        [0.36, lineStart(L('url', 2))],
        [0.42, phrase(L('url', 3), 'a website')],
        [0.52, phrase(L('url', 3), 'adds')],
        [0.6, phrase(L('url', 3), 'https')],
        [0.86, phrase(L('url', 3), "that's the url")],
      ],
      cam: [
        [0, 330, 160, 1.6],
        [0.28, 330, 160, 1.6],
        [0.33, 550, 160, 1.6],
        [0.4, 400, 210, 1.15],
        [0.62, 400, 220, 1.1],
        [0.72, ...WIDE],
        [1, ...WIDE],
      ],
    });
  }

  // ---- cache
  add({
    id: 'cache',
    beat: 'cache',
    scene: 'cache',
    anchors: [
      [0.02, lineStart(L('cache', 0))],
      [0.1, lineEnd(L('cache', 0))],
      [0.78, lineStart(L('cache', 2))],
      [0.84, phrase(L('cache', 2), "that's")],
    ],
    cam: [
        [0, ...WIDE],
        [0.08, ...WIDE],
        [0.17, 517, 232, 1.38],
        [0.74, 517, 232, 1.38],
        [0.84, ...WIDE],
        [1, ...WIDE],
      ],
  });

  // ---- dns
  {
    const l = (k: number) => L('dns', k);
    add({
      id: 'dns',
      beat: 'dns',
      scene: 'dns',
      anchors: [
        [0, lineStart(l(0))],
        [0.02, lineStart(l(1))],
        [0.14, lineEnd(l(1))],
        [0.15, phrase(l(2), 'the root')],
        [0.35, phrase(l(2), 'then the dot-com')],
        [0.55, phrase(l(2), "then the shop's")],
        [0.75, lineStart(l(3))],
        [0.86, phrase(l(3), "that's")],
      ],
      cam: [
        [0, 250, 290, 1.6],
        [0.13, 250, 290, 1.6],
        [0.2, 480, 195, 1.25],
        [0.42, 480, 212, 1.25],
        [0.64, 480, 235, 1.25],
        [0.76, 400, 240, 1.0],
        [0.84, 400, 240, 1.0],
        [0.9, 230, 135, 1.85],
        [1, 230, 136, 1.8],
      ],
    });
  }

  // ---- tcp: the camera follows each envelope down the road
  {
    const l = (k: number) => L('tcp', k);
    add({
      id: 'tcp',
      beat: 'tcp',
      scene: 'tcp',
      anchors: [
        [0, lineStart(l(0))],
        [0.03, lineStart(l(1))],
        [0.3, lineStart(l(2)) - 0.05],
        [0.33, lineStart(l(2))],
        [0.6, lineStart(l(3)) - 0.05],
        [0.63, lineStart(l(3))],
        [0.88, lineEnd(l(3)) + 0.2],
        [0.92, phrase(l(4), "that's")],
        [0.97, phrase(l(4), 'one trip')],
      ],
      cam: [
        [0, ...WIDE],
        [0.04, 276, 230, 1.45],
        [0.3, 524, 230, 1.45],
        [0.36, 524, 230, 1.45],
        [0.6, 276, 230, 1.45],
        [0.66, 276, 230, 1.45],
        [0.88, 524, 230, 1.45],
        [0.94, ...WIDE],
        [1, ...WIDE],
      ],
    });
  }

  // ---- tls
  {
    const l = (k: number) => L('tls', k);
    add({
      id: 'tls',
      beat: 'tls',
      scene: 'tls',
      anchors: [
        [0, lineStart(l(0))],
        [0.05, phrase(l(0), 'agree')],
        [0.26, lineEnd(l(0))],
        [0.3, lineStart(l(1))],
        [0.5, phrase(l(1), 'card')],
        [0.6, phrase(l(1), 'signed')],
        [0.67, lineEnd(l(1))],
        [0.84, lineStart(l(2))],
        [0.92, phrase(l(2), 'padlock')],
      ],
      cam: [
        [0, ...WIDE],
        [0.46, ...WIDE],
        [0.53, 250, 153, 2.8],
        [0.64, 250, 153, 2.8],
        [0.7, ...WIDE],
        [0.9, ...WIDE],
        [0.95, 400, 150, 2.0],
        [1, 400, 150, 2.0],
      ],
    });
  }

  // ---- request
  {
    const l = (k: number) => L('request', k);
    add({
      id: 'request',
      beat: 'request',
      scene: 'request',
      anchors: [
        [0, lineStart(l(0))],
        [0.06, phrase(l(0), 'polite')],
        [0.42, lineEnd(l(0))],
        [0.56, lineEnd(l(0)) + 0.3],
        [0.88, phrase(l(1), 'request')],
      ],
      cam: [
        [0, 391, 190, 1.85],
        [0.48, 391, 192, 1.85],
        [0.6, ...WIDE],
        [1, ...WIDE],
      ],
    });
  }

  // ---- server: pan from the copy shop to the kitchen and back
  {
    const l = (k: number) => L('server', k);
    add({
      id: 'server',
      beat: 'server',
      scene: 'server',
      anchors: [
        [0, lineStart(l(0))],
        [0.14, phrase(l(0), 'checks')],
        [0.22, lineStart(l(1))],
        [0.26, phrase(l(1), 'so the')],
        [0.42, phrase(l(1), 'makes')],
        [0.66, phrase(l(1), 'and the')],
        [0.76, phrase(l(1), 'keeps')],
        [0.84, lineStart(l(2))],
        [0.96, lineEnd(l(2)) + 0.3],
      ],
      cam: [
        [0, 228, 290, 1.75],
        [0.22, 228, 290, 1.75],
        [0.3, 400, 240, 1.0],
        [0.38, 500, 220, 1.33],
        [0.62, 500, 220, 1.33],
        [0.7, ...WIDE],
        [1, ...WIDE],
      ],
    });
  }

  // ---- response
  {
    const l = (k: number) => L('response', k);
    add({
      id: 'response',
      beat: 'response',
      scene: 'response',
      anchors: [
        [0, lineStart(l(0))],
        [0.36, lineEnd(l(0))],
        [0.54, phrase(l(1), 'four')],
        [0.62, phrase(l(1), 'so the')],
        [0.72, lineEnd(l(1))],
        [0.84, lineStart(l(2))],
        [0.95, phrase(l(2), 'ok')],
      ],
      cam: [
        [0, ...WIDE],
        [0.28, ...WIDE],
        [0.36, 284, 230, 1.41],
        [0.8, 284, 230, 1.41],
        [0.88, 300, 112, 2.1],
        [1, 300, 115, 2.0],
      ],
    });
  }

  // ---- dom
  {
    const l = (k: number) => L('dom', k);
    add({
      id: 'dom',
      beat: 'dom',
      scene: 'dom',
      anchors: [
        [0.04, lineStart(l(0))],
        [0.12, lineStart(l(1))],
        [0.42, lineEnd(l(1))],
        [0.5, lineStart(l(2))],
        [0.86, phrase(l(2), "that's")],
      ],
      cam: [
        [0, 267, 200, 1.5],
        [0.1, 267, 250, 1.5],
        [0.16, ...WIDE],
        [0.5, ...WIDE],
        [0.75, 410, 240, 1.04],
        [1, ...WIDE],
      ],
    });
  }

  // ---- cssom
  {
    const l = (k: number) => L('cssom', k);
    add({
      id: 'cssom',
      beat: 'cssom',
      scene: 'cssom',
      anchors: [
        [0, lineStart(l(0))],
        [0.06, phrase(l(0), 'big')],
        [0.22, phrase(l(0), 'round')],
        [0.38, phrase(l(0), 'green')],
        [0.6, lineEnd(l(1)) - 0.6],
        [0.78, phrase(l(2), "that's")],
      ],
      cam: [
        [0, ...WIDE],
        [0.54, ...WIDE],
        [0.62, 584, 340, 1.85],
        [0.9, 584, 340, 1.85],
        [1, ...WIDE],
      ],
    });
  }

  // ---- js: settle on the plain lane, then the defer lane
  {
    const l = (k: number) => L('js', k);
    add({
      id: 'js',
      beat: 'js',
      scene: 'js',
      anchors: [
        [0, lineStart(l(0))],
        [0.04, lineStart(l(1))],
        [0.5, lineEnd(l(1)) + 0.2],
        [0.86, lineEnd(l(2))],
      ],
      cam: [
        [0, ...WIDE],
        [0.5, 400, 236, 1.04],
        [1, ...WIDE],
      ],
    });
  }

  // ---- layout
  {
    const l = (k: number) => L('layout', k);
    add({
      id: 'layout',
      beat: 'layout',
      scene: 'layout',
      anchors: [
        [0, lineStart(l(0))],
        [0.22, lineEnd(l(0))],
        [0.27, phrase(l(1), 'measures')],
        [0.52, lineEnd(l(1))],
        [0.56, phrase(l(2), 'shrink')],
        [0.84, lineEnd(l(2)) + 0.3],
      ],
      cam: [
        [0, 400, 240, 1.2],
        [0.5, 400, 245, 1.2],
        [0.56, ...WIDE],
        [1, ...WIDE],
      ],
    });
  }

  // ---- paint
  {
    const l = (k: number) => L('paint', k);
    add({
      id: 'paint',
      beat: 'paint',
      scene: 'paint',
      anchors: [
        [0.02, lineStart(l(0))],
        [0.4, lineStart(l(1))],
        [0.84, phrase(l(1), "that's")],
      ],
      cam: [
        [0, 255, 245, 1.78],
        [0.36, 255, 250, 1.75],
        [0.44, 593, 240, 1.95],
        [0.8, 593, 240, 1.9],
        [0.9, ...WIDE],
        [1, ...WIDE],
      ],
    });
  }

  // ---- composite
  {
    const l = (k: number) => L('composite', k);
    add({
      id: 'composite',
      beat: 'composite',
      scene: 'composite',
      anchors: [
        [0.06, lineStart(l(0))],
        [0.36, lineEnd(l(0))],
        [0.5, phrase(l(1), 'sliding')],
        [0.78, lineEnd(l(1))],
        [0.82, lineStart(l(2))],
        [0.95, phrase(l(2), 'transform')],
      ],
      cam: [
        [0, ...WIDE],
        [0.46, ...WIDE],
        [0.52, 380, 175, 1.6],
        [0.76, 380, 175, 1.6],
        [0.82, ...WIDE],
        [1, ...WIDE],
      ],
    });
  }

  // ---- interactive
  {
    const l = (k: number) => L('interactive', k);
    add({
      id: 'interactive',
      beat: 'interactive',
      scene: 'interactive',
      anchors: [
        [0, lineStart(l(0))],
        [0.05, lineStart(l(1))],
        [0.22, lineEnd(l(1))],
        [0.27, lineStart(l(2))],
        [0.42, phrase(l(2), 'your tap')],
        [0.66, lineStart(l(3))],
        [0.74, phrase(l(3), 'remember')],
        [0.9, lineEnd(l(3))],
      ],
      cam: [
        [0, 400, 240, 1.0],
        [0.2, 400, 242, 1.04],
        [0.5, 400, 236, 1.06],
        [0.8, 400, 240, 1.02],
        [1, ...WIDE],
      ],
    });
  }

  // ---- outro: the finished page, held while "You pressed Enter" lands
  {
    const b = beatOf('outro');
    const recap = lineStart(L('outro', 1)) - 0.3;
    list.push({
      id: 'outro-page',
      beat: 'paint',
      scene: 'paint',
      start: b.start,
      end: recap,
      anchors: [
        [1, b.start],
        [1, b.start + 99],
      ],
      cam: [],
      camTime: [
        [b.start, 400, 240, 1.1],
        [recap + 0.4, 400, 252, 1.28],
      ],
    });
  }

  return list;
}

export const SHOTS = shots();

export const CARDS: StepCard[] = [
  { beat: 'url', act: 'find', title: 'You type a *name*', term: 'URL parsing', detail: 'https://toyshop.com/  =  scheme + host + path', detailAt: phrase(L('url', 3), 'https'), lead: { title: 'A website is a *toy shop*', until: lineStart(L('url', 1)) - 0.3 } },
  { beat: 'cache', act: 'find', title: 'Look in the *pocket*', term: 'Browser cache', detail: 'memory, disk, service worker: no fresh copy', detailAt: lineStart(L('cache', 2)) },
  { beat: 'dns', act: 'find', title: 'Find the *address*', term: 'DNS lookup', detail: 'toyshop.com.   A   203.0.113.42   TTL 300', detailAt: phrase(L('dns', 3), "that's") },
  { beat: 'tcp', act: 'meet', title: 'Knock on the *door*', term: 'TCP handshake', detail: 'SYN  →  SYN-ACK  →  ACK', detailAt: phrase(L('tcp', 4), "that's") },
  { beat: 'tls', act: 'meet', title: 'Agree on a *secret code*', term: 'TLS 1.3', detail: 'ClientHello  →  ServerHello + certificate', detailAt: phrase(L('tls', 1), 'signed') },
  { beat: 'request', act: 'ask', title: 'Ask for the *page*', term: 'HTTP request', detail: 'GET / HTTP/2    Host: toyshop.com', detailAt: phrase(L('request', 1), "that's") },
  { beat: 'server', act: 'ask', title: 'The shop gets it *ready*', term: 'CDN and origin', detail: 'edge MISS  →  origin renders  →  edge keeps a copy', detailAt: phrase(L('server', 1), 'keeps') },
  { beat: 'response', act: 'ask', title: 'It arrives in *pieces*', term: 'HTTP response', detail: 'HTTP/2 200   content-type: text/html', detailAt: lineStart(L('response', 2)) },
  { beat: 'dom', act: 'build', title: 'Read the *instructions*', term: 'DOM', detail: 'bytes  →  tokens  →  nodes  →  DOM tree', detailAt: phrase(L('dom', 2), "that's") },
  { beat: 'cssom', act: 'build', title: 'Pick the *styles*', term: 'CSSOM', detail: 'CSS is render-blocking: no paint until it arrives', detailAt: lineStart(L('cssom', 1)) },
  { beat: 'js', act: 'build', title: 'Wake up the *scripts*', term: 'async and defer', detail: '<script defer> downloads early, runs after parsing', detailAt: lineStart(L('js', 2)) },
  { beat: 'layout', act: 'draw', title: 'Measure *everything*', term: 'Layout', detail: 'DOM + CSSOM  →  render tree  →  boxes', detailAt: phrase(L('layout', 1), "that's") },
  { beat: 'paint', act: 'draw', title: 'Colour it *in*', term: 'Paint', detail: 'draw commands  →  pixels (raster)', detailAt: phrase(L('paint', 1), "that's") },
  { beat: 'composite', act: 'draw', title: 'Stack the *layers*', term: 'Compositing', detail: 'transform and opacity skip layout and paint', detailAt: phrase(L('composite', 2), "it's") },
  { beat: 'interactive', act: 'play', title: 'Ready to *play*', term: 'Event loop', detail: 'one task at a time; over 50 ms hurts INP', detailAt: phrase(L('interactive', 2), 'give') },
];
