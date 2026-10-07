import { ProposalsService, type ProposalPublic, type ProposalStatus } from "@/client"
import { jobFromApi } from "@/components/freelancer/freelancer-jobs-api"
import useAuth from "@/hooks/useAuth"
import type { FreelancerJob } from "@/types/job"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

type ProposalDraft = {
	job: FreelancerJob
	cover: string
	rate: string
	status?: "Drafts" | "Submitted" | "Archived"
}

export type BackendProposal = ProposalDraft & { proposalId: string }

const proposalStatus = (status: ProposalStatus): ProposalDraft["status"] => {
	if (status === "draft") return "Drafts"
	if (status === "pending") return "Submitted"
	return "Archived"
}

function proposalToDraft(proposal: ProposalPublic): BackendProposal | null {
	if (!proposal.job_post) return null
	return {
		proposalId: proposal.id,
		job: jobFromApi(proposal.job_post),
		cover: proposal.cover_letter ?? "",
		rate: "",
		status: proposalStatus(proposal.status),
	}
}

export function useFreelancerProposals() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const proposalsQuery = useQuery({
		queryKey: ["freelancer-proposals"],
		enabled: Boolean(user),
		queryFn: async ({ signal }) => {
			const { data } = await ProposalsService.readMyProposals({
				query: { skip: 0, limit: 100 },
				signal,
			})
			return data.data.map(proposalToDraft).filter((draft): draft is BackendProposal => draft !== null)
		},
	})
	const mutation = useMutation({
		mutationFn: async ({
			proposalId,
			job,
			cover,
			status,
		}: {
			proposalId?: string
			job: FreelancerJob
			cover: string
			status: "Drafts" | "Submitted"
		}) => {
			const apiStatus: ProposalStatus = status === "Drafts" ? "draft" : "pending"
			if (proposalId) {
				return ProposalsService.updateProposal({
					path: { id: proposalId },
					body: { cover_letter: cover.trim(), status: apiStatus },
				})
			}
			return ProposalsService.submitProposal({
				body: { job_post_id: job.id, cover_letter: cover.trim(), status: apiStatus },
			})
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["freelancer-proposals"] })
			await queryClient.invalidateQueries({ queryKey: ["freelancer-jobs"] })
		},
	})
	const withdrawMutation = useMutation({
		mutationFn: (proposalId: string) => ProposalsService.withdrawProposal({ path: { id: proposalId } }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["freelancer-proposals"] })
		},
	})
	const drafts = proposalsQuery.data ?? []
	const getProposal = (jobId: string) => drafts.find((draft) => draft.job.id === jobId)
	const isSubmitted = (jobId: string) => getProposal(jobId)?.status === "Submitted"
	const hasDraft = (jobId: string) => getProposal(jobId)?.status === "Drafts"

	const saveProposal = async (job: FreelancerJob, cover: string, status: "Drafts" | "Submitted" = "Drafts") => {
		if (!user) throw new Error("Sign in to manage proposals")
		await mutation.mutateAsync({ proposalId: getProposal(job.id)?.proposalId, job, cover, status })
	}

	return {
		drafts,
		loaded: !proposalsQuery.isPending,
		error: proposalsQuery.isError ? "Could not load proposals." : "",
		isSubmitted,
		hasDraft,
		getProposal,
		saveProposal,
		withdrawProposal: (proposalId: string) => withdrawMutation.mutateAsync(proposalId),
		refetch: proposalsQuery.refetch,
	}
}
