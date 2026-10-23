/** Mirrors tokens.css for code that needs values in JS (canvas rendering, OG images). */
export const tokens = {
  color: {
    paper: "#F5F4EF",
    paperRaised: "#FBFAF7",
    paperSunk: "#ECEBE4",
    line: "#E3E1D9",
    lineStrong: "#CFCCC1",
    ink: "#17161C",
    inkMuted: "#55535C",
    inkFaint: "#75737C",
    accent: "#5B4CF5",
    accentHover: "#4A3AE6",
    accentSoft: "#EBE9FE",
    accentInk: "#3A2FB8",
    stage: "#1C1B22",
    stageRaised: "#26252E",
    stageLine: "#34333D",
    stageInk: "#ECEBF2",
    stageInkMuted: "#A3A1AE",
    signal: "#F0443A",
    success: "#1F7A52",
    warning: "#A15C00",
    danger: "#B42318",
  },
  radius: { sm: 6, md: 10, lg: 16, xl: 24 },
  font: {
    sans: "Geist, ui-sans-serif, system-ui, sans-serif",
    mono: "Geist Mono, ui-monospace, monospace",
  },
  motion: { fast: 120, base: 200, slow: 420, easeOut: "cubic-bezier(0.22, 1, 0.36, 1)" },
} as const;

export type DesignTokens = typeof tokens;
