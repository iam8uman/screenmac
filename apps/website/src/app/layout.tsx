import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { product } from "@/lib/product";
import { shareDescription, shareOpenGraph, shareTitle } from "@/lib/share";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(product.siteUrl),
  title: {
    default: `${product.name} — ${product.headline}`,
    template: `%s · ${product.name}`,
  },
  description: product.description,
  applicationName: product.name,
  // The share image itself comes from app/opengraph-image.png and app/twitter-image.png.
  openGraph: shareOpenGraph,
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
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
