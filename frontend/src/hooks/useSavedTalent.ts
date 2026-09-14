import { useCallback, useMemo, useSyncExternalStore } from "react"
import { toast } from "sonner"
import { freelancers } from "@/data/freelancers"
import useAuth from "@/hooks/useAuth"

const changed = "saved-talent-changed"
// Combine the former demo lists into one unique list.
const initialIds = freelancers.map((person) => person.id)
function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function parse(raw: string | null): string[] {
  if (raw === null) return initialIds
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === "string" && initialIds.includes(id),
            ),
          ),
        ]
      : initialIds
  } catch {
    return initialIds
  }
}
export function useSavedTalent() {
  const { user } = useAuth()
  const key = `saved-talent-v1:${user?.id ?? "preview"}`
  const subscribe = useCallback(
    (notify: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) notify()
      }
      window.addEventListener("storage", onStorage)
      window.addEventListener(changed, notify)
      return () => {
        window.removeEventListener("storage", onStorage)
        window.removeEventListener(changed, notify)
      }
    },
    [key],
  )
  const snapshot = useCallback(() => read(key), [key])
  const raw = useSyncExternalStore(subscribe, snapshot, () => null)
  const savedIds = useMemo(() => parse(raw), [raw])
  const toggleSaved = (id: string) => {
    const current = parse(read(key))
    const removing = current.includes(id)
    const next = removing
      ? current.filter((item) => item !== id)
      : [...current, id]
    try {
      localStorage.setItem(key, JSON.stringify(next))
      window.dispatchEvent(new Event(changed))
      toast.success(
        removing ? "Removed from saved talent" : "Added to saved talent",
      )
    } catch {
      toast.error("Couldn’t save this change on your device. Please try again.")
    }
  }
  return { savedIds, toggleSaved }
}
