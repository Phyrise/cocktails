// Sert dist/ comme GitHub Pages (sous /cocktails/, page 404.html pour les routes de l'app).
// Usage : node scripts/serve-site.mjs [port] [--base /cocktails]
// Depuis un téléphone sur le même Wi-Fi : http://<adresse-du-PC>:<port>/cocktails/
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const port = Number(args.find((arg) => /^\d+$/.test(arg)) ?? 8090);
const baseIndex = args.indexOf('--base');
const BASE = (baseIndex >= 0 ? args[baseIndex + 1] : '/cocktails').replace(/\/$/, '');
const ROOT = path.resolve('dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.txt': 'text/plain',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  if (url.pathname === '/' || url.pathname === BASE) {
    response.writeHead(302, { Location: `${BASE}/` });
    return response.end();
  }
  if (!url.pathname.startsWith(`${BASE}/`)) {
    response.writeHead(404);
    return response.end('Introuvable');
  }
  let file = path.join(ROOT, decodeURIComponent(url.pathname.slice(BASE.length)));
  if (!file.startsWith(ROOT)) {
    response.writeHead(403);
    return response.end();
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  let status = 200;
  if (!existsSync(file)) {
    file = path.join(ROOT, '404.html');
    status = 404;
  }
  response.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
  createReadStream(file).pipe(response);
}).listen(port, '0.0.0.0', () => {
  const lan = Object.values(networkInterfaces()).flat().find((item) => item?.family === 'IPv4' && !item.internal)?.address;
  console.log(`Site servi sur http://localhost:${port}${BASE}/`);
  if (lan) console.log(`Sur le réseau local : http://${lan}:${port}${BASE}/`);
});
