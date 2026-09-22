import { useQuery } from "@tanstack/react-query"
import { ProfilesService } from "@/client"
import type { MessageContact } from "@/components/messages/message-types"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { getInitials } from "@/utils"

// The existing public API lists profiles, but has no user-ID filter.
// Keep this adapter separate so chat integration can replace it later.
export function useMessageContacts(enabled: boolean) {
	return useQuery({
		queryKey: ["message-contacts"],
		enabled,
		staleTime: 60_000,
		queryFn: async ({ signal }): Promise<MessageContact[]> => {
			const contacts: MessageContact[] = []
			let skip = 0
			while (true) {
				const { data: page } = await ProfilesService.readProfiles({
					query: { skip, limit: 100 },
					signal,
				})
				for (const profile of page.data) {
					const name = profile.full_name?.trim() || "Freelancer"
					contacts.push({
						id: profile.user_id,
						name,
						initials: getInitials(name),
						title: profile.title || "Freelancer",
						skills: profile.skill_names ?? profile.skills ?? [],
						avatarUrl: accountAvatarUrl(profile.user_id),
					})
				}
				skip += page.data.length
				if (!page.data.length || skip >= page.count) return contacts
			}
		},
	})
}
