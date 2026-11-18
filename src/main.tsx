import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { attemptChunkReloadOnce } from './utils/lazyWithRetry';

// Recover cleanly if Vite attempts to preload a stale hashed asset after a deploy/restart
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    attemptChunkReloadOnce();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
