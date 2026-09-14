import { useRouterState } from "@tanstack/react-router"
import { useSyncExternalStore } from "react"
import { accountRole, subscribeAccountRole } from "@/lib/account-role"
import useAuth from "./useAuth"

export { accountRole, setAccountRole } from "@/lib/account-role"

export function useAccountRole() {
  const { user } = useAuth()
  const path = useRouterState({ select: (state) => state.location.pathname })
  return useSyncExternalStore(
    subscribeAccountRole,
    () =>
      user
        ? accountRole(user.email)
        : import.meta.env.MODE === "visual-test" &&
            path.startsWith("/freelancer")
          ? "freelancer"
          : "client",
    () => "client" as const,
  )
}
