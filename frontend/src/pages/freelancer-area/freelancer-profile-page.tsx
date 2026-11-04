import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, Plus, Star, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useBlocker } from "@tanstack/react-router"
import { toast } from "sonner"
import { SkillsSelect } from "@/components/common/skills-select"
import CitySelect from "@/components/common/city-select"
import { WorkspacePageHeader } from "@/components/dashboard/dashboard-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CategorySelect from "@/components/common/category-select"
import { CategoriesService, ProfilesService, UsersService, type FreelancerProfileDetailPublic, type FreelancerProfileUpdate } from "@/client"
import { Avatar, EntryDialog, ProfilePreview } from "@/components/freelancer/freelancer-profile-components"
import { LanguagesField } from "@/components/freelancer/languages-field"
import { FreelancerReviewsSection } from "@/components/reviews/freelancer-reviews-section"
import {
	completion,
	descriptions,
	type ProfileEntryForm,
	fieldClass,
	type ProfileForm,
	primary,
	secondary,
	steps,
	textareaClass,
} from "@/components/freelancer/freelancer-profile-model"
import { accountAvatarUrl, markAccountAvatarUpdated } from "@/hooks/useAccountAvatar"
import useAuth from "@/hooks/useAuth"
import { useErrorToast } from "@/hooks/useErrorToast"

const FreelancerProfileEditor = ({ initial }: { initial: FreelancerProfileDetailPublic }) => {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const { data: categories = [], isPending: categoriesLoading } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => (await CategoriesService.readCategories()).data.data,
		staleTime: 1000 * 60 * 30,
	})
	const [serverProfile, setServerProfile] = useState(initial)
	const [profile, setProfile] = useState<ProfileForm>(() => ({
		name: initial.full_name ?? initial.user?.full_name ?? "",
		title: initial.title ?? "",
		location: initial.location ?? "",
		photo: accountAvatarUrl(initial.user_id),
		category: initial.category ?? "",
		skills: initial.skills ?? [],
		bio: initial.bio ?? "",
		languages: initial.languages ?? "",
		rate: initial.hourly_rate == null ? "" : String(initial.hourly_rate),
		availability: initial.availability ?? "",
		hours: initial.hours ?? "",
		finished: initial.finished ?? false,
		experience: (initial.experiences ?? []).map((entry) => ({
			id: entry.id,
			title: entry.title,
			organization: entry.organization ?? "",
			detail: entry.detail ?? "",
			url: entry.url ?? "",
		})),
		education: (initial.educations ?? []).map((entry) => ({
			id: entry.id,
			title: entry.title ?? entry.degree ?? "",
			organization: entry.organization ?? entry.institution ?? "",
			detail: entry.detail ?? entry.description ?? "",
			url: entry.url ?? "",
			field_of_study: entry.field_of_study,
			start_date: entry.start_date,
			end_date: entry.end_date,
		})),
		portfolio: (initial.portfolio ?? []).map((entry) => ({
			id: entry.id,
			title: entry.title,
			organization: entry.organization ?? "",
			detail: entry.detail ?? entry.description ?? "",
			url: entry.url ?? "",
			image_url: entry.image_url,
		})),
	}))
	const [savedProfile, setSavedProfile] = useState(profile)
	const [saving, setSaving] = useState(false)
	const saveLock = useRef(false)
	const portfolioTouched = useRef(false)
	const [uploading, setUploading] = useState(false)
	const dirty = JSON.stringify(profile) !== JSON.stringify(savedProfile)
	useBlocker({
		shouldBlockFn: () =>
			saving || uploading || (dirty && !window.confirm("Leave without saving your profile changes?")),
		enableBeforeUnload: dirty || saving || uploading,
	})
	const [view, setView] = useState<"home" | "edit" | "preview">("home")
	const [step, setStep] = useState(0)
	const [editor, setEditor] = useState<{
		kind: "experience" | "education" | "portfolio"
		entry: ProfileEntryForm
	} | null>(null)
	async function save(finished = profile.finished) {
		if (saveLock.current || uploading) return false
		if (profile.rate.trim() && (!Number.isFinite(Number(profile.rate)) || Number(profile.rate) < 0)) {
			toast.error("Enter a valid hourly rate before saving.")
			return false
		}
		saveLock.current = true
		setSaving(true)
		try {
			const body: FreelancerProfileUpdate = {
				full_name: profile.name.trim(),
				title: profile.title,
				location: profile.location,
				category: profile.category,
				skills: profile.skills,
				bio: profile.bio,
				languages: profile.languages,
				hourly_rate: profile.rate.trim() ? Number(profile.rate) : null,
				hours: profile.hours,
				finished,
			}
			// The API replaces a child collection when it is included in the request.
			if (JSON.stringify(profile.experience) !== JSON.stringify(savedProfile.experience)) {
				body.experiences = profile.experience.map(({ title, organization, detail, url }) => ({
					title,
					organization,
					detail,
					url,
				}))
			}
			if (JSON.stringify(profile.education) !== JSON.stringify(savedProfile.education)) {
				body.educations = profile.education.map(
					({ title, organization, detail, url, field_of_study, start_date, end_date }) => ({
						title,
						organization,
						detail,
						url,
						degree: title,
						institution: organization,
						description: detail,
						field_of_study,
						start_date,
						end_date,
					}),
				)
			}
			if (portfolioTouched.current || JSON.stringify(profile.portfolio) !== JSON.stringify(savedProfile.portfolio)) {
				body.portfolio = profile.portfolio.map(({ title, organization, detail, url, image_url }) => ({
					title,
					organization,
					detail,
					url,
					description: detail,
					image_url,
				}))
			}
			const { data } = await ProfilesService.updateProfileMe({
				body,
			})
			const saved = { ...profile, finished }
			setServerProfile(data)
			// Keep anything typed while the request was in flight instead of overwriting it with the saved copy.
			setProfile((current) => ({ ...current, finished }))
			setSavedProfile(saved)
			portfolioTouched.current = false
			queryClient.setQueryData(["freelancer-profile", initial.user_id], data)
			void queryClient.invalidateQueries({ queryKey: ["currentUser"] })
			void queryClient.invalidateQueries({ queryKey: ["message-contacts"] })
			return true
		} catch {
			toast.error(
				"Your profile couldn’t be saved. Your changes are still here. Check your connection and try Save changes again.",
			)
			return false
		} finally {
			saveLock.current = false
			setSaving(false)
		}
	}
	const update = <K extends keyof ProfileForm>(name: K, value: ProfileForm[K]) =>
		setProfile((p) => ({ ...p, [name]: value }))
	const done = completion(profile)
	const percent = Math.round((done.filter(Boolean).length / done.length) * 100)
	const required = [0, 1, 2, 5]
	const reviewCount = serverProfile.reviews_count ?? 0
	const rating = serverProfile.average_rating ?? 0
	const nextStep = done.findIndex((v, i) => !v && required.includes(i))
	const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`
	const summaries = [
		[profile.title, profile.location].filter(Boolean).join(" · "),
		[profile.category, plural(profile.skills.length, "skill")].filter(Boolean).join(" · "),
		profile.bio.trim().slice(0, 90),
		[plural(profile.experience.length, "job"), `${profile.education.length} education`].join(" · "),
		plural(profile.portfolio.length, "project"),
		[profile.rate && `$${profile.rate}/hr`, profile.hours].filter(Boolean).join(" · "),
	]
	function edit(index: number) {
		setStep(index)
		setView("edit")
	}
	async function next() {
		if ([0, 1, 2, 5].includes(step) && !done[step]) {
			toast.error(
				step === 2
					? "Add an introduction of at least 80 characters and your languages."
					: "Complete the required fields before continuing.",
			)
			return
		}
		if (await save()) setStep((s) => Math.min(s + 1, 6))
	}
	async function upload(file?: File) {
		if (!file || !user) return
		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
			toast.error("Choose a JPG, PNG or WebP image under 2 MB.")
			return
		}
		setUploading(true)
		try {
			const response = await UsersService.uploadAvatar({ body: { file } })
			if (response.data.status !== "Ok") throw new Error("Upload failed")
			const version = markAccountAvatarUpdated(user.id)
			const photo = accountAvatarUrl(user.id, version)
			update("photo", photo)
			setSavedProfile((previous) => ({ ...previous, photo }))
		} catch {
			toast.error("This image couldn’t be uploaded. Try again.")
		} finally {
			setUploading(false)
		}
	}
	const input = (
		label: string,
		name: "name" | "title" | "location" | "languages" | "rate",
		placeholder: string,
		type = "text",
	) => (
		<label className="block font-medium text-sm">
			{label}
			<input
				className={fieldClass}
				value={profile[name]}
				onChange={(e) => update(name, e.target.value)}
				placeholder={placeholder}
				type={type}
				min={type === "number" ? "1" : undefined}
				maxLength={120}
			/>
		</label>
	)
	const select = (label: string, name: "category" | "hours", options: string[]) => (
		<div className="block font-medium text-sm">
			<label htmlFor={`profile-${name}`}>{label}</label>
			<Select value={profile[name]} onValueChange={(value) => update(name, value)}>
				<SelectTrigger
					id={`profile-${name}`}
					className="mt-2 h-11 w-full rounded-lg border-outline-variant bg-surface-container-lowest px-3 font-normal text-sm shadow-none hover:border-foreground/20 dark:bg-surface-container-lowest dark:hover:bg-surface-container-lowest"
				>
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent align="start">
					{options.map((option) => (
						<SelectItem key={option} value={option}>
							{option}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)

	return (
		<fieldset disabled={uploading} className="mx-auto w-full min-w-0 max-w-360 space-y-7 px-4 md:px-6">
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title={view === "preview" ? "Profile preview" : view === "edit" ? "Edit profile" : "Your profile"}
				description={
					view === "home"
						? "Complete your profile so clients can find you and get in touch."
						: view === "preview"
							? "This is how clients see your profile."
							: "Fill in one section at a time. Your progress is saved when you continue."
				}
				meta={
					<span className="font-medium text-primary">
						{profile.finished ? "Published" : "Draft"} · {percent}% complete
					</span>
				}
				action={
					<div className="flex flex-wrap items-center gap-2.5">
						{view !== "home" && (
							<button
								className={secondary}
								onClick={() => {
									// Go back right away and save in the background; failures show a toast and the edits stay in memory.
									setView("home")
									void save()
								}}
								type="button"
							>
								<ArrowLeft className="size-4" /> Overview
							</button>
						)}
						{view !== "preview" && (
							<button className={secondary} onClick={() => setView("preview")} type="button">
								<Eye className="size-4" /> Preview
							</button>
						)}
						<button
							type="button"
							className={primary}
							onClick={async () => {
								if (await save()) toast.success("Profile saved")
							}}
						>
							Save changes
						</button>
					</div>
				}
			/>
			{view === "home" ? (
				<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
					<div className="space-y-6 lg:col-span-8">
						<section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
							<div className="flex items-center justify-between border-outline-variant border-b px-5 py-3.5">
								<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Profile sections</h2>
								<span className="text-on-surface-variant text-sm tabular-nums">
									{done.filter(Boolean).length} of 6 done
								</span>
							</div>
							<ul className="divide-y divide-outline-variant">
								{steps.slice(0, 6).map((name, i) => (
									<li key={name}>
										<button
											type="button"
											className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-ring ${nextStep === i ? "bg-surface-container-low/60" : ""}`}
											onClick={() => edit(i)}
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
											<span className="hidden shrink-0 text-on-surface-variant text-xs sm:inline">
												{done[i] ? "" : required.includes(i) ? "Required" : "Optional"}
											</span>
											<ArrowRight className="size-4 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5" />
										</button>
									</li>
								))}
							</ul>
						</section>
					</div>
					<aside className="space-y-5 lg:sticky lg:top-20 lg:col-span-4">
						<section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
							<div className="flex items-center gap-3.5">
								<Avatar profile={profile} size="size-12 text-base" />
								<div className="min-w-0">
									<h2 className="truncate font-semibold text-on-surface">{profile.name || "Your name"}</h2>
									<p className="truncate text-on-surface-variant text-sm">
										{profile.title || "No title yet"}
									</p>
								</div>
							</div>
							<p className="mt-4 border-outline-variant border-t pt-4 text-on-surface-variant text-sm">
								{profile.finished
									? "Your profile is published. Clients can find you and send messages."
									: "Your profile is not published yet. Only you can see it."}
							</p>
							<button
								type="button"
								className={`${primary} mt-4 w-full`}
								onClick={() => edit(nextStep === -1 ? 6 : nextStep)}
							>
								{nextStep === -1 ? (profile.finished ? "Review profile" : "Publish profile") : "Continue setup"}
								<ArrowRight className="size-4" />
							</button>
						</section>
						<section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
							<div className="flex items-center justify-between gap-3">
								<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Client feedback</h2>
								{reviewCount > 0 && (
									<button
										type="button"
										onClick={() => setView("preview")}
										className="font-label-sm font-medium text-label-sm text-primary hover:underline"
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
					</aside>
				</div>
			) : view === "preview" ? (
				<>
					<ProfilePreview
						profile={profile}
						rating={serverProfile.average_rating ?? undefined}
						reviewsCount={serverProfile.reviews_count ?? 0}
						reviewsNode={
							serverProfile.id ? (
								<FreelancerReviewsSection
									freelancerId={serverProfile.id}
									profileUserId={serverProfile.user_id}
									freelancerName={profile.name}
									freelancerTitle={profile.title}
									freelancerAvatarUrl={profile.photo}
								/>
							) : undefined
						}
					/>
					<div className="mt-6 flex justify-end">
						<button className={primary} type="button" onClick={() => edit(0)}>
							Edit profile
						</button>
					</div>
				</>
			) : (
				<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
					<aside className="min-w-0 lg:sticky lg:top-20 lg:col-span-3">
						<nav aria-label="Profile setup steps" className="flex gap-2 overflow-x-auto pb-3 lg:block lg:space-y-1">
							{steps.map((name, i) => (
								<button
									key={name}
									type="button"
									aria-current={step === i ? "step" : undefined}
									onClick={() => edit(i)}
									className={`flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-sm lg:w-full ${step === i ? "bg-surface-container font-semibold text-on-surface" : "text-on-surface-variant hover:bg-surface-container-low"}`}
								>
									<span
										className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs ${done[i] ? "border-transparent bg-primary text-on-primary" : step === i ? "border-on-surface text-on-surface" : "border-outline-variant"}`}
									>
										{done[i] ? <Check className="size-3.5" /> : i + 1}
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
								Step {step + 1} of 7{step === 3 || step === 4 ? " · Optional" : ""}
							</p>
						</div>
						<div className="mt-6 space-y-5">
							{step === 0 && (
								<>
									<div className="flex items-center gap-4">
										<Avatar profile={profile} size="size-16 text-xl" />
										<div>
											<label className={`${secondary} cursor-pointer`}>
												<Upload className="size-4" /> Change photo
												<input
													aria-label="Upload profile photo"
													className="sr-only"
													type="file"
													accept="image/png,image/jpeg,image/webp"
													onChange={(e) => void upload(e.target.files?.[0])}
												/>
											</label>
											<p className="mt-1.5 text-on-surface-variant text-xs">Optional. JPG, PNG or WebP, up to 2 MB.</p>
										</div>
									</div>
									<div className="grid gap-5 sm:grid-cols-2">
										{input("Full name *", "name", "Your name")}
										<div className="block font-medium text-sm">
											<span id="profile-location-label">City *</span>
											<div className="mt-2">
												<CitySelect
													value={profile.location}
													emptyLabel="Select city"
													onValueChange={(city) => update("location", city)}
													className="h-11 w-full max-w-none gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-normal text-sm shadow-none hover:border-foreground/20 hover:text-foreground focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25"
												/>
											</div>
										</div>
									</div>
									{input("Professional title *", "title", "e.g. Product designer for early-stage teams")}
								</>
							)}
							{step === 1 && (
								<>
									<div className="block font-medium text-sm">
										<span id="profile-category-label">Main area of work *</span>
										<div className="mt-2">
											<CategorySelect
												value={profile.category}
												categories={categories}
												isLoading={categoriesLoading}
												placeholder="Select a category"
												onValueChange={(category) => update("category", category)}
												showAllCategories={false}
												align="start"
												className="!flex h-11 w-full min-w-0 max-w-none rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-normal text-sm hover:border-foreground/20 hover:text-foreground"
											/>
										</div>
									</div>
									<SkillsSelect
										inputId="skill-entry"
										label="Your skills *"
										value={profile.skills}
										onChange={(skills) => update("skills", skills)}
									/>
								</>
							)}
							{step === 2 && (
								<>
									<label className="block font-medium text-sm">
										About you *
										<textarea
											className={textareaClass}
											rows={7}
											maxLength={3000}
											value={profile.bio}
											onChange={(e) => update("bio", e.target.value)}
											placeholder="What you do, who you help, and the kind of projects you take on."
										/>
										<span className="mt-1.5 flex justify-between font-normal text-on-surface-variant text-xs">
											<span>
												{profile.bio.trim().length < 80
													? `${80 - profile.bio.trim().length} more characters needed`
													: "Looks good"}
											</span>
											<span className="tabular-nums">{profile.bio.length}/3000</span>
										</span>
									</label>
									<LanguagesField value={profile.languages} onChange={(languages) => update("languages", languages)} />
								</>
							)}
							{(step === 3 || step === 4) &&
								(step === 3 ? (["experience", "education"] as const) : (["portfolio"] as const)).map((kind) => (
									<section key={kind}>
										<div className="mb-3 flex items-center justify-between">
											<h3 className="font-medium text-on-surface text-sm">
												{kind === "experience"
													? "Work experience"
													: kind === "education"
														? "Education"
														: "Projects"}
											</h3>
											<button
												className={secondary}
												type="button"
												onClick={() =>
													setEditor({
														kind,
														entry: {
															id: crypto.randomUUID(),
															title: "",
															organization: "",
															detail: "",
															url: "",
														},
													})
												}
											>
												<Plus className="size-4" />
												Add
											</button>
										</div>
										{profile[kind].length ? (
											<ul className="divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant">
												{profile[kind].map((entry) => (
													<li key={entry.id} className="flex items-center gap-3 px-4 py-3">
														{kind === "portfolio" && entry.image_url && (
															<img src={entry.image_url} alt="" className="size-10 shrink-0 rounded-md object-cover" />
														)}
														<button
															type="button"
															className="min-w-0 flex-1 text-left hover:opacity-80"
															onClick={() => setEditor({ kind, entry })}
														>
															<span className="block truncate font-medium text-on-surface text-sm">
																{entry.title}
																{entry.organization && (
																	<span className="font-normal text-on-surface-variant"> · {entry.organization}</span>
																)}
															</span>
															{entry.detail && (
																<span className="mt-0.5 block truncate text-on-surface-variant text-xs">{entry.detail}</span>
															)}
														</button>
														<button
															type="button"
															className="grid size-9 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-destructive"
															aria-label={`Remove ${entry.title}`}
															onClick={() =>
																update(
																	kind,
																	profile[kind].filter((e) => e.id !== entry.id),
																)
															}
														>
															<Trash2 className="size-4" />
														</button>
													</li>
												))}
											</ul>
										) : (
											<p className="rounded-lg border border-outline-variant border-dashed px-4 py-6 text-center text-on-surface-variant text-sm">
												{kind === "portfolio"
													? "No projects yet. Add one with a short description and a link. Personal projects count too."
													: kind === "education"
														? "No education added."
														: "No work experience added."}
											</p>
										)}
									</section>
								))}
							{step === 5 && (
								<>
									<div>
										{input("Hourly rate (USD) *", "rate", "50", "number")}
										<p className="mt-1.5 text-on-surface-variant text-xs">
											Shown on your profile as a starting rate. You agree the final price with each client.
										</p>
									</div>
									{select("Weekly hours *", "hours", [
										"Less than 10 hours",
										"10–20 hours",
										"20–30 hours",
										"More than 30 hours",
									])}
								</>
							)}
							{step === 6 && (
								<>
									{[0, 1, 2, 5].every((i) => done[i]) ? (
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
										{steps.slice(0, 6).map((name, i) => {
											const missing = !done[i] && required.includes(i)
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
															{!required.includes(i) && <span className="font-normal text-on-surface-variant"> · Optional</span>}
														</p>
														<p className={`mt-0.5 break-words text-xs ${missing ? "text-destructive" : "text-on-surface-variant"}`}>
															{done[i] ? summaries[i] : missing ? "Required. Nothing added yet." : "Nothing added yet."}
														</p>
														{done[i] && i === 1 && profile.skills.length > 0 && (
															<p className="mt-1 line-clamp-2 break-words text-on-surface-variant text-xs">{profile.skills.join(", ")}</p>
														)}
														{done[i] && i === 2 && profile.languages && (
															<p className="mt-1 break-words text-on-surface-variant text-xs">{profile.languages}</p>
														)}
														{i === 4 && profile.portfolio.some((entry) => entry.image_url) && (
															<div className="mt-2 flex gap-2">
																{profile.portfolio
																	.filter((entry) => entry.image_url)
																	.slice(0, 4)
																	.map((entry) => (
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
														className="shrink-0 font-medium text-primary text-sm hover:underline"
														onClick={() => edit(i)}
													>
														{done[i] ? "Edit" : "Add"}
													</button>
												</li>
											)
										})}
									</ul>
									<button type="button" className={secondary} onClick={() => setView("preview")}>
										<Eye className="size-4" /> Preview as a client
									</button>
								</>
							)}
						</div>
						<footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-outline-variant border-t pt-6">
							<button
								type="button"
								className={secondary}
								onClick={async () => {
									if (step) edit(step - 1)
									else if (await save()) setView("home")
								}}
							>
								<ArrowLeft className="size-4" />
								{step ? "Back" : "Save & exit"}
							</button>
							{step < 6 ? (
								<button type="button" className={primary} onClick={() => void next()}>
									{(step === 3 || step === 4) && !done[step] ? "Skip for now" : "Continue"}
									<ArrowRight className="size-4" />
								</button>
							) : (
								<button
									type="button"
									className={primary}
									onClick={async () => {
										if ([0, 1, 2, 5].some((i) => !done[i])) {
											toast.error("Complete the required sections before finishing.")
											return
										}
										if (await save(true)) {
											toast.success(profile.finished ? "Profile saved" : "Profile published")
											setView("home")
										}
									}}
								>
									<CheckCircle2 className="size-4" />
									{profile.finished ? "Save published profile" : "Publish profile"}
								</button>
							)}
						</footer>
					</section>
				</div>
			)}
			{editor && (
				<EntryDialog
					kind={editor.kind}
					entry={editor.entry}
					close={() => setEditor(null)}
					save={async (entry, image, signal) => {
						let saved = entry
						if (image) {
							// The upload creates a portfolio row on the server (even if the request is cut off), so the next save must sync the whole list.
							portfolioTouched.current = true
							try {
								const { data } = await ProfilesService.uploadPortfolioItem({
									body: { title: entry.title, description: entry.detail.trim() || entry.title, file: image },
									signal,
								})
								saved = { ...entry, id: data.id, image_url: data.image_url }
								// The upload endpoint only stores title, description and image, so write the rest right away
								// instead of waiting for a later profile save (otherwise the link and context were lost).
								try {
									await ProfilesService.updatePortfolioItem({
										path: { item_id: data.id },
										body: {
											organization: entry.organization,
											detail: entry.detail,
											description: entry.detail.trim() || entry.title,
											url: entry.url,
										},
										signal,
									})
								} catch {
									if (!signal?.aborted) toast.error("The project was added, but its link and details may not have saved. Try saving again.")
								}
							} catch {
								// An aborted upload means the user cancelled or it timed out; the dialog explains that itself.
								if (!signal?.aborted) toast.error("This image couldn’t be uploaded. Try again.")
								return false
							}
						}
						const list = profile[editor.kind]
						update(
							editor.kind,
							list.some((e) => e.id === entry.id) ? list.map((e) => (e.id === entry.id ? saved : e)) : [...list, saved],
						)
						setEditor(null)
						return true
					}}
				/>
			)}
		</fieldset>
	)
}

export default function FreelancerProfilePage() {
	const { user, isPending: userPending } = useAuth()
	const query = useQuery({
		queryKey: ["freelancer-profile", user?.id],
		enabled: !!user,
		queryFn: async ({ signal }) => (await ProfilesService.readProfileMe({ signal })).data,
	})
	useErrorToast(
		query.isError ? "Your profile couldn’t be loaded. Please try again before editing." : undefined,
		"freelancer-profile-load",
		query.errorUpdatedAt,
		query.refetch,
	)
	if (userPending || (user && query.isPending)) return <p role="status">Loading your profile…</p>
	if (!user || !query.data)
		return (
			<div className="flex flex-col gap-4 p-6">
				<button
					type="button"
					className={secondary}
					onClick={() => void query.refetch()}
					disabled={!user || query.isFetching}
				>
					Try again
				</button>
			</div>
		)
	return <FreelancerProfileEditor key={user.id} initial={query.data} />
}
