import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/layout/PageHeader";
import { product } from "@/lib/product";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the Screenmac website, editor, and Mac beta.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms of use">
        <p>Last updated 23 October 2026.</p>
      </PageHeader>
      <Prose>
        <section>
          <h2>Beta software</h2>
          <p>
            Screenmac is beta software provided as is, without warranty. Features may change or be removed before a
            stable release. Keep copies of anything important.
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
          <h2>Paid plans</h2>
          <p>Nothing is for sale. If paid plans arrive, they will come with their own terms before anyone is charged.</p>
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
