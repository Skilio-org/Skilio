/* Run with a local production preview. Account API responses are test fixtures. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright")
const assert = require("node:assert/strict")
const path = require("node:path")
const baseURL = process.env.BASE_URL || "http://127.0.0.1:5174"
require("node:fs").mkdirSync(path.join(__dirname, "artifacts"), {
  recursive: true,
})
const artifact = (name) => path.join(__dirname, "artifacts", name)

;(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  })
  const errors = []
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
  })
  const page = await context.newPage()
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto(baseURL)
  await page
    .getByRole("heading", { name: "Good people. Great work." })
    .waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: artifact("landing-desktop.png"),
    fullPage: true,
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Development", exact: true }).click()
  assert.equal(await page.locator(".talent-preview").count(), 2)
  await page.getByRole("button", { name: "All talent", exact: true }).click()
  assert.equal(await page.locator(".talent-preview").count(), 3)
  await page.getByRole("link", { name: "Find work", exact: true }).click()
  assert.ok(page.url().includes("role=freelancer"))
  await page.goto(`${baseURL}/signup?role=client`)
  await page.screenshot({
    path: artifact("signup.png"),
    fullPage: true,
    animations: "disabled",
  })
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(baseURL)
    await page
      .getByRole("heading", { name: "Good people. Great work." })
      .waitFor()
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Landing overflow at ${width}`,
    )
    if (width === 375) {
      await page.getByRole("button", { name: "Open navigation" }).click()
      await page.getByRole("menuitem", { name: "Categories" }).click()
      assert.ok(page.url().endsWith("#categories"))
      await page.goto(baseURL)
      await page.screenshot({
        path: artifact("landing-mobile.png"),
        fullPage: true,
        animations: "disabled",
      })
    }
  }
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
  await page.goto(baseURL)
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("dark"),
  )
  await page.screenshot({
    path: artifact("landing-dark.png"),
    fullPage: true,
    animations: "disabled",
  })
  await page.emulateMedia({ colorScheme: "light" })

  // Signed-in user: real route guards, mocked account API, no backend writes.
  await context.route("**/api/v1/users/me", async (route) =>
    route.fulfill({
      json: {
        id: "ui-test-user",
        email: "ui-test@example.com",
        full_name: "Alex Morgan",
        is_active: true,
        is_superuser: false,
        is_verified: true,
      },
    }),
  )
  await page.evaluate(() =>
    localStorage.setItem("access_token", "ui-test-token"),
  )
  await page.goto(`${baseURL}/dashboard`)
  await page.getByRole("heading", { name: "Good to see you, Alex." }).waitFor()
  await page.screenshot({
    path: artifact("client-desktop.png"),
    fullPage: true,
    animations: "disabled",
  })
  await page.getByTestId("user-menu").click()
  await page.screenshot({
    path: artifact("account-menu.png"),
    animations: "disabled",
  })
  await page.getByRole("menuitem", { name: "Switch to freelancer" }).focus()
  await page.keyboard.press("Enter")
  await page.waitForURL("**/freelancer-dashboard")
  assert.equal(
    await page.evaluate(() =>
      localStorage.getItem("account-role:ui-test@example.com"),
    ),
    "freelancer",
  )
  await page.reload()
  await page
    .getByRole("navigation", { name: "Freelancer workspace", exact: true })
    .waitFor()
  await page.screenshot({
    path: artifact("freelancer-desktop.png"),
    fullPage: true,
    animations: "disabled",
  })
  await page.goto(`${baseURL}/dashboard`)
  await page.waitForURL("**/freelancer-dashboard")
  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Switch to client" }).click()
  await page.waitForURL("**/dashboard")
  await page.reload()
  await page.getByRole("heading", { name: "Good to see you, Alex." }).waitFor()
  // A second tab follows the account's workspace preference.
  const second = await context.newPage()
  await second.goto(`${baseURL}/dashboard`)
  await second.getByTestId("user-menu").click()
  await second.getByRole("menuitem", { name: "Switch to freelancer" }).click()
  await page.waitForURL("**/freelancer-dashboard")
  await second.close()
  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Switch to client" }).click()
  await page.waitForURL("**/dashboard")
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Client overflow at ${width}`,
    )
    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "Switch to freelancer" }).click()
    await page.waitForURL("**/freelancer-dashboard")
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Freelancer overflow at ${width}`,
    )
    if (width === 375)
      await page.screenshot({
        path: artifact("freelancer-mobile.png"),
        fullPage: true,
        animations: "disabled",
      })
    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "Switch to client" }).click()
    await page.waitForURL("**/dashboard")
    if (width === 375)
      await page.screenshot({
        path: artifact("client-mobile.png"),
        fullPage: true,
        animations: "disabled",
      })
  }
  await page.emulateMedia({ colorScheme: "dark" })
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("dark"),
  )
  const searchContrast = await page
    .getByRole("heading", { name: "Who would make your next project better?" })
    .evaluate((heading) => {
      const luminance = (value) => {
        const channels = value
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number)
          .map((channel) => {
            const normalized = channel / 255
            return normalized <= 0.04045
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4
          })
        return (
          channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
        )
      }
      const foreground = luminance(getComputedStyle(heading).color)
      const background = luminance(
        getComputedStyle(heading.closest("section")).backgroundColor,
      )
      return (
        (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05)
      )
    })
  assert.ok(searchContrast >= 4.5, `Search panel contrast: ${searchContrast}`)
  await page.screenshot({
    path: artifact("client-dark.png"),
    fullPage: true,
    animations: "disabled",
  })
  // Search still carries the actual query to the talent directory.
  await page
    .getByRole("searchbox", { name: "Search talent", exact: true })
    .last()
    .fill("React")
  await page.getByRole("button", { name: "Search talent", exact: true }).click()
  await page.waitForURL("**/talent?q=React")
  await page.emulateMedia({ colorScheme: "light" })
  for (const route of [
    "/talent",
    "/saved",
    "/messages",
    "/client-profile",
    "/settings",
  ]) {
    await page.goto(`${baseURL}${route}`)
    await page.locator("h1").first().waitFor()
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 900 })
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} overflow at ${width}`,
      )
      await page.screenshot({
        path: artifact(`${route.slice(1)}-${width}.png`),
        fullPage: true,
        animations: "disabled",
      })
    }
  }
  assert.deepEqual(errors, [])
  await browser.close()
  console.log(
    "PASS: landing filters, signup links, mobile menu, 4 responsive widths, light/dark, workspace switching both ways, reload persistence, route guards, cross-tab sync, search, no page errors.",
  )
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
