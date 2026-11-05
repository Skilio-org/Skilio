import { ImagePlus } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
	type ProfileEntryForm,
	fieldClass,
	type ProfileForm,
	primary,
	secondary,
	textareaClass,
} from "@/components/freelancer/freelancer-profile-model"
import { FreelancerProfileView } from "@/components/freelancer/freelancer-profile-view"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function Avatar({ profile, size = "size-20 text-2xl" }: { profile: ProfileForm; size?: string }) {
	const [failedPhoto, setFailedPhoto] = useState("")
	return profile.photo && failedPhoto !== profile.photo ? (
		<img
			className={`${size.split(" ")[0]} shrink-0 rounded-full object-cover`}
			src={profile.photo}
			onError={() => setFailedPhoto(profile.photo)}
			alt={profile.name || "Profile photo"}
		/>
	) : (
		<span className={`grid ${size} shrink-0 place-items-center rounded-full bg-brand-100 font-medium text-brand-800`}>
			{profile.name
				.trim()
				.split(/\s+/)
				.map((n) => n[0])
				.slice(0, 2)
				.join("") || "You"}
		</span>
	)
}

export function ProfilePreview({
	profile: p,
	compact = false,
	rating,
	reviewsCount,
	reviewsNode,
}: {
	profile: ProfileForm
	compact?: boolean
	rating?: number
	reviewsCount?: number
	reviewsNode?: React.ReactNode
}) {
	const name = p.name || "Your name"
	const bio = p.bio || "Your introduction will appear here."
	const languages = p.languages
		.split(",")
		.map((language) => language.trim())
		.filter(Boolean)
		.map((language) => {
			const [languageName, ...levelParts] = language.split(/\s+[—–-]\s+/)
			return { name: languageName, level: levelParts.join(" — ") || "" }
		})

	return (
		<div className={compact ? "-mx-1" : undefined} data-profile-preview>
			<FreelancerProfileView
				profile={{
					name,
					initials:
						name
							.trim()
							.split(/\s+/)
							.map((part) => part[0])
							.slice(0, 2)
							.join("") || "You",
					avatarUrl: p.photo || undefined,
					title: p.title || "Your professional title",
					location: p.location || "Add your location",
					summary: bio,
					about: [bio],
					skills: p.skills,
					rate: p.rate,
					availability: p.availability,
					weeklyCapacity: p.hours,
					rating,
					reviews: reviewsCount,
					portfolio: p.portfolio.map((entry) => ({
						id: entry.id,
						title: entry.title,
						category: entry.organization || "Portfolio project",
						detail: entry.detail,
						url: entry.url,
						imageUrl: entry.image_url || undefined,
					})),
					languages,
					education: p.education.map((entry) => ({
						id: entry.id,
						title: entry.title,
						organization: entry.organization,
						detail: entry.detail,
					})),
					experience: p.experience.map((entry) => ({
						id: entry.id,
						title: entry.title,
						organization: entry.organization,
						detail: entry.detail,
					})),
				}}
				contactTitle="Your availability"
				reviewsNode={reviewsNode}
				contactFooter={
					<p className="mt-4 text-center text-muted-foreground text-xs leading-5">
						Clients will see these details when your profile is published.
					</p>
				}
			/>
		</div>
	)
}

const imageTypes = ["image/jpeg", "image/png", "image/webp"]
const maxImageSize = 5 * 1024 * 1024
const uploadTimeoutMs = 60_000

const copy = {
	portfolio: {
		title: "Project",
		description: "Show clients what you built. A cover image helps the project stand out.",
		name: "Project title",
		namePlaceholder: "e.g. Booking app redesign",
		organization: "Client or context",
		organizationHint: "e.g. Personal project",
		detail: "What you did and the result",
		detailPlaceholder: "What was the problem, what did you do, and what changed because of it?",
	},
	education: {
		title: "Education",
		description: "Add the details you want clients to see.",
		name: "Degree or qualification",
		namePlaceholder: "e.g. BSc in Computer Science",
		organization: "School and dates",
		organizationHint: "e.g. University of Rabat, 2018–2021",
		detail: "Description",
		detailPlaceholder: "Your focus, honors, or anything else relevant to your work.",
	},
	experience: {
		title: "Work experience",
		description: "Add the details you want clients to see.",
		name: "Job title",
		namePlaceholder: "e.g. Frontend developer",
		organization: "Company and dates",
		organizationHint: "e.g. Acme, 2021–2024",
		detail: "Description",
		detailPlaceholder: "What you worked on and what you achieved there.",
	},
} as const

export function EntryDialog({
	kind,
	entry,
	close,
	save,
}: {
	kind: string
	entry: ProfileEntryForm
	close: () => void
	save: (e: ProfileEntryForm, image?: File, signal?: AbortSignal) => Promise<boolean>
}) {
	const text = copy[kind as keyof typeof copy] ?? copy.experience
	const isPortfolio = kind === "portfolio"
	const [value, setValue] = useState(entry)
	const [image, setImage] = useState<File | null>(null)
	const [busy, setBusy] = useState(false)
	const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image])
	useEffect(
		() => () => {
			if (preview) URL.revokeObjectURL(preview)
		},
		[preview],
	)
	const shownImage = preview ?? value.image_url ?? null
	const isNew = !entry.title
	const abortRef = useRef<AbortController | null>(null)

	// Cancelling mid-upload aborts the request so the dialog can never get stuck waiting on it.
	function cancel() {
		abortRef.current?.abort()
		close()
	}

	function pickImage(file?: File) {
		if (!file) return
		if (!imageTypes.includes(file.type) || file.size > maxImageSize) {
			toast.error("Choose a JPG, PNG or WebP image under 5 MB.")
			return
		}
		setImage(file)
	}

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open) cancel()
			}}
		>
			<DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{isNew ? `Add ${text.title.toLowerCase()}` : `Edit ${text.title.toLowerCase()}`}</DialogTitle>
					<DialogDescription>{text.description}</DialogDescription>
				</DialogHeader>
				<form
					className="space-y-5"
					onSubmit={async (e) => {
						e.preventDefault()
						if (busy) return
						setBusy(true)
						const controller = new AbortController()
						abortRef.current = controller
						let timedOut = false
						const timer = setTimeout(() => {
							timedOut = true
							controller.abort()
						}, uploadTimeoutMs)
						const saved = await save({ ...value, title: value.title.trim() }, image ?? undefined, controller.signal)
						clearTimeout(timer)
						abortRef.current = null
						if (!saved) {
							setBusy(false)
							if (timedOut) toast.error("The upload took too long. Try again, or use a smaller image.")
						}
					}}
				>
					<fieldset disabled={busy} className="m-0 min-w-0 space-y-5 border-0 p-0">
					{isPortfolio && (
						<div>
							<span className="block font-medium text-sm">
								Cover image <span className="font-normal text-on-surface-variant">(optional)</span>
							</span>
							{shownImage ? (
								<div className="mt-2 overflow-hidden rounded-lg border border-outline-variant">
									<img src={shownImage} alt="" className="aspect-video w-full object-cover" />
									<div className="flex items-center justify-between gap-3 border-outline-variant border-t bg-surface-container-low/50 px-3 py-2">
										<span className="truncate text-on-surface-variant text-xs">
											{image ? image.name : "Current image"}
										</span>
										<div className="flex shrink-0 gap-3 text-xs">
											<label className="cursor-pointer font-medium text-link hover:underline">
												Replace
												<input
													className="sr-only"
													type="file"
													accept={imageTypes.join(",")}
													aria-label="Replace cover image"
													onChange={(e) => pickImage(e.target.files?.[0])}
												/>
											</label>
											<button
												type="button"
												className="font-medium text-on-surface-variant hover:text-destructive"
												onClick={() => {
													setImage(null)
													setValue({ ...value, image_url: null })
												}}
											>
												Remove
											</button>
										</div>
									</div>
								</div>
							) : (
								<label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-outline-variant border-dashed bg-surface-container-low/40 px-4 py-8 text-center transition-colors hover:bg-surface-container-low">
									<ImagePlus className="size-5 text-on-surface-variant" />
									<span className="font-medium text-on-surface text-sm">Add a cover image</span>
									<span className="text-on-surface-variant text-xs">JPG, PNG or WebP, up to 5 MB</span>
									<input
										className="sr-only"
										type="file"
										accept={imageTypes.join(",")}
										aria-label="Upload cover image"
										onChange={(e) => pickImage(e.target.files?.[0])}
									/>
								</label>
							)}
						</div>
					)}
					<div className="grid gap-5 sm:grid-cols-2">
						<label className="block font-medium text-sm">
							{text.name} *
							<input
								required
								pattern=".*\S.*"
								maxLength={120}
								placeholder={text.namePlaceholder}
								className={fieldClass}
								value={value.title}
								onChange={(e) => setValue({ ...value, title: e.target.value })}
							/>
						</label>
						<label className="block font-medium text-sm">
							{text.organization}
							<input
								className={fieldClass}
								maxLength={160}
								placeholder={text.organizationHint}
								value={value.organization}
								onChange={(e) => setValue({ ...value, organization: e.target.value })}
							/>
						</label>
					</div>
					<label className="block font-medium text-sm">
						{text.detail}
						<textarea
							rows={4}
							maxLength={2000}
							placeholder={text.detailPlaceholder}
							className={textareaClass}
							value={value.detail}
							onChange={(e) => setValue({ ...value, detail: e.target.value })}
						/>
						<span className="mt-1.5 block text-right font-normal text-on-surface-variant text-xs tabular-nums">
							{value.detail.length}/2000
						</span>
					</label>
					{isPortfolio && (
						<label className="block font-medium text-sm">
							Project link <span className="font-normal text-on-surface-variant">(optional)</span>
							<input
								type="url"
								pattern="https?://.*"
								placeholder="https://"
								className={fieldClass}
								value={value.url}
								onChange={(e) => setValue({ ...value, url: e.target.value })}
							/>
						</label>
					)}
					</fieldset>
					<div className="flex justify-end gap-2.5 border-outline-variant border-t pt-5">
						<button type="button" className={secondary} onClick={cancel}>
							{busy ? "Cancel upload" : "Cancel"}
						</button>
						<button className={primary} type="submit" disabled={busy}>
							{busy ? (image ? "Uploading…" : "Saving…") : "Save"}
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
