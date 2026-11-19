import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/layout/PageHeader";
import { product } from "@/lib/product";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms",
  description: "Terms for using the Screenmac website, editor, and Mac app.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms of use">
        <p>Last updated 23 October 2026.</p>
      </PageHeader>
      <Prose>
        <section>
          <h2>The software</h2>
          <p>
            Screenmac is provided as is, without warranty. Features may change between releases. Keep copies of
            anything important.
          </p>
        </section>
        <section>
          <h2>What you capture</h2>
          <p>
            You are responsible for what you capture and share. Don&apos;t record content you aren&apos;t allowed to. macOS
            prevents capture of some protected content, and Screenmac doesn&apos;t try to get around that.
          </p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>
            <a href={`mailto:${product.email}`}>{product.email}</a>
          </p>
        </section>
      </Prose>
    </>
  );
}
