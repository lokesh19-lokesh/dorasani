import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const CHUNK_RELOAD_STORAGE_KEY = 'dorasani_chunk_reload_at';
const CHUNK_RELOAD_COOLDOWN_MS = 15_000;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === 'string'
        ? error
        : String((error as any)?.message || error);

  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk [\d]+ failed|ChunkLoadError|Unable to preload CSS|Failed to load module script/i.test(
    message
  );
}

/**
 * Safely reloads the page at most once per cooldown window when a stale Vite
 * build chunk is requested after a fresh deployment or dev HMR restart.
 * Returns true if a reload was initiated.
 */
export function attemptChunkReloadOnce(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const lastAttempt = Number(window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY) || '0');
    const now = Date.now();
    if (lastAttempt && now - lastAttempt < CHUNK_RELOAD_COOLDOWN_MS) {
      return false;
    }
    window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

/**
 * Drop-in replacement for React.lazy that retries transient module import
 * failures once and triggers a single safe reload if the browser is holding
 * onto a stale chunk manifest after a deployment.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importer();
    } catch (firstErr) {
      // Retry once after a short delay for transient network/HMR glitches
      await new Promise((resolve) => setTimeout(resolve, 250));
      try {
        return await importer();
      } catch (secondErr) {
        if (isChunkLoadError(secondErr) || isChunkLoadError(firstErr)) {
          const reloaded = attemptChunkReloadOnce();
          if (reloaded) {
            // Keep Suspense spinner visible while the browser completes reload
            return await new Promise<{ default: T }>(() => {});
          }
        }
        throw secondErr;
      }
    }
  });
}
