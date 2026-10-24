import type { MetadataRoute } from "next";
import { product } from "@/lib/product";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${product.siteUrl}/sitemap.xml`,
  };
}
