import type { ActId } from './journey';

/** "What happens when you type a URL and press Enter?" The answer, and what gets asked next. */

export const ANSWER: { act: ActId; text: string }[] = [
  {
    act: 'find',
    text: 'The browser parses the input, decides it is a URL, applies HSTS, and checks its caches. Then it resolves the host through DNS: browser and OS caches, a recursive resolver, and on a miss the root, TLD and authoritative name servers.',
  },
  {
    act: 'meet',
    text: 'It opens a TCP connection, one round trip, then runs a TLS 1.3 handshake, one more, verifying the certificate chain against trusted roots. HTTP/3 over QUIC folds both into a single round trip.',
  },
  {
    act: 'ask',
    text: 'It sends an HTTP GET with headers and cookies. A CDN edge answers from cache or forwards to the origin, which renders the HTML. The response streams back: status, headers, then the compressed body.',
  },
  {
    act: 'build',
    text: 'The parser builds the DOM as bytes arrive while the preload scanner fetches CSS, scripts and images. CSS becomes the CSSOM and blocks rendering; classic scripts block parsing unless they are async or defer.',
  },
  {
    act: 'draw',
    text: 'The DOM and CSSOM form the render tree, then layout computes geometry, paint records drawing commands, and the compositor rasters layers and draws them on the GPU.',
  },
  {
    act: 'play',
    text: 'Scripts run, DOMContentLoaded and load fire, and the event loop handles input one task at a time. Short tasks keep the page responsive, which is what INP measures.',
  },
];

export const FOLLOW_UPS: { q: string; a: string }[] = [
  {
    q: 'What is different on the second visit?',
    a: 'Most steps get skipped. DNS is cached until its TTL runs out. An idle connection may still be open, and TLS can resume a session. Hashed CSS and JS come straight from the HTTP cache, and the HTML is revalidated with ETag, often a tiny 304. The back button can restore the whole page from the back/forward cache.',
  },
  {
    q: 'What happens if the DNS lookup fails?',
    a: 'The resolver returns NXDOMAIN, or the lookup times out, and the browser shows its own error page. Negative answers are cached too, for the time the zone says, so a fixed record can take a little while to be seen.',
  },
  {
    q: 'HTTP/1.1, HTTP/2 and HTTP/3: what changes?',
    a: 'HTTP/1.1 sends one request at a time per connection, so browsers open about six per host. HTTP/2 multiplexes many streams on one TCP connection, but a lost packet still stalls them all. HTTP/3 runs on QUIC over UDP: streams are independent, the handshake is combined with TLS, and connections survive network changes.',
  },
  {
    q: 'Why is CSS render-blocking, but images are not?',
    a: 'Styles can change every box on the page, so painting without them would show unstyled content and waste a layout. An image only fills its own box. Give images a size so they do not shift the page when they arrive.',
  },
  {
    q: 'async or defer?',
    a: 'Both download in parallel with parsing. async runs as soon as it arrives, in any order, which suits independent scripts like analytics. defer runs after parsing, in document order, which suits code that needs the DOM. Module scripts are deferred by default.',
  },
  {
    q: 'Reflow, repaint, composite: which is cheapest?',
    a: 'Composite only is cheapest: transform and opacity skip layout and paint. A colour change needs paint. A change to size or position needs layout, then paint, then composite. That is why animations should use transform and opacity.',
  },
  {
    q: 'Where do redirects fit in?',
    a: 'Each redirect restarts the trip for the new URL, which can mean another DNS lookup, connection and handshake. Avoid chains, and use HSTS preload so http:// is upgraded inside the browser instead of by a redirect.',
  },
  {
    q: 'How would you make the first visit faster?',
    a: 'Cut round trips and bytes. Serve from a CDN, enable HTTP/3 and Brotli, preconnect to critical third parties, inline critical CSS, defer scripts, preload the LCP image with fetchpriority="high", and cache hashed assets for a year. Then measure with field data, not only Lighthouse.',
  },
];
