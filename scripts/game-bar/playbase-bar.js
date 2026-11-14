// Playbase game bar: a small floating "Home" and "Back to start" control shown inside every game.
// The build adds this file and its stylesheet to each game's index.html (see scripts/build.mjs).
// It only uses classes (no inline styles or scripts), so it works under each game's strict Content Security Policy.
(function () {
  'use strict';
  var script = document.currentScript;
  if (!script || document.querySelector('.pb-bar')) return;

  var title = script.getAttribute('data-title') || 'this game';
  var hubUrl = new URL('./', script.src).href;      // playbase-bar.js sits next to the hub's index.html
  var startUrl = new URL('./', location.href).href; // this game's own front page

  // Remember whether the player has done anything yet. If not, going back to the start loses nothing.
  var touched = false;
  function markTouched(event) {
    if (event.target && event.target.closest && event.target.closest('.pb-bar, .pb-overlay')) return;
    touched = true;
  }
  document.addEventListener('pointerdown', markTouched, true);
  document.addEventListener('keydown', markTouched, true);

  var NS = 'http://www.w3.org/2000/svg';
  function icon(path) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', path);
    svg.appendChild(p);
    return svg;
  }
  function label(text) {
    var span = document.createElement('span');
    span.textContent = text;
    return span;
  }

  var nav = document.createElement('nav');
  nav.className = 'pb-bar';
  nav.setAttribute('aria-label', 'Playbase');

  var home = document.createElement('a');
  home.className = 'pb-btn';
  home.href = hubUrl;
  home.title = 'Home: see all games';
  home.appendChild(icon('M3 11.5 12 4l9 7.5M5.5 10v9.5h4.5v-5h4v5h4.5V10'));
  home.appendChild(label('Home'));

  var back = document.createElement('button');
  back.className = 'pb-btn';
  back.type = 'button';
  back.title = 'Back to the start of ' + title;
  back.appendChild(icon('M10 6 4 12l6 6M4 12h16'));
  back.appendChild(label('Back to start'));

  nav.appendChild(home);
  nav.appendChild(back);
  document.body.appendChild(nav);

  // Slide away while the page is scrolled down; come back when scrolling up, at the top, or at the end.
  // Small back-and-forth movements (the page settling, a phone's address bar resizing) are ignored.
  var lastY = window.scrollY, anchorY = lastY, direction = 0;
  function setHidden(hidden) {
    nav.classList.toggle('pb-hidden', hidden);
    if ('inert' in nav) nav.inert = hidden;
  }
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y === lastY) return;
    var next = y > lastY ? 1 : -1;
    if (next !== direction) { direction = next; anchorY = lastY; } // the direction changed: measure from here
    lastY = y;
    var atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 4;
    if (y <= 80 || atEnd || (direction === -1 && anchorY - y > 48)) setHidden(false);
    else if (direction === 1 && y - anchorY > 24) setHidden(true);
  }, { passive: true });
  nav.addEventListener('focusin', function () { setHidden(false); });

  function goToStart() { location.assign(startUrl); }

  back.addEventListener('click', function () {
    if (!touched) { goToStart(); return; }
    ask();
  });

  function ask() {
    var opener = document.activeElement;
    var overlay = document.createElement('div');
    overlay.className = 'pb-overlay';
    var card = document.createElement('div');
    card.className = 'pb-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'pb-title');
    var h = document.createElement('p');
    h.className = 'pb-title';
    h.id = 'pb-title';
    h.textContent = 'Go back to the start of ' + title + '?';
    var t = document.createElement('p');
    t.className = 'pb-text';
    t.textContent = 'Your current round will end.';
    var row = document.createElement('div');
    row.className = 'pb-row';
    var stay = document.createElement('button');
    stay.type = 'button';
    stay.className = 'pb-choice';
    stay.textContent = 'Stay here';
    var go = document.createElement('button');
    go.type = 'button';
    go.className = 'pb-choice pb-go';
    go.textContent = 'Go to start';
    row.appendChild(stay);
    row.appendChild(go);
    card.appendChild(h);
    card.appendChild(t);
    card.appendChild(row);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    stay.focus();

    function close() {
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      if (opener && opener.focus) opener.focus();
    }
    function onKey(event) {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      else if (event.key === 'Tab') { // keep focus on the two buttons
        event.preventDefault();
        (document.activeElement === stay ? go : stay).focus();
      }
    }
    document.addEventListener('keydown', onKey, true);
    stay.addEventListener('click', close);
    go.addEventListener('click', goToStart);
    overlay.addEventListener('click', function (event) { if (event.target === overlay) close(); });
  }
})();
