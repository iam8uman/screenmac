/** The only source of plan names, prices, and feature lists. */
export type PlanId = "free-beta" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  available: boolean;
  /** Present only when the plan can actually be acted on. */
  cta: { label: string; href: string } | null;
  unavailableNote?: string;
  features: string[];
}

export const plans: Plan[] = [
  {
    id: "free-beta",
    name: "Beta",
    price: "Free",
    cadence: "for everyone in the Mac beta",
    summary: "The full local workflow on your Mac. No account, no watermark, no time limit during the beta.",
    available: true,
    cta: { label: "Join the Mac beta", href: "/download" },
    features: [
      "Area, window, and full-screen capture",
      "All fourteen annotation tools",
      "Redaction, blur, and pixelate flattened on export",
      "Screen recording to MP4 with microphone",
      "Quick Access preview and local history",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "Later",
    cadence: "price not set",
    summary: "For people who want sharing and more polish. Listed so you can see where Screenmac is going.",
    available: false,
    cta: null,
    unavailableNote: "Not on sale. Nothing in Pro is built yet.",
    features: [
      "Scrolling capture and on-device text recognition",
      "Video trimming and GIF export",
      "Share links with expiry",
      "Team workspaces",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  const plan = plans.find((item) => item.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}
