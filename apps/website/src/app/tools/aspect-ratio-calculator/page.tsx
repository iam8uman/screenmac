import type { Metadata } from "next";
import Link from "next/link";
import { ToolShell } from "@/components/content/ToolShell";
import { getTool } from "@/lib/content/tools";
import { shareOpenGraph } from "@/lib/share";
import { AspectRatioCalculator } from "./AspectRatioCalculator";

const tool = getTool("aspect-ratio-calculator");

export const metadata: Metadata = {
  alternates: { canonical: "/tools/aspect-ratio-calculator" },
  title: { absolute: tool.seoTitle },
  description: tool.seoDescription,
  openGraph: { ...shareOpenGraph, title: tool.seoTitle, description: tool.seoDescription, url: "/tools/aspect-ratio-calculator" },
};

export default function Page() {
  return (
    <ToolShell
      slug="aspect-ratio-calculator"
      explain={
        <>
          <h2>How to use the results</h2>
          <p>
            The ratio is the width and height divided by their greatest common divisor, so 1920 × 1080 becomes 16:9. When a size does not reduce to a familiar ratio, the calculator also names the closest common one and how far off it is.
          </p>
          <p>
            <strong>Crop</strong> keeps the centre of the image and drops the edges, which suits photos and busy screenshots. <strong>Pad</strong> keeps every pixel and adds space around it, which suits screenshots where text near the edge matters. Use the pixel numbers in any editor with a fixed-size crop, including the free <Link href="/editor">screenshot editor</Link>.
          </p>
          <p>
            Mac screenshots on a Retina display are usually twice the size in pixels of the area you selected, so check the real pixel size in Finder before you start.
          </p>
        </>
      }
    >
      <AspectRatioCalculator />
    </ToolShell>
  );
}
