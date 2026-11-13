// Quality checks that need no dependencies. Prints a clear report; exits non-zero only for real breakage
// (a JavaScript syntax error, a missing local file, a leftover placeholder). Style notes are warnings.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const src = join(root, 'src');
const errors = [];
const warnings = [];

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    if ((await stat(full)).isDirectory()) yield* walk(full);
    else yield full;
  }
}
const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };

// 1. JavaScript syntax
for await (const f of walk(src)) {
  if (extname(f) !== '.js') continue;
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) errors.push(`Syntax error in ${relative(root, f)}:\n${r.stderr}`);
}

// 2. HTML: ids, local links and assets, leftover placeholders, inline handlers (blocked by the CSP)
const target = (await exists(dist)) ? dist : src;
for await (const f of walk(target)) {
  const ext = extname(f);
  if (!['.html', '.css', '.webmanifest', '.xml', '.txt'].includes(ext)) continue;
  const text = await readFile(f, 'utf8');
  const rel = relative(root, f);
  if (target === dist && /%(SITE_URL|BASE_PATH)%/.test(text)) errors.push(`${rel}: unreplaced %SITE_URL% / %BASE_PATH% placeholder`);
  if (/lorem ipsum|TODO|FIXME/i.test(text)) warnings.push(`${rel}: contains placeholder-style text`);
  if (ext !== '.html') continue;
  if (/\son(click|change|input|submit|load)=/i.test(text)) errors.push(`${rel}: inline event handler (blocked by the Content Security Policy)`);
  const ids = [...text.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) errors.push(`${rel}: duplicate id(s): ${[...new Set(dup)].join(', ')}`);
  for (const m of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|data:|#|\/\/)/.test(url)) continue;
    const clean = url.split('#')[0].split('?')[0];
    if (!clean) continue;
    const path = clean.startsWith('/') ? clean : join(dirname(f), clean);
    const candidate = clean.endsWith('/') || clean === '.' || clean === './' ? join(path, 'index.html') : path;
    if (!(await exists(normalize(candidate))) && !clean.startsWith('/')) errors.push(`${rel}: broken local link "${url}"`);
  }
  for (const m of text.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.includes(m[1])) errors.push(`${rel}: anchor "#${m[1]}" has no matching id`);
  }
  for (const m of text.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)) warnings.push(`${rel}: image without alt text`);
}

// 3. Required files
for (const f of ['index.html', '404.html', 'offline.html', 'sw.js', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml', 'assets/favicon.svg', 'assets/og-image.png', 'assets/apple-touch-icon.png']) {
  if (!(await exists(join(target, f)))) errors.push(`Missing required file: ${f}`);
}

// 4. Web app manifest: every icon and screenshot must exist and match its stated size
try {
  const manifest = JSON.parse(await readFile(join(target, 'manifest.webmanifest'), 'utf8'));
  for (const key of ['name', 'short_name', 'start_url', 'scope', 'display', 'theme_color', 'background_color', 'id']) {
    if (!manifest[key]) errors.push(`manifest.webmanifest: missing "${key}"`);
  }
  const images = [...(manifest.icons || []), ...(manifest.screenshots || []), ...((manifest.shortcuts || []).flatMap((s) => s.icons || []))];
  for (const img of images) {
    const file = join(target, img.src);
    if (!(await exists(file))) { errors.push(`manifest.webmanifest: missing image ${img.src}`); continue; }
    const buf = await readFile(file);
    if (buf.slice(1, 4).toString() === 'PNG') {
      const size = `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
      if (img.sizes && img.sizes !== size) errors.push(`manifest.webmanifest: ${img.src} is ${size}, but the manifest says ${img.sizes}`);
    }
  }
  const purposes = (manifest.icons || []).map((i) => i.purpose || 'any');
  if (!purposes.includes('maskable')) errors.push('manifest.webmanifest: no maskable icon');
} catch (e) {
  errors.push(`manifest.webmanifest: could not be read (${e.message})`);
}

// 5. Service worker: placeholders filled, every offline file exists, no third-party addresses
if (target === dist && (await exists(join(dist, 'sw.js')))) {
  const sw = await readFile(join(dist, 'sw.js'), 'utf8');
  if (/%VERSION%|%PRECACHE%/.test(sw)) errors.push('sw.js: version or offline list was not filled in');
  const list = sw.match(/JSON\.parse\('(\[.*?\])'\)/s);
  if (!list) errors.push('sw.js: could not find the offline file list');
  else for (const f of JSON.parse(list[1])) {
    if (f !== './' && !(await exists(join(dist, f)))) errors.push(`sw.js: offline list names a missing file: ${f}`);
  }
}

// 6. Privacy and security: no third-party requests, a Content Security Policy on every page
for await (const f of walk(target)) {
  if (!['.html', '.css', '.js', '.webmanifest'].includes(extname(f))) continue;
  const text = await readFile(f, 'utf8');
  const rel = relative(root, f);
  if (/fonts\.(googleapis|gstatic)\.com/.test(text)) errors.push(`${rel}: loads Google Fonts (fonts must be hosted on this site)`);
  if (extname(f) === '.html' && !/http-equiv="Content-Security-Policy"/.test(text)) errors.push(`${rel}: no Content Security Policy`);
}

for (const w of warnings) console.log(`::warning::${w}`);
for (const e of errors) console.log(`::error::${e}`);
console.log(`\nChecked ${relative(root, target)}/ — ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
