import { ArrowRight, Check, Star } from "lucide-react"
import { Avatar } from "@/components/freelancer/freelancer-profile-components"
import { descriptions, type ProfileForm, primary, steps } from "@/components/freelancer/freelancer-profile-model"
import type { ProfileProgress } from "@/components/freelancer/profile-editor/profile-form"

const SECTION_COUNT = 6

function SectionList({
	progress: { done, nextStep, summaries },
	onEdit,
}: {
	progress: ProfileProgress
	onEdit: (step: number) => void
}) {
	return (
		<section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
			<div className="flex items-center justify-between border-outline-variant border-b px-5 py-3.5">
				<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Profile sections</h2>
				<span className="text-on-surface-variant text-sm tabular-nums">
					{done.filter(Boolean).length} of {SECTION_COUNT} done
				</span>
			</div>
			<ul className="divide-y divide-outline-variant">
				{steps.slice(0, SECTION_COUNT).map((name, i) => (
					<li key={name}>
						<button
							type="button"
							className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-ring ${nextStep === i ? "bg-surface-container-low/60" : ""}`}
							onClick={() => onEdit(i)}
						>
							<span
								className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs ${done[i] ? "border-transparent bg-primary text-on-primary" : "border-outline-variant text-on-surface-variant"}`}
							>
								{done[i] ? <Check className="size-3.5" /> : i + 1}
							</span>
							<span className="min-w-0 flex-1">
								<span className="block font-medium text-on-surface text-sm">{name}</span>
								<span className="mt-0.5 block truncate text-on-surface-variant text-xs">
									{done[i] && summaries[i] ? summaries[i] : descriptions[i]}
								</span>
							</span>
							<ArrowRight className="size-4 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5" />
						</button>
					</li>
				))}
			</ul>
		</section>
	)
}

function StatusCard({
	profile,
	nextStep,
	onEdit,
}: {
	profile: ProfileForm
	nextStep: number
	onEdit: (step: number) => void
}) {
	const reviewStep = steps.length - 1
	return (
		<section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
			<div className="flex items-center gap-3.5">
				<Avatar profile={profile} size="size-12 text-base" />
				<div className="min-w-0">
					<h2 className="truncate font-semibold text-on-surface">{profile.name || "Your name"}</h2>
					<p className="truncate text-on-surface-variant text-sm">{profile.title || "No title yet"}</p>
				</div>
			</div>
			<p className="mt-4 border-outline-variant border-t pt-4 text-on-surface-variant text-sm">
				{profile.finished
					? "Your profile is published. Clients can find you and send messages."
					: "Your profile is not published yet. It goes live once the required sections are complete."}
			</p>
			<button
				type="button"
				className={`${primary} mt-4 w-full`}
				onClick={() => onEdit(nextStep === -1 ? reviewStep : nextStep)}
			>
				{nextStep === -1 ? "Review profile" : "Continue setup"}
				<ArrowRight className="size-4" />
			</button>
		</section>
	)
}

function FeedbackCard({
	rating,
	reviewCount,
	onReadReviews,
}: {
	rating: number
	reviewCount: number
	onReadReviews: () => void
}) {
	return (
		<section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
			<div className="flex items-center justify-between gap-3">
				<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Client feedback</h2>
				{reviewCount > 0 && (
					<button
						type="button"
						onClick={onReadReviews}
						className="font-label-sm font-medium text-label-sm text-link hover:underline"
					>
						Read reviews
					</button>
				)}
			</div>
			<div className="mt-3 flex items-center gap-3">
				<span className="font-semibold text-3xl text-on-surface tabular-nums">
					{reviewCount > 0 ? rating.toFixed(1) : "–"}
				</span>
				<div>
					<div className="flex gap-0.5" aria-hidden="true">
						{[1, 2, 3, 4, 5].map((n) => (
							<Star
								key={n}
								className={`size-4 ${n <= Math.round(rating) && reviewCount > 0 ? "fill-primary text-primary" : "text-outline-variant"}`}
							/>
						))}
					</div>
					<p className="mt-1 text-on-surface-variant text-xs">
						{reviewCount > 0 ? `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}` : "No reviews yet"}
					</p>
				</div>
			</div>
			{reviewCount === 0 && (
				<p className="mt-4 border-outline-variant border-t pt-4 text-on-surface-variant text-sm">
					Reviews from clients appear here once you have worked together.
				</p>
			)}
		</section>
	)
}

export function ProfileOverview({
	profile,
	progress,
	rating,
	reviewCount,
	onEdit,
	onPreview,
}: {
	profile: ProfileForm
	progress: ProfileProgress
	rating: number
	reviewCount: number
	onEdit: (step: number) => void
	onPreview: () => void
}) {
	return (
		<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
			<div className="space-y-6 lg:col-span-8">
				<SectionList progress={progress} onEdit={onEdit} />
			</div>
			<aside className="space-y-5 lg:sticky lg:top-20 lg:col-span-4">
				<StatusCard profile={profile} nextStep={progress.nextStep} onEdit={onEdit} />
				<FeedbackCard rating={rating} reviewCount={reviewCount} onReadReviews={onPreview} />
			</aside>
		</div>
	)
}
