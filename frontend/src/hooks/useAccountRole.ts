import { useRouterState } from "@tanstack/react-router";
import useAuth from "./useAuth";

export function useAccountRole() {
  const { user } = useAuth();
  const path = useRouterState({ select: (state) => state.location.pathname });
  // Preview routes never determine the role of an authenticated account.
  return user
    ? accountRole(user.email)
    : import.meta.env.MODE === "visual-test" && path.startsWith("/freelancer")
      ? "freelancer"
      : "client";
}

export function accountRole(email: string): "client" | "freelancer" {
  return localStorage.getItem(`account-role:${email.trim().toLowerCase()}`) === "freelancer" ? "freelancer" : "client";
}
