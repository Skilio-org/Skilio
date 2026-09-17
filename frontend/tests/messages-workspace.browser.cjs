const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright")
const assert = require("node:assert/strict")
const path = require("node:path")
const base = process.env.BASE_URL || "http://127.0.0.1:5180"
const artifact = (name) => path.join(__dirname, "artifacts", name)
;(async () => {
	const browser = await chromium.launch({
		executablePath: process.env.CHROMIUM_PATH,
	})
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		colorScheme: "light",
	})
	await context.route("**/api/v1/users/me", (route) =>
		route.fulfill({
			json: {
				id: "demo-test",
				email: "demo-test@example.com",
				full_name: "Alex Morgan",
				is_active: true,
				is_superuser: false,
				is_verified: true,
			},
		}),
	)
	await context.addInitScript(() => localStorage.setItem("access_token", "demo-test-token"))
	const page = await context.newPage()
	page.setDefaultTimeout(10000)
	const errors = []
	page.on("pageerror", (error) => errors.push(error.message))
	const screenshot = async (name) => {
		await page.evaluate(() => document.fonts.ready)
		await page.screenshot({
			path: artifact(name),
			fullPage: true,
			animations: "disabled",
		})
	}
	const noOverflow = async () =>
		assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Horizontal overflow")
	await page.goto(`${base}/messages`)
	await page.getByRole("heading", { name: "Good work starts with a conversation." }).waitFor()
	await page
		.getByRole("button", {
			name: "Maya Laurent, 2 unread messages",
			exact: true,
		})
		.click()
	const maya = page.getByRole("textbox", {
		name: "Message Maya Laurent",
		exact: true,
	})
	await maya.fill("Maya draft")
	await page.getByRole("button", { name: "Noah Williams", exact: true }).click()
	const noah = page.getByRole("textbox", {
		name: "Message Noah Williams",
		exact: true,
	})
	assert.equal(await noah.inputValue(), "")
	await noah.fill("Noah draft")
	await page.getByRole("button", { name: "Maya Laurent", exact: true }).click()
	assert.equal(await maya.inputValue(), "Maya draft")
	await page.getByRole("button", { name: "Send", exact: true }).click()
	assert.equal(await maya.inputValue(), "")
	await page.getByRole("log").getByText("Maya draft", { exact: true }).waitFor()
	await page.getByRole("button", { name: "Search this conversation" }).click()
	await page.getByRole("textbox", { name: "Search messages in this conversation" }).fill("Maya draft")
	await page.getByText("1 message found", { exact: true }).waitFor()
	await page.getByRole("textbox", { name: "Search messages in this conversation" }).fill("zz-no-match")
	await page.getByRole("heading", { name: "No messages match this search" }).waitFor()
	await page.getByRole("button", { name: "Close conversation search" }).click()
	await page.getByRole("button", { name: "Add a brief" }).click()
	await page.getByRole("textbox", { name: "What do you have in mind?" }).fill("Build a focused onboarding prototype.")
	await page.getByRole("button", { name: "Add to message", exact: true }).click()
	assert.equal(await maya.inputValue(), "Build a focused onboarding prototype.")
	await screenshot("messages-updated-desktop.png")
	await page.getByRole("button", { name: "Show conversation details" }).click()
	await page.getByRole("heading", { name: "Conversation details" }).waitFor()
	await page.keyboard.press("Escape")
	await page.getByRole("button", { name: "Conversation options" }).click()
	await page.getByRole("menuitem", { name: "Archive conversation" }).click()
	await page.getByRole("button", { name: "Archived", exact: true }).click()
	await page.getByRole("button", { name: "Maya Laurent", exact: true }).click()
	await page.getByRole("button", { name: "Move to inbox", exact: true }).click()
	await page.getByRole("button", { name: "All inbox", exact: true }).click()
	await page.getByRole("button", { name: "Maya Laurent", exact: true }).click()
	await page.getByRole("button", { name: "Conversation options" }).click()
	await page.getByRole("menuitem", { name: "Mark as unread" }).click()
	await page
		.getByRole("button", {
			name: "Maya Laurent, 1 unread messages",
			exact: true,
		})
		.waitFor()
	await page.getByTestId("user-menu").click()
	await page.getByRole("menuitem", { name: "Switch to freelancer" }).click()
	await page.waitForURL("**/freelancer-dashboard")
	await page.getByText("Design a clearer onboarding experience", { exact: true }).waitFor()
	await screenshot("freelancer-demo-overview.png")
	await page.goto(`${base}/freelancer-jobs`)
	await page
		.getByRole("button", {
			name: "Save Build a responsive customer dashboard",
			exact: true,
		})
		.click()
	await page.getByRole("button", { name: "Saved", exact: true }).click()
	await page
		.getByRole("button", {
			name: "Build a responsive customer dashboard",
			exact: true,
		})
		.click()
	await page.getByRole("button", { name: "Prepare proposal", exact: true }).click()
	await page
		.getByRole("textbox", { name: "Your introduction" })
		.fill("I would build an accessible React dashboard with reusable chart components and clear responsive behavior.")
	await page.getByRole("spinbutton").fill("65")
	await page.getByRole("button", { name: "Save draft", exact: true }).click()
	await page.goto(`${base}/freelancer-proposals`)
	const proposal = page.locator("section").filter({
		has: page.getByRole("heading", {
			name: "Build a responsive customer dashboard",
			exact: true,
		}),
	})
	await proposal.getByRole("button", { name: "Submit demo proposal" }).click()
	await page.getByRole("button", { name: "Submitted", exact: true }).click()
	await proposal.getByRole("button", { name: "Archive", exact: true }).click()
	await page.getByRole("button", { name: "Archived", exact: true }).click()
	await proposal.getByRole("button", { name: "Restore draft" }).click()
	await page.getByRole("button", { name: "Drafts", exact: true }).click()
	await proposal.getByRole("button", { name: "Edit draft" }).waitFor()
	await page.goto(`${base}/freelancer-projects`)
	await page.getByRole("button", { name: "Open project", exact: true }).first().click()
	await page
		.getByRole("textbox", { name: "Delivery notes" })
		.fill("The interactive prototype is ready for your review at the shared design link.")
	await page.getByRole("button", { name: "Submit demo deliverable" }).click()
	await page.reload()
	await page.getByText("Demo submission awaiting review", { exact: true }).waitFor()
	await screenshot("freelancer-demo-projects.png")
	await page.goto(`${base}/freelancer-earnings`)
	const download = page.waitForEvent("download")
	await page.getByRole("button", { name: "Export CSV" }).click()
	assert.equal((await download).suggestedFilename(), "demo-earnings.csv")
	await page.getByRole("button", { name: "Preview payout" }).click()
	await page.getByRole("button", { name: "Simulate payout request" }).click()
	await page.getByRole("button", { name: "Demo payout requested" }).waitFor()
	await screenshot("freelancer-demo-earnings.png")
	await page.goto(`${base}/freelancer-messages?with=olivia-bennett`)
	await page
		.getByRole("textbox", { name: "Message Olivia Bennett", exact: true })
		.fill("Thanks Olivia. Thursday works for the prototype review.")
	await page.getByRole("button", { name: "Send", exact: true }).click()
	await screenshot("freelancer-demo-messages.png")
	for (const width of [375, 768, 1024, 1440]) {
		await page.setViewportSize({ width, height: 667 })
		await noOverflow()
		const box = await page.getByRole("button", { name: "Send", exact: true }).boundingBox()
		assert.ok(box.y + box.height <= 667, `Composer outside viewport at ${width}`)
		if (width === 375) await screenshot("freelancer-demo-messages-mobile.png")
	}
	await page.setViewportSize({ width: 375, height: 450 })
	const compact = await page.getByRole("button", { name: "Send", exact: true }).boundingBox()
	assert.ok(compact.y + compact.height <= 450, "Composer outside compact viewport")
	await page.setViewportSize({ width: 375, height: 750 })
	await page.getByRole("button", { name: "Back to conversations" }).click()
	await page.getByRole("heading", { name: "Messages", exact: true }).waitFor()
	await page.getByRole("button", { name: "Open workspace navigation" }).click()
	await page.getByRole("menuitem", { name: "My work", exact: true }).click()
	await page.waitForURL("**/freelancer-projects")
	for (const route of [
		"freelancer-dashboard",
		"freelancer-jobs",
		"freelancer-proposals",
		"freelancer-projects",
		"freelancer-earnings",
		"freelancer-settings",
		"freelancer",
	]) {
		await page.goto(`${base}/${route}`)
		await page.locator("h1").first().waitFor()
		await noOverflow()
		await screenshot(`${route}-demo-mobile.png`)
	}
	await page.getByRole("button", { name: "Load demo profile", exact: true }).click()
	await page.getByRole("button", { name: "Preview", exact: true }).click()
	await page.getByText("Product designer & frontend developer", { exact: true }).waitFor()
	await page.reload()
	await page.getByRole("button", { name: "Preview", exact: true }).click()
	await page.getByText("Product designer & frontend developer", { exact: true }).waitFor()
	await page.emulateMedia({ colorScheme: "dark" })
	await page.setViewportSize({ width: 1440, height: 900 })
	await page.goto(`${base}/freelancer-messages?with=olivia-bennett`)
	await page.getByRole("textbox", { name: "Message Olivia Bennett", exact: true }).waitFor()
	await screenshot("freelancer-demo-messages-dark.png")
	assert.deepEqual(errors, [])
	await browser.close()
	console.log(
		"PASS: shared inbox, independent drafts, search, brief, archive/read states; freelancer demo proposals, project submission persistence, CSV and payout preview; responsive screens and compact composer; no page errors.",
	)
})().catch((error) => {
	console.error(error)
	process.exit(1)
})
