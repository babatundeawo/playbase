// Playbase hub. Reads games.json (built from every games/*/game.json) and draws the page.
// Nothing here is specific to one game: adding a game never means editing this file.

const $ = (selector, root = document) => root.querySelector(selector);

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) if (child !== null && child !== undefined) node.append(child);
  return node;
}

// Pick dark or light text for a game's accent colour, whichever reads better (WCAG contrast).
function channel(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }
function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
function onAccent(hex) {
  const L = luminance(hex);
  return (1.05) / (L + 0.05) >= (L + 0.05) / (luminance('#0C1233') + 0.05) ? '#FFFFFF' : '#0C1233';
}
function paint(node, game) {
  node.style.setProperty('--accent', game.accent);
  node.style.setProperty('--on-accent', onAccent(game.accent));
}

const rowTitle = (category) => (/game$/i.test(category) ? `${category}s` : `${category} games`);
const icon = (path) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.4'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', path); svg.append(p);
  return svg;
};

let games = [];
let heroId = null;
let query = '';

const heroEl = $('#hero');
const rowsEl = $('#rows');
const emptyEl = $('#empty');
const dialog = $('#detail');

// ---------- Hero ----------
function renderHero(game, animate = false) {
  heroId = game.id;
  heroEl.replaceChildren(
    el('div', { class: 'hero-copy' },
      el('h1', { text: game.title }),
      el('p', { class: 'tagline', text: game.tagline }),
      el('p', { class: 'blurb', text: game.description }),
      el('ul', { class: 'chips', 'aria-label': 'Tags' }, game.tags.map((tag) => el('li', { text: tag }))),
      el('div', { class: 'actions' },
        el('a', { class: 'btn primary', href: game.play, text: 'Play' }),
        el('button', { class: 'btn', type: 'button', text: 'More info', onclick: () => openDetail(game.id) }),
        el('button', { class: 'btn ghost', type: 'button', text: 'Surprise me', onclick: surprise }),
      ),
    ),
    el('div', { class: 'hero-art' }, el('img', { src: game.cover, alt: `${game.title} on screen`, width: 1280, height: 800, fetchpriority: 'high' })),
  );
  paint(heroEl, game);
  if (animate) {
    heroEl.classList.remove('swap');
    void heroEl.offsetWidth; // restart the animation
    heroEl.classList.add('swap');
  }
}

function surprise() {
  const others = games.filter((g) => g.id !== heroId);
  if (others.length) renderHero(others[Math.floor(Math.random() * others.length)], true);
}

// ---------- Rows ----------
function card(game) {
  const button = el('button', { class: 'card', type: 'button', 'data-id': game.id, onclick: () => openDetail(game.id) },
    el('span', { class: 'card-art' }, el('img', { src: game.cover, alt: '', loading: 'lazy', width: 1280, height: 800 })),
    el('span', { class: 'card-title', text: game.title }),
    el('span', { class: 'card-sub', text: game.players }),
  );
  paint(button, game);
  return el('li', {}, button);
}

function row(title, list) {
  const track = el('ul', { class: 'track', role: 'list' }, list.map(card));
  const prev = el('button', { class: 'nav prev', type: 'button', 'aria-label': `Scroll ${title} left`, onclick: () => scrollTrack(track, -1) }, icon('M15 5l-7 7 7 7'));
  const next = el('button', { class: 'nav next', type: 'button', 'aria-label': `Scroll ${title} right`, onclick: () => scrollTrack(track, 1) }, icon('M9 5l7 7-7 7'));
  const update = () => {
    prev.hidden = track.scrollLeft < 8;
    next.hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
  };
  track.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(track);
  requestAnimationFrame(update);
  return el('section', { class: 'row', 'aria-label': title },
    el('h2', { text: title }),
    el('div', { class: 'track-wrap' }, prev, track, next),
  );
}

function scrollTrack(track, direction) {
  track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function renderRows() {
  const needle = query.trim().toLowerCase();
  rowsEl.replaceChildren();
  if (needle) {
    const found = games.filter((g) => [g.title, g.tagline, g.category, ...g.tags].join(' ').toLowerCase().includes(needle));
    emptyEl.hidden = found.length > 0;
    if (found.length) rowsEl.append(row(`Results for "${query.trim()}"`, found));
    return;
  }
  emptyEl.hidden = true;
  rowsEl.append(row('All games', games));
  const categories = [...new Set(games.map((g) => g.category))];
  if (categories.length > 1) {
    for (const category of categories) rowsEl.append(row(rowTitle(category), games.filter((g) => g.category === category)));
  }
}

// ---------- Details ----------
function openDetail(id) {
  const game = games.find((g) => g.id === id);
  if (!game) return;
  const close = el('button', { class: 'd-close', type: 'button', 'aria-label': 'Close', onclick: () => dialog.close() }, icon('M6 6l12 12M18 6L6 18'));
  dialog.replaceChildren(
    el('div', { class: 'd-grid' },
      el('div', { class: 'd-art' }, el('img', { src: game.cover, alt: `${game.title} on screen` })),
      el('div', { class: 'd-body' },
        close,
        el('h2', { id: 'detail-title', text: game.title }),
        el('p', { class: 'd-tag', text: game.tagline }),
        el('p', { text: game.description }),
        el('dl', { class: 'd-facts' },
          el('div', {}, el('dt', { text: 'Players' }), el('dd', { text: game.players })),
          el('div', {}, el('dt', { text: 'Type' }), el('dd', { text: game.category })),
        ),
        el('ul', { class: 'd-list' }, game.features.map((f) => el('li', { text: f }))),
        el('div', { class: 'actions' },
          el('a', { class: 'btn primary', href: game.play, text: `Play ${game.title}` }),
          el('a', { class: 'btn ghost', href: game.code, text: 'See the code' }),
        ),
      ),
    ),
  );
  paint(dialog, game);
  if (!dialog.open) dialog.showModal();
  history.replaceState(null, '', `#${game.id}`);
}

dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
});
addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (id && games.some((g) => g.id === id)) openDetail(id);
  else if (dialog.open) dialog.close();
});

// ---------- Start ----------
$('#q').addEventListener('input', (event) => { query = event.target.value; renderRows(); });

try {
  const response = await fetch('games.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`games.json: ${response.status}`);
  games = await response.json();
  if (!games.length) throw new Error('games.json is empty');
  const featured = games.find((g) => g.featured) || games[Math.floor(Math.random() * games.length)];
  renderHero(featured);
  renderRows();
  const wanted = location.hash.slice(1);
  if (wanted) openDetail(wanted);
} catch (error) {
  console.error(error);
  heroEl.hidden = true;
  $('#error').hidden = false;
}
