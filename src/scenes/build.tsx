import { PAL, Txt, Pill, Bubble, Check, seg, lerp, easeOut, pop, fadeIn, along, textWidth, type SceneProps } from './kit';

/* The same little document is used in all three build scenes. */

interface TreeNode {
  id: string;
  x: number;
  y: number;
  kid: string;
  pro: string;
  parent: string | null;
  line: number;
}

const NODES: TreeNode[] = [
  { id: 'html', x: 560, y: 92, kid: 'page', pro: 'html', parent: null, line: 0 },
  { id: 'head', x: 444, y: 190, kid: 'notes', pro: 'head', parent: 'html', line: 1 },
  { id: 'body', x: 664, y: 190, kid: 'body', pro: 'body', parent: 'html', line: 2 },
  { id: 'link', x: 444, y: 292, kid: 'styles', pro: 'link', parent: 'head', line: 1 },
  { id: 'h1', x: 568, y: 292, kid: 'title', pro: 'h1', parent: 'body', line: 3 },
  { id: 'img', x: 664, y: 292, kid: 'picture', pro: 'img', parent: 'body', line: 4 },
  { id: 'button', x: 756, y: 292, kid: 'button', pro: 'button', parent: 'body', line: 5 },
  { id: 'script', x: 664, y: 388, kid: 'magic', pro: 'script', parent: 'body', line: 6 },
];

const CODE = [
  '<html>',
  '  <head><link href="style.css">',
  '  <body>',
  '    <h1>Toy shop</h1>',
  '    <img src="robot.png">',
  '    <button>Add to cart</button>',
  '    <script src="app.js" defer>',
];

interface NodeStyle {
  fill: string;
  text: string;
  stroke: string;
  rx?: number;
}

function Tree({
  shown,
  kid,
  styleOf,
  only,
}: {
  shown: (n: TreeNode) => number;
  kid: boolean;
  styleOf?: (n: TreeNode) => NodeStyle | null;
  only?: string[];
}) {
  const list = only ? NODES.filter((n) => only.includes(n.id)) : NODES;
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <g>
      {list.map((n) => {
        if (!n.parent) return null;
        const p = byId[n.parent];
        const o = shown(n);
        if (o <= 0) return null;
        const k = easeOut(o);
        return (
          <path
            key={`e-${n.id}`}
            d={`M ${p.x} ${p.y + 18} C ${p.x} ${p.y + 50}, ${n.x} ${n.y - 50}, ${lerp(p.x, n.x, k)} ${lerp(p.y + 18, n.y - 18, k)}`}
            fill="none"
            stroke={PAL.line2}
            strokeWidth={2.5}
            strokeDasharray={n.id === 'script' ? '4 6' : undefined}
          />
        );
      })}
      {list.map((n) => {
        const o = shown(n);
        if (o <= 0) return null;
        const label = kid ? n.kid : `<${n.pro}>`;
        const size = kid ? 17 : 16;
        const w = textWidth(label, size) * (kid ? 1 : 1.1) + 26;
        const st = styleOf?.(n) ?? { fill: PAL.white, text: PAL.ink, stroke: PAL.build };
        return (
          <g key={n.id} transform={`translate(${n.x} ${n.y}) scale(${pop(o)})`}>
            <rect x={-w / 2} y={-18} width={w} height={36} rx={st.rx ?? 18} fill={st.fill} stroke={st.stroke} strokeWidth={2.5} />
            <Txt x={0} y={1} size={size} fill={st.text} mono={!kid} weight={600}>
              {label}
            </Txt>
          </g>
        );
      })}
    </g>
  );
}

function CodeCard({ t, reader, kid }: { t: number; reader: number; kid: boolean }) {
  return (
    <g>
      <rect x={28} y={64} width={348} height={350} rx={20} fill={PAL.white} stroke={PAL.ink} strokeWidth={2.5} />
      <Txt x={52} y={92} size={14} anchor="start" weight={620} fill={PAL.ink3}>
        {kid ? 'The instructions' : 'index.html'}
      </Txt>
      {reader >= 0 && reader < CODE.length && <rect x={40} y={110 + reader * 42} width={324} height={34} rx={10} fill={PAL.buildSoft} />}
      {CODE.map((line, i) => (
        <Txt key={i} x={52} y={127 + i * 42} size={14} anchor="start" mono weight={500} fill={i <= reader || t >= 0.99 ? PAL.ink : PAL.ink3}>
          {line}
        </Txt>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ 9. Read the instructions (DOM) */

export function DomScene({ t, mode }: SceneProps) {
  const kid = mode === 'kid';
  const read = seg(t, 0.06, 0.76);
  const reader = t < 0.06 ? -1 : Math.min(CODE.length - 1, Math.floor(read * CODE.length));
  const lineTime = (line: number) => 0.06 + (line / CODE.length) * 0.7;
  const shown = (n: TreeNode) => fadeIn(t, lineTime(n.line) + 0.02, 0.06);

  // The preload scanner reads ahead and starts downloads before the parser gets there.
  const ahead = [
    { line: 1, name: 'style.css', to: [470, 446] as [number, number] },
    { line: 4, name: 'robot.png', to: [600, 446] as [number, number] },
    { line: 6, name: 'app.js', to: [720, 446] as [number, number] },
  ];

  return (
    <g>
      <CodeCard t={t} reader={reader} kid={kid} />
      <Tree shown={shown} kid={kid} />
      {ahead.map((a, i) => {
        const k = seg(t, 0.12 + i * 0.05, 0.3 + i * 0.05);
        if (k <= 0) return null;
        const [x, y] = along([340, 127 + a.line * 42], a.to, k, -20);
        return <Pill key={a.name} x={x} y={y} text={a.name} color={PAL.find} bg={PAL.findSoft} size={14} mono o={Math.min(1, k * 4) * (1 - seg(t, 0.62, 0.68))} />;
      })}
      <Pill x={202} y={446} text={kid ? 'Spotted early: fetch these now!' : 'Preload scanner: fetch early'} o={fadeIn(t, 0.14, 0.04) * (1 - seg(t, 0.62, 0.68))} bg={PAL.find} color={PAL.white} size={15} />
      <Bubble x={560} y={444} text={kid ? 'A family tree of blocks!' : 'DOM tree built while bytes stream in'} o={fadeIn(t, 0.86, 0.05)} tail="none" size={17} />
    </g>
  );
}

/* ------------------------------------------------------------------ 10. Pick the styles (CSSOM) */

export function CssomScene({ t, mode }: SceneProps) {
  const kid = mode === 'kid';
  const rules = [
    { node: 'h1', y: 120, kid: 'Title: big and pink', pro: 'h1 { color: hotpink }', color: PAL.draw, soft: PAL.drawSoft },
    { node: 'img', y: 222, kid: 'Picture: round corners', pro: 'img { border-radius: 16px }', color: PAL.find, soft: PAL.findSoft },
    { node: 'button', y: 324, kid: 'Button: green', pro: 'button { background: green }', color: PAL.play, soft: PAL.playSoft },
  ];
  const appear = (i: number) => fadeIn(t, 0.06 + i * 0.16, 0.06);
  const drop = (i: number) => seg(t, 0.14 + i * 0.16, 0.26 + i * 0.16);
  const ready = fadeIn(t, 0.78, 0.05);
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <g>
      {rules.map((r, i) => {
        const o = appear(i);
        if (o <= 0) return null;
        return (
          <g key={r.node} opacity={o} transform={`translate(${-20 * (1 - easeOut(o))} 0)`}>
            <rect x={28} y={r.y - 38} width={330} height={76} rx={18} fill={PAL.white} stroke={r.color} strokeWidth={2.5} />
            <rect x={44} y={r.y - 14} width={28} height={28} rx={8} fill={r.color} />
            <Txt x={88} y={r.y} size={kid ? 18 : 15} anchor="start" mono={!kid} weight={560}>
              {kid ? r.kid : r.pro}
            </Txt>
          </g>
        );
      })}
      {rules.map((r, i) => {
        const k = drop(i);
        if (k <= 0 || k >= 1) return null;
        const n = byId[r.node];
        const [x, y] = along([358, r.y], [n.x, n.y - 24], k, 50);
        return <circle key={r.node} cx={x} cy={y} r={9} fill={r.color} />;
      })}

      <Tree
        kid={kid}
        only={['html', 'head', 'body', 'link', 'h1', 'img', 'button']}
        shown={() => 1}
        styleOf={(n) => {
          const i = rules.findIndex((r) => r.node === n.id);
          if (i < 0 || drop(i) < 1) return null;
          const r = rules[i];
          if (n.id === 'img') return { fill: r.soft, text: r.color, stroke: r.color, rx: 8 };
          return { fill: r.color, text: PAL.white, stroke: r.color };
        }}
      />

      {/* the browser will not draw until styles are ready */}
      <g transform="translate(560 410)">
        <rect x={-190} y={-26} width={380} height={52} rx={26} fill={PAL.white} stroke={ready > 0 ? PAL.good : PAL.line2} strokeWidth={2} />
        <circle cx={-160} cy={0} r={10} fill={ready > 0 ? PAL.good : PAL.bad} />
        <Txt x={-138} y={1} size={16} anchor="start" weight={560}>
          {ready > 0 ? (kid ? 'Styles ready: time to draw!' : 'CSSOM ready: rendering can start') : kid ? 'Waiting for styles before drawing' : 'Render-blocking: paint waits for CSS'}
        </Txt>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ 11. Wake up the scripts (async and defer) */

type Seg = [number, number];
interface Lane {
  title: { kid: string; pro: string };
  sub: { kid: string; pro: string };
  parse: Seg[];
  download: Seg;
  run: Seg;
  blocked?: Seg;
  done: number;
}

const LANES: Lane[] = [
  {
    title: { kid: 'Plain script', pro: '<script>' },
    sub: { kid: 'Stops and waits', pro: 'blocks the parser' },
    parse: [
      [0, 0.25],
      [0.58, 0.88],
    ],
    download: [0.25, 0.48],
    run: [0.48, 0.58],
    blocked: [0.25, 0.48],
    done: 0.88,
  },
  {
    title: { kid: 'async script', pro: '<script async>' },
    sub: { kid: 'Runs when it arrives', pro: 'runs on arrival' },
    parse: [
      [0, 0.33],
      [0.43, 0.65],
    ],
    download: [0.1, 0.33],
    run: [0.33, 0.43],
    done: 0.65,
  },
  {
    title: { kid: 'defer script', pro: '<script defer>' },
    sub: { kid: 'Runs after reading', pro: 'runs after parsing' },
    parse: [[0, 0.55]],
    download: [0.1, 0.33],
    run: [0.55, 0.65],
    done: 0.65,
  },
];

export function JsScene({ t, mode }: SceneProps) {
  const kid = mode === 'kid';
  const x0 = 236;
  const w = 534;
  const cur = seg(t, 0.04, 0.86);
  const X = (u: number) => x0 + u * w;
  const bar = (s: Seg, y: number, h: number, fill: string, key: string) => {
    const end = Math.min(s[1], cur);
    if (end <= s[0]) return null;
    return <rect key={key} x={X(s[0])} y={y} width={X(end) - X(s[0])} height={h} rx={h / 2} fill={fill} />;
  };

  return (
    <g>
      <defs>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill={PAL.paper2} />
          <rect width="3" height="8" fill={PAL.line2} />
        </pattern>
      </defs>
      {LANES.map((lane, i) => {
        const y = 110 + i * 112;
        const finished = cur >= lane.done;
        return (
          <g key={i}>
            <Txt x={30} y={y - 6} size={18} anchor="start" weight={620} mono={!kid}>
              {kid ? lane.title.kid : lane.title.pro}
            </Txt>
            <Txt x={30} y={y + 20} size={14} anchor="start" fill={PAL.ink2}>
              {kid ? lane.sub.kid : lane.sub.pro}
            </Txt>
            <rect x={x0} y={y - 16} width={w} height={22} rx={11} fill={PAL.paper2} />
            {lane.blocked && bar(lane.blocked, y - 16, 22, 'url(#hatch)', 'b')}
            {lane.parse.map((s, k) => bar(s, y - 16, 22, PAL.build, `p${k}`))}
            {bar(lane.run, y - 16, 22, PAL.draw, 'r')}
            {bar(lane.download, y + 12, 10, PAL.find, 'd')}
            {lane.blocked && cur > lane.blocked[0] + 0.04 && cur < lane.blocked[1] && (
              <Txt x={X((lane.blocked[0] + Math.min(cur, lane.blocked[1])) / 2)} y={y - 5} size={13} weight={620} fill={PAL.ink2}>
                {kid ? 'waiting' : 'blocked'}
              </Txt>
            )}
            {finished && (
              <g>
                <Check x={X(lane.done) + 2} y={y - 5} r={13} o={seg(cur, lane.done, lane.done + 0.04)} color={i === 0 ? PAL.ink3 : PAL.good} />
                <Txt x={X(lane.done)} y={y + 40} size={13} weight={560} fill={PAL.ink2}>
                  {kid ? 'done' : 'DOMContentLoaded'}
                </Txt>
              </g>
            )}
          </g>
        );
      })}

      {/* the clock hand */}
      <path d={`M ${X(cur)} 70 L ${X(cur)} 372`} stroke={PAL.ink} strokeWidth={2} strokeDasharray="2 5" />
      <Txt x={X(cur)} y={56} size={13} weight={600} fill={PAL.ink2}>
        {kid ? 'time' : 'time →'}
      </Txt>

      {/* legend */}
      <g transform="translate(40 418)">
        {[
          { fill: PAL.build, kid: 'Reading the page', pro: 'Parse HTML' },
          { fill: PAL.find, kid: 'Fetching the script', pro: 'Download' },
          { fill: PAL.draw, kid: 'Running it', pro: 'Execute' },
          { fill: 'url(#hatch)', kid: 'Waiting', pro: 'Parser blocked' },
        ].map((l, i) => (
          <g key={i} transform={`translate(${i * 186} 0)`}>
            <rect x={0} y={-8} width={26} height={16} rx={8} fill={l.fill} />
            <Txt x={36} y={0} size={15} anchor="start" fill={PAL.ink2}>
              {kid ? l.kid : l.pro}
            </Txt>
          </g>
        ))}
      </g>
      <Pill x={400} y={30} text={kid ? 'Polite scripts never make the builder wait' : 'Prefer defer, or type="module"'} o={fadeIn(t, 0.9, 0.05)} bg={PAL.ink} color={PAL.white} size={15} />
    </g>
  );
}
