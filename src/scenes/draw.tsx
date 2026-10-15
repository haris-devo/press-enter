import { useId } from 'react';
import { PAL, Txt, Pill, Check, seg, lerp, ease, easeOut, fadeIn, type SceneProps } from './kit';

/* A tiny page, laid out wide (picture beside text) or narrow (picture on top). */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PageBoxes {
  header: Box;
  img: Box;
  title: Box;
  lines: Box[];
  button: Box;
}

function wideLayout(iw: number): PageBoxes {
  const tx = iw * 0.46 + 22;
  const tw = iw - tx;
  return {
    header: { x: 0, y: 0, w: iw, h: 30 },
    img: { x: 0, y: 46, w: iw * 0.46, h: 168 },
    title: { x: tx, y: 52, w: tw * 0.78, h: 26 },
    lines: [0, 1, 2].map((i) => ({ x: tx, y: 96 + i * 20, w: tw * [1, 0.88, 0.62][i], h: 9 })),
    button: { x: tx, y: 168, w: 132, h: 42 },
  };
}

function narrowLayout(iw: number): PageBoxes {
  return {
    header: { x: 0, y: 0, w: iw, h: 30 },
    img: { x: 0, y: 46, w: iw, h: 108 },
    title: { x: 0, y: 170, w: iw * 0.8, h: 24 },
    lines: [0, 1, 2].map((i) => ({ x: 0, y: 208 + i * 18, w: iw * [1, 0.88, 0.62][i], h: 8 })),
    button: { x: 0, y: 270, w: 132, h: 40 },
  };
}

const mixBox = (a: Box, b: Box, p: number): Box => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });

function mix(a: PageBoxes, b: PageBoxes, p: number): PageBoxes {
  return {
    header: mixBox(a.header, b.header, p),
    img: mixBox(a.img, b.img, p),
    title: mixBox(a.title, b.title, p),
    lines: a.lines.map((l, i) => mixBox(l, b.lines[i], p)),
    button: mixBox(a.button, b.button, p),
  };
}

function Frame({ cx, top, w, h }: { cx: number; top: number; w: number; h: number }) {
  return (
    <g>
      <rect x={cx - w / 2} y={top} width={w} height={h} rx={18} fill={PAL.white} stroke={PAL.ink} strokeWidth={2.5} />
      <path d={`M ${cx - w / 2} ${top + 26} L ${cx + w / 2} ${top + 26}`} stroke={PAL.ink} strokeWidth={2.5} />
      <circle cx={cx - w / 2 + 16} cy={top + 13} r={3.6} fill={PAL.draw} />
      <circle cx={cx - w / 2 + 28} cy={top + 13} r={3.6} fill={PAL.build} />
      <circle cx={cx - w / 2 + 40} cy={top + 13} r={3.6} fill={PAL.play} />
    </g>
  );
}

function Robot({ b }: { b: Box }) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2 + 6;
  const s = Math.min(b.w, b.h) / 150;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <path d="M 0 -62 V -46" stroke={PAL.ink} strokeWidth={4} />
      <circle cx={0} cy={-66} r={7} fill={PAL.draw} />
      <rect x={-40} y={-46} width={80} height={60} rx={16} fill={PAL.white} stroke={PAL.ink} strokeWidth={4} />
      <circle cx={-15} cy={-18} r={7} fill={PAL.ink} />
      <circle cx={15} cy={-18} r={7} fill={PAL.ink} />
      <path d="M -10 0 H 10" stroke={PAL.ink} strokeWidth={4} strokeLinecap="round" />
      <rect x={-30} y={18} width={60} height={36} rx={10} fill={PAL.build} stroke={PAL.ink} strokeWidth={4} />
    </g>
  );
}

function Dim({ x1, x2, y, label, o }: { x1: number; x2: number; y: number; label: string; o: number }) {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <path d={`M ${x1} ${y - 6} V ${y + 6} M ${x2} ${y - 6} V ${y + 6} M ${x1} ${y} H ${x2}`} stroke={PAL.draw} strokeWidth={2} />
      <Pill x={(x1 + x2) / 2} y={y} text={label} color={PAL.draw} bg={PAL.white} stroke={PAL.draw} size={13} mono />
    </g>
  );
}

/* ------------------------------------------------------------------ 12. Measure everything (layout) */

export function LayoutScene({ t, mode }: SceneProps) {
  const kid = mode === 'kid';
  const squeeze = ease(seg(t, 0.56, 0.82));
  const fw = lerp(600, 340, squeeze);
  const fh = lerp(300, 380, squeeze);
  const top = lerp(90, 56, squeeze);
  const iw = fw - 48;
  const boxes = mix(wideLayout(552), narrowLayout(292), squeeze);
  const ox = 400 - fw / 2 + 24;
  const oy = top + 44;
  const at = (b: Box): Box => ({ x: ox + b.x, y: oy + b.y, w: b.w, h: b.h });
  const list: { b: Box; key: string; a: number }[] = [
    { b: boxes.header, key: 'header', a: 0.03 },
    { b: boxes.img, key: 'img', a: 0.07 },
    { b: boxes.title, key: 'title', a: 0.11 },
    ...boxes.lines.map((b, i) => ({ b, key: `l${i}`, a: 0.14 + i * 0.02 })),
    { b: boxes.button, key: 'button', a: 0.2 },
  ];
  const guides = fadeIn(t, 0.26, 0.06) * (1 - seg(t, 0.52, 0.56)) + fadeIn(t, 0.84, 0.05);
  const img = at(boxes.img);
  const btn = at(boxes.button);
  const px = (n: number) => `${Math.round(n * 2)}px`;

  return (
    <g>
      <Frame cx={400} top={top} w={fw} h={fh} />
      {list.map(({ b, key, a }) => {
        const o = fadeIn(t, a, 0.05);
        if (o <= 0) return null;
        const r = at(b);
        return (
          <rect
            key={key}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx={key === 'button' ? r.h / 2 : key.startsWith('l') ? 4.5 : 10}
            fill={PAL.drawSoft}
            stroke={PAL.draw}
            strokeWidth={2}
            strokeDasharray="5 5"
            opacity={o}
          />
        );
      })}
      <Dim x1={img.x + 8} x2={img.x + img.w - 8} y={img.y + img.h / 2} label={`${px(img.w)} × ${px(img.h)}`} o={guides} />
      <Dim x1={btn.x} x2={btn.x + btn.w} y={btn.y - 16} label={px(btn.w)} o={guides} />
      <Txt x={ox + iw / 2} y={top + 13} size={13} fill={PAL.ink3} weight={600}>
        {`window ${px(fw)}`}
      </Txt>
      <Pill x={400} y={30} text={kid ? 'The window got smaller: measure again!' : 'Viewport resized: reflow'} o={fadeIn(t, 0.54, 0.04) * (1 - seg(t, 0.84, 0.88))} bg={PAL.draw} color={PAL.white} size={15} />
      <Pill x={400} y={30} text={kid ? 'Every block has its place' : 'Layout: exact position and size of every box'} o={fadeIn(t, 0.88, 0.05)} bg={PAL.ink} color={PAL.white} size={15} />
    </g>
  );
}

/* ------------------------------------------------------------------ 13. Colour it in (paint) */

export function PaintScene({ t, mode }: SceneProps) {
  const kid = mode === 'kid';
  const id = useId().replace(/:/g, '');
  const fw = 600;
  const top = 80;
  const boxes = wideLayout(552);
  const ox = 400 - fw / 2 + 24;
  const oy = top + 44;
  const at = (b: Box): Box => ({ x: ox + b.x, y: oy + b.y, w: b.w, h: b.h });
  const header = at(boxes.header);
  const img = at(boxes.img);
  const title = at(boxes.title);
  const lines = boxes.lines.map(at);
  const button = at(boxes.button);

  const parts = [
    { key: 'header', box: header, a: 0.04, b: 0.16 },
    { key: 'img', box: img, a: 0.18, b: 0.38 },
    { key: 'title', box: title, a: 0.4, b: 0.5 },
    { key: 'lines', box: { x: lines[0].x, y: lines[0].y, w: lines[0].w, h: lines[2].y + lines[2].h - lines[0].y }, a: 0.52, b: 0.66 },
    { key: 'button', box: button, a: 0.68, b: 0.8 },
  ];
  const progress = (k: string) => {
    const p = parts.find((q) => q.key === k)!;
    return easeOut(seg(t, p.a, p.b));
  };
  const painting = parts.find((p) => t >= p.a && t <= p.b);
  const brush = painting
    ? (() => {
        const k = seg(t, painting.a, painting.b);
        const b = painting.box;
        const rowY = b.y + b.h * (0.25 + 0.5 * ((Math.floor(k * 6) % 2) === 0 ? k : 1 - k));
        return { x: b.x + b.w * easeOut(k), y: rowY };
      })()
    : null;

  const clip = (k: string, b: Box) => (
    <clipPath id={`${id}-${k}`}>
      <rect x={b.x - 2} y={b.y - 2} width={(b.w + 4) * progress(k)} height={b.h + 4} />
    </clipPath>
  );

  return (
    <g>
      <defs>
        {parts.map((p) => (
          <g key={p.key}>{clip(p.key, p.box)}</g>
        ))}
      </defs>
      <Frame cx={400} top={top} w={fw} h={300} />
      {/* outlines still waiting for paint */}
      {[header, img, title, ...lines, button].map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={i === 0 ? 10 : i === 7 ? b.h / 2 : i > 2 ? 4.5 : 10} fill="none" stroke={PAL.line2} strokeWidth={2} strokeDasharray="5 5" />
      ))}

      <g clipPath={`url(#${id}-header)`}>
        <rect x={header.x} y={header.y} width={header.w} height={header.h} rx={10} fill={PAL.ink} />
        <Txt x={header.x + 16} y={header.y + header.h / 2 + 1} size={14} anchor="start" fill={PAL.white} weight={620}>
          Toy shop
        </Txt>
        <circle cx={header.x + header.w - 20} cy={header.y + header.h / 2} r={7} fill={PAL.build} />
      </g>
      <g clipPath={`url(#${id}-img)`}>
        <rect x={img.x} y={img.y} width={img.w} height={img.h} rx={14} fill={PAL.findSoft} />
        <circle cx={img.x + img.w - 34} cy={img.y + 30} r={14} fill={PAL.build} opacity={0.7} />
        <Robot b={img} />
      </g>
      <g clipPath={`url(#${id}-title)`}>
        <Txt x={title.x} y={title.y + title.h / 2} size={24} anchor="start" fill={PAL.draw} weight={650}>
          Toy robot
        </Txt>
      </g>
      <g clipPath={`url(#${id}-lines)`}>
        {lines.map((l, i) => (
          <rect key={i} x={l.x} y={l.y} width={l.w} height={l.h} rx={4.5} fill={PAL.line2} />
        ))}
      </g>
      <g clipPath={`url(#${id}-button)`}>
        <rect x={button.x} y={button.y} width={button.w} height={button.h} rx={button.h / 2} fill={PAL.play} />
        <Txt x={button.x + button.w / 2} y={button.y + button.h / 2 + 1} size={15} fill={PAL.white} weight={620}>
          Add to cart
        </Txt>
      </g>

      {brush && (
        <g transform={`translate(${brush.x} ${brush.y}) rotate(-35)`}>
          <rect x={-5} y={-62} width={10} height={44} rx={5} fill={PAL.ink} />
          <rect x={-7} y={-22} width={14} height={10} rx={2} fill={PAL.ink3} />
          <path d="M -7 -12 Q -9 4 0 10 Q 9 4 7 -12 Z" fill={painting?.key === 'button' ? PAL.play : painting?.key === 'title' ? PAL.draw : painting?.key === 'img' ? PAL.find : PAL.ink2} />
        </g>
      )}

      {!kid && <Pill x={400} y={40} text="First Contentful Paint (FCP)" o={fadeIn(t, 0.16, 0.04) * (1 - seg(t, 0.4, 0.44))} bg={PAL.draw} color={PAL.white} size={15} />}
      <Pill x={400} y={40} text={kid ? 'All coloured in!' : 'Pixels rastered, ready to show'} o={fadeIn(t, 0.84, 0.05)} bg={PAL.ink} color={PAL.white} size={15} />
      <Check x={400 + fw / 2 - 6} y={top + 6} o={fadeIn(t, 0.84, 0.05)} r={16} color={PAL.draw} />
    </g>
  );
}

/* ------------------------------------------------------------------ 14. Stack the layers (composite) */

export function CompositeScene({ t, mode }: SceneProps) {
  const kid = mode === 'kid';
  const k = ease(seg(t, 0.1, 0.34)) * (1 - ease(seg(t, 0.8, 0.94)));
  const slide = t > 0.5 && t < 0.76 ? Math.sin(seg(t, 0.5, 0.76) * Math.PI * 2) * 54 : 0;
  const sc = lerp(1, 0.78, k);
  const m = (i: number) => {
    const a = lerp(1, 0.866 * sc, k);
    const b = lerp(0, 0.5 * sc, k);
    const c = lerp(0, -0.866 * sc, k);
    const d = lerp(1, 0.5 * sc, k);
    return `matrix(${a} ${b} ${c} ${d} ${lerp(400, 360, k)} ${250 - i * 80 * k + 60 * k})`;
  };
  const labels = kid ? ['Background', 'Words and pictures', 'Button sheet'] : ['Root layer', 'Content layer', 'Own layer: will-change'];
  const lo = fadeIn(t, 0.34, 0.06) * (1 - seg(t, 0.78, 0.82));

  return (
    <g>
      {/* layer 0: background */}
      <g transform={m(0)}>
        <rect x={-180} y={-120} width={360} height={240} rx={18} fill={PAL.white} stroke={PAL.ink} strokeWidth={2.5} />
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => <circle key={`${r}-${c}`} cx={-140 + c * 40} cy={-80 + r * 40} r={2.4} fill={PAL.line2} />),
        )}
      </g>
      {/* layer 1: content */}
      <g transform={m(1)}>
        <rect x={-180} y={-120} width={360} height={240} rx={18} fill={k > 0.02 ? 'rgba(255,255,255,0.35)' : 'none'} stroke={k > 0.02 ? PAL.draw : 'none'} strokeWidth={2} strokeDasharray="6 6" />
        <rect x={-156} y={-96} width={140} height={150} rx={14} fill={PAL.findSoft} />
        <circle cx={-86} cy={-30} r={30} fill={PAL.white} stroke={PAL.ink} strokeWidth={3} />
        <circle cx={-96} cy={-34} r={4} fill={PAL.ink} />
        <circle cx={-76} cy={-34} r={4} fill={PAL.ink} />
        <rect x={0} y={-90} width={120} height={18} rx={9} fill={PAL.draw} />
        <rect x={0} y={-56} width={150} height={9} rx={4.5} fill={PAL.line2} />
        <rect x={0} y={-38} width={130} height={9} rx={4.5} fill={PAL.line2} />
        <rect x={0} y={-20} width={96} height={9} rx={4.5} fill={PAL.line2} />
      </g>
      {/* layer 2: the button, on its own sheet */}
      <g transform={m(2)}>
        <rect x={-180} y={-120} width={360} height={240} rx={18} fill={k > 0.02 ? 'rgba(255,255,255,0.35)' : 'none'} stroke={k > 0.02 ? PAL.play : 'none'} strokeWidth={2} strokeDasharray="6 6" />
        <g transform={`translate(${slide} 0)`}>
          <rect x={0} y={20} width={140} height={44} rx={22} fill={PAL.play} />
          <Txt x={70} y={43} size={16} fill={PAL.white} weight={620}>
            Add to cart
          </Txt>
        </g>
      </g>

      {labels.map((label, i) => {
        if (lo <= 0) return null;
        const y = 250 - i * 80 * k + 60 * k + 36;
        return (
          <g key={label} opacity={lo}>
            <path d={`M 600 ${y} L 628 ${y}`} stroke={[PAL.ink3, PAL.draw, PAL.play][i]} strokeWidth={2} />
            <Txt x={636} y={y} size={15} anchor="start" weight={580} fill={PAL.ink}>
              {label}
            </Txt>
          </g>
        );
      })}

      <Pill x={400} y={456} text={kid ? 'See-through sheets, stacked' : 'Layers rastered separately, then composited'} o={fadeIn(t, 0.14, 0.05) * (1 - seg(t, 0.48, 0.52))} bg={PAL.draw} color={PAL.white} size={15} />
      <Pill x={400} y={456} text={kid ? 'Sliding a sheet is super fast' : 'transform: composite only, no layout or paint'} o={fadeIn(t, 0.52, 0.04) * (1 - seg(t, 0.78, 0.82))} bg={PAL.play} color={PAL.white} size={15} />
      <Pill x={400} y={456} text={kid ? 'Stacked up again: smooth!' : 'GPU draws the final frame'} o={fadeIn(t, 0.9, 0.05)} bg={PAL.ink} color={PAL.white} size={15} />
    </g>
  );
}
