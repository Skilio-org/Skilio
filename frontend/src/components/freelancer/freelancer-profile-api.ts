import type { FreelancerProfileDetailPublic, FreelancerProfileUpdate } from "@/client"
import { empty, type Entry, type Profile } from "./freelancer-profile-model"

export function profileFromApi(data: FreelancerProfileDetailPublic): Profile {
	return {
		...empty,
		name: data.full_name ?? data.user?.full_name ?? "",
		title: data.title ?? "",
		location: data.location ?? "",
		category: data.category ?? "",
		skills: data.skill_names ?? data.skills ?? [],
		bio: data.bio ?? "",
		languages: data.languages ?? "",
		rate: data.hourly_rate == null ? "" : String(data.hourly_rate),
		availability: data.availability ?? "",
		hours: data.hours ?? "",
		finished: data.finished ?? false,
		experience: (data.experiences ?? []).map((entry) => ({
			id: entry.id,
			title: entry.title,
			organization: entry.organization ?? "",
			detail: entry.detail ?? "",
			url: entry.url ?? "",
		})),
		education: (data.educations ?? []).map((entry) => ({
			id: entry.id,
			title: entry.title ?? entry.degree ?? "",
			organization: entry.organization ?? entry.institution ?? "",
			detail: entry.detail ?? entry.description ?? "",
			url: entry.url ?? "",
		})),
		portfolio: (data.portfolio ?? []).map((entry) => ({
			id: entry.id,
			title: entry.title,
			organization: entry.organization ?? "",
			detail: entry.detail ?? entry.description ?? "",
			url: entry.url ?? "",
		})),
	}
}

const entryFields = ({ title, organization, detail, url }: Entry) => ({ title, organization, detail, url })

export function profileToApi(profile: Profile, previous: FreelancerProfileDetailPublic): FreelancerProfileUpdate {
	const original = profileFromApi(previous)
	const body: FreelancerProfileUpdate = {
		full_name: profile.name.trim(),
		title: profile.title,
		location: profile.location,
		category: profile.category,
		skills: profile.skills,
		bio: profile.bio,
		languages: profile.languages,
		hourly_rate: profile.rate.trim() ? Number(profile.rate) : null,
		availability: profile.availability,
		hours: profile.hours,
		finished: profile.finished,
	}
	// The API replaces child collections. Only send changed collections, and
	// preserve fields (dates, images) that this editor does not expose.
	if (JSON.stringify(profile.experience) !== JSON.stringify(original.experience)) {
		body.experiences = profile.experience.map(entryFields)
	}
	if (JSON.stringify(profile.education) !== JSON.stringify(original.education)) {
		body.educations = profile.education.map((entry) => {
			const old = previous.educations?.find((item) => item.id === entry.id)
			return {
				...entryFields(entry),
				degree: entry.title,
				institution: entry.organization,
				description: entry.detail,
				field_of_study: old?.field_of_study,
				start_date: old?.start_date,
				end_date: old?.end_date,
			}
		})
	}
	if (JSON.stringify(profile.portfolio) !== JSON.stringify(original.portfolio)) {
		body.portfolio = profile.portfolio.map((entry) => ({
			...entryFields(entry),
			description: entry.detail,
			image_url: previous.portfolio?.find((item) => item.id === entry.id)?.image_url,
		}))
	}
	return body
}
