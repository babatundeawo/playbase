// Builds the static site into ./dist. No dependencies: runs on the Node.js that GitHub Actions provides.
// 1. Copies ./src to ./dist and fills in the %SITE_URL% and %BASE_PATH% placeholders.
// 2. Writes the offline file list and a version fingerprint into the service worker (sw.js).
//
//   SITE_URL  full address of the site, e.g. https://babatundeawo.github.io/naija-monopoly (no trailing slash)
//   BASE_PATH path the site is served from, e.g. /naija-monopoly (empty for a custom domain)
import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const out = join(root, 'dist');

const trim = (v) => (v || '').replace(/\/+$/, '');
const SITE_URL = trim(process.env.SITE_URL) || 'https://babatundeawo.github.io/naija-monopoly';
const BASE_PATH = process.env.BASE_PATH !== undefined ? trim(process.env.BASE_PATH) : new URL(SITE_URL).pathname.replace(/\/+$/, '');
const TEXT = new Set(['.html', '.xml', '.txt', '.webmanifest', '.js', '.css', '.json']);

// Files that are not needed to play offline (search-engine files, social preview, store screenshots, the worker itself).
const NOT_OFFLINE = [/^sw\.js$/, /^robots\.txt$/, /^sitemap\.xml$/, /^assets\/og-image\.png$/, /^assets\/screenshots\//, /^404\.html$/, /^\./];

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    if ((await stat(full)).isDirectory()) yield* walk(full);
    else yield full;
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(src, out, { recursive: true });

let filled = 0;
for await (const file of walk(out)) {
  if (!TEXT.has(extname(file))) continue;
  const before = await readFile(file, 'utf8');
  const after = before.replaceAll('%SITE_URL%', SITE_URL).replaceAll('%BASE_PATH%', BASE_PATH);
  if (after !== before) { await writeFile(file, after); filled++; }
}

// Offline list and version fingerprint (changes whenever any offline file changes, so phones fetch the update).
const files = [];
for await (const file of walk(out)) {
  const rel = relative(out, file).split(sep).join('/');
  if (!NOT_OFFLINE.some((re) => re.test(rel))) files.push(rel);
}
files.sort();
const hash = createHash('sha256');
for (const rel of files) { hash.update(rel); hash.update(await readFile(join(out, rel))); }
const VERSION = hash.digest('hex').slice(0, 12);
const precache = ['./', ...files];

const swPath = join(out, 'sw.js');
const sw = await readFile(swPath, 'utf8');
if (!sw.includes('%VERSION%') || !sw.includes('%PRECACHE%')) throw new Error('sw.js is missing its %VERSION% or %PRECACHE% placeholder');
await writeFile(swPath, sw.replace('%VERSION%', VERSION).replace('%PRECACHE%', JSON.stringify(precache)));

await writeFile(join(out, '.nojekyll'), '');
console.log(`Built site to dist/ (${filled} files updated, ${precache.length} files kept for offline use, version ${VERSION}).`);
console.log(`SITE_URL=${SITE_URL} BASE_PATH="${BASE_PATH}"`);
