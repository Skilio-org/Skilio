import { ProfilesService, type FreelancerProfilePublic } from "@/client"
import type { Freelancer } from "@/data/freelancers"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"

export type TalentCard = Pick<
	Freelancer,
	"id" | "name" | "title" | "location" | "rate" | "rating" | "reviews" | "availability" | "bio" | "skills"
> & {
	userId?: string
	avatarUrl?: string | null
	category?: string
}

export function talentCardFromApi(profile: FreelancerProfilePublic): TalentCard {
	return {
		id: profile.id,
		userId: profile.user_id,
		name: profile.full_name?.trim() || "Freelancer",
		title: profile.title ?? "Freelancer",
		location: profile.location ?? "",
		rate: profile.hourly_rate ?? 0,
		rating: profile.average_rating ?? 0,
		reviews: profile.reviews_count ?? 0,
		availability: profile.availability ?? "",
		bio: profile.bio ?? "",
		skills: profile.skills ?? [],
		category: profile.category ?? "",
		avatarUrl: profile.avatar_url || accountAvatarUrl(profile.user_id, "", "freelancer"),
	}
}

export async function loadTalentCards(
	query: { q?: string; category?: string; minRate?: number; maxRate?: number },
	signal?: AbortSignal,
) {
	const cards: TalentCard[] = []
	while (true) {
		const { data: page } = await ProfilesService.readProfiles({
			query: {
				skip: cards.length,
				limit: 100,
				q: query.q || undefined,
				category: query.category || undefined,
				min_rate: query.minRate,
				max_rate: query.maxRate,
			},
			signal,
		})
		cards.push(...page.data.map(talentCardFromApi))
		if (!page.data.length || cards.length >= page.count) return cards
	}
}

export async function loadTalentProfile(id: string) {
	const { data } = await ProfilesService.readProfileByUserId({ path: { user_id: id } })
	return data
}
