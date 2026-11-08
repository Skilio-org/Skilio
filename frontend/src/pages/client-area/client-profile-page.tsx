import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Camera, CheckCircle2, Globe, ImageUp, MapPin, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { type ClientProfilePublic, ClientProfilesService, UsersService } from "@/client"
import { queryKeys } from "@/lib/query-keys"

import { Monogram, WorkspacePageHeader, WorkspaceSurface, workspaceStyles } from "@/components/dashboard/dashboard-header"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import CitySelect from "@/components/common/city-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { markAccountAvatarUpdated, useAccountAvatarUrl } from "@/hooks/useAccountAvatar"
import useAuth from "@/hooks/useAuth"
import { getInitials } from "@/lib/format"

const companySizeLabels: Record<string, string> = {
	solo: "Just me",
	"2-10": "2–10 people",
	"11-50": "11–50 people",
	"51-200": "51–200 people",
	"201-plus": "201+ people",
}

type FormField = "fullName" | "company" | "companyRole" | "website" | "location" | "companySize"

// Limits for the client profile form. The inputs stop typing at the limit; validate() checks everything again on save.
const limits = { name: 100, company: 100, role: 100, avatarBytes: 5 * 1024 * 1024 }

const isHttpsUrl = (value: string) => {
	try {
		return new URL(value).protocol === "https:"
	} catch {
		return false
	}
}

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

	const { data: profile, isLoading } = useQuery<ClientProfilePublic>({
		queryKey: queryKeys.clientProfile,
		queryFn: async () => {
			const res = await ClientProfilesService.profilesReadClientProfileMe()
			return res.data
		},
		enabled: !!user,
	})

	// The form shows the saved profile until the user edits a field; edits are kept apart so a refetch never overwrites them.
	const [edits, setEdits] = useState<Partial<Record<FormField, string>>>({})
	const field = (key: FormField, saved: string | null | undefined) => [
		edits[key] ?? saved ?? "",
		(value: string) => setEdits((current) => ({ ...current, [key]: value })),
	] as const
	const [fullName, setFullName] = field("fullName", profile?.full_name ?? user?.full_name)
	const [company, setCompany] = field("company", profile?.company)
	const [companyRole, setCompanyRole] = field("companyRole", profile?.company_role)
	const [website, setWebsite] = field("website", profile?.company_website)
	const [location, setLocation] = field("location", profile?.location)
	const [companySize, setCompanySize] = field("companySize", profile?.company_size)

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
		onSuccess: async () => {
			setSaved(true)
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: queryKeys.clientProfile }),
				queryClient.invalidateQueries({ queryKey: queryKeys.currentUser }),
			])
			setEdits({})
			toast.success("Client profile saved")
		},
		onError: () => {
			toast.error("Couldn’t save your profile. Please try again.")
		},
	})

	const displayName = fullName || profile?.full_name || user?.full_name || "Your name"
	const avatarUrl = useAccountAvatarUrl(user?.id)

	// Returns the first problem with the form, or null when it is fine to save.
	const validate = () => {
		if (!fullName.trim()) return "Enter your full name."
		if (fullName.trim().length > limits.name) return `Your name can be at most ${limits.name} characters.`
		if (company.trim().length > limits.company) return `Company can be at most ${limits.company} characters.`
		if (!companyRole.trim()) return "Enter your role."
		if (companyRole.trim().length > limits.role) return `Role can be at most ${limits.role} characters.`
		if (website.trim() && !isHttpsUrl(website.trim())) return "Enter a valid company website that starts with https://"
		if (!location.trim()) return "Select your location."
		if (!companySize) return "Select your company size."
		return null
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const problem = validate()
		if (problem) {
			toast.error(problem)
			return
		}
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
		<div className="mx-auto w-full max-w-360 space-y-7 px-4  md:px-6 ">
			<WorkspacePageHeader
				eyebrow="Client workspace"
				title="Client profile"
				description="Help independent professionals understand who you are and what working with you will feel like."
				meta={
					<span className="font-medium text-link">
						{[company, companyRole, website, location, companySize].filter((value) => value.trim()).length} of 5 details
						added
					</span>
				}
			/>
			<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
				<form
					onSubmit={handleSubmit}
					className="space-y-8 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 sm:p-8 lg:col-span-8"
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
								label="Full name *"
								id="full-name"
								required
								maxLength={limits.name}
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
								maxLength={limits.company}
								value={company}
								onChange={(e) => {
									setCompany(e.target.value)
									setSaved(false)
								}}
								placeholder="Company or studio"
							/>
							<Field
								label="Role *"
								id="role"
								required
								maxLength={limits.role}
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
								pattern="https://.+"
								title="Enter a link that starts with https://"
								value={website}
								onChange={(e) => {
									setWebsite(e.target.value)
									setSaved(false)
								}}
								placeholder="https://company.com"
							/>
							<div className="space-y-2">
								<Label id="location-label">Location *</Label>
								<CitySelect
									value={location}
									emptyLabel="Select city"
									onValueChange={(city) => {
										setLocation(city)
										setSaved(false)
									}}
									className="h-11 w-full max-w-none gap-2 rounded-lg border border-input bg-surface-container-lowest px-4 text-sm shadow-xs hover:border-foreground/20 hover:text-foreground focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25"
								/>
							</div>
							<div className="space-y-2">
								<Label id="company-size-label">Company size *</Label>
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
						<button type="reset" onClick={handleCancel} className={workspaceStyles.secondaryAction}>
							Cancel
						</button>
						<button
							type="submit"
							disabled={updateMutation.isPending || isLoading}
							className={`${workspaceStyles.primaryAction} disabled:opacity-50`}
						>
							{updateMutation.isPending ? "Saving…" : "Save profile"}
						</button>
					</div>
				</form>
				<aside className="space-y-5 lg:sticky lg:top-20 lg:col-span-4">
					<WorkspaceSurface className="p-5">
						<p className="font-medium text-caption text-on-surface-variant">Your introduction</p>
						<div className="mt-4 flex items-center gap-3.5">
							<Monogram className="relative size-14 shrink-0 bg-brand-100 text-lg text-brand-800">
								{avatarUrl && !avatarFailed ? (
									<img
										src={avatarUrl}
										alt=""
										className="absolute inset-0 size-full rounded-lg object-cover"
										onError={() => setAvatarFailed(true)}
									/>
								) : (
									getInitials(displayName)
								)}
							</Monogram>
							<div className="min-w-0">
								<h2 className="break-words font-semibold text-headline-sm">{displayName}</h2>
								<p className="mt-0.5 break-words text-body-sm text-on-surface-variant">
									{[companyRole, company].filter(Boolean).join(" · ") || "Add your role and company"}
								</p>
							</div>
						</div>
						{(location || website || companySize) && (
							<dl className="mt-4 space-y-2 text-body-sm text-on-surface-variant">
								{location && (
									<div className="flex items-center gap-2">
										<MapPin className="size-4 shrink-0 text-outline" />
										<dd className="break-words">{location}</dd>
									</div>
								)}
								{website && (
									<div className="flex items-center gap-2">
										<Globe className="size-4 shrink-0 text-outline" />
										<dd className="break-all">{website}</dd>
									</div>
								)}
								{companySize && (
									<div className="flex items-center gap-2">
										<Users className="size-4 shrink-0 text-outline" />
										<dd>{companySizeLabels[companySize] ?? companySize}</dd>
									</div>
								)}
							</dl>
						)}
						<p className="mt-5 border-t border-outline-variant pt-4 text-caption text-on-surface-variant">
							A quick preview of the details you’re editing. Save your profile to apply your changes.
						</p>
					</WorkspaceSurface>
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
						<p className="mt-1 text-on-surface-variant text-xs leading-5">JPG or PNG, up to 5 MB, at least 400px square.</p>
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
									if (file && file.size > limits.avatarBytes) {
										toast.error("Choose an image under 5 MB.")
										event.target.value = ""
										setSelectedPhoto(null)
										setSelectedPhotoName("")
										return
									}
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
						<button
							type="button"
							className={workspaceStyles.secondaryAction}
							onClick={() => {
								setSelectedPhotoName("")
								setSelectedPhoto(null)
								setPhotoDialogOpen(false)
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							className={`${workspaceStyles.primaryAction} disabled:opacity-50`}
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
										queryKey: queryKeys.currentUser,
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
						</button>
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
				className="h-11 rounded-lg border-input bg-surface-container-lowest shadow-none dark:bg-surface-container-lowest"
				{...props}
			/>
		</div>
	)
}
