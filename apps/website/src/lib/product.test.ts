import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { primaryCta, product } from "./product";

const repoRoot = resolve(__dirname, "../../../..");

describe("release facts", () => {
  it("advertises the same version the Mac app is built with", () => {
    const pbxproj = readFileSync(resolve(repoRoot, "apps/macos/Screenmac.xcodeproj/project.pbxproj"), "utf8");
    const versions = [...pbxproj.matchAll(/MARKETING_VERSION = "?([^";]+)"?;/g)].map((m) => m[1]);
    expect(versions.length).toBeGreaterThan(0);
    for (const version of versions) expect(version).toBe(product.version);
  });

  it("downloads the asset the CI release publishes", () => {
    const workflow = readFileSync(resolve(repoRoot, ".github/workflows/ci.yml"), "utf8");
    expect(product.downloadUrl).toBe(`${product.releasesUrl}/latest/download/Screenmac.zip`);
    expect(workflow).toContain("apps/macos/build/Screenmac.zip");
    expect(workflow).toContain("apps/macos/build/Screenmac.zip.sha256");
  });

  it("installs from this site's own install script, which uses the same release", () => {
    expect(product.installCommand).toBe(`curl -fsSL ${product.siteUrl}/install.sh | bash`);
    const script = readFileSync(resolve(__dirname, "../../public/install.sh"), "utf8");
    expect(script).toContain('REPO="iam8uman/screenmac"');
    expect(script).toContain("releases/latest/download/Screenmac.zip");
    expect(script).toContain('BUNDLE_ID="app.screenmac.Screenmac"');
  });

  it("sends the primary call to action to the install section", () => {
    expect(primaryCta()).toEqual({ href: "/#install", label: "Download for Mac" });
  });
});
