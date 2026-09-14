const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
  await context.route("**/api/v1/users/me", (route) =>
    route.fulfill({
      json: {
        id: "profile-test",
        email: "profile-test@example.com",
        full_name: "Alex Morgan",
        is_active: true,
        is_superuser: false,
        is_verified: true,
      },
    }),
  );
  await context.addInitScript(() => {
    localStorage.setItem("access_token", "profile-test");
    if (localStorage.getItem("saved-talent-v1:profile-test") === null) localStorage.setItem("saved-talent-v1:profile-test", "[]");
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const base = process.env.BASE_URL || "http://127.0.0.1:5180";
  const shot = async (name) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(__dirname, "artifacts", name),
      fullPage: true,
      animations: "disabled",
    });
  };
  await page.goto(base + "/talent/maya-laurent");
  await page.getByRole("heading", { name: "Maya Laurent", exact: true }).waitFor();
  if (process.env.BEFORE) {
    await shot("profile-before.png");
    await browser.close();
    return;
  }
  await shot("profile-refined-desktop.png");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: "Profile saved", exact: true }).getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("link", { name: "Selected work", exact: true }).click();
  assert.ok(page.url().endsWith("#selected-work"));
  await page.getByRole("button", { name: "View Ledger analytics", exact: true }).click();
  await page.getByRole("dialog").getByRole("heading", { name: "Ledger analytics", exact: true }).waitFor();
  await shot("profile-project-dialog.png");
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    await page.evaluate(() => scrollTo(0, 0));
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "Profile overflow at " + width,
    );
    if (width === 375) await shot("profile-refined-mobile.png");
  }
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
  await shot("profile-refined-dark.png");
  await page.getByRole("link", { name: "Message Maya", exact: true }).click();
  await page.waitForURL("**/messages?with=maya-laurent");
  await page.getByRole("textbox", { name: "Message Maya Laurent", exact: true }).waitFor();
  for (const id of ["noah-williams", "amara-okafor", "elias-chen", "sofia-mendes"]) {
    await page.goto(base + "/talent/" + id);
    await page.locator("h1").waitFor();
    await page.setViewportSize({ width: 375, height: 850 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      id + " overflow",
    );
  }
  await page.getByRole("link", { name: "Back to talent" }).click();
  await page.waitForURL("**/talent");
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    "PASS: profile save, section navigation, portfolio dialog, message route, all five profiles, 4 responsive widths, light/dark, no page errors.",
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
