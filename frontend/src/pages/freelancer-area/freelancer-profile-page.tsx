import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useBlocker } from "@tanstack/react-router"
import { ArrowLeft, Eye } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { type FreelancerProfileDetailPublic, ProfilesService, UsersService } from "@/client"
import { WorkspacePageHeader } from "@/components/dashboard/dashboard-header"
import { EntryDialog, ProfilePreview } from "@/components/freelancer/freelancer-profile-components"
import {
	type ProfileEntryForm,
	type ProfileForm,
	primary,
	secondary,
	steps,
} from "@/components/freelancer/freelancer-profile-model"
import { ProfileOverview } from "@/components/freelancer/profile-editor/profile-overview"
import {
	buildProfileUpdate,
	type EntryKind,
	profileFormFromApi,
	profileProgress,
	requiredSteps,
} from "@/components/freelancer/profile-editor/profile-form"
import { ProfileWizard } from "@/components/freelancer/profile-editor/profile-wizard"
import { FreelancerReviewsSection } from "@/components/reviews/freelancer-reviews-section"
import { accountAvatarUrl, markAccountAvatarUpdated } from "@/hooks/useAccountAvatar"
import useAuth from "@/hooks/useAuth"
import { useCategories } from "@/hooks/useCategories"
import { useErrorToast } from "@/hooks/useErrorToast"
import { queryKeys } from "@/lib/query-keys"

const lastStep = steps.length - 1

const FreelancerProfileEditor = ({ initial }: { initial: FreelancerProfileDetailPublic }) => {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const { data: categories = [], isPending: categoriesLoading } = useCategories()

	// The profile being edited, and a copy of what is saved on the server so we know what changed.
	const [serverProfile, setServerProfile] = useState(initial)
	const [profile, setProfile] = useState<ProfileForm>(() => profileFormFromApi(initial))
	const [savedProfile, setSavedProfile] = useState(profile)
	const [saving, setSaving] = useState(false)
	const [uploading, setUploading] = useState(false)
	const saveLock = useRef(false)
	const portfolioTouched = useRef(false)

	// Which screen is showing, which step is open, and which experience/education/project is being edited.
	const [view, setView] = useState<"home" | "edit" | "preview">("home")
	const [step, setStep] = useState(0)
	const [editor, setEditor] = useState<{ kind: EntryKind; entry: ProfileEntryForm } | null>(null)

	const progress = profileProgress(profile)

	// Warn before leaving the page with unsaved changes.
	const dirty = JSON.stringify(profile) !== JSON.stringify(savedProfile)
	useBlocker({
		shouldBlockFn: () =>
			saving || uploading || (dirty && !window.confirm("Leave without saving your profile changes?")),
		enableBeforeUnload: dirty || saving || uploading,
	})

	const update = <K extends keyof ProfileForm>(name: K, value: ProfileForm[K]) =>
		setProfile((current) => ({ ...current, [name]: value }))

	function edit(index: number) {
		setStep(index)
		setView("edit")
	}

	async function save(finished = profile.finished) {
		if (saveLock.current || uploading) return false
		if (profile.rate.trim() && (!Number.isFinite(Number(profile.rate)) || Number(profile.rate) < 0)) {
			toast.error("Enter a valid hourly rate before saving.")
			return false
		}
		saveLock.current = true
		setSaving(true)
		try {
			const body = buildProfileUpdate(profile, savedProfile, finished, portfolioTouched.current)
			const { data } = await ProfilesService.updateProfileMe({ body })
			setServerProfile(data)
			// Keep anything typed while the request was in flight instead of overwriting it with the saved copy.
			setProfile((current) => ({ ...current, finished }))
			setSavedProfile({ ...profile, finished })
			portfolioTouched.current = false
			queryClient.setQueryData(queryKeys.freelancerProfile(initial.user_id), data)
			void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser })
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

	async function next() {
		if (requiredSteps.includes(step) && !progress.done[step]) {
			toast.error(
				step === 2
					? "Add an introduction of at least 80 characters and your languages."
					: "Complete the required fields before continuing.",
			)
			return
		}
		if (await save()) setStep((current) => Math.min(current + 1, lastStep))
	}

	async function back() {
		if (step) edit(step - 1)
		else if (await save()) setView("home")
	}

	async function publish() {
		if (requiredSteps.some((index) => !progress.done[index])) {
			toast.error("Complete the required sections before finishing.")
			return
		}
		if (await save(true)) {
			toast.success(profile.finished ? "Profile saved" : "Profile published")
			setView("home")
		}
	}

	async function uploadPhoto(file?: File) {
		if (!file || !user) return
		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
			toast.error("Choose a JPG, PNG or WebP image under 2 MB.")
			return
		}
		setUploading(true)
		try {
			const response = await UsersService.uploadAvatar({ body: { file } })
			if (response.data.status !== "Ok") throw new Error("Upload failed")
			const photo = accountAvatarUrl(user.id, markAccountAvatarUpdated(user.id))
			update("photo", photo)
			setSavedProfile((previous) => ({ ...previous, photo }))
		} catch {
			toast.error("This image couldn’t be uploaded. Try again.")
		} finally {
			setUploading(false)
		}
	}

	// Called by the entry dialog. Returns false to keep the dialog open.
	async function saveEntry(entry: ProfileEntryForm, image?: File, signal?: AbortSignal) {
		if (!editor) return false
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
					if (!signal?.aborted) {
						toast.error("The project was added, but its link and details may not have saved. Try saving again.")
					}
				}
			} catch {
				// An aborted upload means the user cancelled or it timed out; the dialog explains that itself.
				if (!signal?.aborted) toast.error("This image couldn’t be uploaded. Try again.")
				return false
			}
		}
		const list = profile[editor.kind]
		const exists = list.some((item) => item.id === entry.id)
		update(editor.kind, exists ? list.map((item) => (item.id === entry.id ? saved : item)) : [...list, saved])
		setEditor(null)
		return true
	}

	const title = view === "preview" ? "Profile preview" : view === "edit" ? "Edit profile" : "Your profile"
	const description =
		view === "home"
			? "Complete your profile so clients can find you and get in touch."
			: view === "preview"
				? "This is how clients see your profile."
				: "Fill in one section at a time. Your progress is saved when you continue."

	return (
		<fieldset disabled={uploading} className="mx-auto w-full min-w-0 max-w-360 space-y-7 px-4 md:px-6">
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title={title}
				description={description}
				meta={
					<span className="font-medium text-link">
						{profile.finished ? "Published" : "Draft"} · {progress.percent}% complete
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

			{view === "home" && (
				<ProfileOverview
					profile={profile}
					progress={progress}
					rating={serverProfile.average_rating ?? 0}
					reviewCount={serverProfile.reviews_count ?? 0}
					onEdit={edit}
					onPreview={() => setView("preview")}
				/>
			)}

			{view === "preview" && (
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
			)}

			{view === "edit" && (
				<ProfileWizard
					profile={profile}
					update={update}
					progress={progress}
					step={step}
					categories={categories}
					categoriesLoading={categoriesLoading}
					onStepChange={edit}
					onPhotoChange={(file) => void uploadPhoto(file)}
					onEditEntry={(kind, entry) => setEditor({ kind, entry })}
					onPreview={() => setView("preview")}
					onBack={() => void back()}
					onNext={() => void next()}
					onPublish={() => void publish()}
				/>
			)}

			{editor && <EntryDialog kind={editor.kind} entry={editor.entry} close={() => setEditor(null)} save={saveEntry} />}
		</fieldset>
	)
}

export default function FreelancerProfilePage() {
	const { user, isPending: userPending } = useAuth()
	const query = useQuery({
		queryKey: queryKeys.freelancerProfile(user?.id),
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
