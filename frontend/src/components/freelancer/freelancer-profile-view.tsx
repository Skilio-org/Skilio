import { ArrowUpRight, Clock3, FileText, MapPin, Star } from "lucide-react"
import { type ReactNode, useState } from "react"

import { Monogram, SkillTag } from "@/components/dashboard/dashboard-header"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type ProfileViewEntry = {
	id: string
	title: string
	category: string
	detail?: string
	url?: string
	color?: string
}

export type ProfileViewBackgroundEntry = {
	id: string
	title: string
	organization?: string
	detail?: string
}

export type FreelancerProfileViewData = {
	name: string
	initials: string
	avatarUrl?: string
	title: string
	location: string
	summary: string
	about: string[]
	skills: string[]
	rate?: string | number
	availability?: string
	weeklyCapacity?: string
	memberSince?: string
	rating?: number
	reviews?: number
	background?: string
	foreground?: string
	portfolio: ProfileViewEntry[]
	languages: { name: string; level: string }[]
	education: ProfileViewBackgroundEntry[]
	experience?: ProfileViewBackgroundEntry[]
}

type Feedback = {
	rating: number
	quote: string
	reviewerInitials: string
	reviewerName: string
	reviewerMeta: string
}

export function FreelancerProfileView({
	profile,
	nameHeadingLevel = "h2",
	backLink,
	contactTitle,
	contactActions,
	contactFooter,
	feedback,
	portfolioDialogAction,
	portfolioDialogEyebrow = "Portfolio entry",
}: {
	profile: FreelancerProfileViewData
	nameHeadingLevel?: "h1" | "h2"
	backLink?: ReactNode
	contactTitle?: string
	contactActions?: ReactNode
	contactFooter?: ReactNode
	feedback?: Feedback
	portfolioDialogAction?: ReactNode
	portfolioDialogEyebrow?: string
}) {
	const [projectId, setProjectId] = useState<string | null>(null)
	const NameHeading = nameHeadingLevel
	const project = profile.portfolio.find((entry) => entry.id === projectId)
	const firstName = profile.name.split(" ")[0] || "you"
	const heading = "text-xl font-semibold tracking-tight"
	const section = "scroll-mt-28 p-5 sm:p-8"
	const sections = [
		["about", "About"],
		["selected-work", "Selected work"],
		["background", "Background"],
		...(feedback ? [["client-feedback", "Feedback"]] : []),
	]

	return (
		<div className="space-y-6" data-profile-view="freelancer">
			{backLink && <div className="flex flex-wrap items-center justify-between gap-3">{backLink}</div>}
			<header className="border-border border-b pb-7 sm:pb-9">
				<div className="flex items-start gap-4 sm:gap-6">
					{profile.avatarUrl ? (
						<img
							src={profile.avatarUrl}
							alt={profile.name}
							className="size-16 shrink-0 rounded-xl object-cover sm:size-24"
						/>
					) : (
						<Monogram
							className={`size-16 text-xl sm:size-24 sm:text-3xl ${profile.background ?? "bg-brand-100"} ${profile.foreground ?? "text-brand-800"}`}
						>
							{profile.initials}
						</Monogram>
					)}
					<div className="min-w-0 flex-1">
						<p className="mb-2 font-medium text-muted-foreground text-xs">Independent professional</p>
						<NameHeading className="break-words font-display font-medium text-3xl tracking-tight sm:text-[2.5rem]">
							{profile.name}
						</NameHeading>
						<p className="mt-2 break-words text-base text-muted-foreground sm:text-lg">{profile.title}</p>
						<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground text-xs">
							<span className="inline-flex items-center gap-1.5">
								<MapPin className="size-3.5" />
								{profile.location}
							</span>
							{profile.memberSince && <span>{profile.memberSince}</span>}
							{profile.rating !== undefined && profile.reviews !== undefined && (
								<span className="inline-flex items-center gap-1.5">
									<Star className="size-3.5" />
									<strong className="font-semibold">{profile.rating.toFixed(1)}</strong>
									<span className="text-muted-foreground">{profile.reviews} reviews</span>
								</span>
							)}
						</div>
					</div>
				</div>
				<p className="mt-6 max-w-3xl whitespace-pre-wrap break-words text-base text-muted-foreground leading-7">
					{profile.summary}
				</p>
			</header>
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
				<aside aria-label="Contact and availability" className="lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
					<section className="rounded-xl border border-border bg-card p-5 sm:p-6">
						<p className="font-medium text-sm">{contactTitle ?? `Work with ${firstName}`}</p>
						<div className="mt-5 flex items-baseline gap-2">
							<p className="font-semibold text-3xl tabular-nums tracking-tight">
								{profile.rate ? `$${profile.rate}` : "—"}
							</p>
							<span className="text-muted-foreground text-sm">USD / hour</span>
						</div>
						<p className="mt-3 inline-flex items-center gap-2 rounded-md bg-accent px-2.5 py-1.5 font-medium text-accent-foreground text-xs">
							<Clock3 className="size-3.5" />
							{profile.availability || "Availability not set"}
						</p>
						{profile.weeklyCapacity && (
							<p className="mt-4 text-muted-foreground text-xs leading-5">{profile.weeklyCapacity} per week</p>
						)}
						{contactActions && <div className="mt-5 grid gap-2">{contactActions}</div>}
						{contactFooter}
					</section>
				</aside>
				<article
					aria-label="Professional profile"
					className="min-w-0 overflow-hidden rounded-xl border border-border bg-card lg:col-start-1 lg:row-start-1"
				>
					<nav aria-label="Profile sections" className="flex gap-6 overflow-x-auto border-border border-b px-5 sm:px-8">
						{sections.map(([id, label]) => (
							<a
								key={id}
								href={`#${id}`}
								className="inline-flex min-h-14 shrink-0 items-center font-medium text-muted-foreground text-sm hover:text-primary"
							>
								{label}
							</a>
						))}
					</nav>
					<section id="about" className={section}>
						<h3 className={heading}>About {firstName}</h3>
						<div className="mt-5 space-y-4 whitespace-pre-wrap break-words text-muted-foreground text-sm leading-7">
							{profile.about.map((paragraph) => (
								<p key={paragraph}>{paragraph}</p>
							))}
						</div>
						<h4 className="mt-7 font-medium text-sm">Skills & expertise</h4>
						<div className="mt-3 flex flex-wrap gap-2">
							{profile.skills.length > 0 ? (
								profile.skills.map((skill) => <SkillTag key={skill}>{skill}</SkillTag>)
							) : (
								<p className="text-muted-foreground text-sm">Skills will appear here.</p>
							)}
						</div>
					</section>
					<section id="selected-work" className={`${section} border-border border-t`}>
						<div className="flex flex-wrap items-baseline justify-between gap-2">
							<h3 className={heading}>Selected work</h3>
							<span className="text-muted-foreground text-xs">
								{profile.portfolio.length} {profile.portfolio.length === 1 ? "project" : "projects"}
							</span>
						</div>
						{profile.portfolio.length > 0 ? (
							<div className="mt-5 space-y-3">
								{profile.portfolio.map((entry) => (
									<button
										key={entry.id}
										type="button"
										aria-label={`View ${entry.title}`}
										onClick={() => setProjectId(entry.id)}
										className="group flex w-full items-center gap-4 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30 sm:p-4"
									>
										<span
											className={`grid size-14 shrink-0 place-items-center rounded-lg text-slate-800 sm:size-16 ${entry.color ?? "bg-brand-100"}`}
										>
											<FileText className="size-6" strokeWidth={1.5} />
										</span>
										<span className="min-w-0 flex-1">
											<span className="block break-words font-medium text-base tracking-tight">{entry.title}</span>
											<span className="mt-1 block break-words text-muted-foreground text-xs leading-5">
												{entry.category}
											</span>
										</span>
										<ArrowUpRight className="mr-1 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
									</button>
								))}
							</div>
						) : (
							<p className="mt-5 text-muted-foreground text-sm">Portfolio projects will appear here.</p>
						)}
					</section>
					<section id="background" className={`${section} border-border border-t`}>
						<h3 className={heading}>Background</h3>
						<div className="mt-5 grid gap-6 sm:grid-cols-2">
							<div>
								<h4 className="font-medium text-sm">Languages</h4>
								{profile.languages.length > 0 ? (
									<dl className="mt-3 space-y-3">
										{profile.languages.map((language) => (
											<div key={`${language.name}-${language.level}`} className="flex justify-between gap-4 text-sm">
												<dt className="text-muted-foreground">{language.name}</dt>
												<dd className="text-right">{language.level}</dd>
											</div>
										))}
									</dl>
								) : (
									<p className="mt-3 text-muted-foreground text-sm">Languages will appear here.</p>
								)}
							</div>
							<div className="sm:border-border sm:border-l sm:pl-6">
								<h4 className="font-medium text-sm">Education</h4>
								{profile.education.length > 0 ? (
									<div className="mt-3 space-y-4">
										{profile.education.map((entry) => (
											<BackgroundEntry key={entry.id} entry={entry} />
										))}
									</div>
								) : (
									<p className="mt-3 text-muted-foreground text-sm">Education can be added later.</p>
								)}
							</div>
						</div>
						{!!profile.experience?.length && (
							<div className="mt-7 border-border border-t pt-6">
								<h4 className="font-medium text-sm">Work experience</h4>
								<div className="mt-4 grid gap-5 sm:grid-cols-2">
									{profile.experience.map((entry) => (
										<BackgroundEntry key={entry.id} entry={entry} />
									))}
								</div>
							</div>
						)}
					</section>
					{feedback && (
						<section id="client-feedback" className={`${section} border-border border-t`}>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<h3 className={heading}>Client feedback</h3>
								<p className="flex items-center gap-2 text-sm">
									<Star className="size-4 text-primary" />
									<strong>{feedback.rating.toFixed(1)}</strong>
									<span className="text-muted-foreground">/ 5</span>
								</p>
							</div>
							<blockquote className="mt-6 border-primary/40 border-l-2 pl-5 text-base leading-7">
								“{feedback.quote}”
							</blockquote>
							<div className="mt-5 flex items-center gap-3">
								<Monogram className="size-10 bg-muted text-muted-foreground text-xs">
									{feedback.reviewerInitials}
								</Monogram>
								<div>
									<p className="font-medium text-sm">{feedback.reviewerName}</p>
									<p className="mt-1 text-muted-foreground text-xs">{feedback.reviewerMeta}</p>
								</div>
							</div>
						</section>
					)}
				</article>
			</div>
			<Dialog
				open={!!project}
				onOpenChange={(open) => {
					if (!open) setProjectId(null)
				}}
			>
				<DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
					<DialogHeader>
						<p className="mb-2 text-muted-foreground text-xs">{portfolioDialogEyebrow}</p>
						<DialogTitle>{project?.title}</DialogTitle>
						<DialogDescription>{project?.category}</DialogDescription>
					</DialogHeader>
					<div className="rounded-xl border border-border bg-muted/40 p-5">
						<p className="whitespace-pre-wrap break-words text-muted-foreground text-sm leading-7">
							{project?.detail || `More details about ${project?.title} will appear here.`}
						</p>
					</div>
					{project?.url && /^https?:\/\//i.test(project.url) && (
						<a
							href={project.url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex min-h-11 items-center gap-2 font-medium text-primary text-sm underline"
						>
							View project <ArrowUpRight className="size-4" />
						</a>
					)}
					{portfolioDialogAction}
				</DialogContent>
			</Dialog>
		</div>
	)
}

function BackgroundEntry({ entry }: { entry: ProfileViewBackgroundEntry }) {
	return (
		<div className="min-w-0">
			<p className="break-words font-medium text-sm">{entry.title}</p>
			{entry.organization && <p className="mt-1 break-words text-muted-foreground text-xs">{entry.organization}</p>}
			{entry.detail && (
				<p className="mt-2 whitespace-pre-wrap break-words text-muted-foreground text-sm leading-6">{entry.detail}</p>
			)}
		</div>
	)
}
