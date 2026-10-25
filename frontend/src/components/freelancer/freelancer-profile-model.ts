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
	"Rates & availability",
	"Review",
]
export const descriptions = [
	"Put a face and a name to your work.",
	"Help clients find you for the work you do best.",
	"Tell clients what you bring to their project.",
	"Give your work some context. You can add these later.",
	"Show the thinking and craft behind your work.",
	"Set expectations for your next collaboration.",
	"Take a moment to see your profile as a client would.",
]
export const fieldClass =
	"mt-2 min-h-12 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
export const primary =
	"inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
export const secondary =
	"inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

export function completion(p: ProfileForm) {
	return [
		!!(p.name.trim() && p.title.trim() && p.location.trim()),
		!!(p.category && p.skills.length),
		p.bio.trim().length >= 80 && !!p.languages.trim(),
		p.experience.length > 0 || p.education.length > 0,
		p.portfolio.length > 0,
		Number.isFinite(Number(p.rate)) && Number(p.rate) > 0 && !!p.availability && !!p.hours,
	]
}
