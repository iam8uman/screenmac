import type { Metadata } from "next";
import Link from "next/link";
import { ToolShell } from "@/components/content/ToolShell";
import { getTool } from "@/lib/content/tools";
import { shareOpenGraph } from "@/lib/share";
import { FileSizeCalculator } from "./FileSizeCalculator";

const tool = getTool("screen-recording-file-size-calculator");

export const metadata: Metadata = {
  alternates: { canonical: "/tools/screen-recording-file-size-calculator" },
  title: { absolute: tool.seoTitle },
  description: tool.seoDescription,
  openGraph: { ...shareOpenGraph, title: tool.seoTitle, description: tool.seoDescription, url: "/tools/screen-recording-file-size-calculator" },
};

export default function Page() {
  return (
    <ToolShell
      slug="screen-recording-file-size-calculator"
      explain={
        <>
          <h2>How the estimate works</h2>
          <p>
            A video file is, very nearly, its bitrate multiplied by its length. A recording at 8 megabits per second for 60 seconds holds 480 megabits, which is 60 megabytes. This calculator does only that sum, so the answer is as good as the bitrate you give it.
          </p>
          <p>
            Recorders do not all publish their bitrate, and most vary it with what is on screen: a still slide costs far less than scrolling or video. The most reliable input is a short test recording made with the same app and settings. Enter its size and length in the second mode and the calculator scales it to the length you plan to record.
          </p>
          <p>
            To shrink a recording you have already made, see <Link href="/blog/reduce-screen-recording-file-size-mac">how to make a Mac screen recording smaller</Link>.
          </p>
        </>
      }
    >
      <FileSizeCalculator />
    </ToolShell>
  );
}
