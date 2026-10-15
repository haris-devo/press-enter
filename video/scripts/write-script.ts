// Write narration.txt and direction.json for the voice pipeline from video/src/script.ts.
// Usage: node video/scripts/write-script.ts <narration.txt> <direction.json> <script path relative to direction.json>
import { writeFileSync } from 'node:fs';
import { LINES, GAP } from '../src/script.ts';

const [narration, direction, scriptRel] = process.argv.slice(2);
if (!narration || !direction || !scriptRel) throw new Error('usage: write-script.ts <narration.txt> <direction.json> <script-relative-to-direction>');

writeFileSync(narration, LINES.map((l) => (l.ref ? `[${l.ref}] ${l.text}` : l.text)).join('\n') + '\n');

const lines = LINES.map((l, i) => {
  const next = LINES[i + 1];
  // a little more air where one step hands over to the next
  const boundary = next && next.beat !== l.beat ? 0.18 : 0;
  return { mood: l.mood, gap: +(GAP[l.mood] + boundary + (l.extra ?? 0)).toFixed(2) };
});
writeFileSync(
  direction,
  JSON.stringify({ script: scriptRel, takes: ['t1', 't2', 't3', 't4'], lead: 0.3, out: 'plan.json', lines }, null, 1) + '\n',
);
const words = LINES.reduce((n, l) => n + l.text.split(/\s+/).length, 0);
console.log(`${LINES.length} lines, ${words} words → ${narration}, ${direction}`);
