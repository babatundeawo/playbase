/* App behaviour: offline support, update notice, install prompt, iPhone guide, connection notices, share and back-to-top. */
(function(){
  'use strict';
  const toastBox = document.getElementById('toasts');
  const banner = document.getElementById('installBanner');
  const installSection = document.getElementById('install');
  const installButtons = [...document.querySelectorAll('[data-install]')];
  const shareButtons = [...document.querySelectorAll('[data-share]')];
  const toTop = document.getElementById('toTop');
  const standaloneQuery = window.matchMedia('(display-mode: standalone)');
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const DISMISS_KEY = 'nm-install-dismissed';
  const DISMISS_DAYS = 14;
  let deferredPrompt = null;
  let updateAccepted = false;

  const isInstalled = () => standaloneQuery.matches || window.navigator.standalone === true;

  /* ---- Toasts ---- */
  function toast(message, options){
    if(!toastBox) return null;
    const opts = options || {};
    const el = document.createElement('div');
    el.className = 'toast';
    const text = document.createElement('span');
    text.textContent = message;
    el.appendChild(text);
    if(opts.action){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = opts.action.label;
      btn.addEventListener('click', ()=>{ opts.action.run(); dismiss(); });
      el.appendChild(btn);
    }
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close secondary';
    close.setAttribute('aria-label', 'Dismiss notice');
    close.textContent = '×';
    close.addEventListener('click', dismiss);
    el.appendChild(close);
    function dismiss(){ el.remove(); }
    toastBox.appendChild(el);
    if(!opts.sticky) setTimeout(dismiss, opts.ms || 5000);
    return el;
  }

  /* ---- Service worker and updates ---- */
  function offerUpdate(worker){
    toast('A new version is ready. Your game is saved automatically.', {
      sticky: true,
      action: { label: 'Refresh', run: ()=>{ updateAccepted = true; worker.postMessage('SKIP_WAITING'); } }
    });
  }
  if('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('sw.js', { scope: './' }).then((reg)=>{
        if(reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
        reg.addEventListener('updatefound', ()=>{
          const incoming = reg.installing;
          if(!incoming) return;
          incoming.addEventListener('statechange', ()=>{
            if(incoming.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(incoming);
          });
        });
        document.addEventListener('visibilitychange', ()=>{
          if(document.visibilityState === 'visible') reg.update().catch(()=>{});
        });
      }).catch(()=>{ /* offline support unavailable here: the site still works while online */ });
    });
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', ()=>{
      if(!updateAccepted || reloading) return;
      reloading = true;
      window.location.reload();
    });
  }

  /* ---- Install ---- */
  function dismissedRecently(){
    const at = Number(store.get(DISMISS_KEY));
    return at && (Date.now() - at) < DISMISS_DAYS * 86400000;
  }
  function refreshInstallUi(){
    const installed = isInstalled();
    const canInstall = !installed && (!!deferredPrompt || isIOS);
    installButtons.forEach(b=> b.classList.toggle('hidden', !canInstall));
    if(installSection) installSection.classList.toggle('hidden', installed);
    if(!canInstall && banner) banner.classList.add('hidden');
  }
  function showIosGuide(){
    modal(`<h3>Add to Home Screen</h3>
      <p class="muted">iPhone and iPad install web apps from Safari. It takes three taps.</p>
      <ol class="ios-steps">
        <li><span class="step-n" aria-hidden="true">1</span><span>Open this page in <strong>Safari</strong>, then tap the <strong>Share</strong> button <svg class="inline-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg> at the bottom of the screen.</span></li>
        <li><span class="step-n" aria-hidden="true">2</span><span>Scroll down and tap <strong>Add to Home Screen</strong>.</span></li>
        <li><span class="step-n" aria-hidden="true">3</span><span>Tap <strong>Add</strong>. Naija Monopoly now opens from your Home Screen like an app.</span></li>
      </ol>
      <div class="row"><button type="button" data-act="closeModal" data-args="[]">Got it</button></div>`, { dismissible: true });
  }
  async function installNow(){
    if(deferredPrompt){
      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      promptEvent.prompt();
      try{ await promptEvent.userChoice; }catch(e){ /* the visitor closed the prompt */ }
      refreshInstallUi();
    } else if(isIOS){
      showIosGuide();
    }
  }
  installButtons.forEach(b=> b.addEventListener('click', ()=>{ if(banner) banner.classList.add('hidden'); installNow(); }));
  window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt = e; refreshInstallUi(); });
  window.addEventListener('appinstalled', ()=>{
    deferredPrompt = null;
    refreshInstallUi();
    toast('Installed. Find Naija Monopoly on your home screen.');
  });
  standaloneQuery.addEventListener('change', refreshInstallUi);
  refreshInstallUi();

  /* A gentle prompt, once the visitor has had time to look around, never during a game, and never again for two weeks after "Not now". */
  const dismissBtn = document.getElementById('installDismiss');
  if(dismissBtn) dismissBtn.addEventListener('click', ()=>{ store.set(DISMISS_KEY, String(Date.now())); banner.classList.add('hidden'); });
  setTimeout(()=>{
    if(!banner || isInstalled() || dismissedRecently() || document.body.dataset.view === 'game') return;
    if(deferredPrompt || isIOS) banner.classList.remove('hidden');
  }, 20000);

  /* ---- Connection notices ---- */
  window.addEventListener('offline', ()=> toast('You are offline. The game still works and saves on this device.', { ms: 6000 }));
  window.addEventListener('online', ()=> toast('Back online.', { ms: 3000 }));

  /* ---- Share ---- */
  if(navigator.share){
    shareButtons.forEach(b=>{
      b.classList.remove('hidden');
      b.addEventListener('click', ()=>{
        navigator.share({ title: document.title, text: 'Play Naija Monopoly, free in your browser.', url: window.location.origin + window.location.pathname }).catch(()=>{});
      });
    });
  }

  /* ---- Back to top ---- */
  if(toTop){
    let ticking = false;
    window.addEventListener('scroll', ()=>{
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(()=>{
        ticking = false;
        toTop.classList.toggle('is-visible', window.scrollY > 900 && document.body.dataset.view !== 'game');
      });
    }, { passive: true });
    toTop.addEventListener('click', ()=>{
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      const brand = document.querySelector('.brand');
      if(brand) brand.focus({ preventScroll: true });
    });
  }
})();
