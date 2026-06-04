// Generates the DoubleCheck app icon set from a hand-authored SVG.
// Run: node scripts/generate-icon.js
//
// Outputs (into ../assets):
//   icon.png                1024x1024  full-bleed (Expo `icon`, legacy launcher)
//   adaptive-icon.png       1024x1024  transparent, art padded into the safe zone
//   splash-icon.png         1024x1024  same art for the splash
//   playstore-icon.png       512x512   Play Store listing icon (exact spec size)

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const SIZE = 1024;
const C = SIZE / 2; // center
const R = 300; // ring radius

// --- geometry helpers ---------------------------------------------------
const rad = (deg) => (deg * Math.PI) / 180;
const px = (n) => Math.round(n * 100) / 100;

// Build a smooth arc as a polyline so dash segmentation is exact and there is
// no SVG arc-flag ambiguity. Screen coords (y down): 0°=east, 90°=south.
function arc(cx, cy, r, startDeg, endDeg, step = 1) {
  const pts = [];
  const dir = endDeg >= startDeg ? 1 : -1;
  for (let a = startDeg; dir > 0 ? a <= endDeg : a >= endDeg; a += dir * step) {
    pts.push(`${px(cx + r * Math.cos(rad(a)))} ${px(cy + r * Math.sin(rad(a)))}`);
  }
  return 'M' + pts.join(' L');
}

// Ring: a single ~60° gap at the bottom-right (centered on 45°), where the
// check sits. The drawn arc runs from 75° clockwise around to 375° (=15°).
const RING_PATH = arc(C, C, R, 75, 375, 1);

// Checkmark, nestled in the gap around (724, 724).
const CHECK_PATH = 'M676 726 L709 761 L786 683';

// --- the SVG ------------------------------------------------------------
function svg({ withBackground, artScale }) {
  const background = withBackground
    ? `
      <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
      <rect width="${SIZE}" height="${SIZE}" fill="url(#topLight)"/>
      <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)"/>`
    : '';

  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="36%" r="78%">
      <stop offset="0%"  stop-color="#26262b"/>
      <stop offset="52%" stop-color="#141417"/>
      <stop offset="100%" stop-color="#070708"/>
    </radialGradient>
    <linearGradient id="topLight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
      <stop offset="62%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>
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
      <stop offset="0%"   stop-color="#34D399" stop-opacity="0.60"/>
      <stop offset="38%"  stop-color="#34D399" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#34D399" stop-opacity="0"/>
    </radialGradient>
  </defs>

  ${background}

  <g transform="translate(${C} ${C}) scale(${artScale}) translate(${-C} ${-C})">
    <!-- segmented translucent progress ring -->
    <path d="${RING_PATH}" fill="none" stroke="url(#ring)" stroke-width="17"
          stroke-linecap="round" stroke-dasharray="50 15"/>

    <!-- emerald glow behind the checkmark -->
    <circle cx="724" cy="724" r="168" fill="url(#glow)"/>

    <!-- the checkmark -->
    <path d="${CHECK_PATH}" fill="none" stroke="url(#check)" stroke-width="30"
          stroke-linecap="round" stroke-linejoin="round"/>
    <!-- subtle highlight sheen on the check -->
    <path d="${CHECK_PATH}" fill="none" stroke="#D1FAE5" stroke-opacity="0.55"
          stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

// --- render -------------------------------------------------------------
function render(svgString, outPath, width) {
  const r = new Resvg(svgString, {
    fitTo: { mode: 'width', value: width },
    background: 'rgba(0,0,0,0)',
  });
  fs.writeFileSync(outPath, r.render().asPng());
  console.log(`  ${path.basename(outPath)}  ${width}x${width}`);
}

const assets = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assets, { recursive: true });

const full = svg({ withBackground: true, artScale: 1 });
const foreground = svg({ withBackground: false, artScale: 0.78 }); // Android safe zone

console.log('Rendering icons:');
render(full, path.join(assets, 'icon.png'), 1024);
render(full, path.join(assets, 'splash-icon.png'), 1024);
render(full, path.join(assets, 'playstore-icon.png'), 512);
render(foreground, path.join(assets, 'adaptive-icon.png'), 1024);

// Keep the editable source around.
fs.writeFileSync(path.join(assets, 'icon.svg'), full);
console.log('Done.');
