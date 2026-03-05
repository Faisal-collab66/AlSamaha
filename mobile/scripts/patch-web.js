/**
 * Post-build patch for Expo web.
 * Expo's Metro bundler generates its own index.html with `body { overflow: hidden }`.
 * This script injects the correct CSS override and fixes the favicon.
 *
 * Run after: npx expo export --platform web
 */
const fs = require('fs');
const path = require('path');

const distHtml = path.join(__dirname, '../dist/index.html');
let html = fs.readFileSync(distHtml, 'utf8');

// 1. Inject scroll-enabling CSS after expo-reset
const scrollCss = `    <style>
      /* Allow body to scroll and stop the oscillation (scroll always reserves space) */
      html { height: auto !important; }
      body { min-height: 100vh; overflow-y: scroll; margin: 0; }
      /* Let #root grow with content instead of being capped at viewport height */
      #root { height: auto !important; min-height: 100vh; flex: none !important; }
    </style>`;

if (!html.includes('height: auto !important')) {
  html = html.replace('</style>\n  <link rel="icon"', `</style>\n${scrollCss}\n  <link rel="icon"`);
}

// 2. Fix favicon to use delivery-bike.png
html = html.replace('<link rel="icon" href="/favicon.ico" />', '<link rel="icon" href="/delivery-bike.png" />');

fs.writeFileSync(distHtml, html);

// 3. Copy delivery-bike.png into dist
const src = path.join(__dirname, '../web/delivery-bike.png');
const dest = path.join(__dirname, '../dist/delivery-bike.png');
fs.copyFileSync(src, dest);

console.log('✓ dist/index.html patched (scroll CSS + favicon)');
console.log('✓ delivery-bike.png copied to dist/');
