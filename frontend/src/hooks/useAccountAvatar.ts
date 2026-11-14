import { useEffect, useState } from "react"

const changed = "account-avatar-updated"

export function accountAvatarUrl(userId: string, version = "", role?: "client" | "freelancer") {
	const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
	const params = new URLSearchParams()
	if (role) params.set("role", role)
	if (version) params.set("v", version)
	const query = params.toString()
	return `${base}/api/v1/users/avatar/${userId}${query ? `?${query}` : ""}`
}

export function markAccountAvatarUpdated(userId: string, role?: "client" | "freelancer") {
	const version = String(Date.now())
	if (role) {
		localStorage.setItem(`account-avatar-version:${userId}:${role}`, version)
	}
	localStorage.setItem(`account-avatar-version:${userId}`, version)
	window.dispatchEvent(new Event(changed))
	return version
}

export function useAccountAvatarUrl(userId?: string, role?: "client" | "freelancer") {
	const [version, setVersion] = useState("")
	useEffect(() => {
		const update = () => {
			if (!userId) {
				setVersion("")
				return
			}
			const scopedKey = role ? `account-avatar-version:${userId}:${role}` : ""
			const v = (scopedKey ? localStorage.getItem(scopedKey) : null) ?? localStorage.getItem(`account-avatar-version:${userId}`) ?? ""
			setVersion(v)
		}
		update()
		window.addEventListener(changed, update)
		window.addEventListener("storage", update)
		return () => {
			window.removeEventListener(changed, update)
			window.removeEventListener("storage", update)
		}
	}, [userId, role])
	return userId ? accountAvatarUrl(userId, version, role) : undefined
}
