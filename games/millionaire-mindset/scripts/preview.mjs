// Serves ./dist locally the way GitHub Pages would: under a sub-path, with 404.html for misses.
// Usage: node scripts/preview.mjs [port] [base-path]    e.g. node scripts/preview.mjs 4173 /Millionaire-Mindset/
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] ?? 4173);
const base = (process.argv[3] ?? '/').replace(/\/?$/, '/');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = null;
  if (url.pathname.startsWith(base)) {
    const p = decodeURIComponent(url.pathname.slice(base.length)) || 'index.html';
    const f = path.join(root, p.endsWith('/') ? p + 'index.html' : p);
    if (f.startsWith(root) && existsSync(f) && statSync(f).isFile()) file = f;
  }
  const status = file ? 200 : 404;
  file ||= path.join(root, '404.html');
  res.writeHead(status, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Serving dist at http://localhost:${port}${base}`));
