import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, FileText, MapPin, Star, X } from "lucide-react"
import { type ReactNode, useRef, useState } from "react"
import { formatMoney } from "@/lib/currency"
import { LoadingImage } from "@/components/common/loading-image"

import { Monogram, SkillTag } from "@/components/dashboard/dashboard-header"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ProfileViewEntry = {
	id: string
	title: string
	category: string
	detail?: string
	url?: string
	color?: string
	imageUrl?: string
}

type ProfileViewBackgroundEntry = {
	id: string
	title: string
	organization?: string
	detail?: string
}

type FreelancerProfileViewData = {
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
	cvCard,
	feedback,
	reviewsNode,
	portfolioDialogAction,
	portfolioDialogEyebrow,
}: {
	profile: FreelancerProfileViewData
	nameHeadingLevel?: "h1" | "h2"
	backLink?: ReactNode
	contactTitle?: string
	contactActions?: ReactNode
	contactFooter?: ReactNode
	cvCard?: ReactNode
	feedback?: Feedback
	reviewsNode?: ReactNode
	portfolioDialogAction?: ReactNode
	portfolioDialogEyebrow?: string
}) {
	const [projectId, setProjectId] = useState<string | null>(null)
	const portfolioTrack = useRef<HTMLDivElement>(null)
	const NameHeading = nameHeadingLevel
	const project = profile.portfolio.find((entry) => entry.id === projectId)
	const firstName = profile.name.split(" ")[0] || "you"
	const heading = "text-xl font-semibold tracking-tight"
	const section = "scroll-mt-28 p-5 sm:p-8"
	const sections = [
		["about", "About"],
		["selected-work", "Selected work"],
		["background", "Background"],
		...(reviewsNode
			? [["client-reviews", `Reviews${profile.reviews !== undefined ? ` (${profile.reviews})` : ""}`]]
			: feedback
				? [["client-feedback", "Feedback"]]
				: []),
	]
	const scrollPortfolio = (direction: -1 | 1) => {
		const track = portfolioTrack.current
		if (track) {
			const cardWidth = track.firstElementChild?.getBoundingClientRect().width ?? track.clientWidth * 0.85
			const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
			track.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" })
		}
	}

	return (
		<div className="space-y-6" data-profile-view="freelancer">
			{backLink && <div className="flex flex-wrap items-center justify-between gap-3">{backLink}</div>}
			<header className="border-outline-variant border-b pb-6 sm:pb-8">
				<div className="flex items-start gap-4 sm:gap-6">
					{profile.avatarUrl ? (
						<LoadingImage
							src={profile.avatarUrl}
							alt={profile.name}
							className="size-16 shrink-0 rounded-lg object-cover sm:size-24"
						/>
					) : (
						<Monogram
							className={`size-16 text-xl sm:size-24 sm:text-3xl ${profile.background ?? "bg-brand-100"} ${profile.foreground ?? "text-brand-800"}`}
						>
							{profile.initials}
						</Monogram>
					)}
					<div className="min-w-0 flex-1">
						<NameHeading className="break-words font-semibold text-2xl tracking-tight sm:text-3xl">
							{profile.name}
						</NameHeading>
						<p className="mt-1 break-words text-base text-on-surface-variant">{profile.title}</p>
						<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-on-surface-variant text-xs">
							<span className="inline-flex items-center gap-1.5">
								<MapPin className="size-3.5" />
								{profile.location}
							</span>
							{profile.memberSince && <span>{profile.memberSince}</span>}
							{profile.rating !== undefined && profile.reviews !== undefined && (
								<a
									href="#client-reviews"
									onClick={(e) => {
										e.preventDefault()
										document.getElementById("client-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" })
									}}
									className="inline-flex items-center gap-1.5 rounded-md px-1.5 -mx-1.5 py-0.5 text-on-surface-variant transition-colors hover:text-foreground hover:bg-muted/60"
								>
									<Star className="size-3.5 fill-primary text-primary" />
									<strong className="font-semibold text-foreground">
										{profile.rating > 0 ? profile.rating.toFixed(1) : "New"}
									</strong>
									<span>
										({profile.reviews} {profile.reviews === 1 ? "review" : "reviews"})
									</span>
								</a>
							)}
						</div>
					</div>
				</div>
				</header>
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
				<aside aria-label="Contact and availability" className="lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
					<section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
						<p className="font-medium text-sm">{contactTitle ?? `Work with ${firstName}`}</p>
						<div className="mt-4 flex items-baseline gap-2">
							<p className="font-semibold text-3xl tabular-nums tracking-tight">
								{profile.rate ? formatMoney(profile.rate) : "Rate not set"}
							</p>
							{profile.rate ? <span className="text-on-surface-variant text-sm">per hour</span> : null}
						</div>
						{(profile.availability || profile.weeklyCapacity) && (
							<ul className="mt-4 space-y-2 border-outline-variant border-t pt-4 text-sm">
								{profile.availability && (
									<li className="flex items-center gap-2 text-on-surface">
										<Clock3 className="size-4 text-on-surface-variant" />
										{profile.availability}
									</li>
								)}
								{profile.weeklyCapacity && (
									<li className="text-on-surface-variant">{profile.weeklyCapacity} per week</li>
								)}
							</ul>
						)}
						{contactActions && <div className="mt-5 grid gap-2">{contactActions}</div>}
						{contactFooter}
					</section>
					{cvCard}
				</aside>
				<section
					aria-label="Professional profile"
					className="min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest lg:col-start-1 lg:row-start-1"
				>
					<nav aria-label="Profile sections" className="flex gap-6 overflow-x-auto border-outline-variant border-b px-5 sm:px-8">
						{sections.map(([id, label]) => (
							<a
								key={id}
								href={`#${id}`}
								onClick={(e) => {
									e.preventDefault()
									document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
								}}
								className="inline-flex min-h-14 shrink-0 items-center font-medium text-on-surface-variant text-sm hover:text-link"
							>
								{label}
							</a>
						))}
					</nav>
					<section id="about" className={section}>
						<h3 className={heading}>About {firstName}</h3>
						<div className="mt-5 space-y-4 whitespace-pre-wrap break-words text-on-surface-variant text-sm leading-7">
							{profile.about.map((paragraph) => (
								<p key={paragraph}>{paragraph}</p>
							))}
						</div>
						<h4 className="mt-7 font-medium text-sm">Skills & expertise</h4>
						<div className="mt-3 flex flex-wrap gap-2">
							{profile.skills.length > 0 ? (
								profile.skills.map((skill) => <SkillTag key={skill}>{skill}</SkillTag>)
							) : (
								<p className="text-on-surface-variant text-sm">No skills added yet.</p>
							)}
						</div>
					</section>
					<section id="selected-work" className={`${section} border-outline-variant border-t`}>
						<div className="flex flex-wrap items-baseline justify-between gap-2">
							<h3 className={heading}>Selected work</h3>
							<div className="flex items-center gap-3">
								<span className="text-on-surface-variant text-xs">
									{profile.portfolio.length} {profile.portfolio.length === 1 ? "project" : "projects"}
								</span>
								{profile.portfolio.length > 1 && (
									<div className="flex gap-1">
										<button
											type="button"
											aria-label="Show previous projects"
											onClick={() => scrollPortfolio(-1)}
											className="grid size-9 place-items-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										>
											<ArrowLeft className="size-4" />
										</button>
										<button
											type="button"
											aria-label="Show more projects"
											onClick={() => scrollPortfolio(1)}
											className="grid size-9 place-items-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										>
											<ArrowRight className="size-4" />
										</button>
									</div>
								)}
							</div>
						</div>
						{profile.portfolio.length > 0 ? (
							<div
								ref={portfolioTrack}
								role="region"
								aria-label="Selected projects"
								className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								tabIndex={0}
							>
								{profile.portfolio.map((entry) => (
									<button
										key={entry.id}
										type="button"
										aria-label={`View ${entry.title}`}
										onClick={() => setProjectId(entry.id)}
										className="group flex w-[82%] max-w-[22rem] shrink-0 snap-start flex-col rounded-lg border border-outline-variant p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-[calc((100%_-_1rem)/2)] sm:max-w-none sm:p-4"
									>
										<span
											className={`relative grid h-44 w-full place-items-center overflow-hidden rounded-lg text-slate-800 ${entry.color ?? "bg-brand-100"}`}
										>
											{entry.imageUrl ? (
												<LoadingImage src={entry.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
											) : (
												<FileText className="size-10 opacity-80" strokeWidth={1.35} />
											)}
											<span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-background/75 text-foreground backdrop-blur-sm transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
												<ArrowUpRight className="size-4" />
											</span>
										</span>
										<span className="mt-4 block min-w-0">
											<span className="block break-words font-medium text-base tracking-tight">{entry.title}</span>
											<span className="mt-1 block break-words text-on-surface-variant text-xs leading-5">
												{entry.category}
											</span>
											{entry.detail && (
												<span className="mt-3 line-clamp-3 text-on-surface-variant text-sm leading-6">
													{entry.detail}
												</span>
											)}
										</span>
									</button>
								))}
							</div>
						) : (
							<p className="mt-5 text-on-surface-variant text-sm">No projects added yet.</p>
						)}
					</section>
					<section id="background" className={`${section} border-outline-variant border-t`}>
						<h3 className={heading}>Background</h3>
						<div className="mt-5 grid gap-6 sm:grid-cols-2">
							<div>
								<h4 className="font-medium text-sm">Languages</h4>
								{profile.languages.length > 0 ? (
									<dl className="mt-3 space-y-3">
										{profile.languages.map((language) => (
											<div key={`${language.name}-${language.level}`} className="flex justify-between gap-4 text-sm">
												<dt className="text-on-surface-variant">{language.name}</dt>
												<dd className="text-right">{language.level}</dd>
											</div>
										))}
									</dl>
								) : (
									<p className="mt-3 text-on-surface-variant text-sm">No languages added yet.</p>
								)}
							</div>
							<div className="sm:border-outline-variant sm:border-l sm:pl-6">
								<h4 className="font-medium text-sm">Education</h4>
								{profile.education.length > 0 ? (
									<div className="mt-3 space-y-4">
										{profile.education.map((entry) => (
											<BackgroundEntry key={entry.id} entry={entry} />
										))}
									</div>
								) : (
									<p className="mt-3 text-on-surface-variant text-sm">No education added yet.</p>
								)}
							</div>
						</div>
						{!!profile.experience?.length && (
							<div className="mt-7 border-outline-variant border-t pt-6">
								<h4 className="font-medium text-sm">Work experience</h4>
								<div className="mt-4 grid gap-5 sm:grid-cols-2">
									{profile.experience.map((entry) => (
										<BackgroundEntry key={entry.id} entry={entry} />
									))}
								</div>
							</div>
						)}
					</section>
					{reviewsNode ? (
						<div className="border-outline-variant border-t">{reviewsNode}</div>
					) : feedback ? (
						<section id="client-feedback" className={`${section} border-outline-variant border-t`}>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<h3 className={heading}>Client feedback</h3>
								<p className="flex items-center gap-2 text-sm">
									<Star className="size-4 text-link" />
									<strong>{feedback.rating.toFixed(1)}</strong>
									<span className="text-on-surface-variant">/ 5</span>
								</p>
							</div>
							<blockquote className="mt-6 border-primary/40 border-l-2 pl-5 text-base leading-7">
								“{feedback.quote}”
							</blockquote>
							<div className="mt-5 flex items-center gap-3">
								<Monogram className="size-10 bg-muted text-on-surface-variant text-xs">
									{feedback.reviewerInitials}
								</Monogram>
								<div>
									<p className="font-medium text-sm">{feedback.reviewerName}</p>
									<p className="mt-1 text-on-surface-variant text-xs">{feedback.reviewerMeta}</p>
								</div>
							</div>
						</section>
					) : null}
				</section>
			</div>
			<Dialog
				open={!!project}
				onOpenChange={(open) => {
					if (!open) setProjectId(null)
				}}
			>
				<DialogContent showCloseButton={false} className="max-h-[88dvh] gap-0 overflow-hidden p-0 sm:max-w-2xl sm:p-0">
					<div className="overflow-y-auto">
						<div
							className={`relative grid aspect-[16/8] w-full place-items-center overflow-hidden text-slate-800 ${project?.color ?? "bg-brand-100"}`}
						>
							{project?.imageUrl ? (
								<LoadingImage src={project.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
							) : (
								<>
									<div className="absolute -right-8 -top-16 size-64 rounded-full border border-current/10" />
									<div className="absolute -right-2 -top-10 size-48 rounded-full border border-current/10" />
									<FileText className="size-16 opacity-80" strokeWidth={1.2} />
								</>
							)}
							<span className="absolute bottom-4 left-6 rounded-full bg-background/80 px-3 py-1 font-medium text-foreground text-xs backdrop-blur-sm">
								{project?.category}
							</span>
							<DialogClose
								aria-label="Close"
								className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
							>
								<X className="size-4" />
							</DialogClose>
						</div>
						<div className="space-y-4 p-6">
							<DialogHeader className="gap-1.5 pr-0">
								{portfolioDialogEyebrow && <p className="text-on-surface-variant text-xs">{portfolioDialogEyebrow}</p>}
								<DialogTitle className="text-2xl tracking-tight">{project?.title}</DialogTitle>
								<DialogDescription className="sr-only">{project?.category}</DialogDescription>
							</DialogHeader>
							<p className="whitespace-pre-wrap break-words text-on-surface-variant text-sm leading-7">
								{project?.detail || "No description added yet."}
							</p>
							{project?.url && /^https?:\/\//i.test(project.url) && (
								<a
									href={project.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-medium text-on-surface text-sm transition-colors hover:border-outline hover:bg-surface-container-low"
								>
									View project <ArrowUpRight className="size-4" />
								</a>
							)}
							{portfolioDialogAction && (
								<div className="space-y-4 border-outline-variant border-t pt-6">{portfolioDialogAction}</div>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

function BackgroundEntry({ entry }: { entry: ProfileViewBackgroundEntry }) {
	return (
		<div className="min-w-0">
			<p className="break-words font-medium text-sm">{entry.title}</p>
			{entry.organization && <p className="mt-1 break-words text-on-surface-variant text-xs">{entry.organization}</p>}
			{entry.detail && (
				<p className="mt-2 whitespace-pre-wrap break-words text-on-surface-variant text-sm leading-6">{entry.detail}</p>
			)}
		</div>
	)
}
