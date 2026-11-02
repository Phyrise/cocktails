// Génère les icônes de l'app (web app, favicon, Expo) à partir d'un dessin vectoriel unique.
// Usage : node scripts/build-icons.mjs
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const icon = (rounded) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="75%">
      <stop offset="0" stop-color="#A3324A"/>
      <stop offset="1" stop-color="#5A1222"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" rx="${rounded ? 224 : 0}" fill="url(#bg)"/>
  <path d="M300 420 Q512 660 724 420 Z" fill="#E0B464"/>
  <path d="M250 372 Q512 712 774 372 Z" fill="none" stroke="#F8EBD7" stroke-width="40" stroke-linejoin="round"/>
  <path d="M512 610 V818" stroke="#F8EBD7" stroke-width="40" stroke-linecap="round"/>
  <path d="M366 836 H658" stroke="#F8EBD7" stroke-width="40" stroke-linecap="round"/>
  <path d="M640 300 Q660 250 712 232" fill="none" stroke="#3E6B3A" stroke-width="18" stroke-linecap="round"/>
  <circle cx="628" cy="338" r="54" fill="#D83A3A"/>
  <circle cx="610" cy="320" r="14" fill="#FFFFFF" opacity="0.55"/>
</svg>`;

await mkdir('public/icons', { recursive: true });
const outputs = [
  ['public/icons/icon-192.png', 192, true],
  ['public/icons/icon-512.png', 512, true],
  ['public/icons/maskable-512.png', 512, false],
  ['public/icons/apple-touch-icon.png', 180, false],
  ['assets/images/icon.png', 1024, false],
  ['assets/images/favicon.png', 48, true],
  ['assets/images/splash-icon.png', 256, true],
];
for (const [file, size, rounded] of outputs) {
  await sharp(Buffer.from(icon(rounded))).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
}
console.log(`${outputs.length} icônes générées.`);
