import { FileText, Trash2, Upload } from "lucide-react"
import { useRef } from "react"
import { secondary } from "@/components/freelancer/freelancer-profile-model"

// The "CV" box on the profile: upload a PDF or DOCX, replace it, or remove it.
export function ProfileCvUpload({
	hasCv,
	uploading,
	progress,
	onPick,
	onRemove,
}: {
	hasCv: boolean
	uploading: boolean
	progress: number
	onPick: (file?: File) => void
	onRemove: () => void
}) {
	const input = useRef<HTMLInputElement>(null)

	return (
		<section>
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-medium text-on-surface text-sm">
					CV <span className="font-normal text-on-surface-variant">(optional)</span>
				</h3>
				<button type="button" className={secondary} disabled={uploading} onClick={() => input.current?.click()}>
					<Upload className="size-4" />
					{hasCv ? "Replace" : "Upload"}
				</button>
				<input
					ref={input}
					type="file"
					accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
					className="sr-only"
					tabIndex={-1}
					aria-label="Upload CV"
					onChange={(event) => {
						onPick(event.target.files?.[0])
						event.target.value = ""
					}}
				/>
			</div>

			{uploading ? (
				<div className="rounded-lg border border-outline-variant px-4 py-4" role="status">
					<div className="flex items-center justify-between text-sm">
						<span>Uploading your CV…</span>
						<span className="tabular-nums">{progress}%</span>
					</div>
					<div
						className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container"
						role="progressbar"
						aria-valuenow={progress}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
					</div>
				</div>
			) : hasCv ? (
				<div className="flex items-center gap-3 rounded-lg border border-outline-variant px-4 py-3">
					<FileText className="size-5 shrink-0 text-on-surface-variant" />
					<span className="min-w-0 flex-1 truncate font-medium text-on-surface text-sm">Your CV is uploaded</span>
					<button
						type="button"
						className="grid size-9 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-destructive"
						aria-label="Remove CV"
						onClick={onRemove}
					>
						<Trash2 className="size-4" />
					</button>
				</div>
			) : (
				<p className="rounded-lg border border-outline-variant border-dashed px-4 py-6 text-center text-on-surface-variant text-sm">
					No CV added. PDF or DOCX, up to 5 MB.
				</p>
			)}
		</section>
	)
}
