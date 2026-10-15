// Global tokens and base styles first, so component styles can build on them.
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The built page is prerendered, so hydrate it. The dev server has nothing prerendered.
if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
