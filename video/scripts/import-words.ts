// Copy word timings from the studio's stitched voiceover (words.js) into video/src/words.ts.
// Usage: node video/scripts/import-words.ts <path to words.js>
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) throw new Error('usage: import-words.ts <words.js>');
const json = readFileSync(src, 'utf8').match(/window\.WORDS = (\[.*\]);/s)?.[1];
if (!json) throw new Error('no window.WORDS in ' + src);
const words = JSON.parse(json);
const out = fileURLToPath(new URL('../src/words.ts', import.meta.url));
writeFileSync(
  out,
  `// Word timings for the voiceover, from the stitched narration (studio voice/stitch.py).\n` +
    `// Regenerate with: node video/scripts/import-words.ts <words.js>\n` +
    `export interface Word {\n  text: string;\n  start: number;\n  end: number;\n  line: number;\n}\n\n` +
    `export const WORDS: Word[] | null = ${JSON.stringify(words)};\n`,
);
console.log(`${words.length} words → ${out}`);
