import type { MetadataRoute } from "next";
import { product } from "@/lib/product";

const ROUTES = ["", "/download", "/editor", "/features", "/pricing", "/changelog", "/support", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${product.siteUrl}${route}`,
    changeFrequency: route === "" || route === "/changelog" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/download" ? 0.9 : 0.6,
  }));
}
