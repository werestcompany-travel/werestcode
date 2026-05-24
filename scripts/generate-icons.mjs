import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath   = path.join(__dirname, '..', 'public', 'icon-192.svg');
const publicDir = path.join(__dirname, '..', 'public');

async function generate() {
  // 192x192
  await sharp(svgPath, { density: 300 }).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  // 512x512
  await sharp(svgPath, { density: 300 }).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  // maskable 192x192 (brand-blue bg, icon scaled to 75% = 144px centered)
  const inner = await sharp(svgPath, { density: 300 }).resize(144, 144).png().toBuffer();
  await sharp({ create: { width: 192, height: 192, channels: 4, background: { r: 37, g: 52, b: 255, alpha: 1 } } })
    .composite([{ input: inner, top: 24, left: 24 }])
    .png().toFile(path.join(publicDir, 'icon-maskable-192.png'));
  // apple-touch-icon 180x180
  await sharp(svgPath, { density: 300 }).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Icons generated.');
}

generate().catch(console.error);
