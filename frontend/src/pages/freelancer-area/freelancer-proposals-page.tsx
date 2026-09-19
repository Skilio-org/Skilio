import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { JobDetails } from "@/components/freelancer/freelancer-job-details"
import { JobFormSection, jobFormField } from "@/components/common/job-form-section"
import { WorkspacePageHeader, WorkspaceSurface, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import {
	type ProposalDraft as Draft,
	freelancerWorkspaceSubtitles,
	freelancerWorkspaceTitles,
	seedProposals,
} from "@/data/freelancer-workspace"
import useAuth from "@/hooks/useAuth"
import type { FreelancerJob } from "@/types/job"

type ProposalTab = "Drafts" | "Submitted" | "Archived"

const FreelancerProposalsPage = () => {
	const { user } = useAuth()

	const storageKey = `freelancer-work-v2:${user?.id ?? "preview"}`

	const [drafts, setDrafts] = useState<Draft[]>([])
	const [loaded, setLoaded] = useState(false)
	const [error, setError] = useState("")

	const [tab, setTab] = useState<ProposalTab>("Drafts")

	const [selected, setSelected] = useState<FreelancerJob | null>(null)
	const [compose, setCompose] = useState(false)

	const [cover, setCover] = useState("")
	const [rate, setRate] = useState("")

	const visibleProposals = drafts.filter((draft) => (draft.status ?? "Drafts") === tab)

	const selectedProjectType =
		selected?.projectType ?? (selected?.budget.toLowerCase().includes("fixed") ? "Fixed price" : "Hourly")

	useEffect(() => {
		try {
			const stored = localStorage.getItem(storageKey)

			if (!stored) {
				setDrafts(seedProposals)
				setLoaded(true)
				return
			}

			const data = JSON.parse(stored)

			const validDrafts = Array.isArray(data.drafts)
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
				: seedProposals

			setDrafts(validDrafts)
		} catch {
			setDrafts(seedProposals)
			setError("Your saved proposals couldn't be restored. Showing demo proposals.")
		}

		setLoaded(true)
	}, [storageKey])

	useEffect(() => {
		if (!loaded) return

		try {
			const stored = localStorage.getItem(storageKey)
			const existing = stored ? JSON.parse(stored) : {}

			localStorage.setItem(
				storageKey,
				JSON.stringify({
					...existing,
					drafts,
				}),
			)
		} catch {
			setError("Proposal changes couldn't be saved on this device.")
		}
	}, [drafts, loaded, storageKey])

	const changeProposal = (id: string, status: ProposalTab) => {
		setDrafts((items) =>
			items.map((item) =>
				item.job.id === id
					? {
							...item,
							status,
						}
					: item,
			),
		)

		if (status === "Submitted") {
			toast.success("Proposal submitted")
			return
		}

		if (status === "Archived") {
			toast.success("Proposal archived")
			return
		}

		toast.success("Proposal restored to drafts")
	}

	const openProposal = (job: FreelancerJob, draft: Draft) => {
		setSelected(job)
		setCompose(true)
		setCover(draft.cover)
		setRate(draft.rate)
	}

	const openJob = (job: FreelancerJob) => {
		setSelected(job)
		setCompose(false)
		setCover("")
		setRate("")
	}

	const closeSheet = () => {
		setSelected(null)
		setCompose(false)
		setCover("")
		setRate("")
	}

	const saveDraft = () => {
		if (!selected) return

		setDrafts((items) => [
			...items.filter((draft) => draft.job.id !== selected.id),
			{
				job: selected,
				cover: cover.trim(),
				rate,
				status: "Drafts",
			},
		])

		closeSheet()

		toast.success("Proposal draft saved")
	}

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title={freelancerWorkspaceTitles.proposals}
				description={freelancerWorkspaceSubtitles.proposals}
				action=""
			/>

			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}

			<div className="flex flex-wrap gap-2">
				{(["Drafts", "Submitted", "Archived"] as ProposalTab[]).map((proposalTab) => (
					<button
						key={proposalTab}
						type="button"
						className={tab === proposalTab ? workspaceStyles.primaryAction : workspaceStyles.secondaryAction}
						onClick={() => setTab(proposalTab)}
					>
						{proposalTab}
					</button>
				))}
			</div>

			{visibleProposals.length > 0 ? (
				<div className="space-y-4">
					{visibleProposals.map((draft) => (
						<WorkspaceSurface key={draft.job.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
							<div>
								<p className="text-muted-foreground text-xs">
									{draft.status ?? "Drafts"} · {draft.job.company}
								</p>

								<h2 className="mt-2 font-semibold text-lg">{draft.job.title}</h2>

								<p className="mt-2 text-muted-foreground text-sm">
									Proposed {draft.job.projectType === "Fixed price" ? "budget" : "rate"}: ${draft.rate}
									{draft.job.projectType === "Hourly" ? "/hr" : ""}
								</p>
							</div>

							<div className="flex flex-wrap gap-2">
								{tab === "Drafts" && (
									<>
										<button
											type="button"
											className={workspaceStyles.secondaryAction}
											onClick={() => openProposal(draft.job, draft)}
										>
											Edit draft
										</button>

										<button
											type="button"
											className={workspaceStyles.primaryAction}
											onClick={() => changeProposal(draft.job.id, "Submitted")}
										>
											Submit proposal
										</button>
									</>
								)}

								{tab === "Submitted" && (
									<button type="button" className={workspaceStyles.secondaryAction} onClick={() => openJob(draft.job)}>
										View job
									</button>
								)}

								<button
									type="button"
									className={workspaceStyles.secondaryAction}
									onClick={() => changeProposal(draft.job.id, tab === "Archived" ? "Drafts" : "Archived")}
								>
									{tab === "Archived" ? "Restore draft" : "Archive"}
								</button>
							</div>
						</WorkspaceSurface>
					))}
				</div>
			) : (
				<EmptyProposals tab={tab} />
			)}

			<Sheet
				open={selected !== null}
				onOpenChange={(open) => {
					if (!open) {
						closeSheet()
					}
				}}
			>
				<SheetContent
					side="right"
					showCloseButton={false}
					className={
						compose
							? "w-full max-w-none gap-0 bg-card p-0 sm:max-w-180"
							: "w-full max-w-none gap-0 p-0 sm:w-[min(78vw,1180px)] sm:max-w-none"
					}
				>
					{selected && (
						<>
							<header className="flex h-18 shrink-0 items-center justify-between gap-4 border-border border-b bg-card px-5 sm:px-7">
								<SheetClose className="inline-flex min-h-11 items-center gap-2 rounded-lg font-medium text-muted-foreground text-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
									<ArrowLeft className="size-4" />
									Back to proposals
								</SheetClose>

								<p className="hidden text-muted-foreground text-xs sm:block">{selected.company} · Remote opportunity</p>
							</header>

							{compose ? (
								<ProposalEditor
									job={selected}
									cover={cover}
									rate={rate}
									onCoverChange={setCover}
									onRateChange={setRate}
									onCancel={() => setCompose(false)}
									onSubmit={saveDraft}
								/>
							) : (
								<JobDetails job={selected} projectType={selectedProjectType} />
							)}
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	)
}

const ProposalEditor = ({
	job,
	cover,
	rate,
	onCoverChange,
	onRateChange,
	onCancel,
	onSubmit,
}: {
	job: FreelancerJob
	cover: string
	rate: string
	onCoverChange: (value: string) => void
	onRateChange: (value: string) => void
	onCancel: () => void
	onSubmit: () => void
}) => {
	const isHourly = job.projectType === "Hourly"

	return (
		<section className="flex min-h-0 flex-1 flex-col">
			<div className="border-border border-b px-6 py-6 sm:px-8">
				<p className="mb-2 font-semibold text-primary text-xs">YOUR NEXT OPPORTUNITY</p>

				<SheetTitle className="font-semibold text-2xl tracking-tight">Make your introduction</SheetTitle>

				<SheetDescription className="mt-2 text-sm leading-6">
					A thoughtful proposal is the start of a great collaboration.
				</SheetDescription>
			</div>

			<form
				className="flex min-h-0 flex-1 flex-col"
				onSubmit={(event) => {
					event.preventDefault()
					onSubmit()
				}}
			>
				<div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
					<div className="rounded-xl border border-border bg-muted/40 p-4">
						<p className="text-muted-foreground text-xs">Applying to · {job.company}</p>

						<p className="mt-2 font-semibold text-sm leading-6">{job.title}</p>

						<p className="mt-2 text-muted-foreground text-xs">{job.budget}</p>
					</div>

					<JobFormSection
						title={isHourly ? "Set your hourly rate" : "Set your project price"}
						description={
							isHourly
								? "Enter the hourly rate you'd like to propose."
								: "Enter the total amount you'd like to propose."
						}
					>
						<label className="block font-medium text-sm">
							{isHourly ? "Hourly rate" : "Project price"}

							<div className="relative mt-2">
								<span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">$</span>

								<input
									required
									type="number"
									min="1"
									step="0.01"
									value={rate}
									onChange={(event) => onRateChange(event.target.value)}
									className={`${jobFormField} pl-7`}
								/>
							</div>
						</label>
					</JobFormSection>

					<JobFormSection
						title="Tell them why you're a good fit"
						description="Share relevant experience and how you'd approach this project."
					>
						<label className="block font-medium text-sm">
							Cover letter
							<textarea
								required
								minLength={40}
								maxLength={5000}
								rows={6}
								value={cover}
								onChange={(event) => onCoverChange(event.target.value)}
								placeholder="Hi! Your project caught my attention because…"
								className={`${jobFormField} mt-2 min-h-40 resize-y leading-6`}
							/>
							<span className="mt-2 block text-muted-foreground text-xs">
								At least 40 characters
								<span className="float-right">{cover.length.toLocaleString()} / 5,000</span>
							</span>
						</label>
					</JobFormSection>
				</div>

				<footer className="shrink-0 border-border border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
					<div className="flex items-center justify-between gap-3">
						<button type="button" onClick={onCancel} className={workspaceStyles.secondaryAction}>
							Back
						</button>

						<button type="submit" className={workspaceStyles.primaryAction}>
							Save draft
							<ArrowRight className="size-4" />
						</button>
					</div>
				</footer>
			</form>
		</section>
	)
}

const EmptyProposals = ({ tab }: { tab: ProposalTab }) => {
	const title =
		tab === "Submitted"
			? "No submitted proposals"
			: tab === "Archived"
				? "No archived proposals"
				: "Start with a project that fits"

	return (
		<WorkspaceSurface className="grid min-h-72 place-items-center border-outline-variant border-dashed bg-surface-container-lowest p-8 text-center">
			<div>
				<span className="mx-auto grid size-14 place-items-center rounded-lg border border-outline-variant bg-surface-container text-primary">
					<FileText className="size-6" strokeWidth={1.5} />
				</span>

				<h2 className="mt-5 font-headline-lg font-semibold text-headline-lg text-on-surface">{title}</h2>

				<p className="mx-auto mt-3 max-w-lg font-body-sm text-body-sm text-on-surface-variant leading-6">
					Your proposals will appear here. Browse work and prepare a thoughtful introduction.
				</p>

				{tab === "Drafts" && (
					<div className="mt-5">
						<Link className={workspaceStyles.primaryAction} to="/freelancer-jobs">
							Find work
							<ArrowRight className="size-4" />
						</Link>
					</div>
				)}
			</div>
		</WorkspaceSurface>
	)
}

export default FreelancerProposalsPage
