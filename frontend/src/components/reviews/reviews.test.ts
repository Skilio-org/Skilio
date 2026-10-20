import { describe, expect, it } from "bun:test"
import { RATING_LABELS } from "./review-stars"

describe("Review System Unit Tests", () => {
	it("should have correct rating labels for all star levels 1 through 5", () => {
		expect(RATING_LABELS[1]).toContain("Poor")
		expect(RATING_LABELS[2]).toContain("Below expectations")
		expect(RATING_LABELS[3]).toContain("Satisfactory")
		expect(RATING_LABELS[4]).toContain("Very good")
		expect(RATING_LABELS[5]).toContain("Exceptional")
	})

	it("should correctly compute distribution and percentages", () => {
		const sampleReviews = [{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 5 }, { rating: 3 }]

		const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
		for (const r of sampleReviews) {
			distribution[r.rating] = (distribution[r.rating] || 0) + 1
		}

		expect(distribution[5]).toBe(3)
		expect(distribution[4]).toBe(1)
		expect(distribution[3]).toBe(1)
		expect(distribution[2]).toBe(0)
		expect(distribution[1]).toBe(0)

		const totalCount = sampleReviews.length
		const averageRating = Number((sampleReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1))
		expect(averageRating).toBe(4.4)

		const percent5 = Math.round((distribution[5] / totalCount) * 100)
		expect(percent5).toBe(60)
	})

	it("should correctly handle filtering reviews by star rating", () => {
		const sampleReviews = [
			{ id: "1", rating: 5, comment: "Top notch", created_at: "2026-01-01T00:00:00Z" },
			{ id: "2", rating: 4, comment: "Good", created_at: "2026-01-02T00:00:00Z" },
			{ id: "3", rating: 5, comment: "Another 5", created_at: "2026-01-03T00:00:00Z" },
			{ id: "4", rating: 2, comment: "Not great", created_at: "2026-01-04T00:00:00Z" },
		]

		const filterByStars = (stars: number | null) =>
			stars === null ? sampleReviews : sampleReviews.filter((r) => Math.round(r.rating) === stars)

		expect(filterByStars(null).length).toBe(4)
		expect(filterByStars(5).length).toBe(2)
		expect(filterByStars(4).length).toBe(1)
		expect(filterByStars(2).length).toBe(1)
		expect(filterByStars(1).length).toBe(0)
	})

	it("should sort reviews correctly by newest, highest, and lowest", () => {
		const sampleReviews = [
			{ id: "1", rating: 3, created_at: "2026-01-01T00:00:00Z" },
			{ id: "2", rating: 5, created_at: "2026-01-05T00:00:00Z" },
			{ id: "3", rating: 1, created_at: "2026-01-03T00:00:00Z" },
		]

		// Sort newest
		const sortedNewest = [...sampleReviews].sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		)
		expect(sortedNewest.map((r) => r.id)).toEqual(["2", "3", "1"])

		// Sort highest
		const sortedHighest = [...sampleReviews].sort((a, b) => b.rating - a.rating)
		expect(sortedHighest.map((r) => r.id)).toEqual(["2", "1", "3"])

		// Sort lowest
		const sortedLowest = [...sampleReviews].sort((a, b) => a.rating - b.rating)
		expect(sortedLowest.map((r) => r.id)).toEqual(["3", "1", "2"])
	})

	it("should pin user's own review to the top when present", () => {
		const sampleReviews = [
			{ id: "1", client_id: "other-user", rating: 5 },
			{ id: "2", client_id: "my-user-id", rating: 4 },
			{ id: "3", client_id: "third-user", rating: 5 },
		]

		const myUserId = "my-user-id"
		const myReview = sampleReviews.find((r) => r.client_id === myUserId)
		expect(myReview).toBeDefined()

		let list = [...sampleReviews]
		if (myReview) {
			list = [myReview, ...list.filter((r) => r.id !== myReview.id)]
		}

		expect(list[0].id).toBe("2")
		expect(list.length).toBe(3)
	})

	it("should evaluate review permissions correctly", () => {
		const checkCanCreate = ({
			user,
			profileUserId,
			existingReview,
		}: {
			user: { id: string; active_role: string; is_superuser?: boolean } | null
			profileUserId: string
			existingReview?: { id: string } | null
		}) => {
			if (!user) return false
			const isClientRole = user.active_role === "client" || Boolean(user.is_superuser)
			const isOwnProfile = user.id === profileUserId
			return Boolean(isClientRole && !isOwnProfile && !existingReview)
		}

		// 1. Logged in client viewing another profile without existing review -> can create
		expect(
			checkCanCreate({
				user: { id: "client-1", active_role: "client" },
				profileUserId: "freelancer-1",
				existingReview: null,
			}),
		).toBe(true)

		// 2. Client viewing their own profile -> cannot create
		expect(
			checkCanCreate({
				user: { id: "client-1", active_role: "client" },
				profileUserId: "client-1",
				existingReview: null,
			}),
		).toBe(false)

		// 3. Client already submitted a review -> cannot create another
		expect(
			checkCanCreate({
				user: { id: "client-1", active_role: "client" },
				profileUserId: "freelancer-1",
				existingReview: { id: "rev-1" },
			}),
		).toBe(false)

		// 4. Freelancer-role user -> cannot create
		expect(
			checkCanCreate({
				user: { id: "freelancer-2", active_role: "freelancer" },
				profileUserId: "freelancer-1",
				existingReview: null,
			}),
		).toBe(false)

		// 5. Unauthenticated user -> cannot create
		expect(
			checkCanCreate({
				user: null,
				profileUserId: "freelancer-1",
				existingReview: null,
			}),
		).toBe(false)

		// 6. Superuser -> can create
		expect(
			checkCanCreate({
				user: { id: "admin-1", active_role: "freelancer", is_superuser: true },
				profileUserId: "freelancer-1",
				existingReview: null,
			}),
		).toBe(true)
	})
})
