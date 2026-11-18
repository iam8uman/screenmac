/**
 * Layout and drawing for the screenshot window frame tool: wrap an image in a simple
 * window title bar or browser bar, add padding and a background, export a PNG.
 * The frames are generic drawings, not copies of any vendor's artwork.
 */

export type FrameStyle = "none" | "window" | "browser";
export type ChromeTheme = "light" | "dark";

export interface FrameOptions {
  style: FrameStyle;
  theme: ChromeTheme;
  /** Padding around the window as a percentage of the image width (0 to 20). */
  paddingPercent: number;
  /** Corner radius in output pixels at a 1,000 px wide image; scaled with the image. */
  radius: number;
  shadow: boolean;
  background: string;
  url: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameLayout {
  width: number;
  height: number;
  /** Window including its bar. */
  window: Rect;
  /** Where the screenshot itself is drawn. */
  image: Rect;
  barHeight: number;
  radius: number;
  unit: number;
}

export const BACKGROUNDS: readonly { id: string; label: string; css: string; stops?: readonly [string, string] }[] = [
  { id: "transparent", label: "None (transparent)", css: "transparent" },
  { id: "white", label: "White", css: "#ffffff" },
  { id: "paper", label: "Warm grey", css: "#ece9e2" },
  { id: "ink", label: "Charcoal", css: "#1c1b22" },
  { id: "violet", label: "Violet gradient", css: "linear-gradient(135deg,#8f84ff,#5b4cf5)", stops: ["#8f84ff", "#5b4cf5"] },
  { id: "sunset", label: "Sunset gradient", css: "linear-gradient(135deg,#ffb38a,#f2453d)", stops: ["#ffb38a", "#f2453d"] },
  { id: "sea", label: "Sea gradient", css: "linear-gradient(135deg,#7ee0c3,#2f7fd8)", stops: ["#7ee0c3", "#2f7fd8"] },
];

export const DEFAULT_FRAME: FrameOptions = {
  style: "window",
  theme: "light",
  paddingPercent: 8,
  radius: 12,
  shadow: true,
  background: "violet",
  url: "example.com",
};

/** One "unit" is a pixel at a 1,000 px wide image, so frames look the same on Retina captures. */
export function unitFor(imageWidth: number): number {
  return Math.min(4, Math.max(0.5, imageWidth / 1000));
}

export function computeFrameLayout(image: { width: number; height: number }, options: FrameOptions): FrameLayout {
  const unit = unitFor(image.width);
  const barHeight = options.style === "window" ? Math.round(34 * unit) : options.style === "browser" ? Math.round(52 * unit) : 0;
  const pad = Math.round((image.width * Math.min(20, Math.max(0, options.paddingPercent))) / 100);
  const radius = Math.round(Math.max(0, options.radius) * unit);
  const windowRect: Rect = { x: pad, y: pad, width: image.width, height: image.height + barHeight };
  return {
    width: image.width + pad * 2,
    height: image.height + barHeight + pad * 2,
    window: windowRect,
    image: { x: pad, y: pad + barHeight, width: image.width, height: image.height },
    barHeight,
    radius,
    unit,
  };
}

type Ctx = CanvasRenderingContext2D;

function roundRect(ctx: Ctx, r: Rect, radius: number) {
  const rad = Math.min(radius, r.width / 2, r.height / 2);
  ctx.beginPath();
  ctx.moveTo(r.x + rad, r.y);
  ctx.arcTo(r.x + r.width, r.y, r.x + r.width, r.y + r.height, rad);
  ctx.arcTo(r.x + r.width, r.y + r.height, r.x, r.y + r.height, rad);
  ctx.arcTo(r.x, r.y + r.height, r.x, r.y, rad);
  ctx.arcTo(r.x, r.y, r.x + r.width, r.y, rad);
  ctx.closePath();
}

/** Draw the framed image onto a canvas sized to the layout. */
export function drawFrame(ctx: Ctx, source: CanvasImageSource, layout: FrameLayout, options: FrameOptions) {
  const { width, height, window: win, image, barHeight, radius, unit } = layout;
  ctx.clearRect(0, 0, width, height);
  const bg = BACKGROUNDS.find((b) => b.id === options.background) ?? BACKGROUNDS[0]!;
  if (bg.stops) {
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, bg.stops[0]);
    g.addColorStop(1, bg.stops[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.css !== "transparent") {
    ctx.fillStyle = bg.css;
    ctx.fillRect(0, 0, width, height);
  }

  const dark = options.theme === "dark";
  if (options.shadow && win.x > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(15, 14, 20, 0.35)";
    ctx.shadowBlur = 40 * unit;
    ctx.shadowOffsetY = 14 * unit;
    roundRect(ctx, win, radius);
    ctx.fillStyle = dark ? "#232229" : "#ffffff";
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  roundRect(ctx, win, radius);
  ctx.clip();
  if (barHeight > 0) {
    ctx.fillStyle = dark ? "#2a2930" : "#ecebef";
    ctx.fillRect(win.x, win.y, win.width, barHeight);
    const dotR = 6 * unit;
    const cy = win.y + (options.style === "browser" ? 18 * unit : barHeight / 2);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(win.x + 18 * unit + i * 20 * unit, cy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    });
    if (options.style === "browser") {
      const field: Rect = { x: win.x + 16 * unit, y: win.y + 30 * unit, width: win.width - 32 * unit, height: 16 * unit };
      roundRect(ctx, field, 8 * unit);
      ctx.fillStyle = dark ? "#3a3941" : "#ffffff";
      ctx.fill();
      ctx.fillStyle = dark ? "#c9c7d1" : "#55535c";
      ctx.font = `${Math.round(10.5 * unit)}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(options.url.slice(0, 120), field.x + field.width / 2, field.y + field.height / 2 + 0.5 * unit, field.width - 16 * unit);
    }
  }
  ctx.drawImage(source, image.x, image.y, image.width, image.height);
  ctx.restore();
}
