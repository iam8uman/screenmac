import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/layout/PageHeader";
import { product } from "@/lib/product";

export const metadata: Metadata = {
  title: "Support",
  description: "Fix common Screenmac issues: permissions, shortcuts, copying, and exports.",
};

export default function SupportPage() {
  return (
    <>
      <PageHeader title="Support">
        <p>
          Fixes for the most common problems. Still stuck? Email <a className="text-ink underline underline-offset-2" href={`mailto:${product.email}`}>{product.email}</a>{" "}
          with your macOS version and what you expected to happen.
        </p>
      </PageHeader>
      <Prose>
        <section>
          <h2>Captures come out blank or the app asks for permission</h2>
          <p>
            Open System Settings, then Privacy &amp; Security, then Screen &amp; System Audio Recording. Turn on
            Screenmac, then quit and reopen it. macOS only applies the change after a relaunch.
          </p>
        </section>
        <section>
          <h2>A shortcut does nothing</h2>
          <p>
            Another app or macOS may already use it. The built-in screenshot shortcuts can be turned off in System
            Settings, then Keyboard, then Keyboard Shortcuts, then Screenshots. Or pick different keys in Screenmac&apos;s
            settings.
          </p>
        </section>
        <section>
          <h2>Copy doesn&apos;t work in the browser editor</h2>
          <p>
            Some browsers block writing images to the clipboard, or only allow it on HTTPS. The editor tells you when
            that happens. Use Export PNG instead; it works everywhere.
          </p>
        </section>
        <section>
          <h2>My own image won&apos;t open in the editor</h2>
          <p>
            The editor opens PNG, JPEG, WebP, and GIF files. Very large images are scaled down to 6000 pixels on the
            long edge so the browser stays responsive.
          </p>
        </section>
      </Prose>
    </>
  );
}
