import { expect, test } from "@playwright/test";

test("landing page explains the product and every primary CTA has a destination", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Your screen,\s*captured beautifully\./);
  await expect(page.getByRole("heading", { name: "This is the real editor. Go ahead." })).toBeVisible();

  await page.getByRole("main").getByRole("link", { name: "Try the editor" }).click();
  await expect(page).toHaveURL(/#editor$/);

  const ctas = page.getByRole("link", { name: "Download for Mac" });
  expect(await ctas.count()).toBeGreaterThan(1);
  for (const href of await ctas.evaluateAll((links) => links.map((l) => l.getAttribute("href")))) {
    expect(["/#install", "/download"]).toContain(href);
  }
});

test("install section offers the one-liner, a real download, and the script", async ({ page, context, browserName }) => {
  await page.goto("/#install");
  const install = page.locator("#install");
  await expect(install.getByRole("heading", { name: "Install in a minute." })).toBeVisible();
  await expect(install.getByTestId("install-command")).toHaveText("curl -fsSL https://screenmac.vercel.app/install.sh | bash");
  await expect(install.getByRole("link", { name: "Download Screenmac.zip" })).toHaveAttribute(
    "href",
    "https://github.com/iam8uman/screenmac/releases/latest/download/Screenmac.zip",
  );
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await install.getByRole("button", { name: "Copy install command" }).click();
    await expect(install.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("install.sh | bash");
  }
  const script = await page.request.get("/install.sh");
  expect(script.status()).toBe(200);
  expect(await script.text()).toContain("releases/latest/download/Screenmac.zip");
});

test("primary navigation reaches real sections and pages", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  await nav.getByRole("link", { name: "Features" }).click();
  await expect(page.locator("#features")).toBeInViewport({ timeout: 10_000 });
  await nav.getByRole("link", { name: "Pricing" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.getByRole("heading", { level: 1, name: "Free while it's in beta." })).toBeVisible();
  await nav.getByRole("link", { name: "Editor" }).click();
  await expect(page).toHaveURL(/\/editor$/);
  await expect(page.getByTestId("editor-surface").filter({ visible: true })).toBeVisible();
});

for (const path of ["/features", "/pricing", "/download", "/editor", "/privacy", "/terms", "/support", "/changelog"]) {
  test(`page ${path} renders with one h1 and no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

test("unknown routes show a helpful 404", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Nothing was captured here." })).toBeVisible();
  await page.getByRole("link", { name: "Open the editor" }).click();
  await expect(page).toHaveURL(/\/editor$/);
});

test("pricing never offers a way to buy Pro", async ({ page }) => {
  await page.goto("/pricing");
  const pro = page.getByRole("article", { name: "Pro" });
  await expect(pro.getByText("Not available")).toBeVisible();
  await expect(pro.getByRole("link")).toHaveCount(0);
  await expect(pro.getByRole("button")).toHaveCount(0);
});

test("FAQ opens and matches the privacy claims", async ({ page }) => {
  await page.goto("/");
  const question = page.getByText("Are my screenshots uploaded anywhere?");
  await question.click();
  await expect(page.getByText(/Images you open in it are never sent to a server/)).toBeVisible();
  await page.goto("/privacy");
  await expect(page.getByText(/never sent to a server/)).toBeVisible();
});

test("download page offers the real build and the waitlist API never fakes success", async ({ page }) => {
  await page.goto("/download");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Install in a minute.");
  await expect(page.getByRole("link", { name: "Download Screenmac.zip" })).toHaveAttribute("href", /releases\/latest\/download\/Screenmac\.zip$/);
  await expect(page.getByRole("link", { name: "View the source" })).toHaveAttribute("href", "https://github.com/iam8uman/screenmac");

  // No webhook is configured in tests, so the API must say so rather than claim success.
  const response = await page.request.post("/api/waitlist", { data: { email: "dev@example.com" } });
  expect(response.status()).toBe(503);
  expect(JSON.stringify(await response.json())).toContain("not configured");
});

test("keyboard users can skip to content and see focus", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("reduced motion disables the hero animation", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const marquee = page.locator(".sm-marquee-in");
  await expect
    .poll(async () => parseFloat(await marquee.evaluate((el) => getComputedStyle(el).animationDuration)), { timeout: 10_000 })
    .toBeLessThan(0.01);
  await context.close();
});

test("the live demo sits under the hero, install sits right under the demo, then how it works", async ({ page }) => {
  await page.goto("/");
  const order = await page.evaluate(() =>
    ["editor", "install", "how-it-works"].map((id) => document.getElementById(id)!.getBoundingClientRect().top + window.scrollY),
  );
  expect(order[0]).toBeLessThan(order[1]);
  expect(order[1]).toBeLessThan(order[2]);
  const next = await page.evaluate(() => document.getElementById("editor")!.nextElementSibling?.id);
  expect(next).toBe("install");
});

test("the page is light from the top: header and hero use the paper background", async ({ page }) => {
  await page.goto("/");
  const paper = "rgb(245, 244, 239)";
  const bg = (selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).backgroundColor);
  await expect.poll(() => bg("header")).toBe(paper);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(paper);
  const heading = page.getByRole("heading", { level: 1 });
  expect(await heading.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(23, 22, 28)");
  // Scrolled anywhere, the header keeps dark text on paper.
  const link = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Features" });
  for (const id of ["editor", "install", "how-it-works"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    expect(await link.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(85, 83, 92)");
  }
});

test("the hero is headline, pill and actions only", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("section").first();
  await expect(hero.getByText("A native Mac app for screenshots")).toHaveCount(0);
  await expect(hero.getByText("Free while in beta")).toHaveCount(0);
  await expect(hero.getByRole("link", { name: "Download free for Mac" })).toHaveAttribute("href", "/#install");
  await expect(hero.getByRole("link", { name: /Free for macOS/ })).toHaveAttribute("href", "/#install");
});

test("the landing page hydrates cleanly with reduced motion on", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await expect(page.getByTestId("editor-surface").filter({ visible: true })).toBeVisible();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
  await context.close();
});

test("shared links get a large preview image and a real title", async ({ page }) => {
  await page.goto("/");
  const meta = (selector: string) => page.locator(selector).first().getAttribute("content");
  const ogImage = await meta('meta[property="og:image"]');
  expect(ogImage).toMatch(/^https:\/\/screenmac\.vercel\.app\/opengraph-image\.png/);
  expect(await meta('meta[property="og:image:width"]')).toBe("1200");
  expect(await meta('meta[property="og:image:height"]')).toBe("630");
  expect(await meta('meta[property="og:image:alt"]')).toContain("Screenmac");
  expect(await meta('meta[property="og:title"]')).toContain("Screenmac");
  expect(await meta('meta[property="og:url"]')).toBe("https://screenmac.vercel.app");
  expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
  expect(await meta('meta[name="twitter:image"]')).toMatch(/twitter-image\.png/);

  // The images the tags point at are really served.
  for (const path of [new URL(ogImage!).pathname + new URL(ogImage!).search, "/twitter-image.png", "/icon.png", "/apple-icon.png"]) {
    const res = await page.request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
  expect((await page.request.get("/sitemap.xml")).status()).toBe(200);
  expect(await (await page.request.get("/robots.txt")).text()).toContain("Sitemap: https://screenmac.vercel.app/sitemap.xml");
});

test("subpages share the same preview image", async ({ page }) => {
  await page.goto("/download");
  expect(await page.locator('meta[property="og:image"]').first().getAttribute("content")).toMatch(/opengraph-image\.png/);
});
