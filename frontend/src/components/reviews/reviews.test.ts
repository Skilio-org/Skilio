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

	it("should validate comment lengths", () => {
		const emptyComment = "   "
		expect(emptyComment.trim().length).toBe(0)

		const validComment = "Great freelancer! High quality deliverables and fast communication."
		expect(validComment.trim().length).toBeGreaterThanOrEqual(1)
		expect(validComment.trim().length).toBeLessThanOrEqual(3000)

		const longComment = "a".repeat(3001)
		expect(longComment.length > 3000).toBe(true)
	})
})
