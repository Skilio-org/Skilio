import { useState } from "react"
import {
	type Entry,
	fieldClass,
	type Profile,
	primary,
	secondary,
} from "@/components/freelancer/freelancer-profile-model"
import { FreelancerProfileView } from "@/components/freelancer/freelancer-profile-view"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function Avatar({ profile }: { profile: Profile }) {
	const [failedPhoto, setFailedPhoto] = useState("")
	return profile.photo && failedPhoto !== profile.photo ? (
		<img
			className="size-20 shrink-0 rounded-full object-cover"
			src={profile.photo}
			onError={() => setFailedPhoto(profile.photo)}
			alt={profile.name || "Profile photo"}
		/>
	) : (
		<span className="grid size-20 shrink-0 place-items-center rounded-full bg-brand-100 font-medium text-2xl text-brand-800">
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
	profile: Profile
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

export function EntryDialog({
	kind,
	entry,
	close,
	save,
}: {
	kind: string
	entry: Entry
	close: () => void
	save: (e: Entry) => void
}) {
	const [value, setValue] = useState(entry)
	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open) close()
			}}
		>
			<DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{kind === "portfolio"
							? "Project details"
							: kind === "education"
								? "Education details"
								: "Experience details"}
					</DialogTitle>
					<DialogDescription>Add the details you want clients to see.</DialogDescription>
				</DialogHeader>
				<form
					className="space-y-5"
					onSubmit={(e) => {
						e.preventDefault()
						save({ ...value, title: value.title.trim() })
					}}
				>
					<label className="block font-medium text-sm">
						{kind === "portfolio" ? "Project title" : kind === "education" ? "Degree or qualification" : "Job title"} *
						<input
							required
							pattern=".*\S.*"
							maxLength={120}
							className={fieldClass}
							value={value.title}
							onChange={(e) => setValue({ ...value, title: e.target.value })}
						/>
					</label>
					<label className="block font-medium text-sm">
						{kind === "portfolio"
							? "Client or personal project"
							: kind === "education"
								? "School and dates"
								: "Company and dates"}
						<input
							className={fieldClass}
							maxLength={160}
							value={value.organization}
							onChange={(e) => setValue({ ...value, organization: e.target.value })}
						/>
					</label>
					<label className="block font-medium text-sm">
						{kind === "portfolio" ? "Your contribution and results" : "Description"}
						<textarea
							rows={4}
							maxLength={2000}
							className={fieldClass}
							value={value.detail}
							onChange={(e) => setValue({ ...value, detail: e.target.value })}
						/>
					</label>
					{kind === "portfolio" && (
						<label className="block font-medium text-sm">
							Project link
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
					<div className="flex justify-end gap-3">
						<button type="button" className={secondary} onClick={close}>
							Cancel
						</button>
						<button className={primary} type="submit">
							Save details
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
