import { AxiosError } from "axios"

export function extractErrorMessage(err: any): string {
	const errDetail = err?.response?.data?.detail ?? err?.body?.detail
	if (Array.isArray(errDetail) && errDetail.length > 0) {
		return errDetail[0]?.msg || JSON.stringify(errDetail[0])
	}
	if (typeof errDetail === "string") {
		return errDetail
	}
	if (err instanceof AxiosError && err.message) {
		return err.message
	}
	if (typeof err?.message === "string") {
		return err.message
	}
	return "Something went wrong."
}

export const handleError = function (this: (msg: string) => void, err: Error) {
	const errorMessage = extractErrorMessage(err)
	this(errorMessage)
}

export const getInitials = (name: string): string => {
	return name
		.split(" ")
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase()
}
