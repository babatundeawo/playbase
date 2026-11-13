// ============================================================
// app.js: starts the app and connects the screens together
// ============================================================

import { $, $$, storage } from './dom.js';
import { SoundFX } from './sounds.js';
import { showScreen, initTheme, initHeader, confirmDialog, toast } from './ui.js';
import { ONLINE_ENABLED, onWriteError, describeError } from './room.js';
import { initHost, leaveHost, resetSetupForm } from './game.js';
import { initAudience, leaveAudience } from './audience.js';
import { initPwa } from './pwa.js';

// Which role this device is playing right now: 'host', 'audience', or null
let role = null;

// ---------- Header controls ----------
function initSoundButton() {
  const button = $('#muteBtn');
  const apply = (muted) => {
    SoundFX.setMuted(muted);
    button.setAttribute('aria-pressed', String(muted));
    button.setAttribute('aria-label', muted ? 'Sound is off. Turn sound on' : 'Sound is on. Turn sound off');
    button.title = muted ? 'Sound off' : 'Sound on';
  };
  apply(storage.get('kq-muted') === '1');
  button.addEventListener('click', () => {
    const muted = !SoundFX.isMuted();
    apply(muted);
    storage.set('kq-muted', muted ? '1' : '0');
  });
}

$('#homeBtn').addEventListener('click', async () => {
  const ok = await confirmDialog({
    title: 'Leave this session?',
    message: role === 'host'
      ? 'This ends the game for everyone and takes you back to the home screen.'
      : 'You will leave the room and go back to the home screen.',
    confirmLabel: 'Leave', cancelLabel: 'Stay', danger: true,
  });
  if (ok) goHome();
});

function goHome() {
  if (role === 'host') leaveHost();
  if (role === 'audience') leaveAudience();
  role = null;
  showScreen('screen-role');
}

// ---------- Home: choose a role ----------
function chooseRole(choice, { quiet = false } = {}) {
  if (!quiet) SoundFX.click();
  if (choice === 'host') {
    role = 'host';
    showScreen('screen-rules');
  } else if (!ONLINE_ENABLED) {
    toast('Audience voting is not set up yet. Ask the host to finish the Firebase setup guide, then try again.', { tone: 'warning', duration: 9000 });
  } else {
    role = 'audience';
    showScreen('screen-audience-tutorial');
  }
}

$$('.role-card').forEach((card) => {
  card.addEventListener('click', () => chooseRole(card.dataset.role));
});

// ---------- Tutorials ----------
$('#rulesContinueBtn').addEventListener('click', () => {
  SoundFX.click();
  resetSetupForm();
  showScreen('screen-host-setup');
});
$('#audienceTutorialContinueBtn').addEventListener('click', () => {
  SoundFX.click();
  showScreen('screen-audience-join');
});

// ---------- Game over: "New game" ----------
$('#newGameBtn').addEventListener('click', goHome);

// ---------- Connection awareness ----------
let lastWriteToast = 0;
onWriteError((error) => {
  console.error('Room update failed:', error);
  if (Date.now() - lastWriteToast < 10000) return; // one message is enough
  lastWriteToast = Date.now();
  toast(describeError(error), { tone: 'error' });
});
window.addEventListener('offline', () => toast('You are offline. The game keeps working, but the audience cannot see updates.', { tone: 'warning' }));
window.addEventListener('online', () => toast('Back online.', { tone: 'success', duration: 3000 }));

// ---------- Start ----------
initTheme();
initHeader();
initSoundButton();
initHost();
initAudience();
initPwa();
showScreen('screen-role', { focus: false });

// App-icon shortcuts open the site as ?role=host or ?role=audience (see manifest.webmanifest)
const shortcutRole = new URLSearchParams(window.location.search).get('role');
if (shortcutRole === 'host' || shortcutRole === 'audience') {
  window.history.replaceState(null, '', window.location.pathname);
  chooseRole(shortcutRole, { quiet: true });
}
