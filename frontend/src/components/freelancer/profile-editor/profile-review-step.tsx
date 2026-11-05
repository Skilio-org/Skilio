import { Check, Eye } from "lucide-react"
import { type ProfileForm, secondary, steps } from "@/components/freelancer/freelancer-profile-model"
import { type ProfileProgress, requiredSteps } from "@/components/freelancer/profile-editor/profile-form"

const SECTION_COUNT = 6
const EXPERTISE_STEP = 1
const INTRODUCTION_STEP = 2
const PORTFOLIO_STEP = 4

export function ReviewStep({
	profile,
	progress: { done, summaries },
	onEdit,
	onPreview,
}: {
	profile: ProfileForm
	progress: ProfileProgress
	onEdit: (step: number) => void
	onPreview: () => void
}) {
	const ready = requiredSteps.every((index) => done[index])
	const portfolioImages = profile.portfolio.filter((entry) => entry.image_url).slice(0, 4)

	return (
		<>
			{ready ? (
				<p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-on-surface text-sm">
					{profile.finished
						? "Your profile is published. Save to update it."
						: "Your profile is ready. Publishing makes it visible to clients so they can contact you."}
				</p>
			) : (
				<p className="rounded-lg border border-outline-variant bg-surface-container-low/50 px-4 py-3 text-on-surface-variant text-sm">
					Complete the required sections below before you publish.
				</p>
			)}
			<ul className="divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant">
				{steps.slice(0, SECTION_COUNT).map((name, i) => {
					const missing = !done[i] && requiredSteps.includes(i)
					return (
						<li key={name} className="flex items-start gap-4 px-4 py-4">
							<span
								className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs ${done[i] ? "bg-primary text-on-primary" : missing ? "bg-destructive/10 text-destructive" : "bg-surface-container text-on-surface-variant"}`}
							>
								{done[i] ? <Check className="size-3.5" /> : missing ? "!" : "–"}
							</span>
							<div className="min-w-0 flex-1">
								<p className="font-medium text-on-surface text-sm">
									{name}
									{!requiredSteps.includes(i) && <span className="font-normal text-on-surface-variant"> · Optional</span>}
								</p>
								<p className={`mt-0.5 break-words text-xs ${missing ? "text-destructive" : "text-on-surface-variant"}`}>
									{done[i] ? summaries[i] : missing ? "Required. Nothing added yet." : "Nothing added yet."}
								</p>
								{done[i] && i === EXPERTISE_STEP && profile.skills.length > 0 && (
									<p className="mt-1 line-clamp-2 break-words text-on-surface-variant text-xs">{profile.skills.join(", ")}</p>
								)}
								{done[i] && i === INTRODUCTION_STEP && profile.languages && (
									<p className="mt-1 break-words text-on-surface-variant text-xs">{profile.languages}</p>
								)}
								{i === PORTFOLIO_STEP && portfolioImages.length > 0 && (
									<div className="mt-2 flex gap-2">
										{portfolioImages.map((entry) => (
											<img
												key={entry.id}
												src={entry.image_url ?? ""}
												alt={entry.title}
												className="size-12 rounded-md border border-outline-variant object-cover"
											/>
										))}
									</div>
								)}
							</div>
							<button
								type="button"
								className="shrink-0 font-medium text-link text-sm hover:underline"
								onClick={() => onEdit(i)}
							>
								{done[i] ? "Edit" : "Add"}
							</button>
						</li>
					)
				})}
			</ul>
			<button type="button" className={secondary} onClick={onPreview}>
				<Eye className="size-4" /> Preview as a client
			</button>
		</>
	)
}
