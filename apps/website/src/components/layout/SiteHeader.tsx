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
  // True while the header sits over a [data-header-dark] stage (the landing hero, demo and install).
  const [overDark, setOverDark] = useState(false);
  const pathname = usePathname();
  const cta = primaryCta();

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 8);
      const probe = 65; // just below the 64px header
      const dark = Array.from(document.querySelectorAll<HTMLElement>("[data-header-dark]")).some((el) => {
        const box = el.getBoundingClientRect();
        return box.height > 0 && box.top <= probe && box.bottom > 32;
      });
      setOverDark(dark);
    };
    update();
    // The new route's DOM may not be painted yet when the pathname changes.
    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  const dark = overDark && !open;

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
        dark
          ? scrolled
            ? "border-white/10 bg-[#08080b]/75 backdrop-blur-md"
            : "border-transparent bg-[#08080b]"
          : scrolled || open
            ? "border-line bg-paper/90 backdrop-blur-md"
            : "border-transparent bg-paper",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[75rem] items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" aria-label="Screenmac home" className="shrink-0 rounded-md" onClick={() => setOpen(false)}>
          <Logo tone={dark ? "dark" : "light"} />
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
                  dark
                    ? active
                      ? "bg-white/10 text-white"
                      : "text-white/65 hover:text-white"
                    : active
                      ? "bg-paper-sunk text-ink"
                      : "text-ink-muted hover:text-ink",
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
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm transition-colors",
              dark ? "text-white/65 hover:bg-white/10 hover:text-white" : "text-ink-muted hover:bg-paper-sunk hover:text-ink",
            )}
          >
            <GitHubMark className="size-4" />
            <span className="hidden lg:inline">GitHub</span>
          </a>
          <LinkButton href={cta.href} size="sm" variant={dark ? "inverse" : "primary"}>
            {cta.label}
          </LinkButton>
        </div>
        <button
          type="button"
          className={cn(
            "-mr-2 inline-flex size-10 items-center justify-center rounded-full md:hidden",
            dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-paper-sunk",
          )}
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
