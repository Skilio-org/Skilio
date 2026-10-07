import { useSyncExternalStore } from "react"
import type { AccountRole } from "@/lib/account-role"
import { accountRole, subscribeAccountRole } from "@/lib/account-role"
import useAuth from "./useAuth"

export { accountRole, setAccountRole } from "@/lib/account-role"

export function useAccountRole(): AccountRole {
	const { user } = useAuth()
	return useSyncExternalStore(
		subscribeAccountRole,
		() => {
			if (user?.active_role) {
				return user.active_role as AccountRole
			}
			if (user?.email) {
				return accountRole(user.email)
			}
			return "client"
		},
		() => "client" as const,
	)
}
