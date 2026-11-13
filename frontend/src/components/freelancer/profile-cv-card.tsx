import { Download, FileText, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ProfilesService } from "@/client"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"

// Shown on a freelancer's public profile when they have uploaded a CV. Clients can download it.
export function ProfileCvCard({ userId, name }: { userId: string; name: string }) {
	const [downloading, setDownloading] = useState(false)

	// The CV is private to logged-in users, so it is fetched with the login token and saved from the browser.
	async function download() {
		setDownloading(true)
		try {
			const response = await ProfilesService.proxyResume({ path: { uuid: userId }, responseType: "blob" })
			const blob = response.data as Blob
			const link = document.createElement("a")
			link.href = URL.createObjectURL(blob)
			link.download = `${name} - CV.${blob.type === "application/pdf" ? "pdf" : "docx"}`
			link.click()
			URL.revokeObjectURL(link.href)
		} catch {
			toast.error("Couldn’t download the CV. Please try again.")
		} finally {
			setDownloading(false)
		}
	}

	return (
		<section className="mt-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
			<div className="flex items-center gap-3">
				<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-container text-on-surface-variant">
					<FileText className="size-5" />
				</span>
				<div className="min-w-0">
					<p className="font-medium text-sm">Curriculum vitae</p>
					<p className="text-on-surface-variant text-xs">PDF or Word document</p>
				</div>
			</div>
			<button
				type="button"
				onClick={() => void download()}
				disabled={downloading}
				className={`${workspaceStyles.secondaryAction} mt-4 w-full disabled:opacity-60`}
			>
				{downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
				{downloading ? "Downloading…" : "Download CV"}
			</button>
		</section>
	)
}
