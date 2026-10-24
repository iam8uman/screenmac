import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { product } from "@/lib/product";
import "./globals.css";

const shareTitle = `${product.name}: free screenshot and screen recording app for Mac`;
const shareDescription =
  "Capture an area, a window or the whole screen, mark it up, hide what's private, and share it in seconds. Native, free, no account.";

export const metadata: Metadata = {
  metadataBase: new URL(product.siteUrl),
  title: {
    default: `${product.name} — ${product.headline}`,
    template: `%s · ${product.name}`,
  },
  description: product.description,
  applicationName: product.name,
  // The share image itself comes from app/opengraph-image.png and app/twitter-image.png.
  openGraph: {
    type: "website",
    url: "/",
    siteName: product.name,
    locale: "en_US",
    title: shareTitle,
    description: shareDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F4EF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-ink px-3 py-2 text-sm text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
