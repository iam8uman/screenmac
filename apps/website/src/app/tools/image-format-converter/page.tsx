import type { Metadata } from "next";
import Link from "next/link";
import { ToolShell } from "@/components/content/ToolShell";
import { getTool } from "@/lib/content/tools";
import { shareOpenGraph } from "@/lib/share";
import { FormatConverter } from "./FormatConverter";

const tool = getTool("image-format-converter");

export const metadata: Metadata = {
  alternates: { canonical: "/tools/image-format-converter" },
  title: { absolute: tool.seoTitle },
  description: tool.seoDescription,
  openGraph: { ...shareOpenGraph, title: tool.seoTitle, description: tool.seoDescription, url: "/tools/image-format-converter" },
};

export default function Page() {
  return (
    <ToolShell
      slug="image-format-converter"
      explain={
        <>
          <h2>What happens to your image</h2>
          <p>
            Your browser decodes the image, draws it onto a canvas and encodes a new file in the format you picked. Nothing is uploaded. Because the new file is built from pixels alone, it does not carry over the EXIF and XMP metadata, colour profile notes or Finder tags of the original.
          </p>
          <p>
            PNG is lossless and best for text and interface screenshots. JPG and WebP are lossy: smaller files, with some blurring around sharp edges at lower quality settings. WebP saving depends on your browser; if it is not supported you will see a message rather than a mislabelled file.
          </p>
          <p>
            Why the formats differ, and when each is the right choice, is covered in <Link href="/blog/remove-metadata-from-screenshot-mac">removing metadata from a screenshot</Link> and the <Link href="/blog/how-to-screenshot-on-mac">Mac screenshot guide</Link>.
          </p>
        </>
      }
    >
      <FormatConverter />
    </ToolShell>
  );
}
