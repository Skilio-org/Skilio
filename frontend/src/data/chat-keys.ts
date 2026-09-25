
export const chatKeys = {
	all: ["chat"] as const,
	conversation: (id: string)  => [...chatKeys.all, "conversation", id] as const,
	conversations: ()           => [...chatKeys.all, "conversations"   ] as const,
	profiles: (users: string[]) => [...chatKeys.all, "profiles", users ] as const,
}