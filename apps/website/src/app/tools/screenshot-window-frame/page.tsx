import type { Metadata } from "next";
import Link from "next/link";
import { ToolShell } from "@/components/content/ToolShell";
import { getTool } from "@/lib/content/tools";
import { shareOpenGraph } from "@/lib/share";
import { WindowFrameTool } from "./WindowFrameTool";

const tool = getTool("screenshot-window-frame");

export const metadata: Metadata = {
  alternates: { canonical: "/tools/screenshot-window-frame" },
  title: { absolute: tool.seoTitle },
  description: tool.seoDescription,
  openGraph: { ...shareOpenGraph, title: tool.seoTitle, description: tool.seoDescription, url: "/tools/screenshot-window-frame" },
};

export default function Page() {
  return (
    <ToolShell
      slug="screenshot-window-frame"
      explain={
        <>
          <h2>What the tool draws</h2>
          <p>
            It places your image inside a simple window title bar or browser bar, adds padding, a background and an optional soft shadow, then exports a PNG at the full resolution of your original. The bars are generic drawings, so they will not be mistaken for a real screenshot of a specific browser.
          </p>
          <p>
            Pick <strong>No frame</strong> with a background and padding to get the presentation look used on slides and social posts. Pick <strong>None (transparent)</strong> as the background to export only the framed window with transparent corners.
          </p>
          <p>
            If you want the real macOS window shadow instead, see <Link href="/blog/screenshot-window-without-shadow-mac">how to screenshot a window with or without the shadow</Link>.
          </p>
        </>
      }
    >
      <WindowFrameTool />
    </ToolShell>
  );
}
