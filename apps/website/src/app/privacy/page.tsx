import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/layout/PageHeader";
import { product } from "@/lib/product";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Screenmac handles screenshots, recordings, and the little data this website collects.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy">
        <p>Last updated 23 October 2026. This describes what Screenmac does today, not plans.</p>
      </PageHeader>
      <Prose>
        <section>
          <h2>The Mac app</h2>
          <p>
            Captures, recordings, and annotations are created and stored on your Mac, in
            ~/Library/Application Support/Screenmac and in the folder you choose for exports. Screenmac has no account
            system and no upload feature, and it does not send your media anywhere.
          </p>
          <p>
            macOS asks for Screen Recording permission before any app can read the screen, and Microphone permission
            before recording audio. You can revoke both in System Settings at any time.
          </p>
        </section>
        <section>
          <h2>The editor on this website</h2>
          <p>
            The editor draws in your browser. Sample images ship with the site. Images you open, paste, or drop are
            decoded in the browser tab and are never sent to a server. Closing the tab discards them.
          </p>
        </section>
        <section>
          <h2>The beta list</h2>
          <p>
            If you submit your email, it is forwarded to the service we use for the beta announcement and used only
            for that. If that service isn&apos;t configured, the form says so and nothing is stored.
          </p>
        </section>
        <section>
          <h2>Analytics</h2>
          <p>
            This site has no analytics or tracking scripts. If that changes, we will count page views and button use
            only, never image content, text you type into the editor, or clipboard contents, and this page will say so.
          </p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>
            Questions or deletion requests: <a href={`mailto:${product.email}`}>{product.email}</a>
          </p>
        </section>
      </Prose>
    </>
  );
}
