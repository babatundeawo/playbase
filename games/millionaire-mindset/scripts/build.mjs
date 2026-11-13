// Builds the site into ./dist with esbuild. Run with: npm run build
//
// Environment (all optional):
//   SITE_URL  Full public address, e.g. https://name.github.io/repo/ (set by GitHub Actions).
//             Falls back to GITHUB_REPOSITORY, then to the address in package.json "homepage".
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

// ---------- Site address ----------
function siteUrl() {
  let u = process.env.SITE_URL?.trim();
  if (!u && process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    u = `https://${owner.toLowerCase()}.github.io/${repo}/`;
  }
  u ||= pkg.homepage;
  if (!/^https:\/\//.test(u)) throw new Error(`SITE_URL must start with https:// (got "${u}")`);
  return u.endsWith('/') ? u : u + '/';
}
const SITE_URL = siteUrl();
const SITE_PATH = new URL(SITE_URL).pathname;

// ---------- Clean ----------
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// ---------- App bundle ----------
const result = await build({
  entryPoints: { main: path.join(root, 'src/main.tsx') },
  outdir: dist,
  entryNames: 'assets/[name]-[hash]',
  chunkNames: 'assets/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]',
  bundle: true,
  splitting: true,
  format: 'esm',
  target: ['es2022', 'chrome111', 'safari16.4', 'firefox113'],
  jsx: 'automatic',
  minify: true,
  legalComments: 'none',
  metafile: true,
  loader: { '.woff2': 'file' },
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
});

const outputs = Object.entries(result.metafile.outputs);
const rel = (f) => path.relative(dist, path.resolve(root, f)).split(path.sep).join('/');
const mainJs = outputs.find(([, o]) => o.entryPoint === 'src/main.tsx');
const mainJsFile = rel(mainJs[0]);
const mainCssFile = rel(outputs.find(([f]) => f.endsWith('.css'))[0]);
const fontFile = (name) => rel(outputs.find(([f]) => f.includes(name))[0]);

// ---------- Static copy ----------
cpSync(path.join(root, 'public'), dist, { recursive: true });

// ---------- HTML ----------
const themeInit = "try{var t=localStorage.getItem('mm_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}";
const themeHash = createHash('sha256').update(themeInit).digest('base64');
const csp = [
  "default-src 'self'",
  `script-src 'self' 'sha256-${themeHash}'`,
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self' https://api.groq.com",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

const preloads = ['fraunces-latin-600', 'inter-latin-400']
  .map((n) => `<link rel="preload" href="./${fontFile(n)}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ');
const assets = `${preloads}\n    <link rel="stylesheet" href="./${mainCssFile}" />\n    <script type="module" src="./${mainJsFile}"></script>`;

const fill = (html, { abs = false } = {}) =>
  html
    .replaceAll('%SITE_URL%', SITE_URL)
    .replaceAll('%SITE_PATH%', SITE_PATH)
    .replaceAll('%CSP%', csp)
    .replace('%THEME_INIT%', themeInit)
    .replace('<!--ASSETS-->', abs ? `<link rel="stylesheet" href="${SITE_PATH}${mainCssFile}" />` : assets);

writeFileSync(path.join(dist, 'index.html'), fill(readFileSync(path.join(root, 'index.html'), 'utf8')));
// 404 and offline pages can be shown from any URL depth, so they use absolute paths.
for (const name of ['404.html', 'offline.html']) {
  writeFileSync(path.join(dist, name), fill(readFileSync(path.join(root, 'src/static', name), 'utf8'), { abs: true }));
}

// ---------- Manifest, sitemap, robots ----------
const png = (f) => {
  const b = readFileSync(path.join(dist, f));
  return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;
};
const shots = existsSync(path.join(dist, 'screenshots')) ? readdirSync(path.join(dist, 'screenshots')).filter((f) => f.endsWith('.png')).sort() : [];
const manifest = {
  id: './',
  name: 'Millionaire Mindset',
  short_name: 'Mindset',
  description: 'A free 15-question trivia climb to ₦1,000,000 with lifelines and safe havens.',
  lang: 'en',
  dir: 'ltr',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'any',
  background_color: '#0c0f1f',
  theme_color: '#0c0f1f',
  categories: ['games', 'education', 'entertainment'],
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  shortcuts: [{ name: 'Play now', short_name: 'Play', description: 'Start a new game', url: './#/game', icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }] }],
  screenshots: shots.map((f) => ({
    src: `screenshots/${f}`,
    sizes: png(`screenshots/${f}`),
    type: 'image/png',
    form_factor: f.startsWith('wide') ? 'wide' : 'narrow',
    label: f.startsWith('wide') ? 'Millionaire Mindset on a large screen' : 'Millionaire Mindset on a phone',
  })),
};
writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}</loc></url>\n</urlset>\n`);
writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);

// ---------- Service worker ----------
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const skip = /^(sw\.js|404\.html|og-image\.png|sitemap\.xml|robots\.txt)$|^screenshots\/|\.map$/;
const files = walk(dist)
  .map((f) => path.relative(dist, f).split(path.sep).join('/'))
  .filter((f) => !skip.test(f))
  .sort();
const buildId = createHash('sha256')
  .update(files.map((f) => f + createHash('sha256').update(readFileSync(path.join(dist, f))).digest('hex')).join('\n'))
  .digest('hex')
  .slice(0, 12);
await build({
  entryPoints: [path.join(root, 'src/sw.ts')],
  outfile: path.join(dist, 'sw.js'),
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  define: { __PRECACHE__: JSON.stringify(files), __BUILD_ID__: JSON.stringify(buildId) },
  logLevel: 'warning',
});

// ---------- Report ----------
const kb = (n) => (n / 1024).toFixed(1).padStart(6) + ' KB';
console.log(`Built ${SITE_URL}  (build ${buildId})`);
for (const f of walk(path.join(dist, 'assets')).filter((f) => /\.(js|css)$/.test(f))) {
  const b = readFileSync(f);
  console.log(`  ${path.relative(dist, f).padEnd(34)} ${kb(b.length)}  gzip ${kb(gzipSync(b).length)}`);
}
console.log(`  precached files: ${files.length}, total ${kb(files.reduce((a, f) => a + statSync(path.join(dist, f)).size, 0))}`);
