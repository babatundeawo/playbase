// ============================================================
// pwa.js: install prompt, iPhone install guide, offline support,
// and the "new version is ready" prompt
//
// Android and desktop Chrome/Edge: a gentle banner (and an "Install app"
// link in the footer) opens the browser's own install dialog.
// iPhone and iPad: Apple offers no install event, so a short illustrated
// guide shows the three taps in Safari.
// Updates: a new version waits in the background until the visitor taps
// "Refresh", so a game in progress is never interrupted.
// ============================================================

import { $, el, storage } from './dom.js';
import { announce, confirmDialog } from './ui.js';

const DISMISS_KEY = 'kq-install-dismissed';
const DISMISS_DAYS = 30;
const FIRST_NUDGE_MS = 20000;   // never in the first 20 seconds
const UPDATE_CHECK_MS = 60 * 60 * 1000;

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const gameIsRunning = () => !$('#screen-host-game').hidden || !$('#screen-audience-view').hidden;

let deferredPrompt = null;
let barKind = null;
let nudgeTimer = null;

// The banner and guide styles load on demand, so the home page stays as light as before
function loadStyles() {
  if (document.querySelector('link[data-pwa]')) return;
  document.head.append(el('link', { attrs: { rel: 'stylesheet', href: 'css/pwa.css', 'data-pwa': '' } }));
}

// ---------- Banner (one at a time; "update" always wins over "install") ----------
function closeBar() {
  const bar = $('#pwaBar');
  barKind = null;
  if (!bar) return;
  bar.classList.remove('is-open');
  setTimeout(() => bar.remove(), 260);
}

function openBar(kind, title, text, buttons) {
  if (barKind === 'update' && kind !== 'update') return;
  $('#pwaBar')?.remove();
  const actions = el('div', { className: 'pwa-bar-actions' });
  buttons.forEach(({ label, primary, onClick }) => {
    const button = el('button', { className: `btn btn-sm ${primary ? 'btn-primary' : 'btn-ghost'}`, text: label, attrs: { type: 'button' } });
    button.addEventListener('click', onClick);
    actions.append(button);
  });
  const bar = el('section', { className: 'pwa-bar', attrs: { id: 'pwaBar', 'aria-label': title } },
    el('div', { className: 'pwa-bar-copy' },
      el('p', { className: 'pwa-bar-title', text: title }),
      el('p', { className: 'pwa-bar-text', text })),
    actions);
  document.body.append(bar);
  requestAnimationFrame(() => bar.classList.add('is-open'));
  barKind = kind;
}

// ---------- Install ----------
const canInstall = () => !isStandalone() && (Boolean(deferredPrompt) || isIos());

function recentlyDismissed() {
  const stamp = Number(storage.get(DISMISS_KEY));
  return Boolean(stamp) && Date.now() - stamp < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}
const rememberDismiss = () => storage.set(DISMISS_KEY, String(Date.now()));

const SHARE_GLYPH = ['M12 3v12', 'M8 7l4-4 4 4', 'M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1'];
const ADD_GLYPH = ['M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v9a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5z', 'M12 8v8', 'M8 12h8'];
const CHECK_GLYPH = ['M5 12.5l4.5 4.5L19 7.5'];

function glyph(paths) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'pwa-glyph');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  paths.forEach((d) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.append(path);
  });
  return svg;
}

function openIosGuide() {
  let dialog = $('#iosGuide');
  if (!dialog) {
    const step = (paths, text) => el('li', { className: 'pwa-step' }, el('span', { className: 'pwa-step-glyph' }, glyph(paths)), el('span', { text }));
    const close = el('button', { className: 'btn btn-primary btn-block', text: 'Got it', attrs: { type: 'button' } });
    dialog = el('dialog', { className: 'dialog', attrs: { id: 'iosGuide', 'aria-labelledby': 'iosGuideTitle' } },
      el('div', { className: 'dialog-card' },
        el('h2', { className: 'dialog-title', text: 'Add Kingdom Quiz to your Home Screen', attrs: { id: 'iosGuideTitle' } }),
        el('p', { className: 'dialog-text', text: 'Apple does not let websites install themselves, so it takes three taps in Safari:' }),
        el('ol', { className: 'pwa-steps' },
          step(SHARE_GLYPH, 'Tap the Share button, the square with an arrow pointing up, in the Safari toolbar.'),
          step(ADD_GLYPH, 'Scroll down and tap “Add to Home Screen”.'),
          step(CHECK_GLYPH, 'Tap “Add” in the top-right corner. Kingdom Quiz now opens like an app.')),
        el('p', { className: 'pwa-note', text: 'Not seeing “Add to Home Screen”? Open this page in Safari first.' }),
        close));
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    document.body.append(dialog);
  }
  dialog.showModal();
}

async function runInstall() {
  if (deferredPrompt) {
    const prompt = deferredPrompt;
    deferredPrompt = null; // a prompt can only be used once
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'dismissed') rememberDismiss();
    syncInstallLink();
  } else if (isIos()) {
    openIosGuide();
  }
}

/** The "Install app" link in the footer: always available, even after the banner was dismissed. */
function syncInstallLink() {
  const nav = $('.home-footer nav');
  if (!nav) return;
  const existing = $('#installLink');
  if (!canInstall()) { existing?.remove(); return; }
  if (existing) return;
  const link = el('button', { className: 'link-btn', text: 'Install app', attrs: { id: 'installLink', type: 'button' } });
  link.addEventListener('click', runInstall);
  nav.append(link);
}

function showInstallBar() {
  const ios = isIos() && !deferredPrompt;
  openBar('install', 'Install Kingdom Quiz',
    ios ? 'Add it to your Home Screen to open it like an app.' : 'Open it like an app from your home screen, even when the connection is poor.',
    [
      { label: ios ? 'Show me how' : 'Install', primary: true, onClick: () => { closeBar(); runInstall(); } },
      { label: 'Not now', onClick: () => { rememberDismiss(); closeBar(); } },
    ]);
}

/** Waits until the visitor has had time to look around, is on the home screen and no dialog is open. */
function scheduleInstallNudge() {
  if (nudgeTimer || !canInstall() || recentlyDismissed()) return;
  nudgeTimer = setInterval(() => {
    if (!canInstall() || recentlyDismissed()) { clearInterval(nudgeTimer); return; }
    if (performance.now() < FIRST_NUDGE_MS || $('#screen-role').hidden || $('dialog[open]') || barKind) return;
    clearInterval(nudgeTimer);
    showInstallBar();
  }, 4000);
}

// ---------- Offline support and updates ----------
function offerUpdate(worker) {
  let refreshRequested = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshRequested) window.location.reload();
  });
  openBar('update', 'A new version is ready',
    gameIsRunning() ? 'Refreshing ends the game in progress, so it can wait until you are done.' : 'Refresh to get the latest questions and fixes.',
    [
      {
        label: 'Refresh',
        primary: true,
        onClick: async () => {
          if (gameIsRunning()) {
            const ok = await confirmDialog({
              title: 'End the current game?',
              message: 'Updating reloads the page, which ends the game for everyone in the room.',
              confirmLabel: 'Refresh', cancelLabel: 'Keep playing', danger: true,
            });
            if (!ok) return;
          }
          refreshRequested = true;
          worker.postMessage({ type: 'SKIP_WAITING' });
          setTimeout(() => window.location.reload(), 3000); // safety net if the switch is slow
        },
      },
      { label: 'Later', onClick: closeBar },
    ]);
  announce('A new version of Kingdom Quiz is ready. Choose Refresh to update.');
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || location.hostname === 'localhost')) return;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('sw.js');
      if (registration.waiting && navigator.serviceWorker.controller) offerUpdate(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(worker);
        });
      });
      const check = () => registration.update().catch(() => {});
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
      setInterval(check, UPDATE_CHECK_MS);
    } catch (error) {
      console.warn('Offline mode unavailable:', error);
    }
  });
}

// ---------- Start-up ----------
export function initPwa() {
  loadStyles();
  registerServiceWorker();

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // we show our own prompt at a better moment
    deferredPrompt = event;
    syncInstallLink();
    scheduleInstallNudge();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (barKind === 'install') closeBar();
    syncInstallLink();
  });

  syncInstallLink();
  scheduleInstallNudge();
}
