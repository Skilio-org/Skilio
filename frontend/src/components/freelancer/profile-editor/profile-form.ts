import type { FreelancerProfileDetailPublic, FreelancerProfileUpdate } from "@/client"
import { completion, type ProfileForm } from "@/components/freelancer/freelancer-profile-model"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { formatRate } from "@/lib/currency"

// Steps that must be complete before a profile can be published (indexes into `steps`).
export const requiredSteps = [0, 1, 2, 5]

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`

export function profileProgress(profile: ProfileForm) {
	const done = completion(profile)
	return {
		done,
		percent: Math.round((done.filter(Boolean).length / done.length) * 100),
		nextStep: done.findIndex((isDone, index) => !isDone && requiredSteps.includes(index)),
		summaries: [
			[profile.title, profile.location].filter(Boolean).join(" · "),
			[profile.category, plural(profile.skills.length, "skill")].filter(Boolean).join(" · "),
			profile.bio.trim().slice(0, 90),
			[plural(profile.experience.length, "job"), `${profile.education.length} education`].join(" · "),
			plural(profile.portfolio.length, "project"),
			[profile.rate && formatRate(profile.rate), profile.hours].filter(Boolean).join(" · "),
		],
	}
}

export type EntryKind = "experience" | "education" | "portfolio"
export type UpdateProfile = <K extends keyof ProfileForm>(name: K, value: ProfileForm[K]) => void

// The values profileProgress returns, used as a prop type by the step components.
export type ProfileProgress = ReturnType<typeof profileProgress>

export function profileFormFromApi(initial: FreelancerProfileDetailPublic): ProfileForm {
	return {
		name: initial.full_name ?? initial.user?.full_name ?? "",
		title: initial.title ?? "",
		location: initial.location ?? "",
		photo: accountAvatarUrl(initial.user_id),
		category: initial.category ?? "",
		skills: initial.skills ?? [],
		bio: initial.bio ?? "",
		languages: initial.languages ?? "",
		rate: initial.hourly_rate == null ? "" : String(initial.hourly_rate),
		availability: initial.availability ?? "",
		hours: initial.hours ?? "",
		finished: initial.finished ?? false,
		experience: (initial.experiences ?? []).map((entry) => ({
			id: entry.id,
			title: entry.title,
			organization: entry.organization ?? "",
			detail: entry.detail ?? "",
			url: entry.url ?? "",
		})),
		education: (initial.educations ?? []).map((entry) => ({
			id: entry.id,
			title: entry.title ?? entry.degree ?? "",
			organization: entry.organization ?? entry.institution ?? "",
			detail: entry.detail ?? entry.description ?? "",
			url: entry.url ?? "",
			field_of_study: entry.field_of_study,
			start_date: entry.start_date,
			end_date: entry.end_date,
		})),
		portfolio: (initial.portfolio ?? []).map((entry) => ({
			id: entry.id,
			title: entry.title,
			organization: entry.organization ?? "",
			detail: entry.detail ?? entry.description ?? "",
			url: entry.url ?? "",
			image_url: entry.image_url,
		})),
	}
}

const differs = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b)

// The API replaces a child collection whenever it is included, so only send the ones that changed.
export function buildProfileUpdate(
	profile: ProfileForm,
	saved: ProfileForm,
	finished: boolean,
	portfolioTouched: boolean,
): FreelancerProfileUpdate {
	const body: FreelancerProfileUpdate = {
		full_name: profile.name.trim(),
		title: profile.title,
		location: profile.location,
		category: profile.category,
		skills: profile.skills,
		bio: profile.bio,
		languages: profile.languages,
		hourly_rate: profile.rate.trim() ? Number(profile.rate) : null,
		hours: profile.hours,
		finished,
	}
	if (differs(profile.experience, saved.experience)) {
		body.experiences = profile.experience.map(({ title, organization, detail, url }) => ({
			title,
			organization,
			detail,
			url,
		}))
	}
	if (differs(profile.education, saved.education)) {
		body.educations = profile.education.map(
			({ title, organization, detail, url, field_of_study, start_date, end_date }) => ({
				title,
				organization,
				detail,
				url,
				degree: title,
				institution: organization,
				description: detail,
				field_of_study,
				start_date,
				end_date,
			}),
		)
	}
	if (portfolioTouched || differs(profile.portfolio, saved.portfolio)) {
		body.portfolio = profile.portfolio.map(({ title, organization, detail, url, image_url }) => ({
			title,
			organization,
			detail,
			url,
			description: detail,
			image_url,
		}))
	}
	return body
}
