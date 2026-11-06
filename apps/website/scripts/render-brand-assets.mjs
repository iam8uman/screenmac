#!/usr/bin/env node
/**
 * Renders the favicon and the link-preview (Open Graph / X) image.
 *
 *   node scripts/render-brand-assets.mjs
 *
 * Output:
 *   src/app/favicon.ico            16, 32 and 48 px, drawn from the logo mark
 *   src/app/opengraph-image.png    1200×630
 *   src/app/twitter-image.png      same image
 *
 * Set CHROMIUM_PATH to use a specific Chromium binary.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fonts = path.join(root, "node_modules/geist/dist/fonts");
const app = path.join(root, "src/app");

const INK = "#17161C";
const PAPER = "#F5F4EF";
const ACCENT = "#5B4CF5";

const dataURL = async (file, type) => `data:${type};base64,${(await readFile(file)).toString("base64")}`;
const sans = await dataURL(path.join(fonts, "geist-sans/Geist-Variable.woff2"), "font/woff2");
const mono = await dataURL(path.join(fonts, "geist-mono/GeistMono-Variable.woff2"), "font/woff2");
const sample = await dataURL(path.join(root, "public/samples/code-review.png"), "image/png");

/** The logo mark (same drawing as components/brand/Logo.tsx). Small sizes get heavier strokes. */
function mark(size) {
  const stroke = size <= 16 ? 2.9 : size <= 32 ? 2.5 : 2.1;
  const radius = size <= 16 ? 6 : 7.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
    <rect width="32" height="32" rx="${radius}" fill="${INK}"/>
    <path d="M8.5 13V10a1.5 1.5 0 0 1 1.5-1.5h3M19 8.5h3a1.5 1.5 0 0 1 1.5 1.5v3M23.5 19v3a1.5 1.5 0 0 1-1.5 1.5h-3M13 23.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3"
      fill="none" stroke="${PAPER}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="12.5" y="12.5" width="7" height="7" rx="1.75" fill="${ACCENT}"/>
  </svg>`;
}

/** Packs PNGs into one .ico (PNG-compressed entries, supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.png)]);
}

// The sample is 1600×1000. Show the code area at a size where it can still be read.
const crop = { x: 290, y: 56, w: 980, h: 580 };
const shotWidth = 572;
const s = shotWidth / crop.w;
const shotHeight = Math.round(crop.h * s);
/** Sample-image rect → px inside the cropped screenshot. */
const at = (x, y, w, h) =>
  `left:${((x - crop.x) * s).toFixed(1)}px;top:${((y - crop.y) * s).toFixed(1)}px;width:${(w * s).toFixed(1)}px;height:${(h * s).toFixed(1)}px`;

const tools = ["M5 3l14 9-6 1.5L10 20z", "M4 20L20 4M20 4h-7M20 4v7", "M4 6h16v12H4z", "M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16", "M6 5h12M12 5v14", "M4 18c4-1 6-12 9-12s1 9 4 9 2-3 3-3"];

const share = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Geist; src: url("${sans}") format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistMono; src: url("${mono}") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { font-family: Geist, sans-serif; -webkit-font-smoothing: antialiased; color: ${INK}; position: relative;
  background: radial-gradient(900px 520px at 100% 100%, #E7E4FD 0%, rgba(231,228,253,0) 62%), ${PAPER}; }
.left { position: absolute; left: 68px; top: 60px; bottom: 56px; width: 470px; display: flex; align-items: flex-start; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 600; letter-spacing: -0.02em; }
.headline { position: relative; margin-top: 50px; margin-left: 16px; font-size: 64px; line-height: 1.02; font-weight: 600; letter-spacing: -0.045em; }
.sel { position: absolute; inset: -14px -18px -16px -16px; border: 2px dashed ${ACCENT}; border-radius: 3px; background: rgba(91,76,245,0.05); }
.sel i { position: absolute; width: 11px; height: 11px; background: #fff; border: 2px solid ${ACCENT}; border-radius: 3px; }
.sub { margin-top: 38px; font-size: 24px; line-height: 1.38; color: #55535C; letter-spacing: -0.01em; }
.foot { margin-top: auto; display: flex; align-items: center; gap: 18px; font-size: 19px; white-space: nowrap; }
.pill { background: ${INK}; color: #fff; font-weight: 600; padding: 13px 22px; border-radius: 12px; }
.url { font-family: GeistMono, monospace; font-size: 16px; color: #55535C; }

.win { position: absolute; right: 52px; top: 50%; transform: translateY(-50%); width: ${shotWidth}px; border-radius: 14px; overflow: hidden;
  background: #1C1B22; box-shadow: 0 0 0 1px rgba(23,22,28,0.12), 0 30px 60px -18px rgba(23,22,28,0.42), 0 12px 24px -12px rgba(23,22,28,0.3); }
.bar { height: 38px; display: flex; align-items: center; gap: 7px; padding: 0 14px; background: #232229; border-bottom: 1px solid #2E2D35; }
.bar .dot { width: 11px; height: 11px; border-radius: 50%; }
.bar .tools { margin-left: 18px; display: flex; gap: 4px; }
.bar .tool { width: 26px; height: 24px; border-radius: 6px; display: grid; place-items: center; }
.bar .tool.on { background: ${ACCENT}; }
.bar .title { margin-left: auto; font-size: 12px; color: #9C9AA6; }
.shot { position: relative; width: ${shotWidth}px; height: ${shotHeight}px;
  background: url("${sample}") no-repeat; background-size: ${1600 * s}px ${1000 * s}px; background-position: ${-crop.x * s}px ${-crop.y * s}px; }
.blur { position: absolute; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border-radius: 4px; background: rgba(28,27,34,0.25); }
.box { position: absolute; border: 2.5px solid #F2453D; border-radius: 6px; }
.badge { position: absolute; width: 24px; height: 24px; border-radius: 50%; background: ${ACCENT}; color: #fff; font-size: 13px; font-weight: 700;
  display: grid; place-items: center; box-shadow: 0 0 0 2px #fff; }
.note { position: absolute; background: #F2453D; color: #fff; font-size: 14px; font-weight: 600; padding: 6px 10px; border-radius: 7px; white-space: nowrap; }
svg.arrow { position: absolute; left: 0; top: 0; overflow: visible; }
</style></head><body>
<div class="left">
  <div class="brand">${mark(52)}Screenmac</div>
  <div class="headline">
    <div class="sel"><i style="left:-7px;top:-7px"></i><i style="right:-7px;top:-7px"></i><i style="left:-7px;bottom:-7px"></i><i style="right:-7px;bottom:-7px"></i></div>
    Your screen,<br>captured<br>beautifully.
  </div>
  <div class="sub">Free, native screenshots and screen recordings for Mac.</div>
  <div class="foot"><span class="pill">Download free for Mac</span><span class="url">screenmac.vercel.app</span></div>
</div>

<div class="win">
  <div class="bar">
    <span class="dot" style="background:#FF5F57"></span><span class="dot" style="background:#FEBC2E"></span><span class="dot" style="background:#28C840"></span>
    <span class="tools">${tools
      .map(
        (d, i) =>
          `<span class="tool${i === 1 ? " on" : ""}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${i === 1 ? "#fff" : "#B5B3BF"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg></span>`,
      )
      .join("")}</span>
    <span class="title">Bug report.png</span>
  </div>
  <div class="shot">
    <div class="blur" style="${at(580, 134, 342, 34)}"></div>
    <div class="box" style="${at(508, 318, 408, 36)}"></div>
    <div class="badge" style="left:${((924 - crop.x) * s).toFixed(1)}px;top:${((336 - crop.y) * s - 12).toFixed(1)}px">1</div>
    <div class="badge" style="left:${((938 - crop.x) * s).toFixed(1)}px;top:${((151 - crop.y) * s - 12).toFixed(1)}px">2</div>
    <svg class="arrow" width="${shotWidth}" height="${shotHeight}">
      <defs><marker id="h" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#F2453D"/></marker></defs>
      <path d="M ${(1040 - crop.x) * s} ${(470 - crop.y) * s} Q ${(1000 - crop.x) * s} ${(400 - crop.y) * s} ${(880 - crop.x) * s} ${(362 - crop.y) * s}"
        fill="none" stroke="#F2453D" stroke-width="3" stroke-linecap="round" marker-end="url(#h)"/>
    </svg>
    <div class="note" style="left:${((930 - crop.x) * s).toFixed(1)}px;top:${((478 - crop.y) * s).toFixed(1)}px">Clamp to maxX, not width</div>
  </div>
</div>
</body></html>`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(share, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await writeFile(path.join(app, "opengraph-image.png"), png);
  await writeFile(path.join(app, "twitter-image.png"), png);

  const icons = [];
  for (const size of [16, 32, 48]) {
    const p = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await p.setContent(`<html><body style="margin:0;background:transparent">${mark(size)}</body></html>`);
    icons.push({ size, png: await p.screenshot({ type: "png", omitBackground: true }) });
  }
  await writeFile(path.join(app, "favicon.ico"), ico(icons));
  console.log("Wrote favicon.ico, opengraph-image.png, twitter-image.png");
} finally {
  await browser.close();
}
