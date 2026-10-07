import { JobFormSection, jobFormField } from "@/components/common/job-form-section"
import CategorySelect from "@/components/common/category-select"
import { SkillsSelect } from "@/components/common/skills-select"
import { experienceLevels, jobDescriptionLimit } from "@/components/common/job-experience"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CategoriesService } from "@/client"
import { useQuery } from "@tanstack/react-query"
import type { ClientJob } from "./client-job-types"
import { ClientJobProposals } from "./client-job-proposals"

type ClientJobEditorProps = {
	job: ClientJob | null
	editing: boolean
	onClose: () => void
	onEditingChange: (editing: boolean) => void
	onJobChange: (job: ClientJob) => void
	onSave: (job: ClientJob) => void
	onDelete: (job: ClientJob) => void
}

export function ClientJobEditor({
	job,
	editing,
	onClose,
	onEditingChange,
	onJobChange,
	onSave,
	onDelete,
}: ClientJobEditorProps) {
	const descriptionLimit = jobDescriptionLimit(job?.experienceLevel ?? "")
	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => (await CategoriesService.readCategories()).data.data,
		staleTime: 1000 * 60 * 30,
	})
	return (
		<Sheet open={!!job} onOpenChange={(open) => !open && onClose()}>
			<SheetContent className="w-full gap-0 bg-surface-container-lowest p-0 sm:max-w-180">
				<SheetHeader className="border-b px-6 py-6 pr-12 sm:px-8 sm:pr-14">
					<p className="font-semibold text-primary text-xs">{editing ? "FIND YOUR NEXT COLLABORATOR" : "YOUR JOB"}</p>
					<SheetTitle className="mt-1 font-semibold text-2xl tracking-tight">
						{editing ? "Let’s shape your project" : job?.title || "Untitled job"}
					</SheetTitle>
					<SheetDescription>
						{editing ? "A few details to help the right freelancer find you." : `${job?.status} · ${job?.category}`}
					</SheetDescription>
				</SheetHeader>
				{job && (
					<div className={editing ? "flex min-h-0 flex-1 flex-col" : "min-h-0 flex-1 overflow-y-auto p-6 sm:p-8"}>
						{editing ? (
							<form
								className="flex min-h-0 flex-1 flex-col"
								onSubmit={(event) => {
									event.preventDefault()
									onSave({ ...job, title: job.title.trim(), status: "Open" })
								}}
							>
								<div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
									<JobFormSection title="" description="">
										<label className="block font-medium text-sm">
											Job title
											<input
												required
												maxLength={120}
												pattern=".*\S.*"
												className={jobFormField}
												value={job.title}
												onChange={(event) => onJobChange({ ...job, title: event.target.value })}
												placeholder="e.g. Design an onboarding flow for our app"
											/>
										</label>
										<label className="block font-medium text-sm">
											Project description
											<textarea
												required
												minLength={80}
												maxLength={descriptionLimit}
												rows={5}
												className={`${jobFormField} min-h-32 resize-y leading-6`}
												value={job.description}
												onChange={(event) =>
													onJobChange({
														...job,
														description: event.target.value,
													})
												}
												placeholder={"We’re looking for someone to…\nThe main deliverables are…"}
											/>
											<span className="mt-2 flex justify-between gap-3 font-normal text-on-surface-variant text-xs">
												<span>At least 80 characters</span>
												<span>
													{job.description.length.toLocaleString()} / {descriptionLimit.toLocaleString()}
												</span>
											</span>
										</label>
									</JobFormSection>

									<div className="border-outline-variant border-t" />
									<JobFormSection title="Choose a category" description="Help the right freelancers find your project.">
										<div className="mt-2">
											<CategorySelect
												value={job.category}
												categories={categories}
												onValueChange={(category) => onJobChange({ ...job, category })}
												showAllCategories={false}
												align="start"
												contentClassName="w-80"
												className="!flex h-12 w-full min-w-0 max-w-none rounded-lg border border-outline-variant px-3 hover:border-primary sm:flex"
											/>
										</div>
									</JobFormSection>
									<div className="border-outline-variant border-t" />
									<JobFormSection title="Find the right expertise" description="Choose the skills your project needs.">
										<SkillsSelect
											inputId="job-skill-entry"
											label="Skills"
											value={job.skills}
											onChange={(skills) => onJobChange({ ...job, skills })}
										/>
									</JobFormSection>
									<div className="border-outline-variant border-t" />
									<JobFormSection
										title="Experience level"
										description="Choose the level of experience this project needs."
									>
										<fieldset className="flex flex-col gap-2">
											<legend className="mb-2 font-medium text-sm">Select the experience level *</legend>
											{experienceLevels.map((level) => (
												<label
													key={level}
													className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm hover:border-primary"
												>
													<input
														type="radio"
														name="job-experience-level"
														value={level}
														checked={job.experienceLevel === level}
														required
														onChange={() => onJobChange({ ...job, experienceLevel: level })}
														className="size-4 accent-primary"
													/>
													{level}
												</label>
											))}
										</fieldset>
									</JobFormSection>
									<div className="border-outline-variant border-t" />
									<JobFormSection
										title="Set a budget"
										description="Give freelancers a clear starting point for their proposal."
									>
										<div className="grid gap-5 sm:grid-cols-2">
											<div className="font-medium text-sm">
												<label htmlFor="job-payment-type">Payment type</label>
												<Select value={job.type} onValueChange={(type) => onJobChange({ ...job, type })}>
													<SelectTrigger
														id="job-payment-type"
														className="mt-2 min-h-12 w-full rounded-lg border-outline-variant bg-surface-container-lowest px-3 text-on-surface shadow-none hover:border-primary dark:bg-surface-container-lowest dark:hover:bg-surface-container-lowest"
													>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="Fixed price">Fixed price</SelectItem>
														<SelectItem value="Hourly">Hourly</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<label className="block font-medium text-sm">
												{job.type === "Hourly" ? "Hourly rate (USD)" : "Budget (USD)"}
												<input
													required
													type="number"
													min="1"
													step="0.01"
													placeholder={job.type === "Hourly" ? "e.g. 65" : "e.g. 2000"}
													className={jobFormField}
													value={job.budget}
													onChange={(event) => onJobChange({ ...job, budget: event.target.value })}
												/>
											</label>
										</div>
									</JobFormSection>
								</div>
								<footer className="shrink-0 border-outline-variant border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<button
											type="button"
											onClick={() => onSave({ ...job, status: "Draft" })}
											className={workspaceStyles.secondaryAction}
										>
											Save draft
										</button>
										<button type="submit" className={workspaceStyles.primaryAction}>
											Save as open
										</button>
									</div>
								</footer>
							</form>
						) : (
							<ClientJobDetails job={job} onEdit={() => onEditingChange(true)} onSave={onSave} onDelete={onDelete} />
						)}
					</div>
				)}
			</SheetContent>
		</Sheet>
	)
}

function ClientJobDetails({
	job,
	onEdit,
	onSave,
	onDelete,
}: {
	job: ClientJob
	onEdit: () => void
	onSave: (job: ClientJob) => void
	onDelete: (job: ClientJob) => void
}) {
	return (
		<div className="space-y-7">
			{job.id && job.status !== "Draft" && <ClientJobProposals jobId={job.id} />}
			<section>
				<h3 className="font-semibold">Project brief</h3>
				<p className="wrap-break-word mt-3 whitespace-pre-wrap text-on-surface-variant text-sm leading-7">
					{job.description || "No description yet."}
				</p>
			</section>
			<section>
				<h3 className="font-semibold">Budget</h3>
				<p className="mt-2 text-sm">
					{job.budget ? `$${job.budget}${job.type === "Hourly" ? "/hr" : ""}` : "Not set"} · {job.type}
				</p>
			</section>
			<section>
				<h3 className="font-semibold">Skills</h3>
				<div className="mt-3 flex flex-wrap gap-2">
					{job.skills.map((skill) => (
						<span key={skill} className="rounded-md bg-muted px-3 py-1.5 text-xs">
							{skill}
						</span>
					))}
				</div>
			</section>
			{job.experienceLevel && (
				<section>
					<h3 className="font-semibold">Experience level</h3>
					<p className="mt-2 text-sm">{job.experienceLevel}</p>
				</section>
			)}
			<div className="flex flex-wrap gap-3">
				<button type="button" onClick={onEdit} className={workspaceStyles.primaryAction}>
					Edit job
				</button>
				{job.status === "Open" && (
					<button
						type="button"
						onClick={() => onSave({ ...job, status: "Closed" })}
						className={workspaceStyles.secondaryAction}
					>
						Close job
					</button>
				)}
				{job.status === "Closed" && (
					<button type="button" onClick={onEdit} className={workspaceStyles.secondaryAction}>
						Review and reopen
					</button>
				)}
				<button
					type="button"
					onClick={() => onDelete(job)}
					className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-destructive text-sm hover:bg-destructive/10"
				>
					Delete job
				</button>
			</div>
		</div>
	)
}
