// Official list of categories on the Skilio platform.
// Mirrors the backend JobCategory enum in backend/app/models.py.
export const PLATFORM_CATEGORIES = [
	"Accounting & Consulting",
	"Customer Service",
	"Data Science & Analytics",
	"Design & Creative",
	"Engineering & Architecture",
	"Sales & Marketing",
	"Web Mobile & Software Dev",
	"Ai & Automations",
	"IT & Networking",
	"Writing",
	"Legal",
] as const

export type PlatformCategory = (typeof PLATFORM_CATEGORIES)[number]
