import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const websiteRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(websiteRoot, "../..");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    root: repoRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
