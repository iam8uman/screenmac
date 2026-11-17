import Link from "next/link";
import { CopyCommand } from "@/components/install/CopyCommand";
import { buttonClass } from "@/components/ui/Button";
import { product } from "@/lib/product";
import type { Post } from "@/lib/content/posts";
import { postPath } from "@/lib/content/posts";
import { appsFor, type AppKey } from "@/lib/content/site";

export function Breadcrumbs({ crumbs }: { crumbs: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap gap-1.5 text-sm text-ink-faint">
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i < crumbs.length - 1 ? (
              <Link href={c.path} className="hover:text-ink">
                {c.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-muted">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function FaqList({ faq, heading = "Frequently asked questions" }: { faq: { question: string; answer: string }[]; heading?: string }) {
  if (!faq.length) return null;
  return (
    <section aria-labelledby="faq-h" className="mt-14">
      <h2 id="faq-h" className="text-2xl font-semibold tracking-[-0.02em] text-ink">
        {heading}
      </h2>
      <div className="mt-5 divide-y divide-line border-y border-line">
        {faq.map((f, i) => (
          <details key={f.question} open={i === 0} className="group py-4">
            <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
              <span className="mr-2 inline-block text-ink-faint transition-transform group-open:rotate-45">+</span>
              {f.question}
            </summary>
            <p className="mt-2 pl-5 leading-7 text-ink-muted">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function AppsCallout({ primary }: { primary: AppKey }) {
  const apps = appsFor(primary);
  return (
    <aside aria-labelledby="apps-h" className="mt-14 rounded-2xl border border-line bg-paper-raised p-5 md:p-6">
      <h2 id="apps-h" className="text-xl font-semibold tracking-[-0.02em] text-ink">
        Free Mac apps that help with this
      </h2>
      <p className="mt-1 text-sm text-ink-muted">Three small, native utilities by the same developer. No account, no tracking.</p>
      <ul className="mt-4 grid gap-2.5">
        {apps.map((a) => (
          <li key={a.key}>
            <a
              href={a.url}
              className="grid grid-cols-[40px_1fr] items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:bg-paper-sunk sm:grid-cols-[40px_1fr_auto]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.icon} alt="" width={40} height={40} loading="lazy" className="rounded-[10px]" />
              <span>
                <b className="block font-semibold text-ink">{a.name}</b>
                <span className="block text-sm leading-5 text-ink-muted">{a.pitch}</span>
              </span>
              <span className="hidden text-sm text-ink sm:block">Get it free →</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function InstallCta() {
  return (
    <section aria-labelledby="cta-h" className="mt-14 rounded-3xl border border-line bg-paper-sunk px-5 py-10 text-center">
      <h2 id="cta-h" className="text-[clamp(1.6rem,3.4vw,2.2rem)] font-semibold tracking-[-0.03em] text-ink">
        Try {product.name}, free
      </h2>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-ink-muted">{product.description}</p>
      <div className="mx-auto mt-6 max-w-xl text-left">
        <CopyCommand command={product.installCommand} />
      </div>
      <Link href="/download" className={buttonClass("primary", "md", "mt-5")}>
        Download for Mac
      </Link>
    </section>
  );
}

const TYPE_LABEL: Record<string, string> = {
  "how-to": "How-to",
  alternative: "Alternative",
  comparison: "Comparison",
  roundup: "Roundup",
  explainer: "Explainer",
  troubleshooting: "Fix",
};

export function PostCard({ post }: { post: Post }) {
  return <Card href={postPath(post.slug)} tag={TYPE_LABEL[post.type] ?? "Guide"} title={post.title} text={post.description} />;
}

export function Card({ href, tag, title, text }: { href: string; tag: string; title: string; text: string }) {
  return (
    <Link href={href} className="flex flex-col gap-2 rounded-2xl border border-line bg-paper-raised p-5 transition hover:-translate-y-0.5 hover:border-line-strong">
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-accent">{tag}</span>
      <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">{title}</h3>
      <p className="text-[15px] leading-6 text-ink-muted">{text}</p>
    </Link>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function PageWrap({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className="px-4 pb-24 md:px-6">
      <div className={narrow ? "mx-auto max-w-3xl" : "mx-auto max-w-6xl"}>{children}</div>
    </div>
  );
}
