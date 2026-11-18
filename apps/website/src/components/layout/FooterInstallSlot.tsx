"use client";

import { usePathname } from "next/navigation";
import { FooterInstall } from "./FooterInstall";

/** The one-line install sits above "Get it on your Mac" on the home and download pages. */
const inlinePaths = new Set(["/", "/download"]);

export function FooterInstallSlot() {
  const path = usePathname();
  if (inlinePaths.has(path)) return null;

  return (
    <div className="border-b border-line">
      <div className="mx-auto max-w-[75rem] px-4 md:px-6">
        <FooterInstall />
      </div>
    </div>
  );
}
