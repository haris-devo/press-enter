# Press Enter

**What happens when you type a URL and press Enter?** Fifteen animated steps from the address bar to a finished page, explained simply enough for a five-year-old, with an engineer mode for interviews.

**Live:** https://haris-devo.github.io/press-enter/

![Press Enter](public/og.png)

## What's inside

- **The trip.** Type any address (or a search) and watch the journey play like a short film: URL parsing, the browser cache, DNS, the TCP and TLS handshakes, the HTTP request, the CDN and origin, the response in packets, the DOM, the CSSOM, async and defer scripts, layout, paint, compositing and the event loop. Pause, scrub and replay any step.
- **Two voices.** *Like I'm 5* tells it with a toy shop, a phone book and a secret code. *Like an engineer* adds the real names, the raw messages (`dig`, the TLS handshake, the HTTP request and response) and what to say in an interview.
- **Speed lab.** Move the shop, change the network, add a CDN, HTTP/3 or a return visit, and see which part of the trip dominates. It counts round trips, so the latency-versus-bandwidth lesson is visible.
- **Your real trip.** The page reads your own browser's Navigation Timing for this visit: DNS, connect, TLS, time to first byte, download, parse and first paint, plus the protocol and the CDN edge that answered.
- **The order game.** Eight shuffled cards; a wrong pick explains why it is too early.
- **Interview answer.** A one-minute answer in six parts and the follow-ups that usually come next.

## How it's built

Vite, React 19 and TypeScript, with no UI or animation libraries. Every scene is a pure function of time (`t` from 0 to 1) drawn in SVG, so the player can pause, scrub and prerender any frame. The page is prerendered at build time and hydrated in the browser. Type is Google Sans Flex (with its rounded axis) and Google Sans Code, self-hosted.

```
src/engine/   content and logic, no React: the journey, the speed model, Navigation Timing, the game
src/scenes/   the fifteen animated scenes and their drawing kit
src/components/  one component and stylesheet per section
```

The speed lab is a model with round numbers (`src/engine/trip.ts`) and its lessons are covered by tests. Use your browser's dev tools or WebPageTest for real measurements.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # typecheck, build, prerender into dist/
```

`review.html` (dev server only) shows every scene at several moments side by side: `/review.html?steps=2,3&t=0.3,0.6,1&mode=pro`.

Part of a series on frontend system design. Also see [renderlab](https://haris-devo.github.io/renderlab/), on rendering strategies.

## License

MIT
