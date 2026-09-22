import { Link } from "@tanstack/react-router"
import { ArrowRight, Bookmark, BriefcaseBusiness, CheckCircle2, ChevronDown, Circle, Search } from "lucide-react"
import { useEffect, useState } from "react"

import FreelancerJobCard from "@/components/freelancer/freelancer-job-card"
import { type ProposalDraft as Draft, freelancerJobs, seedProposals } from "@/data/freelancer-workspace"
import useAuth from "@/hooks/useAuth"
import { useFreelancerAvailability } from "@/hooks/useFreelancerAvailability"
import QuickSavedSearch from "../common/quick-search"
import { WorkspacePageHeader } from "@/components/dashboard/dashboard-header"

const FreelancerDashboardPage = () => {
	const { user } = useAuth()
	const { available } = useFreelancerAvailability()

	const jobs = freelancerJobs

	const storageKey = `freelancer-work-v2:${user?.id ?? "preview"}`

	const [drafts, setDrafts] = useState<Draft[]>([])
	const [error, setError] = useState("")

	const [filter, setFilter] = useState("All work")

	useEffect(() => {
		try {
			const stored = localStorage.getItem(storageKey)

			if (!stored) {
				setDrafts(seedProposals)
				return
			}

			const data = JSON.parse(stored)

			// setSaved(
			// 	Array.isArray(data.saved) ? data.saved.filter((id: unknown): id is string => typeof id === "string") : [],
			// )

			setDrafts(
				Array.isArray(data.drafts)
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
								typeof draft.cover === "string" &&
								typeof draft.rate === "string",
						)
					: seedProposals,
			)
		} catch {
			setDrafts(seedProposals)

			setError("Your saved workspace data couldn't be restored. Showing demo data.")
		}
	}, [storageKey])

	const filteredJobs = jobs.filter((job) => {
		const matchesCategory = filter === "All work" || job.category === filter
		return matchesCategory
	})

	const submittedProposals = drafts.filter((draft) => (draft.status ?? "Drafts") === "Submitted")

	const firstName = user?.full_name?.trim().split(/\s+/)[0] || "there"

	const dashboardFilters = ["All work", ...Array.from(new Set(jobs.map((job) => job.category))).slice(0, 2)]

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title={firstName ? `Good to see you, ${firstName}.` : "Find your next collaborator."}
				description="Keep your profile current and discover verified opportunities curated specifically for your skill stack."
				meta={
					<span
						className={`flex items-center gap-1 font-caption font-medium text-caption ${available ? "text-primary" : "text-secondary"}`}
					>
						<span
							className={`size-1.5 rounded-full ${available ? "bg-primary-container dark:bg-primary" : "bg-outline"}`}
						/>
						{available === undefined
							? "Availability not loaded"
							: available
								? "Available for new contracts"
								: "Not taking new contracts"}
					</span>
				}
				action={
					<>
						<Link
							to="/freelancer-saved-jobs"
							className="group inline-flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md font-medium text-label-md text-on-surface transition-colors hover:border-outline hover:bg-surface-container-low dark:border-border-subtle dark:hover:border-border-input"
						>
							<Bookmark className="size-4 text-current transition-colors" />

							<span>Saved</span>

							<span className="rounded-md bg-surface-container px-1.5 py-0.5 font-caption text-[10px] text-on-surface-variant transition-colors group-hover:text-on-surface">
								{/* {savedCount} */}0
							</span>
						</Link>
						<Link
							to="/freelancer-jobs"
							className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-surface-container-lowest shadow-sm transition-colors hover:bg-[#152243] dark:bg-on-surface dark:font-semibold dark:text-background dark:shadow-none dark:hover:bg-white"
						>
							<Search className="size-4" />
							Browse all jobs
						</Link>
					</>
				}
			/>
			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}

			<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
				<section className="flex flex-col gap-6 lg:col-span-8">
					<div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
							{dashboardFilters.map((item) => {
								const active = filter === item

								const count = item === "All work" ? jobs.length : jobs.filter((job) => job.category === item).length

								return (
									<button
										key={item}
										type="button"
										onClick={() => setFilter(item)}
										aria-pressed={active}
										className={
											active
												? "flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 font-label-md text-label-md text-surface-container-lowest transition-colors dark:bg-on-surface dark:text-background"
												: "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface dark:border-border-subtle"
										}
									>
										<span>{item === "All work" ? "All matches" : item}</span>

										<span
											className={
												active
													? "rounded bg-white/20 px-1.5 py-0.5 font-caption text-caption dark:bg-background/15 dark:text-background"
													: "rounded bg-surface-container px-1.5 py-0.5 font-caption text-caption text-outline"
											}
										>
											{count}
										</span>
									</button>
								)
							})}
						</div>
					</div>

					<div className="flex items-center justify-between px-1">
						<div className="flex items-center gap-2">
							<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">
								Opportunities to explore
							</h2>
						</div>

						<Link
							to="/freelancer-jobs"
							className="flex items-center gap-0.5 font-label-sm font-medium text-label-sm text-primary transition-colors hover:text-primary-container"
						>
							View all
							<ArrowRight className="size-3.5" />
						</Link>
					</div>

					{filteredJobs.length > 0 ? (
						<div className="flex flex-col gap-3.5">
							{filteredJobs.slice(0, 4).map((job) => (
								<FreelancerJobCard key={job.id} {...job} />
							))}
						</div>
					) : (
						<section className="grid min-h-72 place-items-center rounded-lg border border-outline-variant border-dashed bg-surface-container-lowest p-8 text-center">
							<div>
								<span className="mx-auto grid size-14 place-items-center rounded-lg border border-outline-variant bg-surface-container text-primary">
									<BriefcaseBusiness className="size-6" strokeWidth={1.5} />
								</span>

								<h2 className="mt-5 font-headline-lg font-semibold text-headline-lg text-on-surface">
									No opportunities in this category
								</h2>

								<p className="mx-auto mt-3 max-w-lg font-body-sm text-body-sm text-on-surface-variant leading-6">
									Try another category or browse all available work.
								</p>
							</div>
						</section>
					)}

					{filteredJobs.length > 0 && (
						<div className="flex justify-center pt-2 pb-6">
							<Link
								to="/freelancer-jobs"
								className="flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-6 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low dark:border-border-subtle dark:hover:border-border-input"
							>
								Load more opportunities
								<ChevronDown className="size-4 text-outline" />
							</Link>
						</div>
					)}
				</section>

				<aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:col-span-4">
					<section className="relative overflow-hidden rounded-lg border border-outline-variant bg-gradient-to-b from-[#e8f1fc] to-[#f0f6fd] p-5 dark:bg-surface-card dark:bg-none dark:shadow-none">
						<div className="mb-3">
							<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">
								Let your profile do the talking
							</h2>

							<p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
								Add your verified skills, set your target rate, and showcase client work you’re proud of.
							</p>
						</div>

						<div className="my-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-3.5 shadow-sm dark:border-border-subtle dark:bg-surface-panel dark:shadow-none">
							<div className="mb-1.5 flex items-center justify-between font-caption text-caption">
								<span className="font-medium text-on-surface dark:text-on-surface-soft">Profile readiness</span>

								<span className="font-medium text-primary dark:text-primary-hover">Review</span>
							</div>

							<div className="h-px w-full bg-surface-container dark:bg-border-dark" />

							<ul className="mt-3 flex flex-col gap-2 font-caption text-caption text-on-surface-variant">
								<li className="flex items-center gap-2">
									<CheckCircle2 className="size-3.5 shrink-0 text-primary-container dark:text-primary" />
									<span>Keep your skills and rate current</span>
								</li>

								<li className="flex items-center gap-2">
									<CheckCircle2 className="size-3.5 shrink-0 text-primary-container dark:text-primary" />
									<span>Show strong portfolio work</span>
								</li>

								<li className="flex items-center gap-2 text-on-surface">
									<Circle className="size-3.5 shrink-0 text-outline" />
									<span>Review your public profile before applying</span>
								</li>
							</ul>
						</div>

						<Link
							to="/freelancer"
							className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-surface-container-lowest shadow-sm transition-colors hover:bg-[#152243] dark:bg-on-surface dark:font-semibold dark:text-background dark:shadow-none dark:hover:bg-white"
						>
							Complete profile
							<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
						</Link>
					</section>

					<section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<h3 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Active proposals</h3>

								<span className="rounded border border-transparent bg-surface-container px-1.5 py-0.5 font-caption text-caption text-outline dark:border-border-subtle dark:text-on-surface-variant">
									{submittedProposals.length}
								</span>
							</div>

							<Link to="/freelancer-proposals" className="font-label-sm text-label-sm text-primary hover:underline">
								View all
							</Link>
						</div>

						<div className="flex flex-col gap-3">
							{submittedProposals.length > 0 ? (
								submittedProposals.slice(0, 2).map((proposal) => (
									<Link
										key={proposal.job.id}
										to="/freelancer-proposals"
										className="flex flex-col gap-1.5 rounded-lg border border-outline-variant p-3 text-left transition-colors hover:bg-surface-container-low dark:bg-surface-panel"
									>
										<div className="flex w-full items-center justify-between gap-3">
											<span className="truncate font-label-sm font-medium text-label-sm text-on-surface">
												{proposal.job.title}
											</span>

											<span className="shrink-0 rounded bg-primary-fixed px-2 py-0.5 font-caption font-medium text-caption text-on-primary-fixed">
												Submitted
											</span>
										</div>

										<div className="flex w-full items-center justify-between gap-3 font-caption text-caption text-outline">
											<span className="truncate">
												{proposal.job.company} • {proposal.job.budget}
											</span>

											<span className="shrink-0">{proposal.job.posted ?? "Recently"}</span>
										</div>
									</Link>
								))
							) : (
								<p className="rounded-lg border border-outline-variant border-dashed px-3 py-4 font-body-sm text-body-sm text-on-surface-variant">
									Submitted proposals will appear here.
								</p>
							)}
						</div>
					</section>

					<QuickSavedSearch />
				</aside>
			</div>
		</div>
	)
}

export default FreelancerDashboardPage
