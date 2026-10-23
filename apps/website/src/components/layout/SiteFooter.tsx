import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { product } from "@/lib/product";

const groups = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/editor", label: "Try the editor" },
      { href: "/pricing", label: "Pricing" },
      { href: "/download", label: "Mac beta" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/support", label: "Support" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: `mailto:${product.email}`, label: "Email us" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[75rem] gap-10 px-4 py-14 md:grid-cols-[1.6fr_1fr_1fr] md:px-6">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink-muted">
            Screenshots and screen recordings for macOS {product.minimumMacOS} and later. Everything stays on your Mac.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium text-ink">{group.title}</h2>
            <ul className="mt-3 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[75rem] px-4 py-5 text-xs text-ink-faint md:px-6">
          © {product.copyrightYear} Screenmac. Mac is a trademark of Apple Inc. Screenmac is not affiliated with Apple.
        </p>
      </div>
    </footer>
  );
}
