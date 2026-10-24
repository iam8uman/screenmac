"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { GitHubMark } from "@/components/install/GitHubMark";
import { primaryCta, product } from "@/lib/product";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#install", label: "Install" },
  { href: "/pricing", label: "Pricing" },
  { href: "/editor", label: "Editor" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const cta = primaryCta();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-200",
        scrolled || open ? "border-line bg-paper/90 backdrop-blur-md" : "border-transparent bg-paper",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[75rem] items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" aria-label="Screenmac home" className="shrink-0 rounded-md" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => {
            const active = link.href === pathname;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  active ? "bg-paper-sunk text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <a
            href={product.repoUrl}
            aria-label="Screenmac on GitHub"
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm text-ink-muted transition-colors hover:bg-paper-sunk hover:text-ink"
          >
            <GitHubMark className="size-4" />
            <span className="hidden lg:inline">GitHub</span>
          </a>
          <LinkButton href={cta.href} size="sm">
            {cta.label}
          </LinkButton>
        </div>
        <button
          type="button"
          className="-mr-2 inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-paper-sunk md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <div id="mobile-nav" hidden={!open} className="border-t border-line bg-paper md:hidden">
        <nav className="mx-auto flex max-w-[75rem] flex-col px-4 py-3" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-2 py-3 text-[1.05rem] text-ink hover:bg-paper-sunk"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a href={product.repoUrl} className="flex items-center gap-2 rounded-lg px-2 py-3 text-[1.05rem] text-ink hover:bg-paper-sunk">
            <GitHubMark className="size-4" />
            GitHub
          </a>
          <LinkButton href={cta.href} className="mt-3" onClick={() => setOpen(false)}>
            {cta.label}
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
