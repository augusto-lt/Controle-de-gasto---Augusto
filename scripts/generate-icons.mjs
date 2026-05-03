/**
 * Gera os ícones PNG do PWA a partir de um SVG inline.
 *
 *   any-192   → public/icons/icon-192.png
 *   any-512   → public/icons/icon-512.png
 *   maskable  → public/icons/icon-maskable-512.png  (com safe-area de 20%)
 *   apple     → public/icons/apple-touch-icon.png   (180×180, padrão iOS)
 *
 * Visual: fundo zinc-900 (#18181b), glifo "R$" branco centralizado em
 * Geist Bold-ish (usa o weight built-in da fonte do navegador headless,
 * via SVG <text>). Simples, neutro, legível em qualquer tamanho.
 *
 * Run:  node scripts/generate-icons.mjs
 */

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "icons");
mkdirSync(OUT_DIR, { recursive: true });

const BG = "#18181b"; // zinc-900
const FG = "#fafafa"; // zinc-50

/** SVG completo do ícone. `padding` em % aplicado para versão maskable. */
function makeSvg({ size, padding = 0 }) {
  // safe-area maskable: spec recomenda manter conteúdo dentro dos 80% centrais
  const inset = Math.round((size * padding) / 100);
  const inner = size - inset * 2;
  const radius = Math.round(size * 0.22); // arredondamento generoso, estilo iOS

  // Tamanho do glifo "R$": ~52% do lado interno
  const fontSize = Math.round(inner * 0.52);
  const cx = size / 2;
  const cy = size / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${BG}"/>
  <text
    x="${cx}"
    y="${cy}"
    fill="${FG}"
    font-family="Geist, 'SF Pro Display', system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    text-anchor="middle"
    dominant-baseline="central"
    letter-spacing="-0.02em"
  >R$</text>
</svg>`;
}

async function render({ name, size, padding = 0 }) {
  const svg = Buffer.from(makeSvg({ size, padding }));
  const out = resolve(OUT_DIR, name);
  await sharp(svg).png().toFile(out);
  console.log(`✓ ${name} (${size}×${size})`);
}

await render({ name: "icon-192.png", size: 192 });
await render({ name: "icon-512.png", size: 512 });
await render({ name: "icon-maskable-512.png", size: 512, padding: 12 });
await render({ name: "apple-touch-icon.png", size: 180 });

console.log(`\nÍcones gravados em ${OUT_DIR}`);
