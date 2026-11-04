import { Star } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export const RATING_LABELS: Record<number, string> = {
	1: "Poor experience",
	2: "Below expectations",
	3: "Satisfactory / Average",
	4: "Very good",
	5: "Exceptional / Exceeded expectations",
}

export function StarRatingDisplay({
	rating,
	maxRating = 5,
	size = "sm",
	showScore = false,
	showCount,
	className,
}: {
	rating: number
	maxRating?: number
	size?: "xs" | "sm" | "md" | "lg"
	showScore?: boolean
	showCount?: number
	className?: string
}) {
	const sizeMap = {
		xs: "size-3",
		sm: "size-3.5",
		md: "size-4",
		lg: "size-5",
	}

	const normalizedRating = Math.max(0, Math.min(maxRating, rating))

	return (
		<div className={cn("inline-flex items-center gap-1.5", className)}>
			<div
				className="flex items-center gap-0.5"
				aria-label={`Rating: ${normalizedRating.toFixed(1)} out of ${maxRating} stars`}
			>
				{Array.from({ length: maxRating }).map((_, index) => {
					const starIndex = index + 1
					const isFilled = normalizedRating >= starIndex
					const isHalfFilled = !isFilled && normalizedRating > index && normalizedRating < starIndex

					return (
						<span key={starIndex} className="relative inline-block text-on-surface-variant/30">
							<Star className={cn(sizeMap[size], "text-on-surface-variant/25 stroke-current")} />
							{(isFilled || isHalfFilled) && (
								<span
									className="absolute inset-0 overflow-hidden text-amber-500"
									style={{ width: isFilled ? "100%" : `${Math.round((normalizedRating - index) * 100)}%` }}
								>
									<Star className={cn(sizeMap[size], "fill-amber-500 text-amber-500")} />
								</span>
							)}
						</span>
					)
				})}
			</div>
			{showScore && (
				<strong className="font-semibold text-foreground text-sm tracking-tight">
					{normalizedRating > 0 ? normalizedRating.toFixed(1) : "New"}
				</strong>
			)}
			{showCount !== undefined && (
				<span className="text-on-surface-variant text-xs">
					({showCount} {showCount === 1 ? "review" : "reviews"})
				</span>
			)}
		</div>
	)
}

export function StarRatingInput({
	value,
	onChange,
	disabled = false,
	className,
}: {
	value: number
	onChange: (value: number) => void
	disabled?: boolean
	className?: string
}) {
	const [hovered, setHovered] = useState<number | null>(null)
	const activeValue = hovered !== null ? hovered : value

	return (
		<div className={cn("space-y-1.5", className)}>
			<div
				role="radiogroup"
				aria-label="Star rating from 1 to 5"
				className="inline-flex items-center gap-1"
				onMouseLeave={() => setHovered(null)}
			>
				{[1, 2, 3, 4, 5].map((star) => {
					const isSelectedOrHovered = activeValue >= star

					return (
						<button
							key={star}
							type="button"
							role="radio"
							aria-checked={value === star}
							aria-label={`${star} star${star > 1 ? "s" : ""}: ${RATING_LABELS[star]}`}
							disabled={disabled}
							onClick={() => onChange(star)}
							onMouseEnter={() => setHovered(star)}
							onFocus={() => setHovered(star)}
							onBlur={() => setHovered(null)}
							onKeyDown={(e) => {
								if (e.key === "ArrowRight" || e.key === "ArrowUp") {
									e.preventDefault()
									onChange(Math.min(5, (value || 0) + 1))
								} else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
									e.preventDefault()
									onChange(Math.max(1, (value || 1) - 1))
								}
							}}
							className={cn(
								"group relative grid size-9 place-items-center rounded-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
								disabled && "cursor-not-allowed opacity-50",
							)}
						>
							<Star
								className={cn(
									"size-6 transition-colors duration-150",
									isSelectedOrHovered
										? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.25)]"
										: "text-on-surface-variant/35 group-hover:text-on-surface-variant/60",
								)}
							/>
						</button>
					)
				})}
			</div>

			<p className="min-h-5 font-medium text-xs text-on-surface-variant transition-opacity">
				{activeValue > 0 ? (
					<span className="font-semibold text-amber-600 dark:text-amber-400">
						{activeValue} {activeValue === 1 ? "star" : "stars"} — {RATING_LABELS[activeValue]}
					</span>
				) : (
					<span className="text-on-surface-variant">Select a rating from 1 to 5 stars</span>
				)}
			</p>
		</div>
	)
}
