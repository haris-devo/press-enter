import type { Destination } from './url';

/**
 * The words of the journey. Every step has two voices: one a five-year-old follows, one an
 * interviewer expects. `{host}`, `{ip}`, `{path}`, `{tld}` and `{zone}` are filled in with
 * whatever the reader typed.
 */

export type Mode = 'kid' | 'pro';
export type ActId = 'find' | 'meet' | 'ask' | 'build' | 'draw' | 'play';

export interface Act {
  id: ActId;
  kid: string;
  pro: string;
  /** One word for tight spaces, like the step rail. */
  short: { kid: string; pro: string };
}

export const ACTS: Act[] = [
  { id: 'find', kid: 'Find the shop', pro: 'Resolve', short: { kid: 'Find', pro: 'Resolve' } },
  { id: 'meet', kid: 'Say hello', pro: 'Connect', short: { kid: 'Hello', pro: 'Connect' } },
  { id: 'ask', kid: 'Ask and get', pro: 'Request and response', short: { kid: 'Ask', pro: 'HTTP' } },
  { id: 'build', kid: 'Build the page', pro: 'Parse', short: { kid: 'Build', pro: 'Parse' } },
  { id: 'draw', kid: 'Draw it', pro: 'Render', short: { kid: 'Draw', pro: 'Render' } },
  { id: 'play', kid: 'Ready to play', pro: 'Interactive', short: { kid: 'Play', pro: 'Ready' } },
];

export type StepId =
  | 'url'
  | 'cache'
  | 'dns'
  | 'tcp'
  | 'tls'
  | 'request'
  | 'server'
  | 'response'
  | 'dom'
  | 'cssom'
  | 'js'
  | 'layout'
  | 'paint'
  | 'composite'
  | 'interactive';

export interface Step {
  id: StepId;
  act: ActId;
  /** The grown-up name for the step, shown next to the kid title so the words connect. */
  name: string;
  kid: { title: string; text: string; fact: string };
  pro: { title: string; text: string; points: string[]; sample?: string; tip: string };
  /** Animation length in milliseconds at normal speed. */
  ms: number;
}

export const STEPS: Step[] = [
  {
    id: 'url',
    act: 'find',
    name: 'URL parsing',
    kid: {
      title: 'You type a name',
      text: 'You tell the browser where you want to go. First it checks: is this the name of a website, or something you want to search for?',
      fact: 'URL is short for Uniform Resource Locator. That is a very long way to say "address".',
    },
    pro: {
      title: 'Parse the input',
      text: 'The browser decides whether the text is a URL or a search query, then splits the URL into scheme, host, port and path. Addresses typed without a scheme are tried over HTTPS first.',
      points: [
        'Not a URL? The text goes to the default search engine instead.',
        'HSTS: if the site is on the preload list, or sent Strict-Transport-Security before, http:// becomes https:// before anything leaves the device.',
        'Names with non-ASCII letters become Punycode: bücher.de is sent as xn--bcher-kva.de.',
        'The port is implied: 443 for https, 80 for http.',
      ],
      tip: 'Mention HSTS. It explains why the very first request is already HTTPS.',
    },
    ms: 7000,
  },
  {
    id: 'cache',
    act: 'find',
    name: 'Browser cache',
    kid: {
      title: 'Look in the pocket',
      text: 'Before going anywhere, the browser checks if it kept a copy from last time. If it did, it can skip the whole trip!',
      fact: 'The back button feels instant because the browser often keeps the whole page frozen in memory.',
    },
    pro: {
      title: 'Check the caches',
      text: 'Before touching the network, the browser checks the back/forward cache, a registered service worker, then the HTTP cache in memory and on disk. A fresh hit skips the network entirely.',
      points: [
        'Cache-Control: max-age says how long a copy stays fresh. After that the browser revalidates with ETag or Last-Modified, and may get a tiny 304 Not Modified.',
        'A service worker sits in the middle and can answer from its own cache. That is how offline apps work.',
        'HTML is usually revalidated on every visit. Files with a hash in their name can be cached for a year.',
      ],
      tip: 'Separate "fresh" (no request at all) from "revalidated" (a request that returns 304).',
    },
    ms: 6000,
  },
  {
    id: 'dns',
    act: 'find',
    name: 'DNS lookup',
    kid: {
      title: 'Find the address',
      text: 'Computers find each other by number, not by name. So the browser asks a giant phone book: what is the number for {host}?',
      fact: 'There are only 13 root server names in the whole world, but they are copied to more than a thousand places.',
    },
    pro: {
      title: 'Resolve the name (DNS)',
      text: 'The browser checks its own cache, then the operating system, then asks a recursive resolver. On a miss the resolver walks the tree: a root server, then the {tld} servers, then the authoritative name server for {zone}, which returns the IP address.',
      points: [
        'Every answer carries a TTL, so each layer caches it. Most lookups never reach the root.',
        'An A record holds an IPv4 address, AAAA holds IPv6. A CNAME points one name at another, often a CDN.',
        'Lookups usually travel over UDP port 53, or encrypted as DNS over HTTPS (DoH).',
        'Pages can start lookups early with <link rel="dns-prefetch"> or preconnect.',
      ],
      sample: '$ dig {host} A\n\n;; ANSWER SECTION:\n{host}.  300  IN  A  {ip}',
      tip: 'Say "recursive resolver" and "authoritative name server", and mention TTL caching at every layer.',
    },
    ms: 9500,
  },
  {
    id: 'tcp',
    act: 'meet',
    name: 'TCP handshake',
    kid: {
      title: 'Knock on the door',
      text: 'Now the browser knows where the shop is. It knocks: "Can we talk?" The shop says "Yes! Can you hear me?" And the browser says "Yes!"',
      fact: 'A message from New York to London and back takes about 70 milliseconds, even at the speed of light.',
    },
    pro: {
      title: 'Open a connection (TCP)',
      text: 'A three-way handshake: SYN, SYN-ACK, ACK. It costs one full round trip before any data moves, which is why distance matters so much.',
      points: [
        'TCP gives an ordered, reliable stream: lost packets are sent again and pieces are put back in order.',
        'New connections start slow (slow start) and speed up as packets get through, so the first few kilobytes matter most.',
        'HTTP/2 shares one connection for every file. HTTP/3 runs on QUIC over UDP and merges this handshake with the next one.',
      ],
      sample: '→ SYN        seq=x\n← SYN, ACK   seq=y  ack=x+1\n→ ACK        ack=y+1',
      tip: 'Tie it to latency: one handshake is one round trip, so a CDN close to the user makes it cheaper.',
    },
    ms: 7000,
  },
  {
    id: 'tls',
    act: 'meet',
    name: 'TLS handshake',
    kid: {
      title: 'Agree on a secret code',
      text: 'Next they agree on a secret code, so nobody in the middle can read their notes. The shop shows an ID card, and the browser checks that someone it trusts signed it.',
      fact: 'The padlock does not mean a website is nice. It means nobody can listen in while you talk to it.',
    },
    pro: {
      title: 'Secure it (TLS 1.3)',
      text: 'ClientHello with key shares, then ServerHello, the certificate and Finished. Both sides derive the same session keys from an ephemeral Diffie-Hellman exchange. One round trip, and the padlock appears.',
      points: [
        'The certificate proves the server owns the name. The browser checks the chain up to a root authority it already trusts, plus the name and the dates.',
        'SNI says which site you want, since one IP can host many. ALPN agrees on h2 or http/1.1 in the same messages.',
        'TLS 1.2 needed two round trips. TLS 1.3 needs one, and a resumed session can send data straight away (0-RTT).',
      ],
      sample: '→ ClientHello   key share, SNI {host}, ALPN h2\n← ServerHello   key share\n← Certificate, CertificateVerify, Finished\n→ Finished',
      tip: 'Separate the two jobs: the certificate proves identity, the key exchange gives secrecy.',
    },
    ms: 9000,
  },
  {
    id: 'request',
    act: 'ask',
    name: 'HTTP request',
    kid: {
      title: 'Ask for the page',
      text: 'Inside the locked box, the browser sends a polite note: "Please may I have this page? I can read English."',
      fact: 'The note also says which browser you are. Grown-ups call that the User-Agent.',
    },
    pro: {
      title: 'Send the request (HTTP)',
      text: 'An HTTP GET for {path}, with headers that describe the client: Host, Accept, Accept-Language, Accept-Encoding and cookies. Over HTTP/2 it travels as a compressed binary HEADERS frame.',
      points: [
        'Cookies for that site ride along automatically. That is how you stay logged in.',
        'Accept-Encoding: br, gzip tells the server it may compress the answer.',
        'GET asks for something. POST sends something, like a form.',
      ],
      sample: 'GET {path} HTTP/2\nHost: {host}\nAccept: text/html\nAccept-Language: en\nAccept-Encoding: br, gzip\nCookie: cart=3',
      tip: 'Mention that cookies and caching headers travel on every request, which is why their size matters.',
    },
    ms: 6500,
  },
  {
    id: 'server',
    act: 'ask',
    name: 'Server and CDN',
    kid: {
      title: 'The shop gets it ready',
      text: 'A little copy shop near you checks if it has the page. Not this time, so it asks the main shop, which makes the page and sends it back. The copy shop keeps a copy for the next person.',
      fact: 'Big websites keep copies in hundreds of cities, so the shop is often just down the road.',
    },
    pro: {
      title: 'CDN edge and origin',
      text: 'The request lands on the nearest CDN edge. On a miss it goes on to the origin: load balancer, app server, maybe a database, then the HTML is rendered. The time until the first byte comes back is TTFB.',
      points: [
        'A CDN hit answers in a few milliseconds from a city near you. A miss pays the full trip to the origin.',
        'Cache-Control from the origin decides whether the edge may keep a copy, and for how long.',
        'The HTML can be rendered per request (SSR), built ahead of time (SSG), or a mix. Rendering strategies have their own lab, renderlab.',
      ],
      sample: 'edge near you    cache MISS, forward to origin\norigin           render page, 120 ms\nedge             store a copy, max-age=60',
      tip: 'Talk about TTFB as network time plus server time, and what a CDN changes in each.',
    },
    ms: 9000,
  },
  {
    id: 'response',
    act: 'ask',
    name: 'HTTP response',
    kid: {
      title: 'The page arrives in pieces',
      text: 'The page is too big to send in one go, so it comes in small numbered pieces. The browser puts them back in order, like a puzzle. The first piece says: "200 OK, here you go!"',
      fact: 'Each piece is called a packet. One web page can be hundreds of them.',
    },
    pro: {
      title: 'Receive the response',
      text: 'The status and headers come first: 200, Content-Type, Cache-Control, Content-Encoding. Then the compressed body in packets of about 1.4 KB. TCP puts them back in order, and the browser starts parsing before the last byte arrives.',
      points: [
        '301 and 302 send you somewhere else, and the trip starts again. 304 means your copy is still good. 404 means not found, 500 means the server broke.',
        'Content-Type: text/html tells the browser how to read the bytes.',
        'Set-Cookie stores a small note for the next request.',
      ],
      sample: 'HTTP/2 200\ncontent-type: text/html; charset=utf-8\ncontent-encoding: br\ncache-control: max-age=60\n\n<!doctype html>…',
      tip: 'Point out that the browser streams: it parses HTML while the rest is still downloading.',
    },
    ms: 7500,
  },
  {
    id: 'dom',
    act: 'build',
    name: 'DOM',
    kid: {
      title: 'Read the instructions',
      text: 'The page is really a list of instructions. The browser reads them from top to bottom and builds a family tree of blocks: a title, a picture, a button.',
      fact: 'DOM means Document Object Model. Every tag becomes one branch of the tree.',
    },
    pro: {
      title: 'Parse HTML into the DOM',
      text: 'Bytes become characters, characters become tokens, and tokens become nodes in the DOM tree, a little at a time as data streams in. A preload scanner reads ahead to fetch CSS, scripts and images early.',
      points: [
        'The DOM is a live tree that JavaScript can read and change.',
        'The preload scanner finds <link> and <img> tags in the HTML. Images added later by JavaScript are discovered late.',
        'HTML parsing forgives mistakes: unclosed tags get fixed instead of failing.',
      ],
      sample: '<html>\n  <head><link rel="stylesheet" href="style.css"></head>\n  <body>\n    <h1>Toy shop</h1>\n    <img src="robot.png">\n    <button>Add to cart</button>\n    <script src="app.js" defer></script>\n  </body>\n</html>',
      tip: 'Name the preload scanner. It is the reason resources in the HTML load faster than ones injected by JavaScript.',
    },
    ms: 8000,
  },
  {
    id: 'cssom',
    act: 'build',
    name: 'CSSOM',
    kid: {
      title: 'Pick the styles',
      text: 'Style rules say how each block should look: big, pink, round corners. The browser waits for these rules before drawing, so you never see a messy page.',
      fact: 'CSS stands for Cascading Style Sheets. Cascading means the rules flow down, like a waterfall.',
    },
    pro: {
      title: 'Build the CSSOM',
      text: 'Stylesheets are parsed into the CSSOM. The cascade, specificity and inheritance give each element its computed style. CSS is render-blocking: nothing is painted until the stylesheets in the head arrive.',
      points: [
        'Render-blocking is on purpose: it prevents a flash of unstyled content.',
        'Inline the small critical CSS and load the rest without blocking, to paint sooner.',
        'Specificity: an id beats a class, a class beats a tag, and later rules win ties.',
      ],
      sample: 'h1     { font-size: 40px; color: hotpink; }\nimg    { width: 100%; border-radius: 16px; }\nbutton { background: green; color: white; }',
      tip: 'Explain why CSS blocks rendering but images do not: styles change everything, an image only fills its box.',
    },
    ms: 7500,
  },
  {
    id: 'js',
    act: 'build',
    name: 'JavaScript',
    kid: {
      title: 'Wake up the scripts',
      text: 'Scripts are the magic that makes buttons work. A plain script makes the builder stop and wait. A polite script waits until the builder has finished reading.',
      fact: 'The first version of JavaScript was written in just 10 days, in 1995.',
    },
    pro: {
      title: 'Load and run JavaScript',
      text: 'A classic <script> blocks the parser while it downloads and runs. async downloads in parallel and runs as soon as it arrives. defer downloads in parallel and runs in order once parsing is done.',
      points: [
        'Module scripts (type="module") are deferred by default.',
        'A classic script waits for stylesheets above it, because it might read styles.',
        'Big bundles cost twice: time to download, then main-thread time to parse, compile and run.',
      ],
      sample: '<script src="a.js"></script>         blocks parsing\n<script src="b.js" async></script>   runs when it arrives\n<script src="c.js" defer></script>   runs after parsing',
      tip: 'Use defer for scripts that need the DOM, async for independent ones like analytics.',
    },
    ms: 9000,
  },
  {
    id: 'layout',
    act: 'draw',
    name: 'Layout',
    kid: {
      title: 'Measure everything',
      text: 'The browser puts the blocks and their styles together, then measures where each one goes and how big it is. Make the window smaller and it measures again.',
      fact: 'Every time you resize a window, the browser measures the whole page again.',
    },
    pro: {
      title: 'Render tree and layout',
      text: 'The DOM and the CSSOM combine into the render tree, which keeps only what is visible, so display: none is skipped. Layout computes the exact position and size of every box. Changing geometry later triggers a reflow.',
      points: [
        'One width change can move everything after it, and layout runs on the main thread.',
        'Reading layout (offsetHeight) right after writing styles forces a synchronous layout. Doing it in a loop is layout thrashing.',
        'Give images width and height, or an aspect-ratio, so they do not shift the page when they load (CLS).',
      ],
      tip: 'Know which properties trigger layout (width, top, font-size) and which do not (transform, opacity).',
    },
    ms: 8000,
  },
  {
    id: 'paint',
    act: 'draw',
    name: 'Paint',
    kid: {
      title: 'Colour it in',
      text: 'Now it colours everything in: the words, the colours, the pictures. Like a colouring book where the lines are already drawn.',
      fact: 'Your screen draws a new picture about 60 times a second. That gives the browser about 16 milliseconds for each one.',
    },
    pro: {
      title: 'Paint',
      text: 'Paint turns every box into drawing commands, backgrounds, borders, text and images in stacking order. Raster then turns those commands into pixels, tile by tile.',
      points: [
        'Changing a colour repaints without layout. Changing a size needs layout and paint.',
        'Large blurs and shadows are expensive to paint.',
        'First Contentful Paint (FCP) is the moment the first text or image shows up.',
      ],
      tip: 'Connect it to metrics: FCP and LCP both happen at a paint.',
    },
    ms: 6500,
  },
  {
    id: 'composite',
    act: 'draw',
    name: 'Compositing',
    kid: {
      title: 'Stack the layers',
      text: 'Some parts are drawn on see-through sheets and stacked together. Sliding a sheet around is super fast, so animations stay smooth.',
      fact: 'Cartoon makers used the same trick: characters painted on clear sheets over a background.',
    },
    pro: {
      title: 'Composite on the GPU',
      text: 'The page is split into layers that are rastered, then combined by the GPU on a separate compositor thread. Animating transform or opacity only re-composites, skipping layout and paint.',
      points: [
        'Scrolling and transform or opacity animations stay smooth even while the main thread is busy.',
        'will-change: transform gives an element its own layer. Too many layers cost GPU memory.',
        'Cheapest to most expensive: composite only, then paint, then layout.',
      ],
      tip: 'This is why you animate transform instead of left or top.',
    },
    ms: 8000,
  },
  {
    id: 'interactive',
    act: 'play',
    name: 'Event loop',
    kid: {
      title: 'Ready to play',
      text: 'The page is ready! When you tap, the browser does one job at a time, very fast. If one job takes too long, everyone else has to wait in line.',
      fact: 'All of this usually happens in about a second, and you never even notice.',
    },
    pro: {
      title: 'Interactive: the event loop',
      text: 'DOMContentLoaded fires once the HTML is parsed and deferred scripts have run, and load fires when images and other files finish. From then on, input goes through the event loop: one task at a time on the main thread, microtasks after each task, then rendering.',
      points: [
        'Tasks longer than 50 ms are long tasks. They delay input and hurt INP (Interaction to Next Paint).',
        'Pages rendered on the server must hydrate before clicks work.',
        'Break big work up with scheduler.yield() or setTimeout, or move it to a Web Worker.',
      ],
      sample: 'task       click handler     12 ms\nmicrotask  promise callback   1 ms\nrender     style, layout, paint\ntask       timer              3 ms',
      tip: 'Finish with INP: a slow handler is what people feel, even when the page loaded fast.',
    },
    ms: 9500,
  },
];

export const STEP_INDEX: Record<StepId, number> = Object.fromEntries(STEPS.map((s, i) => [s.id, i])) as Record<StepId, number>;

export function actOf(stepIndex: number): Act {
  return ACTS.find((a) => a.id === STEPS[stepIndex].act)!;
}

export function firstStepOf(act: ActId): number {
  return STEPS.findIndex((s) => s.act === act);
}

export function fill(text: string, d: Destination): string {
  return text
    .replaceAll('{host}', d.host)
    .replaceAll('{ip}', d.ip)
    .replaceAll('{path}', d.path)
    .replaceAll('{tld}', d.tld)
    .replaceAll('{zone}', d.zone);
}

export const TOTAL_MS = STEPS.reduce((sum, s) => sum + s.ms, 0);
