import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import type { EducationPublic, ExperiencePublic, FreelancerProfileDetailPublic, PortfolioItemPublic } from "@/client"

type EntryTextField = "title" | "organization" | "detail" | "url"

export type ProfileEntryForm = {
	[K in EntryTextField]-?: NonNullable<ExperiencePublic[K]>
} &
	Pick<ExperiencePublic, "id"> &
	Pick<EducationPublic, "field_of_study" | "start_date" | "end_date"> &
	Pick<PortfolioItemPublic, "image_url">

type ProfileTextField = "title" | "location" | "category" | "bio" | "languages" | "availability" | "hours"

export type ProfileForm = {
	[K in ProfileTextField]-?: NonNullable<FreelancerProfileDetailPublic[K]>
} & {
	name: NonNullable<FreelancerProfileDetailPublic["full_name"]>
	photo: string
	rate: string // Text inputs hold strings; the API uses hourly_rate as a number.
	skills: NonNullable<FreelancerProfileDetailPublic["skills"]>
	finished: NonNullable<FreelancerProfileDetailPublic["finished"]>
	experience: ProfileEntryForm[]
	education: ProfileEntryForm[]
	portfolio: ProfileEntryForm[]
}
export const steps = [
	"The basics",
	"Your expertise",
	"Your introduction",
	"Work & education",
	"Portfolio",
	"Rates & hours",
	"Review",
]
export const descriptions = [
	"Your photo, name, title and location.",
	"Your main field and the skills clients can find you by.",
	"Tell clients what you do and who you help.",
	"Optional. Add past roles and education.",
	"Optional. Add projects that show your work.",
	"Your hourly rate and weekly hours.",
	"Check how clients will see your profile, then publish.",
]
// Matches the shared Input used on the other forms (client profile, settings).
const fieldBase =
	"mt-2 w-full min-w-0 rounded-lg border border-input bg-surface-container-lowest px-3 text-sm text-on-surface shadow-none outline-none transition-[color,box-shadow] placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:opacity-50"
export const fieldClass = `${fieldBase} h-11`
export const textareaClass = `${fieldBase} min-h-28 resize-y py-2.5 leading-6`
export const primary = `${workspaceStyles.primaryAction} disabled:opacity-50`
export const secondary = workspaceStyles.secondaryAction

export function completion(p: ProfileForm) {
	return [
		!!(p.name.trim() && p.title.trim() && p.location.trim()),
		!!(p.category && p.skills.length),
		p.bio.trim().length >= 80 && !!p.languages.trim(),
		p.experience.length > 0 || p.education.length > 0,
		p.portfolio.length > 0,
		Number.isFinite(Number(p.rate)) && Number(p.rate) > 0 && !!p.hours,
	]
}
