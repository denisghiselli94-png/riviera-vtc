import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp Luxury Midnight Blue & Gold / White icon
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b132b"/>
      <stop offset="50%" stop-color="#1c2541"/>
      <stop offset="100%" stop-color="#0b132b"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)"/>
  
  <!-- Subtle inner border -->
  <rect x="24" y="24" width="464" height="464" rx="88" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>

  <!-- Stylized Luxury Car & Crown / Wings Motif -->
  <!-- Top decorative line -->
  <path d="M196 140 L256 120 L316 140" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-linecap="round"/>
  
  <!-- Emblem Center: Sleek Car silhouette -->
  <g transform="translate(106, 160)">
    <!-- Aerodynamic luxury sedan silhouette -->
    <path d="M30 110 C 50 70, 90 40, 150 35 C 210 35, 250 70, 270 110 L 290 125 C 295 128, 298 134, 295 140 C 290 146, 280 148, 270 148 L 30 148 C 20 148, 10 146, 5 140 C 2 134, 5 128, 10 125 Z" fill="none" stroke="url(#silverGrad)" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
    
    <!-- Windshield & Roof arc -->
    <path d="M75 105 C 100 65, 140 50, 185 50 C 220 50, 245 75, 255 105 Z" fill="rgba(255,255,255,0.12)" stroke="url(#silverGrad)" stroke-width="6"/>

    <!-- Headlights glow -->
    <circle cx="36" cy="128" r="8" fill="#38bdf8"/>
    <circle cx="264" cy="128" r="8" fill="#f59e0b"/>

    <!-- Speed/road lines underneath -->
    <line x1="20" y1="168" x2="280" y2="168" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round"/>
    <line x1="50" y1="182" x2="250" y2="182" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Brand Typography -->
  <text x="256" y="385" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="8">
    RIVIERA
  </text>
  <text x="256" y="425" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#f59e0b" text-anchor="middle" letter-spacing="6">
    VTC SERVICE
  </text>
</svg>
`.trim();

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

async function run() {
  const svgBuffer = Buffer.from(svgContent);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 180x180 Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 512x512 maskable (with safe zone 12% padding)
  await sharp(svgBuffer)
    .resize(400, 400)
    .extend({
      top: 56,
      bottom: 56,
      left: 56,
      right: 56,
      background: '#0b132b',
    })
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('Icons generated successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
