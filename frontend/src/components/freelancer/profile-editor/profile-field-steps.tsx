import { Camera } from "lucide-react"
import { useRef } from "react"
import CategorySelect from "@/components/common/category-select"
import CitySelect from "@/components/common/city-select"
import { SkillsSelect } from "@/components/common/skills-select"
import { Avatar } from "@/components/freelancer/freelancer-profile-components"
import { type ProfileForm, profileLimits, textareaClass } from "@/components/freelancer/freelancer-profile-model"
import { LanguagesField } from "@/components/freelancer/languages-field"
import { ProfileSelectField, ProfileTextField } from "@/components/freelancer/profile-editor/profile-fields"
import type { UpdateProfile } from "@/components/freelancer/profile-editor/profile-form"
import { formatMoney } from "@/lib/currency"

type StepProps = { profile: ProfileForm; update: UpdateProfile }

const weeklyHours = ["Less than 10 hours", "10–20 hours", "20–30 hours", "More than 30 hours"]

export function BasicsStep({
	profile,
	update,
	uploading,
	uploadProgress,
	onPhotoChange,
}: StepProps & { uploading: boolean; uploadProgress: number; onPhotoChange: (file?: File) => void }) {
	const photoInput = useRef<HTMLInputElement>(null)

	return (
		<>
			<div className="flex items-center gap-4">
				<div className="relative">
					<Avatar profile={profile} size="size-16 text-xl" />
					{uploading && (
						<span className="absolute inset-0 grid place-items-center rounded-full bg-background/70" role="status">
							<span className="font-semibold text-foreground text-xs tabular-nums">{uploadProgress}%</span>
							<span className="sr-only">Uploading photo</span>
						</span>
					)}
					<input
						ref={photoInput}
						type="file"
						accept="image/png,image/jpeg,image/webp"
						className="sr-only"
						tabIndex={-1}
						onChange={(event) => {
							onPhotoChange(event.target.files?.[0])
							event.target.value = ""
						}}
					/>
					<button
						type="button"
						aria-label="Change profile photo"
						disabled={uploading}
						onClick={() => photoInput.current?.click()}
						className="absolute -right-1.5 -bottom-1.5 grid size-8 place-items-center rounded-full border-4 border-card bg-foreground text-background hover:bg-primary hover:text-on-primary disabled:opacity-60"
					>
						<Camera className="size-3.5" />
					</button>
				</div>
				<div>
					<p className="font-medium text-sm">Profile photo</p>
					<p className="mt-1 text-on-surface-variant text-xs">
						{uploading ? `Uploading your photo… ${uploadProgress}%` : "Optional. JPG, PNG or WebP, up to 5 MB."}
					</p>
				</div>
			</div>
			<div className="grid gap-5 sm:grid-cols-2">
				<ProfileTextField
					label="Full name *"
					value={profile.name}
					onChange={(value) => update("name", value)}
					placeholder="Your name"
					maxLength={profileLimits.name}
					showCount
				/>
				<div className="block font-medium text-sm">
					<span id="profile-location-label">City *</span>
					<div className="mt-2">
						<CitySelect
							value={profile.location}
							emptyLabel="Select city"
							onValueChange={(city) => update("location", city)}
							className="h-11 w-full max-w-none gap-2 rounded-lg border border-input bg-surface-container-lowest px-3 font-normal text-sm shadow-none hover:border-foreground/20 hover:text-foreground focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25"
						/>
					</div>
				</div>
			</div>
			<ProfileTextField
				label="Professional title *"
				value={profile.title}
				onChange={(value) => update("title", value)}
				placeholder="e.g. Product designer for early-stage teams"
				maxLength={profileLimits.title}
				showCount
			/>
		</>
	)
}

export function ExpertiseStep({
	profile,
	update,
	categories,
	categoriesLoading,
}: StepProps & { categories: string[]; categoriesLoading: boolean }) {
	return (
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
						className="!flex h-11 w-full min-w-0 max-w-none rounded-lg border border-input bg-surface-container-lowest px-3 font-normal text-sm hover:border-foreground/20 hover:text-foreground"
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
	)
}

export function IntroductionStep({ profile, update }: StepProps) {
	const bioLength = profile.bio.trim().length
	return (
		<>
			<label className="block font-medium text-sm">
				About you *
				<textarea
					className={textareaClass}
					rows={7}
					maxLength={profileLimits.bioMax}
					value={profile.bio}
					onChange={(e) => update("bio", e.target.value)}
					placeholder="What you do, who you help, and the kind of projects you take on."
				/>
				<span className="mt-1.5 flex justify-between font-normal text-on-surface-variant text-xs">
					<span>
						{bioLength < profileLimits.bioMin
							? `${profileLimits.bioMin - bioLength} more characters needed`
							: "Looks good"}
					</span>
					<span className="tabular-nums">
						{profile.bio.length}/{profileLimits.bioMax}
					</span>
				</span>
			</label>
			<LanguagesField value={profile.languages} onChange={(languages) => update("languages", languages)} />
		</>
	)
}

export function RatesStep({ profile, update }: StepProps) {
	return (
		<>
			<div>
				<ProfileTextField
					label="Hourly rate (DH) *"
					value={profile.rate}
					onChange={(value) => update("rate", value)}
					placeholder="50"
					type="number"
					min={profileLimits.rateMin}
					max={profileLimits.rateMax}
				/>
				<p className="mt-1.5 text-on-surface-variant text-xs">
					Between {formatMoney(profileLimits.rateMin)} and {formatMoney(profileLimits.rateMax)}. Shown on your profile
					as a starting rate. You agree the final price with each client.
				</p>
			</div>
			<ProfileSelectField
				id="profile-hours"
				label="Weekly hours *"
				value={profile.hours}
				options={weeklyHours}
				onChange={(value) => update("hours", value)}
			/>
		</>
	)
}
