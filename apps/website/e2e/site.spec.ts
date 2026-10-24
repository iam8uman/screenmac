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

test("the header is dark over the night stage and light over the rest of the page", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header").first();
  const bg = () => header.evaluate((el) => getComputedStyle(el).backgroundColor);
  await expect.poll(bg).toMatch(/rgba?\(8, 8, 11/);
  await page.locator("#how-it-works").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect.poll(bg).not.toMatch(/rgba?\(8, 8, 11/);
});
