"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveals, as on the Windowmac site: content below the fold rises, un-blurs and fades in as
 * it scrolls into view, staggered within each group. The markup stays plain: this finds the
 * pieces worth revealing in each <main> section. Content already on screen is never hidden, so
 * nothing flashes, and with reduced motion (or no script) everything simply stays put.
 * A section opts out with data-no-reveal (the hero and the live editor have their own motion).
 */
const CANDIDATES = [
  "h2",
  "h2 + p",
  "[data-reveal-item]",
  "article",
  "details",
  "ol > li",
  "ul > li",
  "dl > div",
  "pre",
].join(",");

const STAGGER_CAP = 5;

export function ScrollReveals() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section:not([data-no-reveal])")).filter(
      (s) => !s.closest("[data-no-reveal]"),
    );
    const found = new Set<HTMLElement>();
    for (const section of sections) {
      section.querySelectorAll<HTMLElement>(CANDIDATES).forEach((el) => {
        if (!el.closest("[data-no-reveal]") && el.offsetParent !== null) found.add(el);
      });
    }
    // Reveal the outermost piece only: a card moves as one, not each line inside it.
    const items = [...found].filter((el) => {
      for (let p = el.parentElement; p; p = p.parentElement) if (found.has(p)) return false;
      return true;
    });

    // Web Animations, not attributes: nothing React rendered is touched, so this is safe to run
    // while the page is still hydrating. A paused animation holds each item at its first frame.
    const below = window.innerHeight * 0.92;
    const pending = new Map<Element, Animation>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Below the screen and not in yet: keep waiting. Above it (a fast scroll or an anchor jump
          // went past): show it at once, so nothing is ever left hidden.
          const passed = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
          if (!entry.isIntersecting && !passed) continue;
          const animation = pending.get(entry.target);
          pending.delete(entry.target);
          io.unobserve(entry.target);
          if (!animation) continue;
          if (passed) {
            animation.cancel();
            continue;
          }
          animation.play();
          // Once it has arrived, drop the effect so the element's own styles and transitions apply.
          animation.finished.then(() => animation.cancel()).catch(() => {});
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const counts = new Map<Element | null, number>();
    for (const el of items) {
      if (el.getBoundingClientRect().top < below) continue; // already on screen: leave it be
      const group = el.parentElement;
      const index = Math.min(counts.get(group) ?? 0, STAGGER_CAP);
      counts.set(group, index + 1);
      const animation = el.animate(
        [
          { opacity: 0, transform: "translateY(28px)", filter: "blur(6px)" },
          { opacity: 1, transform: "none", filter: "none" },
        ],
        { duration: 1000, delay: index * 90, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
      );
      animation.pause();
      pending.set(el, animation);
      io.observe(el);
    }

    return () => {
      io.disconnect();
      pending.forEach((animation) => animation.cancel());
    };
  }, [pathname]);

  return null;
}
