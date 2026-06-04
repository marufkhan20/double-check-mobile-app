// Generates the Play Store feature graphic (1024x500) from SVG, matching the
// app icon's obsidian + emerald theme.
// Run: node scripts/generate-feature-graphic.js  ->  assets/feature-graphic.png
//
// NOTE: resvg emits a 32-bit RGBA PNG, but Google Play rejects feature graphics
// that contain an alpha channel. After regenerating, flatten to 24-bit RGB:
//   npm i --no-save sharp
//   node -e "require('sharp')('assets/feature-graphic.png').flatten({background:'#000000'}).png().toFile('fg.png').then(()=>require('fs').renameSync('fg.png','assets/feature-graphic.png'))"

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const W = 1024;
const H = 500;

const rad = (d) => (d * Math.PI) / 180;
const px = (n) => Math.round(n * 100) / 100;

// Art is authored in the icon's 1024 space (ring center 512,512, r=300),
// then scaled/positioned on the left via a group transform.
function arc(cx, cy, r, a0, a1, step = 1) {
  const pts = [];
  for (let a = a0; a <= a1; a += step) {
    pts.push(`${px(cx + r * Math.cos(rad(a)))} ${px(cy + r * Math.sin(rad(a)))}`);
  }
  return 'M' + pts.join(' L');
}
const RING = arc(512, 512, 300, 75, 375, 1);
const CHECK = 'M676 726 L709 761 L786 683';

// Place the icon art: pivot (512,512) -> (artX, artY), scaled by ART_S.
const ART_S = 0.52;
const artX = 290;
const artY = 250;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="32%" cy="40%" r="95%">
      <stop offset="0%"  stop-color="#26262b"/>
      <stop offset="52%" stop-color="#131316"/>
      <stop offset="100%" stop-color="#070708"/>
    </radialGradient>
    <linearGradient id="topLight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.36"/>
    </linearGradient>
    <linearGradient id="check" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%"   stop-color="#6EE7B7"/>
      <stop offset="55%"  stop-color="#34D399"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#34D399" stop-opacity="0.55"/>
      <stop offset="38%"  stop-color="#34D399" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#34D399" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#topLight)"/>

  <!-- icon art, left -->
  <g transform="translate(${artX} ${artY}) scale(${ART_S}) translate(-512 -512)">
    <path d="${RING}" fill="none" stroke="url(#ring)" stroke-width="17"
          stroke-linecap="round" stroke-dasharray="50 15"/>
    <circle cx="724" cy="724" r="168" fill="url(#glow)"/>
    <path d="${CHECK}" fill="none" stroke="url(#check)" stroke-width="30"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${CHECK}" fill="none" stroke="#D1FAE5" stroke-opacity="0.55"
          stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- wordmark + tagline, right -->
  <text x="494" y="220" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="74" font-weight="700" fill="#FFFFFF" letter-spacing="-1">Double<tspan fill="#34D399">Check</tspan></text>
  <text x="496" y="276" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="26" font-weight="400" fill="rgba(255,255,255,0.55)" letter-spacing="0.3">Hold to confirm. Leave at peace.</text>
  <rect x="497" y="308" width="54" height="3" rx="1.5" fill="#34D399"/>
</svg>`;

const out = path.join(__dirname, '..', 'assets', 'feature-graphic.png');
const r = new Resvg(svg, {
  fitTo: { mode: 'width', value: W },
  font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica' },
});
fs.writeFileSync(out, r.render().asPng());
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'feature-graphic.svg'), svg);
console.log('Wrote assets/feature-graphic.png (1024x500)');
