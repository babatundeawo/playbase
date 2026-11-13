import { useSyncExternalStore } from 'react';
import { readStore, writeStore } from './storage.ts';

// Minimal typing for the install prompt event (not in lib.dom).
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaState {
  canInstall: boolean;
  installed: boolean;
  isIos: boolean;
  updateReady: boolean;
  online: boolean;
}

const standalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

let state: PwaState = { canInstall: false, installed: false, isIos: false, updateReady: false, online: true };
let deferred: InstallEvent | null = null;
let registration: ServiceWorkerRegistration | null = null;
let userAskedForUpdate = false;
const listeners = new Set<() => void>();

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function initPwa(): void {
  set({ installed: standalone(), isIos: ios(), online: navigator.onLine });
  window.addEventListener('online', () => set({ online: true }));
  window.addEventListener('offline', () => set({ online: false }));
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    set({ canInstall: true });
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    set({ canInstall: false, installed: true });
  });

  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Reload only when the player asked for the update, never on first install.
    if (userAskedForUpdate) window.location.reload();
  });

  const start = async () => {
    try {
      registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      const flag = () => {
        if (registration?.waiting && navigator.serviceWorker.controller) set({ updateReady: true });
      };
      flag();
      registration.addEventListener('updatefound', () => {
        const w = registration?.installing;
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed') flag();
        });
      });
      const check = () => registration?.update().catch(() => undefined);
      document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check());
      window.setInterval(check, 60 * 60 * 1000);
    } catch {
      /* Offline support is a bonus; the site works without it. */
    }
  };
  if (document.readyState === 'complete') void start();
  else window.addEventListener('load', () => void start(), { once: true });
}

export async function promptInstall(): Promise<void> {
  if (!deferred) return;
  const e = deferred;
  deferred = null;
  set({ canInstall: false });
  await e.prompt();
  await e.userChoice.catch(() => undefined);
}

export function applyUpdate(): void {
  userAskedForUpdate = true;
  if (registration?.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  else window.location.reload();
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
export const usePwa = (): PwaState => useSyncExternalStore(subscribe, () => state, () => state);

// "Not now" memory for the install card (14 days), and a visit counter.
const DISMISS_KEY = 'mm_install_dismissed';
const VISITS_KEY = 'mm_visits';
export function installDismissed(): boolean {
  const t = Number(readStore(DISMISS_KEY) ?? 0);
  return Date.now() - t < 14 * 86_400_000;
}
export function dismissInstall(): void {
  writeStore(DISMISS_KEY, String(Date.now()));
}
export function countVisit(): number {
  const n = Number(readStore(VISITS_KEY) ?? 0) + 1;
  writeStore(VISITS_KEY, String(n));
  return n;
}
