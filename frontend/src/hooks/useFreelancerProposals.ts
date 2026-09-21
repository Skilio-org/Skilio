import { useCallback, useEffect, useState } from "react"
import { type ProposalDraft as Draft, seedProposals } from "@/data/freelancer-workspace"
import useAuth from "@/hooks/useAuth"
import type { FreelancerJob } from "@/types/job"

export const PROPOSALS_CHANGED_EVENT = "freelancer-proposals-changed"

export function useFreelancerProposals() {
	const { user } = useAuth()
	const storageKey = `freelancer-work-v2:${user?.id ?? "preview"}`

	const [state, setState] = useState<{ key: string; drafts: Draft[] }>({
		key: "",
		drafts: [],
	})
	const [error, setError] = useState("")

	const read = useCallback(() => {
		try {
			const stored = localStorage.getItem(storageKey)
			if (!stored) {
				setState({ key: storageKey, drafts: seedProposals })
				setError("")
				return
			}
			const data = JSON.parse(stored)
			const validDrafts = Array.isArray(data.drafts)
				? data.drafts.filter(
						(draft: Draft) =>
							draft?.job &&
							[
								draft.job.id,
								draft.job.title,
								draft.job.company,
								draft.job.category,
								draft.job.budget,
								draft.job.description,
							].every((value) => typeof value === "string") &&
							Array.isArray(draft.job.skills) &&
							draft.job.skills.every((value) => typeof value === "string") &&
							typeof draft.cover === "string",
					)
				: seedProposals

			setState({ key: storageKey, drafts: validDrafts })
			setError("")
		} catch {
			setState({ key: storageKey, drafts: seedProposals })
			setError("Your saved proposals couldn't be restored on this device.")
		}
	}, [storageKey])

	useEffect(() => {
		read()
		window.addEventListener(PROPOSALS_CHANGED_EVENT, read)
		window.addEventListener("storage", read)
		return () => {
			window.removeEventListener(PROPOSALS_CHANGED_EVENT, read)
			window.removeEventListener("storage", read)
		}
	}, [read])

	const currentDrafts = state.key === storageKey ? state.drafts : seedProposals

	const isSubmitted = useCallback(
		(jobId: string) => {
			return currentDrafts.some((d) => d.job.id === jobId && d.status === "Submitted")
		},
		[currentDrafts],
	)

	const hasDraft = useCallback(
		(jobId: string) => {
			return currentDrafts.some((d) => d.job.id === jobId && (d.status ?? "Drafts") === "Drafts")
		},
		[currentDrafts],
	)

	const getProposal = useCallback(
		(jobId: string) => {
			return currentDrafts.find((d) => d.job.id === jobId)
		},
		[currentDrafts],
	)

	const saveProposal = useCallback(
		(job: FreelancerJob, cover: string, status: "Drafts" | "Submitted" = "Drafts") => {
			try {
				const stored = localStorage.getItem(storageKey)
				const data = stored ? JSON.parse(stored) : {}
				const existingDrafts: Draft[] = Array.isArray(data.drafts) ? data.drafts : seedProposals
				const existing = existingDrafts.find((d) => d.job.id === job.id)

				if (existing?.status === "Submitted") {
					return { success: false, reason: "already_submitted" as const }
				}

				const nextDrafts: Draft[] = [
					...existingDrafts.filter((d) => d.job.id !== job.id),
					{
						job,
						cover: cover.trim(),
						rate: existing?.rate ?? "",
						status,
					},
				]

				localStorage.setItem(storageKey, JSON.stringify({ ...data, drafts: nextDrafts }))
				window.dispatchEvent(new Event(PROPOSALS_CHANGED_EVENT))
				return { success: true }
			} catch {
				setError("Proposal changes couldn't be saved on this device.")
				return { success: false, reason: "storage_error" as const }
			}
		},
		[storageKey],
	)

	return {
		drafts: currentDrafts,
		loaded: state.key === storageKey,
		error,
		isSubmitted,
		hasDraft,
		getProposal,
		saveProposal,
	}
}
