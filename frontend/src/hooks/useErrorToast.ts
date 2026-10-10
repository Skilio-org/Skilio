import { useEffect } from "react"
import { toast } from "sonner"

export function useErrorToast(message: string | undefined, id: string, occurrence?: number, retry?: () => void) {
	useEffect(() => {
		if (!message) {
			if (retry) toast.dismiss(id)
			return
		}
		toast.error(message, {
			id,
			duration: retry ? Infinity : undefined,
			action: retry ? { label: "Try again", onClick: retry } : undefined,
		})
	}, [message, id, occurrence, retry])
}
