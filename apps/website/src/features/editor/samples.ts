import type { Annotation } from "./model";

export interface Sample {
  id: string;
  title: string;
  /** What a visitor might want to point out in this capture. */
  hint: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** Bundled, immutable sample captures (fictional data, rendered by scripts/render-samples.mjs). */
export const SAMPLES: readonly Sample[] = [
  {
    id: "code-review",
    title: "Bug report",
    hint: "Circle the failing line, redact the token on line 14.",
    src: "/samples/code-review.png",
    alt: "Code editor showing a Swift RegionSelector with a highlighted failing line and a test results panel.",
    width: 1600,
    height: 1000,
  },
  {
    id: "metrics",
    title: "Dashboard",
    hint: "Point at the week 9 drop, blur the customer emails.",
    src: "/samples/metrics.png",
    alt: "Analytics dashboard with KPI cards, a weekly bar chart that drops after week 8, and a table of accounts.",
    width: 1600,
    height: 1000,
  },
  {
    id: "design-review",
    title: "Design feedback",
    hint: "Number the issues, pixelate the test card details.",
    src: "/samples/design-review.png",
    alt: "Team chat thread about checkout design feedback with a ticket details sidebar.",
    width: 1600,
    height: 1000,
  },
];

export const UPLOAD_PREFIX = "upload:";

export function findSample(id: string): Sample | undefined {
  return SAMPLES.find((sample) => sample.id === id);
}

/**
 * A finished example for the first sample, so the showcase shows the result
 * before anyone touches it. Reset clears it like any other markup.
 */
export function seededAnnotations(sampleId: string): Annotation[] {
  if (sampleId !== "code-review") return [];
  return [
    { id: "seed-blur", kind: "blur", rect: { x: 578, y: 134, width: 346, height: 34 }, intensity: 18 },
    {
      id: "seed-box",
      kind: "rectangle",
      rect: { x: 506, y: 318, width: 414, height: 40 },
      color: "#F0443A",
      strokeWidth: 5,
      filled: false,
    },
    {
      id: "seed-arrow",
      kind: "arrow",
      start: { x: 1070, y: 456 },
      end: { x: 846, y: 366 },
      color: "#F0443A",
      strokeWidth: 7,
    },
    {
      id: "seed-label",
      kind: "text",
      origin: { x: 1010, y: 452 },
      text: "Clamp to maxX, not width",
      color: "#F0443A",
      fontSize: 30,
      style: "label",
    },
    { id: "seed-1", kind: "counter", center: { x: 950, y: 338 }, value: 1, color: "#5B4CF5", radius: 18 },
    { id: "seed-2", kind: "counter", center: { x: 952, y: 843 }, value: 2, color: "#5B4CF5", radius: 18 },
  ];
}
