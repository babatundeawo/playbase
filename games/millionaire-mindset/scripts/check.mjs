// Post-build sanity checks. Fails the build (exit 1) if something important is broken.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const dist = 'dist';
const errors = [];
const fail = (m) => errors.push(m);
const read = (p) => readFileSync(join(dist, p), 'utf8');

if (!existsSync(dist)) {
  console.error('dist/ not found. Run the build first.');
  process.exit(1);
}

// 1. Required files
for (const f of ['index.html', '404.html', 'offline.html', 'sw.js', 'manifest.webmanifest', 'sitemap.xml', 'robots.txt', 'favicon.svg', 'og-image.png']) {
  if (!existsSync(join(dist, f))) fail(`Missing dist/${f}`);
}
if (errors.length) done();

// 2. Manifest and icons
const manifest = JSON.parse(read('manifest.webmanifest'));
for (const k of ['name', 'short_name', 'start_url', 'scope', 'display', 'icons', 'theme_color', 'background_color']) {
  if (!manifest[k]) fail(`Manifest missing "${k}"`);
}
const sizes = new Set((manifest.icons ?? []).map((i) => i.sizes));
if (!sizes.has('192x192') || !sizes.has('512x512')) fail('Manifest needs 192x192 and 512x512 icons');
if (!(manifest.icons ?? []).some((i) => String(i.purpose).includes('maskable'))) fail('Manifest has no maskable icon');
const toLocal = (src) => src.replace(/^https?:\/\/[^/]+\/[^/]+\//, '').replace(/^\.\//, '');
for (const i of [...(manifest.icons ?? []), ...(manifest.screenshots ?? [])]) {
  if (!existsSync(join(dist, toLocal(i.src)))) fail(`Manifest file missing in dist: ${i.src}`);
}

// 3. index.html essentials
const html = read('index.html');
if (!/<html[^>]+lang="/.test(html)) fail('index.html: <html lang> missing');
if (!/<title>[^<]{5,}/.test(html)) fail('index.html: <title> missing');
if (!/name="description"/.test(html)) fail('index.html: meta description missing');
if (!/rel="canonical"/.test(html)) fail('index.html: canonical missing');
if (!/property="og:image"/.test(html)) fail('index.html: og:image missing');
if (!/name="viewport"/.test(html)) fail('index.html: viewport missing');
if (html.includes('%SITE_URL%') || html.includes('%CSP%') || html.includes('%THEME_INIT%')) fail('index.html: unreplaced placeholder');
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!ld) fail('index.html: JSON-LD missing');
else {
  try { JSON.parse(ld[1]); } catch { fail('index.html: JSON-LD is not valid JSON'); }
}

// 4. CSP hash matches the inline theme script
const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
if (!csp) fail('index.html: CSP meta missing');
else {
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)];
  for (const m of inline) {
    const h = "'sha256-" + createHash('sha256').update(m[1]).digest('base64') + "'";
    if (!csp[1].includes(h)) fail('CSP hash does not match an inline script');
  }
}

// 5. Every local asset referenced by html exists
for (const page of ['index.html', '404.html', 'offline.html']) {
  const h = read(page);
  for (const m of h.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|#|data:)/.test(u) && !u.startsWith('https://babatundeawo')) continue;
    // Strip the site's own path (taken from SITE_URL, so it works at any depth), then any "./".
    const stripped = u.replace(/^https?:\/\/[^/]+/, '');
    const sitePath = process.env.SITE_URL ? new URL(process.env.SITE_URL).pathname : null;
    const local = (sitePath && stripped.startsWith(sitePath) ? stripped.slice(sitePath.length) : stripped.replace(/^\/[^/]+\//, '')).replace(/^\.\//, '').split('#')[0];
    if (!local) continue;
    if (!existsSync(join(dist, local))) fail(`${page}: referenced file not found: ${u}`);
  }
  // Images need alt text
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) fail(`${page}: <img> without alt`);
}

// 6. Service worker precache entries exist
const sw = read('sw.js');
const pre = sw.match(/=\s*(\["[^\]]*index\.html[^\]]*\])/);
if (!pre) fail('sw.js: precache list not found');
else {
  try {
    for (const p of JSON.parse(pre[1])) {
      const local = String(p).replace(/^\.?\//, '').replace(/^Millionaire-Mindset\//, '').split('?')[0];
      if (local && !existsSync(join(dist, local))) fail(`sw.js precaches a missing file: ${p}`);
    }
  } catch { /* list format differs; skip */ }
}
if (sw.includes('__PRECACHE__') || sw.includes('__BUILD_ID__')) fail('sw.js: unreplaced placeholder');

// 7. Sitemap
const sm = read('sitemap.xml');
if (!sm.includes('http://www.sitemaps.org/schemas/sitemap/0.9')) fail('sitemap.xml: wrong namespace');
if (!/<loc>https:\/\//.test(sm)) fail('sitemap.xml: no absolute <loc>');

// 8. Size budget (honest guard, not a Lighthouse score)
let js = 0;
const walk = (d) => readdirSync(d).forEach((n) => {
  const p = join(d, n);
  if (statSync(p).isDirectory()) walk(p);
  else if (p.endsWith('.js') && !p.endsWith('sw.js')) js += statSync(p).size;
});
walk(join(dist, 'assets'));
if (js > 600 * 1024) fail(`JavaScript is ${(js / 1024).toFixed(0)} KB, over the 600 KB budget`);

done();

function done() {
  if (errors.length) {
    console.error('\nBuild checks FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }
  console.log('Build checks passed.');
}
