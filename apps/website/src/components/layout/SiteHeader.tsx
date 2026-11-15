"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [section, setSection] = useState<string | null>(null);
  // The pill sits on the hovered link, else the section being read (home), else the current page.
  const target = hovered ?? (pathname === "/" ? section : (links.find((l) => l.href === pathname)?.href ?? null));

  useEffect(() => {
    const pill = pillRef.current;
    const nav = navRef.current;
    if (!pill || !nav) return;
    const link = target ? nav.querySelector<HTMLElement>(`a[href="${target}"]`) : null;
    if (!link) {
      pill.style.opacity = "0";
      return;
    }
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.opacity = "1";
  }, [target]);

  // On the home page, follow the section in the middle of the screen.
  useEffect(() => {
    if (pathname !== "/" || !("IntersectionObserver" in window)) return;
    const ids = links.filter((l) => l.href.startsWith("/#")).map((l) => l.href.slice(2));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const href = `/#${entry.target.id}`;
          if (entry.isIntersecting) setSection(href);
          else setSection((current) => (current === href ? null : current));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

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
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-4">
      <div
        className={cn(
          "mx-auto max-w-5xl rounded-2xl border transition-[background-color,border-color,box-shadow] duration-300",
          scrolled || open
            ? "border-line bg-paper-raised/85 shadow-[0_12px_32px_-16px_rgba(23,22,28,0.25),0_1px_0_rgba(255,255,255,0.6)_inset] backdrop-blur-xl backdrop-saturate-150"
            : "border-line/70 bg-paper-raised/60 shadow-[0_1px_2px_rgba(23,22,28,0.04)] backdrop-blur-md",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-4 pl-3 pr-2 md:pl-4">
          <div className="flex items-center gap-6">
            <Link href="/" aria-label="Screenmac home" className="shrink-0 rounded-md" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
            <nav
              ref={navRef}
              className="relative hidden items-center gap-0.5 lg:flex"
              aria-label="Primary"
              onMouseLeave={() => setHovered(null)}
            >
              <span
                ref={pillRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-paper-sunk opacity-0 transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              />
              {links.map((link) => {
                const active = link.href === pathname;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={() => setHovered(link.href)}
                    onFocus={() => setHovered(link.href)}
                    onBlur={() => setHovered(null)}
                    className={cn(
                      "relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors duration-300",
                      link.href === target ? "text-ink" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="hidden items-center gap-1.5 lg:flex">
            <a
              href={product.repoUrl}
              aria-label="Screenmac on GitHub"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-ink-muted transition-colors hover:bg-paper-sunk hover:text-ink"
            >
              <GitHubMark className="size-4" />
              <span>GitHub</span>
            </a>
            <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
            <LinkButton href={cta.href} size="sm">
              {cta.label}
            </LinkButton>
          </div>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl text-ink hover:bg-paper-sunk lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        <div id="mobile-nav" hidden={!open} className="border-t border-line lg:hidden">
          <nav className="flex flex-col px-2 py-2" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-[1.05rem] text-ink hover:bg-paper-sunk"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a href={product.repoUrl} className="flex items-center gap-2 rounded-lg px-3 py-3 text-[1.05rem] text-ink hover:bg-paper-sunk">
              <GitHubMark className="size-4" />
              GitHub
            </a>
            <LinkButton href={cta.href} className="m-1 mt-2" onClick={() => setOpen(false)}>
              {cta.label}
            </LinkButton>
          </nav>
        </div>
      </div>
    </header>
  );
}
