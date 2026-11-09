// Official list of categories on the Skilio platform.
// Mirrors the backend JobCategory enum in backend/app/models.py.
export const PLATFORM_CATEGORIES = [
	"Web Mobile & Software Dev",
	"Design & Creative",
	"Ai & Automations",
	"Data Science & Analytics",
	"Sales & Marketing",
	"Engineering & Architecture",
	"IT & Networking",
	"Writing",
	"Accounting & Consulting",
	"Customer Service",
	"Legal",
] as const

export type PlatformCategory = (typeof PLATFORM_CATEGORIES)[number]
