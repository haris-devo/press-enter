import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// The companion film. It shares the site's scenes, fonts and tokens, and builds on its own:
//   npx vite --config video/vite.config.ts          preview with a scrubber at http://localhost:5185
//   npx vite build --config video/vite.config.ts    static build in video/dist for the renderer
const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  root,
  base: './',
  publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  plugins: [react()],
  server: { port: 5185, strictPort: true, fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] } },
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2022' },
});
