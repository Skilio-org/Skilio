import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, Plus, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useBlocker } from "@tanstack/react-router"
import { toast } from "sonner"
import { profileFromApi, profileToApi } from "@/components/freelancer/freelancer-profile-api"
import { SkillsSelect } from "@/components/common/skills-select"
import { ProfilesService, UsersService, type FreelancerProfileDetailPublic } from "@/client"
import { Avatar, EntryDialog, ProfilePreview } from "@/components/freelancer/freelancer-profile-components"
import {
	completion,
	descriptions,
	type Entry,
	fieldClass,
	type Profile,
	primary,
	secondary,
	steps,
} from "@/components/freelancer/freelancer-profile-model"
import { accountAvatarUrl, markAccountAvatarUpdated } from "@/hooks/useAccountAvatar"
import useAuth from "@/hooks/useAuth"
import { useErrorToast } from "@/hooks/useErrorToast"

const FreelancerProfileEditor = ({ initial }: { initial: FreelancerProfileDetailPublic }) => {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const [serverProfile, setServerProfile] = useState(initial)
	const [profile, setProfile] = useState<Profile>(() => ({
		...profileFromApi(initial),
		photo: accountAvatarUrl(initial.user_id),
	}))
	const [savedProfile, setSavedProfile] = useState(profile)
	const [saving, setSaving] = useState(false)
	const saveLock = useRef(false)
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
		entry: Entry
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
			const { data } = await ProfilesService.updateProfileMe({
				body: profileToApi({ ...profile, finished }, serverProfile),
			})
			const saved = { ...profileFromApi(data), photo: profile.photo }
			setServerProfile(data)
			setProfile(saved)
			setSavedProfile(saved)
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
	const update = <K extends keyof Profile>(name: K, value: Profile[K]) => setProfile((p) => ({ ...p, [name]: value }))
	const done = completion(profile)
	const percent = Math.round((done.filter(Boolean).length / done.length) * 100)
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
	const select = (label: string, name: "category" | "availability" | "hours", options: string[]) => (
		<label className="block font-medium text-sm">
			{label}
			<select className={fieldClass} value={profile[name]} onChange={(e) => update(name, e.target.value)}>
				<option value="">Select an option</option>
				{options.map((option) => (
					<option key={option}>{option}</option>
				))}
			</select>
		</label>
	)

	return (
		<fieldset disabled={saving || uploading} className="mx-auto min-w-0 max-w-6xl">
			<header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-border border-b pb-6">
				<div>
					<p className="mb-2 text-muted-foreground text-sm">Freelancer workspace</p>
					<h1 className="font-display font-medium text-3xl tracking-tight">
						{view === "home"
							? "Your next chapter starts here."
							: view === "preview"
								? "Profile preview"
								: "Let’s build your profile."}
					</h1>
					<p className="mt-2 text-muted-foreground text-sm">
						{view === "home"
							? "A little about you. A lot of possibility."
							: "Make it easy for the right clients to find you."}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<span role="status" className="text-muted-foreground text-sm">
						{saving ? "Saving…" : uploading ? "Uploading…" : dirty ? "Unsaved changes" : "Saved to your account"}
					</span>
					<button type="button" className={primary} onClick={() => void save()}>
						Save changes
					</button>
					{view !== "home" && (
						<button
							className={secondary}
							onClick={async () => {
								if (await save()) setView("home")
							}}
							type="button"
						>
							<ArrowLeft className="size-4" /> Workspace
						</button>
					)}
					{view !== "preview" && (
						<button className={secondary} onClick={() => setView("preview")} type="button">
							<Eye className="size-4" /> Preview
						</button>
					)}
				</div>
			</header>
			{view === "home" ? (
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
					<div className="space-y-6">
						<section className="rounded-xl border border-border bg-card p-6 sm:p-8">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<span className="font-medium text-sm">
									{profile.finished ? "Profile published" : "Make a strong first impression"}
								</span>
								<span className="text-muted-foreground text-sm">{done.filter(Boolean).length} of 6 sections</span>
							</div>
							<div
								className="my-5 h-2 overflow-hidden rounded-full bg-muted"
								role="progressbar"
								aria-label="Profile completion"
								aria-valuenow={percent}
								aria-valuemin={0}
								aria-valuemax={100}
							>
								<div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
							</div>
							<h2 className="font-semibold text-2xl tracking-tight">Your profile is {percent}% complete</h2>
							<p className="mt-2 max-w-lg text-muted-foreground text-sm leading-6">
								Introduce yourself, choose your skills, and show a little of what you can do. You can come back and edit
								anything.
							</p>
							<button
								type="button"
								className={`${primary} mt-6`}
								onClick={() =>
									edit(
										Math.max(
											0,
											done.findIndex((v) => !v),
										),
									)
								}
							>
								{percent ? "Continue your profile" : "Get started"}
								<ArrowRight className="size-4" />
							</button>
						</section>
						<section>
							<h2 className="mb-4 font-semibold text-lg">Your profile checklist</h2>
							<div className="divide-y divide-border rounded-xl border border-border bg-card">
								{steps.slice(0, 6).map((name, i) => (
									<button
										key={name}
										type="button"
										className="flex w-full items-center gap-4 p-5 text-left hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
										onClick={() => edit(i)}
									>
										<span
											className={`grid size-9 shrink-0 place-items-center rounded-full ${done[i] ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}
										>
											{done[i] ? <Check className="size-4" /> : i + 1}
										</span>
										<span className="flex-1">
											<span className="block font-semibold text-sm">{name}</span>
											<span className="mt-1 block text-muted-foreground text-xs">{descriptions[i]}</span>
										</span>
										<ArrowRight className="size-4 text-muted-foreground" />
									</button>
								))}
							</div>
						</section>
					</div>
					<aside className="space-y-5">
						<section className="rounded-xl border border-border bg-card p-6">
							<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Profile status</p>
							<h2 className="mt-3 font-semibold text-lg">{profile.finished ? "Published" : "Private draft"}</h2>
							<p className="mt-2 text-muted-foreground text-sm leading-6">
								{profile.finished
									? "Clients can find your profile and start a conversation with you."
									: "Save your draft, then publish it when you’re ready for clients to find you."}
							</p>
							<p className="mt-4 border-border border-t pt-4 text-muted-foreground text-xs leading-5">
								Saved details are stored in your account and available when you sign in on another device.
							</p>
						</section>
						<section className="p-2">
							<h2 className="font-semibold">A profile that sounds like you</h2>
							<p className="mt-3 text-muted-foreground text-sm leading-6">
								Be specific about the problems you solve. A clear introduction and one thoughtful project tell clients
								more than a long list of buzzwords.
							</p>
						</section>
					</aside>
				</div>
			) : view === "preview" ? (
				<>
					<ProfilePreview profile={profile} />
					<div className="mt-6 flex justify-end">
						<button className={primary} type="button" onClick={() => edit(0)}>
							Edit profile
						</button>
					</div>
				</>
			) : (
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
					<aside className="min-w-0">
						<nav aria-label="Profile setup steps" className="flex gap-2 overflow-x-auto pb-3 lg:block lg:space-y-1">
							{steps.map((name, i) => (
								<button
									key={name}
									type="button"
									aria-current={step === i ? "step" : undefined}
									onClick={() => edit(i)}
									className={`flex min-h-12 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-sm lg:w-full ${step === i ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted"}`}
								>
									<span
										className={`grid size-6 place-items-center rounded-full border ${step === i ? "border-primary" : "border-border"}`}
									>
										{done[i] ? <Check className="size-3.5" /> : i + 1}
									</span>
									{name}
								</button>
							))}
						</nav>
						<p className="mt-6 hidden text-muted-foreground text-xs leading-5 lg:block">
							Save changes or continue to save your progress.
							<br />
							You can finish this later.
						</p>
					</aside>
					<section className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-8">
						<p className="font-medium text-muted-foreground text-xs">
							STEP {step + 1} OF 7{step === 3 || step === 4 ? " · OPTIONAL" : ""}
						</p>
						<h2 tabIndex={-1} className="mt-3 font-semibold text-2xl tracking-tight">
							{steps[step]}
						</h2>
						<p className="mt-2 text-muted-foreground text-sm leading-6">{descriptions[step]}</p>
						<div className="mt-8 space-y-6">
							{step === 0 && (
								<>
									<div className="flex items-center gap-5">
										<Avatar profile={profile} />
										<div>
											<label className={`${secondary} cursor-pointer`}>
												<Upload className="size-4" /> Add photo
												<input
													aria-label="Upload profile photo"
													className="sr-only"
													type="file"
													accept="image/png,image/jpeg,image/webp"
													onChange={(e) => void upload(e.target.files?.[0])}
												/>
											</label>
											<p className="mt-2 text-muted-foreground text-xs">Optional · JPG, PNG or WebP, up to 2 MB</p>
										</div>
									</div>
									{input("Full name *", "name", "Your name")}
									{input("Professional title *", "title", "e.g. Product designer for early-stage teams")}
									{input("City and country *", "location", "e.g. Casablanca, Morocco")}
								</>
							)}
							{step === 1 && (
								<>
									{select("Main area of work *", "category", [
										"Design & creative",
										"Development & IT",
										"Sales & marketing",
										"Writing & translation",
										"Video & audio",
										"Business & consulting",
										"AI & automation",
									])}
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
											className={fieldClass}
											rows={8}
											maxLength={3000}
											value={profile.bio}
											onChange={(e) => update("bio", e.target.value)}
											placeholder="What do you do, who do you help, and what makes your approach different?"
										/>
										<span className="mt-2 flex justify-between font-normal text-muted-foreground text-xs">
											<span>At least 80 characters. Write in your own voice.</span>
											<span>{profile.bio.length}/3000</span>
										</span>
									</label>
									{input("Languages and proficiency *", "languages", "e.g. English — fluent, Arabic — native")}
								</>
							)}
							{(step === 3 || step === 4) &&
								(step === 3 ? (["experience", "education"] as const) : (["portfolio"] as const)).map((kind) => (
									<section key={kind}>
										<div className="mb-4 flex items-center justify-between">
											<h3 className="font-semibold">
												{kind === "experience"
													? "Work experience"
													: kind === "education"
														? "Education"
														: "Selected projects"}
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
											<div className="space-y-3">
												{profile[kind].map((entry) => (
													<div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
														<button
															type="button"
															className="min-w-0 flex-1 text-left"
															onClick={() => setEditor({ kind, entry })}
														>
															<span className="block font-medium">{entry.title}</span>
															<span className="mt-1 block text-muted-foreground text-sm">{entry.organization}</span>
															<span className="mt-2 block truncate text-muted-foreground text-xs">{entry.detail}</span>
															<span className="mt-3 block text-primary text-xs">Edit details</span>
														</button>
														<button
															type="button"
															className="grid size-11 place-items-center rounded-lg hover:bg-muted"
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
													</div>
												))}
											</div>
										) : (
											<div className="rounded-lg border border-border border-dashed p-8 text-center">
												<p className="font-medium text-sm">
													{kind === "portfolio" ? "Give your work a place to shine" : `No ${kind} added yet`}
												</p>
												<p className="mt-2 text-muted-foreground text-sm leading-6">
													{kind === "portfolio"
														? "Add a project, describe your contribution, and link to the finished work. Personal projects count, too."
														: "Add relevant details, or skip this for now."}
												</p>
											</div>
										)}
									</section>
								))}
							{step === 5 && (
								<>
									{input("Hourly rate (USD) *", "rate", "50", "number")}
									<p className="text-muted-foreground text-sm">
										This is the starting rate shown on your profile. Agree on the final scope and price with each
										client.
									</p>
									{select("Weekly hours *", "hours", [
										"Less than 10 hours",
										"10–20 hours",
										"20–30 hours",
										"More than 30 hours",
									])}
									{select("Availability *", "availability", [
										"Available now",
										"Available this week",
										"Available next month",
										"Not currently available",
									])}
									<div className="rounded-lg bg-muted/60 p-4 text-muted-foreground text-sm leading-6">
										You can change your rate and availability at any time.
									</div>
								</>
							)}
							{step === 6 && (
								<>
									<ProfilePreview profile={profile} compact />
									<div className="rounded-lg bg-muted p-4 text-muted-foreground text-sm leading-6">
										Publishing makes your profile visible to clients so they can contact you.
									</div>
									{[0, 1, 2, 5]
										.filter((i) => !done[i])
										.map((i) => (
											<button
												key={i}
												className="block text-destructive text-sm underline"
												type="button"
												onClick={() => edit(i)}
											>
												Complete {steps[i].toLowerCase()}
											</button>
										))}
								</>
							)}
						</div>
						<footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-border border-t pt-6">
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
										if (await save(true)) setView("home")
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
					save={(entry) => {
						const list = profile[editor.kind]
						update(
							editor.kind,
							list.some((e) => e.id === entry.id) ? list.map((e) => (e.id === entry.id ? entry : e)) : [...list, entry],
						)
						setEditor(null)
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
