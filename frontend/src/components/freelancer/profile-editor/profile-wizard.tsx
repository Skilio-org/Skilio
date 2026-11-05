import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react"
import {
	descriptions,
	type ProfileEntryForm,
	type ProfileForm,
	primary,
	secondary,
	steps,
} from "@/components/freelancer/freelancer-profile-model"
import { EntriesStep } from "@/components/freelancer/profile-editor/profile-entries-step"
import {
	BasicsStep,
	ExpertiseStep,
	IntroductionStep,
	RatesStep,
} from "@/components/freelancer/profile-editor/profile-field-steps"
import type { EntryKind, ProfileProgress, UpdateProfile } from "@/components/freelancer/profile-editor/profile-form"
import { ReviewStep } from "@/components/freelancer/profile-editor/profile-review-step"

// Step numbers, matching the order of `steps` in freelancer-profile-model.ts.
const WORK_AND_EDUCATION = 3
const PORTFOLIO = 4
const REVIEW = 6

// The "edit profile" screen: a list of steps on the left and the form for the current step on the right.
export function ProfileWizard({
	profile,
	update,
	progress,
	step,
	categories,
	categoriesLoading,
	onStepChange,
	onPhotoChange,
	onEditEntry,
	onPreview,
	onBack,
	onNext,
	onPublish,
}: {
	profile: ProfileForm
	update: UpdateProfile
	progress: ProfileProgress
	step: number
	categories: string[]
	categoriesLoading: boolean
	onStepChange: (step: number) => void
	onPhotoChange: (file?: File) => void
	onEditEntry: (kind: EntryKind, entry: ProfileEntryForm) => void
	onPreview: () => void
	onBack: () => void
	onNext: () => void
	onPublish: () => void
}) {
	const isOptional = step === WORK_AND_EDUCATION || step === PORTFOLIO

	return (
		<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
			<aside className="min-w-0 lg:sticky lg:top-20 lg:col-span-3">
				<nav aria-label="Profile setup steps" className="flex gap-2 overflow-x-auto pb-3 lg:block lg:space-y-1">
					{steps.map((name, i) => (
						<button
							key={name}
							type="button"
							aria-current={step === i ? "step" : undefined}
							onClick={() => onStepChange(i)}
							className={`flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-sm lg:w-full ${step === i ? "bg-surface-container font-semibold text-on-surface" : "text-on-surface-variant hover:bg-surface-container-low"}`}
						>
							<span
								className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs ${progress.done[i] ? "border-transparent bg-primary text-on-primary" : step === i ? "border-on-surface text-on-surface" : "border-outline-variant"}`}
							>
								{progress.done[i] ? <Check className="size-3.5" /> : i + 1}
							</span>
							{name}
						</button>
					))}
				</nav>
			</aside>
			<section className="min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 sm:p-6 lg:col-span-9">
				<div className="flex flex-wrap items-baseline justify-between gap-x-4 border-outline-variant border-b pb-5">
					<div>
						<h2 tabIndex={-1} className="font-headline-sm font-semibold text-headline-sm text-on-surface">
							{steps[step]}
						</h2>
						<p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{descriptions[step]}</p>
					</div>
					<p className="text-on-surface-variant text-xs">
						Step {step + 1} of {steps.length}
						{isOptional ? " · Optional" : ""}
					</p>
				</div>
				<div className="mt-6 space-y-5">
					{step === 0 && <BasicsStep profile={profile} update={update} onPhotoChange={onPhotoChange} />}
					{step === 1 && (
						<ExpertiseStep
							profile={profile}
							update={update}
							categories={categories}
							categoriesLoading={categoriesLoading}
						/>
					)}
					{step === 2 && <IntroductionStep profile={profile} update={update} />}
					{step === WORK_AND_EDUCATION && (
						<EntriesStep kinds={["experience", "education"]} profile={profile} update={update} onEdit={onEditEntry} />
					)}
					{step === PORTFOLIO && (
						<EntriesStep kinds={["portfolio"]} profile={profile} update={update} onEdit={onEditEntry} />
					)}
					{step === 5 && <RatesStep profile={profile} update={update} />}
					{step === REVIEW && (
						<ReviewStep profile={profile} progress={progress} onEdit={onStepChange} onPreview={onPreview} />
					)}
				</div>
				<footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-outline-variant border-t pt-6">
					<button type="button" className={secondary} onClick={onBack}>
						<ArrowLeft className="size-4" />
						{step ? "Back" : "Save & exit"}
					</button>
					{step < REVIEW ? (
						<button type="button" className={primary} onClick={onNext}>
							{isOptional && !progress.done[step] ? "Skip for now" : "Continue"}
							<ArrowRight className="size-4" />
						</button>
					) : (
						<button type="button" className={primary} onClick={onPublish}>
							<CheckCircle2 className="size-4" />
							{profile.finished ? "Save published profile" : "Publish profile"}
						</button>
					)}
				</footer>
			</section>
		</div>
	)
}
