import { Plus, Trash2 } from "lucide-react"
import { type ProfileEntryForm, type ProfileForm, secondary } from "@/components/freelancer/freelancer-profile-model"
import type { EntryKind, UpdateProfile } from "@/components/freelancer/profile-editor/profile-form"

const headings: Record<EntryKind, string> = {
	experience: "Work experience",
	education: "Education",
	portfolio: "Projects",
}

const emptyMessages: Record<EntryKind, string> = {
	experience: "No work experience added.",
	education: "No education added.",
	portfolio: "No projects yet. Add one with a short description and a link. Personal projects count too.",
}

const blankEntry = (): ProfileEntryForm => ({ id: crypto.randomUUID(), title: "", organization: "", detail: "", url: "" })

// Lists the entries of one or more kinds (work + education, or projects) with add, edit and remove.
export function EntriesStep({
	kinds,
	profile,
	update,
	onEdit,
}: {
	kinds: readonly EntryKind[]
	profile: ProfileForm
	update: UpdateProfile
	onEdit: (kind: EntryKind, entry: ProfileEntryForm) => void
}) {
	return (
		<>
			{kinds.map((kind) => (
		<section key={kind}>
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-medium text-on-surface text-sm">{headings[kind]}</h3>
				<button className={secondary} type="button" onClick={() => onEdit(kind, blankEntry())}>
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
								onClick={() => onEdit(kind, entry)}
							>
								<span className="block truncate font-medium text-on-surface text-sm">
									{entry.title}
									{entry.organization && <span className="font-normal text-on-surface-variant"> · {entry.organization}</span>}
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
					{emptyMessages[kind]}
				</p>
			)}
		</section>
			))}
		</>
	)
}
