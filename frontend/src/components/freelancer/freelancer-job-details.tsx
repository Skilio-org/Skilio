import { ArrowRight, Banknote, Bookmark, Building2, Clock3, Globe2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { seedProposals } from "@/data/freelancer-workspace"
import useAuth from "@/hooks/useAuth"
import type { FreelancerJob } from "@/types/job"

export const JobDetails = ({
	job,
	projectType,
	initiallyApplying = false,
}: {
	job: FreelancerJob
	projectType: string
	initiallyApplying?: boolean
}) => {
	const { user } = useAuth()
	const storageKey = `freelancer-work-v2:${user?.id ?? "preview"}`
	const [saved, setSaved] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem(storageKey) || "{}").saved?.includes(job.id) ?? false
		} catch {
			return false
		}
	})
	const [applying, setApplying] = useState(initiallyApplying)
	const rateInput = useRef<HTMLInputElement>(null)
	useEffect(() => {
		if (applying) rateInput.current?.focus()
	}, [applying])
	const [cover, setCover] = useState("")
	const [rate, setRate] = useState("")
	const toggleSaved = () => {
		try {
			const existing = JSON.parse(localStorage.getItem(storageKey) || "{}")
			const ids: string[] = Array.isArray(existing.saved) ? existing.saved : []
			const next = !ids.includes(job.id)
			localStorage.setItem(
				storageKey,
				JSON.stringify({ ...existing, saved: next ? [...ids, job.id] : ids.filter((id) => id !== job.id) }),
			)
			setSaved(next)
		} catch {
			toast.error("Couldn't update saved jobs.")
		}
	}
	const saveDraft = () => {
		try {
			const existing = JSON.parse(localStorage.getItem(storageKey) || "{}")
			const drafts = Array.isArray(existing.drafts) ? existing.drafts : seedProposals
			if (drafts.some((draft: { job: FreelancerJob }) => draft.job.id === job.id)) {
				toast.info("You already have a proposal for this job. Continue it from Proposals.")
				return
			}
			localStorage.setItem(
				storageKey,
				JSON.stringify({ ...existing, drafts: [...drafts, { job, cover: cover.trim(), rate, status: "Drafts" }] }),
			)
			setApplying(false)
			toast.success("Draft saved", { description: "You can review it in Proposals." })
		} catch {
			toast.error("Couldn't save your draft.")
		}
	}
	const primary =
		"flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container dark:bg-on-surface dark:text-background dark:hover:bg-white"
	return (
		<div className="min-h-0 flex-1 overflow-y-auto bg-surface-container-lowest text-on-surface">
			<div className="grid min-h-full md:grid-cols-[minmax(0,1fr)_260px]">
				<div className="min-w-0">
					<section className="border-outline-variant/60 border-b px-6 py-7 sm:px-8">
						<p className="mb-3 font-caption font-medium text-caption text-primary uppercase tracking-wider">
							{job.category} · Opportunity
						</p>
						<SheetTitle className="max-w-2xl font-headline-lg font-semibold text-2xl leading-8 text-on-surface tracking-tight">
							{job.title}
						</SheetTitle>
						<SheetDescription className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-caption text-caption text-on-surface-variant">
							<span>{job.posted}</span>
							<span className="inline-flex items-center gap-1.5">
								<Globe2 className="size-3.5" />
								Worldwide · Remote
							</span>
						</SheetDescription>
					</section>
					<section className="border-outline-variant/60 border-b px-6 py-6 sm:px-8">
						<h3 className="font-semibold text-headline-sm">About the project</h3>
						<p className="mt-3 whitespace-pre-line font-body-sm text-body-sm text-on-surface-variant leading-6">
							{job.description}
						</p>
					</section>
					<section className="grid grid-cols-2 gap-6 border-outline-variant/60 border-b px-6 py-6 sm:px-8">
						<div>
							<Banknote className="mb-3 size-5 text-outline" />
							<p className="font-semibold text-body-md">{job.budget.split(" · ")[0]}</p>
							<p className="mt-1 text-caption text-on-surface-variant">
								{projectType === "Hourly" ? "Hourly rate" : "Project budget"}
							</p>
						</div>
						<div>
							<Clock3 className="mb-3 size-5 text-outline" />
							<p className="font-semibold text-body-md">{projectType}</p>
							<p className="mt-1 text-caption text-on-surface-variant">
								{job.budget.split(" · ")[1] !== "Fixed price"
									? job.budget.split(" · ")[1] || "Project-based engagement"
									: "Project-based engagement"}
							</p>
						</div>
					</section>
					<section className="px-6 py-6 sm:px-8">
						<h3 className="font-semibold text-headline-sm">Skills and expertise</h3>
						<div className="mt-3 flex flex-wrap gap-1.5">
							{job.skills.map((skill) => (
								<span
									key={skill}
									className="rounded border border-transparent bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed-variant dark:border-border-subtle dark:text-on-surface-soft"
								>
									{skill}
								</span>
							))}
						</div>
					</section>
					{applying && (
						<section className="border-outline-variant/60 border-t px-6 py-6 sm:px-8">
							<h3 className="font-semibold text-headline-sm">Make your introduction</h3>
							<p className="mt-1 text-body-sm text-on-surface-variant">Prepare a draft to review before submitting.</p>
							<form
								onSubmit={(event) => {
									event.preventDefault()
									saveDraft()
								}}
								className="mt-4 space-y-4"
							>
								<label className="block text-label-sm">
									{projectType === "Hourly" ? "Hourly rate ($)" : "Project price ($)"}
									<input
										required
										ref={rateInput}
										type="number"
										min="1"
										step="0.01"
										value={rate}
										onChange={(event) => setRate(event.target.value)}
										className="mt-2 h-10 w-full rounded-lg border border-outline-variant bg-background px-3 outline-none focus:border-primary"
									/>
								</label>
								<label className="block text-label-sm">
									Cover letter
									<textarea
										required
										minLength={40}
										maxLength={5000}
										rows={5}
										value={cover}
										onChange={(event) => setCover(event.target.value)}
										placeholder="Introduce yourself and explain your approach…"
										className="mt-2 w-full rounded-lg border border-outline-variant bg-background p-3 text-body-sm outline-none focus:border-primary"
									/>
								</label>
								<div className="flex items-center gap-3">
									<button type="submit" className={primary}>
										Save draft
										<ArrowRight className="size-4" />
									</button>
									<button
										type="button"
										onClick={() => setApplying(false)}
										className="px-3 text-label-sm text-on-surface-variant"
									>
										Cancel
									</button>
								</div>
							</form>
						</section>
					)}
				</div>
				<aside className="border-outline-variant/60 border-t bg-surface-container-low/40 p-6 md:border-t-0 md:border-l">
					<div className="space-y-2.5">
						<button type="button" className={primary} onClick={() => setApplying(true)}>
							Apply now
							<ArrowRight className="size-4" />
						</button>
						<button
							type="button"
							onClick={toggleSaved}
							aria-pressed={saved}
							className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md text-on-surface hover:bg-surface-container"
						>
							<Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
							{saved ? "Saved job" : "Save job"}
						</button>
					</div>
					<section className="mt-7 border-outline-variant/60 border-t pt-6">
						<h3 className="font-semibold text-headline-sm">About the client</h3>
						<div className="mt-4 flex items-center gap-3">
							<span className="grid size-9 shrink-0 place-items-center rounded-lg border border-outline-variant bg-surface-container-lowest text-primary">
								<Building2 className="size-4" />
							</span>
							<div>
								<p className="font-medium text-body-sm">{job.company}</p>
								<p className="mt-0.5 text-caption text-on-surface-variant">Project owner</p>
							</div>
						</div>
						<p className="mt-4 text-body-sm text-on-surface-variant leading-5">
							Hiring for {job.category.toLowerCase()}.
						</p>
					</section>
					<section className="mt-6 border-outline-variant/60 border-t pt-5">
						<h3 className="font-medium text-label-sm">Your next step</h3>
						<p className="mt-2 text-body-sm text-on-surface-variant leading-5">
							Share relevant work and how you would approach this project. You can save your proposal as a draft.
						</p>
					</section>
				</aside>
			</div>
		</div>
	)
}
