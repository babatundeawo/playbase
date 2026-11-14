#!/usr/bin/env node
// Builds the whole Playbase site into ./dist:
//   dist/                 the hub (carousel page), games.json, covers
//   dist/games/<id>/      each game, built by its own build command
//
// Usage:
//   node scripts/build.mjs                    build everything
//   node scripts/build.mjs --only quizmaster  build one game (comma separated for more)
//   node scripts/build.mjs --preview          fill missing secrets with placeholders (pull requests, local testing)
//   node scripts/build.mjs --skip-checks      skip each game's own checks
//   node scripts/build.mjs --site https://example.com/playbase/   address the site is published at
//
// Every game also gets the shared Home / "Back to start" bar (scripts/game-bar). Set "bar": false in a game's game.json to opt out.
//
// Each game describes itself in games/<id>/game.json. Adding a game means adding a folder with that file;
// this script and the hub page never need to change. See docs/ADDING-A-GAME.md.

import { spawnSync } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gamesDir = join(root, 'games');
const dist = join(root, 'dist');

// ---------- Options ----------
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const option = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };

const preview = flag('preview');
const skipChecks = flag('skip-checks');
const only = option('only')?.split(',').map((s) => s.trim()).filter(Boolean);
const SITE = (option('site') || process.env.SITE_URL || 'https://babatundeawo.github.io/playbase/').replace(/\/*$/, '/');
const BASE_PATH = new URL(SITE).pathname;
const REPO = process.env.GITHUB_REPOSITORY || 'babatundeawo/playbase';
const CODE_URL = `https://github.com/${REPO}/tree/main/games`;

// ---------- Read and check every game.json ----------
const problems = [];
const bad = (id, message) => problems.push(`games/${id}: ${message}`);
const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const isList = (v) => Array.isArray(v) && v.length > 0 && v.every(isText);

const all = readdirSync(gamesDir)
  .filter((name) => statSync(join(gamesDir, name)).isDirectory())
  .sort()
  .map((id) => {
    const file = join(gamesDir, id, 'game.json');
    if (!existsSync(file)) { bad(id, 'has no game.json, so it will not appear in the hub'); return null; }
    let game;
    try { game = JSON.parse(readFileSync(file, 'utf8')); } catch (error) { bad(id, `game.json is not valid JSON (${error.message})`); return null; }
    if (game.id !== id) bad(id, `"id" must match the folder name ("${id}"), but it is "${game.id}"`);
    for (const key of ['title', 'tagline', 'description', 'category', 'players']) if (!isText(game[key])) bad(id, `"${key}" is missing`);
    if (!isList(game.tags)) bad(id, '"tags" needs at least one text entry');
    if (!isList(game.features)) bad(id, '"features" needs at least one text entry');
    if (!/^#[0-9a-fA-F]{6}$/.test(game.accent ?? '')) bad(id, '"accent" must be a colour like #008751');
    if (!isText(game.cover) || !existsSync(join(gamesDir, id, game.cover))) bad(id, `"cover" must point to an image inside the game folder (got "${game.cover}")`);
    if (!isText(game.build?.command)) bad(id, '"build.command" is missing');
    if (!isText(game.build?.output)) bad(id, '"build.output" is missing');
    return game;
  })
  .filter(Boolean);

if (problems.length) {
  console.error('Fix these game.json problems first:\n' + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
if (only) {
  const unknown = only.filter((id) => !all.some((g) => g.id === id));
  if (unknown.length) { console.error(`Unknown game id: ${unknown.join(', ')}`); process.exit(1); }
}
const selected = all.filter((g) => !only || only.includes(g.id));

// ---------- Helpers ----------
function run(command, cwd, env) {
  console.log(`  $ ${command}`);
  const result = spawnSync(command, { cwd, env, shell: true, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`"${command}" stopped with exit code ${result.status}`);
}

function gameEnv(game, siteForGame) {
  const env = { ...process.env };
  const missing = [];
  for (const [key, value] of Object.entries(game.build.env ?? {})) {
    if (value.startsWith('$')) {
      const secret = value.slice(1);
      const found = process.env[secret] || (preview ? game.build.previewEnv?.[key] : undefined);
      if (found) env[key] = found; else missing.push(secret);
    } else {
      env[key] = value.replaceAll('{siteNoSlash}', siteForGame.replace(/\/+$/, '')).replaceAll('{site}', siteForGame);
    }
  }
  if (missing.length) {
    throw new Error(`needs these secrets in the repository settings (Settings > Secrets and variables > Actions): ${missing.join(', ')}`);
  }
  return env;
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');


// ---------- The Home / "Back to start" bar ----------
const barDir = join(root, 'scripts', 'game-bar');
const barHash = createHash('sha256').update(readFileSync(join(barDir, 'playbase-bar.js'))).update(readFileSync(join(barDir, 'playbase-bar.css'))).digest('hex').slice(0, 12);

// Adds the bar's stylesheet and script to a game's front page (index.html). The game's own checks have already run.
function addBar(game, gameDist) {
  const file = join(gameDist, 'index.html');
  let html = readFileSync(file, 'utf8');
  if (html.includes('playbase-bar')) return;
  const hasHead = /<\/head>/i.test(html);
  const hasBody = /<\/body>/i.test(html);
  if (!hasHead || !hasBody) throw new Error('index.html needs both </head> and </body> so the Home bar can be added (or set "bar": false in game.json)');
  html = html
    .replace(/<\/head>/i, `<link rel="stylesheet" href="../../playbase-bar.css">\n</head>`)
    .replace(/<\/body>/i, `<script src="../../playbase-bar.js" data-title="${escapeHtml(game.title)}" defer></script>\n</body>`);
  writeFileSync(file, html);
  // The page changed after the game was built, so a phone that already saved the old page would keep showing it.
  // Changing the offline worker's file makes browsers reinstall it, which refreshes the saved pages.
  for (const name of ['sw.js', 'service-worker.js']) {
    const worker = join(gameDist, name);
    if (existsSync(worker)) appendFileSync(worker, `\n// playbase-bar ${barHash}\n`);
  }
}

// ---------- Build ----------
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'games'), { recursive: true });
mkdirSync(join(dist, 'covers'), { recursive: true });

const built = [];
const failed = [];

for (const game of selected) {
  const dir = join(gamesDir, game.id);
  const started = Date.now();
  console.log(`\n=== ${game.title} (${game.id})`);
  try {
    const siteForGame = `${SITE}games/${game.id}/`;
    const env = gameEnv(game, siteForGame);
    if (game.build.install) run(game.build.install, dir, env);
    run(game.build.command, dir, env);
    const out = join(dir, game.build.output);
    if (!existsSync(join(out, 'index.html'))) throw new Error(`the build did not produce ${game.build.output}/index.html`);
    if (!skipChecks) for (const check of game.build.checks ?? []) run(check, dir, env);
    if (game.bar !== false) addBar(game, out);
    cpSync(out, join(dist, 'games', game.id), { recursive: true });
    const ext = extname(game.cover);
    cpSync(join(dir, game.cover), join(dist, 'covers', `${game.id}${ext}`));
    built.push({ game, cover: `covers/${game.id}${ext}`, seconds: ((Date.now() - started) / 1000).toFixed(1) });
  } catch (error) {
    failed.push({ game, message: error.message });
    console.error(`\n  ${game.title} failed: ${error.message}`);
  }
}

if (failed.length) {
  console.error('\nBuild stopped. These games did not build:\n' + failed.map((f) => `  - ${f.game.id}: ${f.message}`).join('\n'));
  process.exit(1);
}

// ---------- The hub page ----------
cpSync(join(root, 'hub'), dist, { recursive: true });
cpSync(join(barDir, 'playbase-bar.js'), join(dist, 'playbase-bar.js'));
cpSync(join(barDir, 'playbase-bar.css'), join(dist, 'playbase-bar.css'));

const catalogue = built
  .map(({ game, cover }) => ({
    id: game.id,
    title: game.title,
    tagline: game.tagline,
    description: game.description,
    category: game.category,
    tags: game.tags,
    players: game.players,
    features: game.features,
    accent: game.accent,
    featured: game.featured === true,
    order: Number.isFinite(game.order) ? game.order : 100,
    cover,
    play: `games/${game.id}/`,
    code: `${CODE_URL}/${game.id}`,
  }))
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
  .map(({ order, ...rest }) => rest);
writeFileSync(join(dist, 'games.json'), JSON.stringify(catalogue, null, 2) + '\n');

const noscriptList = catalogue
  .map((g) => `<li><a href="${escapeHtml(g.play)}">${escapeHtml(g.title)}</a>: ${escapeHtml(g.tagline)}</li>`)
  .join('\n          ');
for (const page of ['index.html', '404.html']) {
  const file = join(dist, page);
  writeFileSync(file, readFileSync(file, 'utf8')
    .replaceAll('%SITE_URL%', SITE)
    .replaceAll('%BASE_PATH%', BASE_PATH)
    .replace('<!--NOSCRIPT_LIST-->', noscriptList));
}

writeFileSync(join(dist, '.nojekyll'), '');
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
writeFileSync(join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [SITE, ...catalogue.map((g) => `${SITE}${g.play}`)].map((u) => `  <url><loc>${u}</loc></url>`).join('\n') + `\n</urlset>\n`);

// ---------- Final check on the assembled site ----------
const missing = [];
for (const g of catalogue) {
  if (!existsSync(join(dist, g.play, 'index.html'))) missing.push(`${g.play}index.html`);
  if (!existsSync(join(dist, g.cover))) missing.push(g.cover);
}
if (/%SITE_URL%|%BASE_PATH%|NOSCRIPT_LIST/.test(readFileSync(join(dist, 'index.html'), 'utf8'))) missing.push('index.html still has unfilled placeholders');
if (missing.length) { console.error('\nThe finished site is missing:\n' + missing.map((m) => `  - ${m}`).join('\n')); process.exit(1); }

console.log(`\nPlaybase built: ${catalogue.length} game${catalogue.length === 1 ? '' : 's'} for ${SITE}`);
for (const { game, seconds } of built) console.log(`  ${game.id.padEnd(22)} ${seconds}s`);
