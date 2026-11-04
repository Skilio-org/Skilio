import { AxiosError } from "axios"

type ApiError = {
	response?: { data?: { detail?: unknown } }
	body?: { detail?: unknown }
	message?: unknown
}

// Pulls a readable message out of a generated-client error, an Axios error or a plain Error.
export function extractErrorMessage(err: unknown): string {
	const apiError = (err ?? {}) as ApiError
	const detail = apiError.response?.data?.detail ?? apiError.body?.detail
	if (Array.isArray(detail) && detail.length > 0) {
		return detail[0]?.msg || JSON.stringify(detail[0])
	}
	if (typeof detail === "string") return detail
	if (err instanceof AxiosError && err.message) return err.message
	if (typeof apiError.message === "string") return apiError.message
	return "Something went wrong."
}

// Bind to a toast function: `onError: handleError.bind(showErrorToast)`.
export function handleError(this: (message: string) => void, err: unknown) {
	this(extractErrorMessage(err))
}
