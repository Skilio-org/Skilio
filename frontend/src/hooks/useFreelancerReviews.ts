import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ReviewsService, type ReviewCreate, type ReviewPublic, type ReviewUpdate } from "@/client"
import useAuth from "./useAuth"
import { extractErrorMessage } from "@/utils"

export const reviewKeys = {
	all: ["reviews"] as const,
	freelancer: (freelancerId: string) => [...reviewKeys.all, "freelancer", freelancerId] as const,
}

export function useFreelancerReviews(freelancerId?: string, profileUserId?: string) {
	const queryClient = useQueryClient()
	const { user } = useAuth()

	const reviewsQuery = useQuery({
		queryKey: reviewKeys.freelancer(freelancerId || ""),
		enabled: Boolean(freelancerId),
		queryFn: async ({ signal }) => {
			if (!freelancerId) return { data: [] as ReviewPublic[], count: 0 }
			const response = await ReviewsService.listReviewsForFreelancer({
				path: { freelancer_id: freelancerId },
				query: { skip: 0, limit: 100 },
				signal,
			})
			return response.data
		},
	})

	const reviews: ReviewPublic[] = reviewsQuery.data?.data ?? []
	const totalCount: number = reviewsQuery.data?.count ?? reviews.length

	const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0)
	const averageRating = totalCount > 0 ? Number((totalRatingSum / totalCount).toFixed(1)) : 0

	const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
	for (const r of reviews) {
		const star = Math.min(5, Math.max(1, Math.round(r.rating)))
		distribution[star] = (distribution[star] || 0) + 1
	}

	const distributionPercent: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
	if (totalCount > 0) {
		for (let s = 1; s <= 5; s++) {
			distributionPercent[s] = Math.round((distribution[s] / totalCount) * 100)
		}
	}

	const myReview = user ? reviews.find((r) => r.client_id === user.id) : undefined
	const isClientRole = user?.active_role === "client" || Boolean(user?.is_superuser)
	const isOwnProfile = Boolean(user && profileUserId && user.id === profileUserId)
	const canCreateReview = Boolean(user && isClientRole && !isOwnProfile && !myReview)

	const invalidateReviewQueries = async () => {
		if (freelancerId) {
			await queryClient.invalidateQueries({ queryKey: reviewKeys.freelancer(freelancerId) })
			if (profileUserId) {
				await queryClient.invalidateQueries({ queryKey: ["talent-profile", profileUserId] })
			}
			await queryClient.invalidateQueries({ queryKey: ["talent-profile", freelancerId] })
		}
		await queryClient.invalidateQueries({ queryKey: ["profiles"] })
	}

	const createMutation = useMutation({
		mutationFn: async (payload: { rating: number; comment: string }) => {
			if (!freelancerId) throw new Error("Freelancer ID is required")
			const body: ReviewCreate = {
				freelancer_id: freelancerId,
				rating: payload.rating,
				comment: payload.comment.trim(),
			}
			const response = await ReviewsService.createReview({ body })
			return response.data
		},
		onSuccess: async () => {
			await invalidateReviewQueries()
			toast.success("Review published", {
				description: "Thank you for sharing your feedback with the community.",
			})
		},
		onError: (err: Error) => {
			toast.error("Could not submit review", {
				description: extractErrorMessage(err),
			})
		},
	})

	const updateMutation = useMutation({
		mutationFn: async ({ reviewId, rating, comment }: { reviewId: string; rating: number; comment: string }) => {
			const body: ReviewUpdate = {
				rating,
				comment: comment.trim(),
			}
			const response = await ReviewsService.updateReview({
				path: { id: reviewId },
				body,
			})
			return response.data
		},
		onSuccess: async () => {
			await invalidateReviewQueries()
			toast.success("Review updated", {
				description: "Your updated rating and feedback have been saved.",
			})
		},
		onError: (err: Error) => {
			toast.error("Could not update review", {
				description: extractErrorMessage(err),
			})
		},
	})

	const deleteMutation = useMutation({
		mutationFn: async (reviewId: string) => {
			const response = await ReviewsService.deleteReview({ path: { id: reviewId } })
			return response.data
		},
		onSuccess: async () => {
			await invalidateReviewQueries()
			toast.success("Review removed", {
				description: "Your review has been successfully deleted.",
			})
		},
		onError: (err: Error) => {
			toast.error("Could not delete review", {
				description: extractErrorMessage(err),
			})
		},
	})

	return {
		reviews,
		totalCount,
		averageRating,
		distribution,
		distributionPercent,
		myReview,
		isClientRole,
		isOwnProfile,
		canCreateReview,
		isLoading: reviewsQuery.isLoading,
		isError: reviewsQuery.isError,
		refetch: reviewsQuery.refetch,
		createReview: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateReview: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteReview: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	}
}
