/**
 * Remove white/light background from the Pointy logo using Deno canvas.
 * Run: deno run -A scripts/remove-bg.ts
 */

import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.2/mod.ts";

const inputPath = "public/pointy_logo.png";
const outputPath = "public/pointy_logo_nobg.png";

const img = await loadImage(inputPath);
const canvas = createCanvas(img.width(), img.height());
const ctx = canvas.getContext("2d");

ctx.drawImage(img, 0, 0);

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;

// Threshold: pixels with R, G, B all above this value are considered "white/light background"
const THRESHOLD = 230;

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  // If pixel is very light (near white), make it transparent
  if (r > THRESHOLD && g > THRESHOLD && b > THRESHOLD) {
    data[i + 3] = 0; // Set alpha to 0
  }
}

ctx.putImageData(imageData, 0, 0);

const pngData = canvas.toBuffer("image/png");
await Deno.writeFile(outputPath, pngData);

console.log(`Background removed: ${outputPath}`);
