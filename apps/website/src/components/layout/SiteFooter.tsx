import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { product } from "@/lib/product";
import { FooterInstallSlot } from "./FooterInstallSlot";
import { FooterWordmark } from "./FooterInstall";

const maker = [
  {
    href: "https://www.windowmac.app/",
    name: "Windowmac",
    pitch: "Flick windows into place.",
    icon: "https://www.windowmac.app/icon.png",
  },
  {
    href: "https://www.slidemac.app/",
    name: "Slidemac",
    pitch: "Trackpad edges for volume, brightness and apps.",
    icon: "https://slidemac.vercel.app/icon.png",
  },
  {
    href: "https://ui.sumansharma.info.np",
    name: "Sumanifest UI",
    pitch: "UI blocks you can copy, customize, and ship.",
    icon: "/sumanifest.svg",
  },
];

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
    title: "Learn",
    links: [
      { href: "/blog", label: "Guides" },
      { href: "/tools", label: "Free tools" },
      { href: "/tools/mac-screenshot-shortcuts", label: "Screenshot shortcuts" },
      { href: "/quiz/which-mac-screenshot-tool", label: "Screenshot tool quiz" },
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
      <FooterInstallSlot />
      <div className="mx-auto grid max-w-[75rem] gap-10 px-4 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:px-6">
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
        <div className="mx-auto max-w-[75rem] px-4 py-10 md:px-6">
          <h2 className="text-sm font-medium text-ink">From the same maker</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {maker.map((app) => (
              <li key={app.href}>
                <a href={app.href} className="group flex items-start gap-3 rounded-2xl border border-transparent p-2 transition-[background-color,border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-line hover:bg-paper-raised hover:shadow-[0_14px_30px_-18px_rgba(23,22,28,.35)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={app.icon} alt="" width={36} height={36} className="size-9 shrink-0 rounded-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
                  <span>
                    <span className="block text-sm font-medium text-ink transition-colors group-hover:text-accent">{app.name}</span>
                    <span className="mt-0.5 block text-sm leading-5 text-ink-muted">{app.pitch}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[75rem] px-4 md:px-6">
        <FooterWordmark />
      </div>
      <div className="relative border-t border-line bg-paper">
        <p className="mx-auto max-w-[75rem] px-4 py-5 text-xs text-ink-faint md:px-6">
          © {product.copyrightYear} Screenmac. Mac is a trademark of Apple Inc. Screenmac is not affiliated with Apple.
        </p>
      </div>
    </footer>
  );
}
