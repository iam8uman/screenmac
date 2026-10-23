import { Plus } from "lucide-react";
import Link from "next/link";
import { product } from "@/lib/product";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Can I download Screenmac today?",
    a: (
      <>
        Not yet. The Mac app is in development and there&apos;s no signed build to download. You can{" "}
        <Link href="/download" className="text-ink underline underline-offset-2">
          join the beta list
        </Link>{" "}
        and try the editor on this page in the meantime.
      </>
    ),
  },
  {
    q: "Which versions of macOS will it support?",
    a: `macOS ${product.minimumMacOS} Sonoma and later. Capture uses Apple's ScreenCaptureKit.`,
  },
  {
    q: "Are my screenshots uploaded anywhere?",
    a: "No. The Mac app saves captures to a folder on your Mac and has no upload feature. The editor on this site draws in your browser. Images you open in it are never sent to a server.",
  },
  {
    q: "Is blur safe for passwords and card numbers?",
    a: "Use Redact for anything secret. It replaces the pixels with solid black in the exported file. Blur and pixelate also change the exported pixels, but a heavy blur of short text can sometimes be guessed, so they're better for faces and background details.",
  },
  {
    q: "Why does macOS ask for Screen Recording permission?",
    a: "macOS requires it before any app can read the screen, even for a single screenshot. If it's off, Screenmac tells you how to turn it on and doesn't pretend a capture happened.",
  },
  {
    q: "Will there be a paid version?",
    a: "Probably, for features like share links and scrolling capture. None of those are built, nothing is for sale, and the beta stays free.",
  },
];

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-line px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
        <div>
          <h2 id="faq-title" className="text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-ink">
            Questions, answered plainly.
          </h2>
          <p className="mt-5 max-w-sm leading-7 text-ink-muted">
            Something else?{" "}
            <a href={`mailto:${product.email}`} className="text-ink underline underline-offset-2">
              {product.email}
            </a>
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQS.map((item, index) => (
            <details key={item.q} className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[1.0625rem] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  className="size-4 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <div className="-mt-1 max-w-2xl pb-6 leading-7 text-ink-muted">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
