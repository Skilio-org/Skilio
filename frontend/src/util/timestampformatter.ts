export function formatMessageTime(value: string | null | undefined): string {
    if (!value) return ""

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""

    const seconds = Math.round((date.getTime() - Date.now()) / 1000)
    const absoluteSeconds = Math.abs(seconds)

    if (absoluteSeconds < 10) return "Just now"
    if (absoluteSeconds < 60) return `${absoluteSeconds}s ago`

    const minutes = Math.round(seconds / 60)
    if (Math.abs(minutes) < 60) return `${Math.abs(minutes)}m ago`

    const hours = Math.round(seconds / 3600)
    if (Math.abs(hours) < 24) return `${Math.abs(hours)}h ago`

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday"
    }

    if (Math.abs(hours) < 24 * 7) {
        return new Intl.DateTimeFormat(undefined, {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
        }).format(date)
    }

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    }).format(date)
}