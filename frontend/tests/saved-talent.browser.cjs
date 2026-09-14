const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, colorScheme: "light" });
  await context.route("**/api/v1/users/me", (route) =>
    route.fulfill({
      json: {
        id: "saved-test",
        email: "saved-test@example.com",
        full_name: "Alex Morgan",
        is_active: true,
        is_superuser: false,
        is_verified: true,
      },
    }),
  );
  await context.addInitScript(() => localStorage.setItem("access_token", "saved-test"));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.setDefaultTimeout(10000);
  const base = process.env.BASE_URL || "http://127.0.0.1:5180";
  const shot = async (name) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(__dirname, "artifacts", name),
      fullPage: true,
      animations: "disabled",
    });
  };
  await page.goto(base + "/saved");
  await page.getByRole("heading", { name: "Saved talent", exact: true }).waitFor();
  assert.equal(await page.getByRole("article").count(), 5);
  assert.equal(await page.getByRole("button", { name: /create list|new list|rename list/i }).count(), 0);
  const cardClass = await page.getByRole("article").first().getAttribute("class");
  await shot("saved-single-desktop.png");
  await page.goto(base + "/dashboard");
  const recommendations = page.getByRole("region", { name: "People worth getting to know" });
  await recommendations.getByRole("article").first().waitFor();
  assert.equal(await recommendations.getByRole("article").count(), 3);
  assert.equal(await recommendations.getByRole("article").first().getAttribute("class"), cardClass);
  await recommendations.getByRole("button", { name: "Remove Maya Laurent", exact: true }).click();
  await page.goto(base + "/saved");
  await page.getByRole("heading", { name: "Saved talent", exact: true }).waitFor();
  assert.equal(await page.getByRole("article").count(), 4);
  await page.goto(base + "/dashboard");
  await page.getByRole("button", { name: "Save Maya Laurent", exact: true }).click();
  await shot("dashboard-shared-talent-cards.png");
  await page.setViewportSize({ width: 375, height: 850 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Dashboard overflow");
  await shot("dashboard-shared-talent-cards-mobile.png");
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto(base + "/saved");
  await page.getByRole("heading", { name: "Saved talent", exact: true }).waitFor();
  await page.getByRole("button", { name: "Remove Maya Laurent", exact: true }).click();
  assert.equal(await page.getByRole("article").count(), 4);
  await page.reload();
  await page.getByRole("heading", { name: "Saved talent", exact: true }).waitFor();
  assert.equal(await page.getByRole("article").count(), 4);
  await page.goto(base + "/talent");
  await page.getByRole("button", { name: "Save Maya Laurent", exact: true }).waitFor();
  assert.equal(await page.getByRole("article").first().getAttribute("class"), cardClass);
  await page.getByRole("button", { name: "Save Maya Laurent", exact: true }).click();
  await page.goto(base + "/talent/maya-laurent");
  await page.getByRole("button", { name: "Profile saved", exact: true }).waitFor();
  await page.getByRole("button", { name: "Profile saved", exact: true }).click();
  await page.goto(base + "/saved");
  await page.getByRole("searchbox", { name: "Search saved talent" }).fill("React");
  assert.equal(await page.getByRole("article").count(), 1);
  await page.getByRole("searchbox", { name: "Search saved talent" }).fill("zz-no-match");
  await page.getByRole("heading", { name: "No matching saved profiles" }).waitFor();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await page.getByRole("combobox", { name: "Sort saved talent" }).click();
  await page.getByRole("option", { name: "Lowest rate" }).click();
  assert.equal(await page.getByRole("article").first().getAttribute("aria-label"), "Amara Okafor");
  const second = await context.newPage();
  await second.goto(base + "/talent");
  await second.getByRole("button", { name: "Save Maya Laurent", exact: true }).click();
  await page.getByRole("button", { name: "Remove Maya Laurent", exact: true }).waitFor();
  await second.close();
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Overflow at " + width);
    if (width === 375) await shot("saved-single-mobile.png");
  }
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
  await shot("saved-single-dark.png");
  for (const name of ["Maya Laurent", "Noah Williams", "Amara Okafor", "Elias Chen", "Sofia Mendes"])
    await page.getByRole("button", { name: "Remove " + name, exact: true }).click();
  await page.getByRole("heading", { name: "Your shortlist starts here" }).waitFor();
  await page.reload();
  await page.getByRole("heading", { name: "Your shortlist starts here" }).waitFor();
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    "PASS: one saved list, exact shared cards, directory/profile synchronization, refresh and cross-tab persistence, search, sorting, empty state, 4 widths and dark mode.",
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
