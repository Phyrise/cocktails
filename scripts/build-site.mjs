// Construit le site statique installable (PWA) prêt pour GitHub Pages dans dist/.
// Usage : node scripts/build-site.mjs [--base /cocktails]
//  - export web d'Expo avec la base d'URL du site ;
//  - manifeste d'application, page 404 (navigation directe vers une fiche), .nojekyll ;
//  - service worker : app et base disponibles hors ligne, photos gardées en cache.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const baseIndex = args.indexOf('--base');
const BASE = (baseIndex >= 0 ? args[baseIndex + 1] : '/cocktails').replace(/\/$/, '');
const OUT = path.resolve('dist');

// Une route qui porte le nom du dossier de publication (ex. /cocktails sous /cocktails/) serait confondue
// avec la racine du site par le routeur : les liens vers elle ramèneraient à l'accueil.
const segment = BASE.split('/').filter(Boolean).pop();
if (segment) {
  const routes = await readdir('src/app', { recursive: true });
  const clash = routes.find((file) => path.basename(file).replace(/\.tsx?$/, '') === segment);
  if (clash) {
    console.error(`La route src/app/${clash} porte le même nom que la base d'URL « ${BASE} » : renommez-la.`);
    process.exit(1);
  }
}

await rm(OUT, { recursive: true, force: true });
const result = spawnSync(process.execPath, ['node_modules/expo/bin/cli', 'export', '-p', 'web', '--output-dir', 'dist'], {
  stdio: 'inherit',
  env: { ...process.env, EXPO_BASE_URL: BASE, NODE_ENV: 'production' },
});
if (result.status !== 0) process.exit(result.status ?? 1);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }));
  return files.flat();
}

// Page d'accueil : base d'URL dans les liens du modèle public/index.html.
const indexFile = path.join(OUT, 'index.html');
const html = (await readFile(indexFile, 'utf8')).replaceAll('__BASE__', BASE);
await writeFile(indexFile, html);
await copyFile(indexFile, path.join(OUT, '404.html'));
await writeFile(path.join(OUT, '.nojekyll'), '');

const manifest = {
  name: 'Arturo et Clémentine',
  short_name: 'Cocktails',
  description: 'Quoi boire ce soir ? Recettes de cocktails, votre bar et vos envies.',
  lang: 'fr',
  // Identité de l'app pour Chrome. Changée (« app-v2 ») parce qu'un Chrome Android gardait la trace d'une ancienne
  // installation supprimée et refusait de réinstaller. Les données (IndexedDB) suivent le site, pas cet id.
  id: `${BASE}/?app-v2`,
  start_url: `${BASE}/`,
  scope: `${BASE}/`,
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#F8F4EE',
  theme_color: '#8C2638',
  icons: [
    { src: `${BASE}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${BASE}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
    { src: `${BASE}/icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
await writeFile(path.join(OUT, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));

// Fichiers mis en cache à l'installation : tout sauf les photos (chargées à la demande) et la page 404.
const files = (await walk(OUT))
  .map((file) => path.relative(OUT, file).split(path.sep).join('/'))
  .filter((file) => !file.startsWith('db/img/') && !['404.html', '.nojekyll', 'sw.js'].includes(file) && !file.endsWith('.map'));
const hash = createHash('sha256');
for (const file of files.sort()) hash.update(file).update(await readFile(path.join(OUT, file)));
const version = hash.digest('hex').slice(0, 10);
const precache = files.filter((file) => file !== 'index.html').map((file) => `${BASE}/${file}`);

const sw = `// Généré par scripts/build-site.mjs — version ${version}
const VERSION = '${version}';
const BASE = '${BASE}';
const SHELL_CACHE = 'ac-shell-' + VERSION;
const DATA_CACHE = 'ac-data';
const IMAGE_CACHE = 'ac-images';
const SHELL = BASE + '/';
const PRECACHE = ${JSON.stringify([`${BASE}/`, ...precache])};

self.addEventListener('install', (event) => {
  // cache: 'reload' contourne le cache HTTP (GitHub Pages : max-age 600) pour ne pas figer une ancienne page.
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('ac-shell-') && key !== SHELL_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE + '/')) return;
  if (request.mode === 'navigate') {
    // Toujours la dernière version en ligne ; hors ligne, l'app en cache (toutes les routes = même page).
    event.respondWith(fetch(request).catch(() => caches.match(SHELL)));
    return;
  }
  if (url.pathname.startsWith(BASE + '/db/img/')) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }
  if (url.pathname.startsWith(BASE + '/db/')) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }
  event.respondWith(cacheFirst(request, SHELL_CACHE));
});
`;
await writeFile(path.join(OUT, 'sw.js'), sw);

let total = 0;
for (const file of await walk(OUT)) total += (await stat(file)).size;
const shellBytes = (await Promise.all(files.map(async (file) => (await stat(path.join(OUT, file))).size))).reduce((a, b) => a + b, 0);
console.log(`\nSite prêt dans dist/ (base ${BASE || '/'}) — version ${version}`);
console.log(`Total ${(total / 1024 / 1024).toFixed(2)} Mo, dont ${(shellBytes / 1024 / 1024).toFixed(2)} Mo mis en cache à l'installation (${precache.length} fichiers).`);
