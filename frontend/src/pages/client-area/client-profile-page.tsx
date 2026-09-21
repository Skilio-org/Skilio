import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Camera, CheckCircle2, ImageUp } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { type ClientProfilePublic, ClientProfilesService, UsersService } from "@/client"

import { Monogram, WorkspacePageHeader, WorkspaceSurface } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { markAccountAvatarUpdated, useAccountAvatarUrl } from "@/hooks/useAccountAvatar"
import useAuth from "@/hooks/useAuth"
import { getInitials } from "@/utils"

export function ClientProfilePage() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const [saved, setSaved] = useState(false)
	const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
	const [selectedPhotoName, setSelectedPhotoName] = useState("")
	const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
	const [photoUpdated, setPhotoUpdated] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [avatarFailed, setAvatarFailed] = useState(false)

	const [fullName, setFullName] = useState("")
	const [company, setCompany] = useState("")
	const [companyRole, setCompanyRole] = useState("")
	const [website, setWebsite] = useState("")
	const [location, setLocation] = useState("")
	const [companySize, setCompanySize] = useState("")

	const { data: profile, isLoading } = useQuery<ClientProfilePublic>({
		queryKey: ["clientProfile"],
		queryFn: async () => {
			const res = await ClientProfilesService.profilesReadClientProfileMe()
			return res.data
		},
		enabled: !!user,
	})

	useEffect(() => {
		if (profile) {
			setFullName(profile.full_name ?? user?.full_name ?? "")
			setCompany(profile.company ?? "")
			setCompanyRole(profile.company_role ?? "")
			setWebsite(profile.company_website ?? "")
			setLocation(profile.location ?? "")
			setCompanySize(profile.company_size ?? "")
		} else if (user) {
			setFullName(user.full_name ?? "")
		}
	}, [profile, user])

	const updateMutation = useMutation({
		mutationFn: async () => {
			const res = await ClientProfilesService.profilesUpdateClientProfileMe({
				body: {
					full_name: fullName.trim() || null,
					company: company.trim() || null,
					company_role: companyRole.trim() || null,
					company_website: website.trim() || null,
					location: location.trim() || null,
					company_size: companySize || null,
				},
			})
			return res.data
		},
		onSuccess: () => {
			setSaved(true)
			queryClient.invalidateQueries({ queryKey: ["clientProfile"] })
			queryClient.invalidateQueries({ queryKey: ["currentUser"] })
			toast.success("Client profile saved")
		},
		onError: () => {
			toast.error("Couldn’t save your profile. Please try again.")
		},
	})

	const displayName = fullName || profile?.full_name || user?.full_name || "Your name"
	const avatarUrl = useAccountAvatarUrl(user?.id)
	useEffect(() => setAvatarFailed(false), [])

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		updateMutation.mutate()
	}

	const handleCancel = () => {
		if (profile) {
			setFullName(profile.full_name ?? user?.full_name ?? "")
			setCompany(profile.company ?? "")
			setCompanyRole(profile.company_role ?? "")
			setWebsite(profile.company_website ?? "")
			setLocation(profile.location ?? "")
			setCompanySize(profile.company_size ?? "")
		} else if (user) {
			setFullName(user.full_name ?? "")
			setCompany("")
			setCompanyRole("")
			setWebsite("")
			setLocation("")
			setCompanySize("")
		}
		setSaved(false)
	}

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Client workspace / Profile"
				title="Client profile"
				description="Help independent professionals understand who you are and what working with you will feel like."
				action=""
			/>

			<div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
				<form
					onSubmit={handleSubmit}
					className="space-y-8 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 sm:p-8"
				>
					<div className="flex flex-col gap-5 border-outline-variant border-b pb-8 sm:flex-row sm:items-center">
						<Monogram className="relative size-24 bg-brand-100 text-2xl text-brand-800">
							{avatarUrl && !avatarFailed ? (
								<img
									src={avatarUrl}
									alt={displayName}
									className="absolute inset-0 size-full rounded-lg object-cover"
									onError={() => setAvatarFailed(true)}
								/>
							) : (
								getInitials(displayName)
							)}
							<button
								type="button"
								aria-label="Change profile photo"
								onClick={() => setPhotoDialogOpen(true)}
								className="absolute -right-2 -bottom-2 grid size-10 place-items-center rounded-full border-4 border-card bg-foreground text-background hover:bg-brand-700 hover:text-white"
							>
								<Camera className="size-4" />
							</button>
						</Monogram>
						<div>
							<h2 className="font-display font-semibold text-xl">Profile photo</h2>
							<p className="mt-1 text-on-surface-variant text-sm leading-6">
								{photoUpdated
									? "Your new profile image is ready across the workspace."
									: "A clear photo or company logo makes your messages easier to recognize."}
							</p>
						</div>
					</div>

					<div>
						<h2 className="font-display font-semibold text-xl">About you</h2>
						<p className="mt-1 text-on-surface-variant text-sm">
							The essentials freelancers see when you start a conversation.
						</p>
						<div className="mt-6 grid gap-5 sm:grid-cols-2">
							<Field
								label="Full name"
								id="full-name"
								value={fullName}
								onChange={(e) => {
									setFullName(e.target.value)
									setSaved(false)
								}}
								placeholder="Your full name"
							/>
							<Field
								label="Company"
								id="company"
								value={company}
								onChange={(e) => {
									setCompany(e.target.value)
									setSaved(false)
								}}
								placeholder="Company or studio"
							/>
							<Field
								label="Role"
								id="role"
								value={companyRole}
								onChange={(e) => {
									setCompanyRole(e.target.value)
									setSaved(false)
								}}
								placeholder="e.g. Product lead"
							/>
							<Field
								label="Company website"
								id="website"
								type="url"
								value={website}
								onChange={(e) => {
									setWebsite(e.target.value)
									setSaved(false)
								}}
								placeholder="https://company.com"
							/>
							<Field
								label="Location"
								id="location"
								value={location}
								onChange={(e) => {
									setLocation(e.target.value)
									setSaved(false)
								}}
								placeholder="City, country"
							/>
							<div className="space-y-2">
								<Label id="company-size-label">Company size</Label>
								<Select
									value={companySize}
									onValueChange={(val) => {
										setCompanySize(val)
										setSaved(false)
									}}
								>
									<SelectTrigger aria-labelledby="company-size-label" className="h-10 w-full rounded-lg">
										<SelectValue placeholder="Select company size" />
									</SelectTrigger>
									<SelectContent align="start">
										<SelectItem value="solo">Just me</SelectItem>
										<SelectItem value="2-10">2–10 people</SelectItem>
										<SelectItem value="11-50">11–50 people</SelectItem>
										<SelectItem value="51-200">51–200 people</SelectItem>
										<SelectItem value="201-plus">201+ people</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<div className="flex flex-col-reverse gap-3 border-outline-variant border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
						{saved && (
							<span className="mr-auto inline-flex items-center gap-2 text-emerald-700 text-sm">
								<CheckCircle2 className="size-4" />
								Changes saved
							</span>
						)}
						<Button type="reset" onClick={handleCancel} variant="outline" className="min-h-9 rounded-lg px-5">
							Cancel
						</Button>
						<Button type="submit" disabled={updateMutation.isPending || isLoading} className="min-h-9 rounded-lg px-6">
							{updateMutation.isPending ? "Saving…" : "Save profile"}
						</Button>
					</div>
				</form>
				<aside className="space-y-5 lg:sticky lg:top-24">
					<WorkspaceSurface className="p-5">
						<p className="font-medium text-caption text-on-surface-variant">Your introduction</p>
						<h2 className="mt-3 break-words font-semibold text-headline-md">{displayName}</h2>
						<p className="mt-1 break-words text-body-sm text-on-surface-variant">
							{[companyRole, company].filter(Boolean).join(" · ") || "Add your role and company"}
						</p>
						{location && <p className="mt-3 break-words text-body-sm text-on-surface-variant">{location}</p>}
						{website && <p className="mt-2 break-all text-body-sm text-on-surface-variant">{website}</p>}
						<p className="mt-5 border-t border-outline-variant pt-4 text-caption text-on-surface-variant">
							A quick preview of the details you’re editing. Save your profile to apply your changes.
						</p>
					</WorkspaceSurface>
					<p className="px-1 text-body-sm text-on-surface-variant leading-6">
						A complete introduction helps freelancers understand your business before the first conversation.
					</p>
				</aside>
			</div>

			<Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update profile photo</DialogTitle>
						<DialogDescription>
							Choose the image clients and independent professionals see when they review your workspace.
						</DialogDescription>
					</DialogHeader>
					<div className="rounded-lg border border-brand-200 border-dashed bg-brand-50/45 p-7 text-center dark:border-brand-900 dark:bg-brand-950/25">
						<span className="mx-auto grid size-12 place-items-center rounded-lg bg-surface-container-lowest text-brand-700 shadow-sm">
							<ImageUp className="size-5" />
						</span>
						<p className="mt-3 font-semibold text-sm">Choose a clear headshot or company logo</p>
						<p className="mt-1 text-on-surface-variant text-xs leading-5">JPG or PNG, at least 400px square.</p>
						<label
							htmlFor="client-photo-upload"
							className="mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-5 font-semibold text-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
						>
							<Camera className="size-4" />
							Choose image
							<input
								id="client-photo-upload"
								type="file"
								accept="image/png,image/jpeg"
								onChange={(event) => {
									const file = event.target.files?.[0] ?? null
									setSelectedPhoto(file)
									setSelectedPhotoName(file?.name ?? "")
								}}
								className="sr-only"
							/>
						</label>
						{selectedPhotoName && (
							<p className="mt-3 font-medium text-emerald-700 text-xs">Selected: {selectedPhotoName}</p>
						)}
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setSelectedPhotoName("")
								setSelectedPhoto(null)
								setPhotoDialogOpen(false)
							}}
						>
							Cancel
						</Button>
						<Button
							type="button"
							disabled={!selectedPhoto || uploading}
							onClick={async () => {
								if (!selectedPhoto || uploading || !user) return
								setUploading(true)
								try {
									const response = await UsersService.uploadAvatar({
										body: { file: selectedPhoto },
									})
									if (response.data.status !== "Ok") throw new Error("Upload failed")
									markAccountAvatarUpdated(user.id)
									await queryClient.invalidateQueries({
										queryKey: ["currentUser"],
									})
									setPhotoUpdated(true)
									setPhotoDialogOpen(false)
									toast.success("Profile photo uploaded")
								} catch {
									toast.error("Couldn’t upload your photo. Please try again.")
								} finally {
									setUploading(false)
								}
							}}
						>
							{uploading ? "Uploading…" : "Apply photo"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

function Field({ label, id, ...props }: { label: string; id: string } & React.ComponentProps<typeof Input>) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				className="h-10 rounded-lg border-outline-variant bg-surface-container-lowest shadow-none"
				{...props}
			/>
		</div>
	)
}
