#!/usr/bin/env node
// Serves ./dist on your computer so you can try the site before publishing it.
//   node scripts/build.mjs --preview
//   node scripts/serve.mjs            then open http://localhost:8080/playbase/
// The site is served under /playbase/ exactly like GitHub Pages, so path mistakes show up here first.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist');
const port = Number(process.argv[2]) || 8080;
const PREFIX = '/playbase';
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

if (!existsSync(dist)) { console.error('Nothing to serve yet. Run: node scripts/build.mjs --preview'); process.exit(1); }

createServer((request, response) => {
  let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (path === '/') { response.writeHead(302, { location: `${PREFIX}/` }).end(); return; }
  if (path === PREFIX) { response.writeHead(302, { location: `${PREFIX}/` }).end(); return; }
  path = path.startsWith(`${PREFIX}/`) ? path.slice(PREFIX.length) : '/__not_found__';
  let file = normalize(join(dist, path));
  if (!file.startsWith(dist)) { response.writeHead(403).end('Forbidden'); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    response.writeHead(404, { 'content-type': types['.html'] }).end(readFileSync(join(dist, '404.html')));
    return;
  }
  response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' }).end(readFileSync(file));
}).listen(port, () => console.log(`Playbase is running at http://localhost:${port}${PREFIX}/ (press Ctrl+C to stop)`));
