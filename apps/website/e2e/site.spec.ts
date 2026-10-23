import { expect, test } from "@playwright/test";

test("landing page explains the product and every primary CTA has a destination", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Your screen,\s*captured beautifully\./);
  await expect(page.getByRole("heading", { name: "This is the real editor. Go ahead." })).toBeVisible();

  await page.getByRole("main").getByRole("link", { name: "Try the editor" }).click();
  await expect(page).toHaveURL(/#editor$/);

  const ctas = page.getByRole("link", { name: "Join the Mac beta" });
  expect(await ctas.count()).toBeGreaterThan(1);
  for (const href of await ctas.evaluateAll((links) => links.map((l) => l.getAttribute("href")))) {
    expect(href).toBe("/download");
  }
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

test("download page is honest that there is no build and the waitlist reports real outcomes", async ({ page }) => {
  await page.goto("/download");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Mac app isn't ready to download yet.");
  await expect(page.getByRole("link", { name: /download for mac/i })).toHaveCount(0);

  const form = page.locator("main form").first();
  await form.getByLabel("Email address").fill("not-an-email");
  await form.getByRole("button", { name: "Join the beta list" }).click();
  await expect(form.getByRole("status")).toHaveText("Enter a valid email address.");
  await expect(form.getByLabel("Email address")).toHaveAttribute("aria-invalid", "true");

  await form.getByLabel("Email address").fill("dev@example.com");
  await form.getByRole("button", { name: "Join the beta list" }).click();
  // No webhook is configured in tests, so the API must say so rather than claim success.
  await expect(form.getByRole("status")).toContainText("not configured", { timeout: 20_000 });
  await expect(form.getByRole("status")).not.toContainText("You're on the list");
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
