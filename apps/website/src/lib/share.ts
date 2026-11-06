import type { Metadata } from "next";
import { product } from "@/lib/product";

export const shareTitle = `${product.name}: free screenshot and screen recording app for Mac`;
export const shareDescription =
  "Capture an area, a window or the whole screen, mark it up, hide what's private, and share it in seconds. Native, free, no account.";

/**
 * Link-preview tags shared by every page. The image itself comes from app/opengraph-image.png.
 * No `url` here: each page that sets one must use its own path, or a shared subpage would
 * claim to be the homepage.
 */
export const shareOpenGraph = {
  type: "website",
  siteName: product.name,
  locale: "en_US",
  title: shareTitle,
  description: shareDescription,
} satisfies NonNullable<Metadata["openGraph"]>;
