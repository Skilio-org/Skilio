import { useCallback, useEffect, useState } from "react"
import useAuth from "@/hooks/useAuth"

const changed = "freelancer-saved-jobs-changed"

export function useSavedJobs() {
	const { user } = useAuth()
	const storageKey = `freelancer-work-v2:${user?.id ?? "preview"}`
	const [state, setState] = useState<{ key: string; saved: string[]; savedAt: Record<string, string> }>({
		key: "",
		saved: [],
		savedAt: {},
	})
	const [error, setError] = useState("")
	const read = useCallback(() => {
		try {
			const data = JSON.parse(localStorage.getItem(storageKey) || "{}")
			setState({
				key: storageKey,
				saved: Array.isArray(data.saved)
					? data.saved.filter((id: unknown): id is string => typeof id === "string")
					: [],
				savedAt: data.savedAt ?? {},
			})
			setError("")
		} catch {
			setError("Your saved jobs couldn't be restored on this device.")
		}
	}, [storageKey])
	useEffect(() => {
		read()
		window.addEventListener(changed, read)
		window.addEventListener("storage", read)
		return () => {
			window.removeEventListener(changed, read)
			window.removeEventListener("storage", read)
		}
	}, [read])
	const toggleSaved = (id: string) => {
		try {
			const data = JSON.parse(localStorage.getItem(storageKey) || "{}")
			const ids: string[] = Array.isArray(data.saved)
				? data.saved.filter((value: unknown) => typeof value === "string")
				: []
			const savedAt = { ...data.savedAt }
			const removing = ids.includes(id)
			if (removing) delete savedAt[id]
			else savedAt[id] = new Date().toISOString()
			localStorage.setItem(
				storageKey,
				JSON.stringify({ ...data, saved: removing ? ids.filter((value) => value !== id) : [...ids, id], savedAt }),
			)
			window.dispatchEvent(new Event(changed))
			return true
		} catch {
			setError("Saved jobs couldn't be updated on this device.")
			return false
		}
	}
	return {
		saved: state.key === storageKey ? state.saved : [],
		savedAt: state.key === storageKey ? state.savedAt : {},
		loaded: state.key === storageKey || !!error,
		error,
		toggleSaved,
	}
}
