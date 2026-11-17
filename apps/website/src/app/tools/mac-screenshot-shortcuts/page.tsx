import type { Metadata } from "next";
import { ToolShell } from "@/components/content/ToolShell";
import { getTool } from "@/lib/content/tools";
import { shareOpenGraph } from "@/lib/share";
import { ShortcutFinder } from "./ShortcutFinder";

const tool = getTool("mac-screenshot-shortcuts");

export const metadata: Metadata = {
  alternates: { canonical: "/tools/mac-screenshot-shortcuts" },
  title: { absolute: tool.seoTitle },
  description: tool.seoDescription,
  openGraph: { ...shareOpenGraph, title: tool.seoTitle, description: tool.seoDescription, url: "/tools/mac-screenshot-shortcuts" },
};

export default function Page() {
  return (
    <ToolShell
      slug="mac-screenshot-shortcuts"
      explain={
        <>
          <h2>Where the shortcuts come from</h2>
          <p>
            These are Apple&apos;s built-in macOS shortcuts. Adding <strong>Control</strong> to any of them copies the capture to the clipboard instead of saving a file. Holding <strong>Option</strong> while you click a window leaves out its shadow. <strong>Shift-Command-5</strong> opens the Screenshot app, whose Options menu sets the save folder, a timer, the floating thumbnail and whether the pointer shows.
          </p>
          <p>
            Screenmac uses its own shortcuts with Option added (Option-Shift-Command-4 for an area, 2 for a window, 3 for the full screen, 5 to record), so they never clash with the built-in ones. Every capture then opens in an editor where blur and pixelate are written into the pixels.
          </p>
        </>
      }
    >
      <ShortcutFinder />
    </ToolShell>
  );
}
