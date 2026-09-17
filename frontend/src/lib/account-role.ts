export type AccountRole = "client" | "freelancer"

const roleChanged = "freelancer:account-role-changed"
const roleKey = (email: string) => `account-role:${email.trim().toLowerCase()}`

export function accountRole(email: string): AccountRole {
	try {
		return localStorage.getItem(roleKey(email)) === "freelancer" ? "freelancer" : "client"
	} catch {
		return "client"
	}
}

export function setAccountRole(email: string, role: AccountRole) {
	// Persist before notifying subscribers so route guards see the new workspace.
	// A failed write leaves the current workspace intact.
	localStorage.setItem(roleKey(email), role)
	window.dispatchEvent(new Event(roleChanged))
}

export function subscribeAccountRole(onChange: () => void) {
	const onStorage = (event: StorageEvent) => {
		if (event.key === null || event.key.startsWith("account-role:")) onChange()
	}
	window.addEventListener(roleChanged, onChange)
	window.addEventListener("storage", onStorage)
	return () => {
		window.removeEventListener(roleChanged, onChange)
		window.removeEventListener("storage", onStorage)
	}
}
