import { maxSkillLength, maxSkills } from "@/components/common/skills-select"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import type { EducationPublic, ExperiencePublic, FreelancerProfileDetailPublic, PortfolioItemPublic } from "@/client"
import { formatMoney } from "@/lib/currency"

type EntryTextField = "title" | "organization" | "detail" | "url"

export type ProfileEntryForm = {
	[K in EntryTextField]-?: NonNullable<ExperiencePublic[K]>
} & Pick<ExperiencePublic, "id"> &
	Pick<EducationPublic, "field_of_study" | "start_date" | "end_date"> &
	Pick<PortfolioItemPublic, "image_url">

type ProfileTextField = "title" | "location" | "category" | "bio" | "languages" | "availability" | "hours"

export type ProfileForm = {
	[K in ProfileTextField]-?: NonNullable<FreelancerProfileDetailPublic[K]>
} & {
	name: NonNullable<FreelancerProfileDetailPublic["full_name"]>
	photo: string
	rate: string
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
	"Check how clients will see your profile. It goes live when you save.",
]

const fieldBase =
	"mt-2 w-full min-w-0 rounded-lg border border-input bg-surface-container-lowest px-3 text-sm text-on-surface shadow-none outline-none transition-[color,box-shadow] placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:opacity-50"
export const fieldClass = `${fieldBase} h-11`
export const textareaClass = `${fieldBase} min-h-28 resize-y py-2.5 leading-6`
export const primary = `${workspaceStyles.primaryAction} disabled:opacity-50`
export const secondary = workspaceStyles.secondaryAction

export const profileLimits = {
	name: 100,
	title: 100,
	skills: maxSkills,
	skillLength: maxSkillLength,
	bioMin: 80,
	bioMax: 3000,
	avatarBytes: 5 * 1024 * 1024,
	// Work experience, education and projects.
	entryTitle: 100,
	entryOrganization: 100,
	entryDetail: 1000,
	projectImageBytes: 5 * 1024 * 1024,
	cvBytes: 5 * 1024 * 1024,
	// Hourly rate in Moroccan dirhams (DH).
	rateMin: 10,
	rateMax: 5000,
}

export const isHttpsUrl = (value: string) => {
	try {
		return new URL(value).protocol === "https:"
	} catch {
		return false
	}
}

const rateInRange = (rate: string) => {
	const value = Number(rate)
	return Number.isFinite(value) && value >= profileLimits.rateMin && value <= profileLimits.rateMax
}

// Checks one experience, education or project entry. `label` is the name of its title field, e.g. "Job title".
export function validateEntry(entry: ProfileEntryForm, label: string): string | null {
	if (!entry.title.trim()) return `${label} is required.`
	if (entry.title.trim().length > profileLimits.entryTitle) {
		return `${label} can be at most ${profileLimits.entryTitle} characters.`
	}
	if (entry.organization.length > profileLimits.entryOrganization) {
		return `This field can be at most ${profileLimits.entryOrganization} characters.`
	}
	if (entry.detail.length > profileLimits.entryDetail) {
		return `The description can be at most ${profileLimits.entryDetail} characters.`
	}
	if (entry.url.trim() && !isHttpsUrl(entry.url.trim())) return "Enter a valid link that starts with https://"
	return null
}

export function validateProfile(p: ProfileForm): string | null {
	if (p.rate.trim() && !rateInRange(p.rate)) {
		return `Your hourly rate must be between ${formatMoney(profileLimits.rateMin)} and ${formatMoney(profileLimits.rateMax)}.`
	}
	for (const entry of [...p.experience, ...p.education, ...p.portfolio]) {
		const problem = validateEntry(entry, "The title")
		if (problem) return problem
	}
	if (p.name.trim().length > profileLimits.name) return `Your name can be at most ${profileLimits.name} characters.`
	if (p.title.trim().length > profileLimits.title) {
		return `Your professional title can be at most ${profileLimits.title} characters.`
	}
	if (p.skills.length > profileLimits.skills) return `Choose up to ${profileLimits.skills} skills.`
	if (p.skills.some((skill) => skill.length > profileLimits.skillLength)) {
		return `Each skill can be at most ${profileLimits.skillLength} characters.`
	}
	if (p.bio.length > profileLimits.bioMax) return `"About you" can be at most ${profileLimits.bioMax} characters.`
	return null
}

export function completion(p: ProfileForm) {
	return [
		!!(p.name.trim() && p.title.trim() && p.location.trim()),
		!!(p.category && p.skills.length),
		p.bio.trim().length >= profileLimits.bioMin && !!p.languages.trim(),
		p.experience.length > 0 || p.education.length > 0,
		p.portfolio.length > 0,
		rateInRange(p.rate) && !!p.hours,
	]
}
