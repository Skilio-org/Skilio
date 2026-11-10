export const chatKeys = {
	all: ["chat"] as const,
	conversation: (id: string) => [...chatKeys.all, "conversation", id] as const,
	conversations: (role?: string) => [...chatKeys.all, "conversations", role ?? "active"] as const,
	profile: (userId: string, role: string) => [...chatKeys.all, "profile", userId, role] as const,
	notifications: () => [...chatKeys.all, "notifications"] as const,
}
