import { Bell, Eye, KeyRound, Palette, Trash2, UserRound } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChangePassword from "@/components/user-settings/change-password"
import DeleteAccount from "@/components/user-settings/delete-account"
import { AppearanceSettings, NotificationSettings, PrivacySettings } from "@/components/user-settings/preferences"
import UserInformation from "@/components/user-settings/user-information"
import type { SettingsSection } from "@/lib/settings"

const settingsSections = [
	{
		value: "profile",
		title: "Account profile",
		description: "Identity and contact details",
		icon: UserRound,
		component: UserInformation,
	},
	{
		value: "password",
		title: "Login & security",
		description: "Password and protection",
		icon: KeyRound,
		component: ChangePassword,
	},
	{
		value: "notifications",
		title: "Notifications",
		description: "Alerts and email updates",
		icon: Bell,
		component: NotificationSettings,
	},
	{
		value: "privacy",
		title: "Privacy",
		description: "Personalization and data",
		icon: Eye,
		component: PrivacySettings,
	},
	{
		value: "appearance",
		title: "Appearance",
		description: "Theme and display",
		icon: Palette,
		component: AppearanceSettings,
	},
	{
		value: "danger-zone",
		title: "Account deletion",
		description: "Permanently close account",
		icon: Trash2,
		component: DeleteAccount,
		destructive: true,
	},
]

export function SettingsPage({
	section,
	onSectionChange,
}: {
	section: SettingsSection
	onSectionChange: (value: SettingsSection) => void
}) {
	return (
		<div className="space-y-7">
			<Tabs
				value={section}
				onValueChange={(value) => onSectionChange(value as SettingsSection)}
				orientation="vertical"
				className="gap-6 lg:grid lg:grid-cols-[270px_minmax(0,1fr)]"
			>
				<aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
					<div className="mb-3 hidden px-2 lg:block">
						<p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.16em]">Settings</p>
					</div>
					<TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-card lg:flex-col lg:overflow-visible">
						{settingsSections.map((section) => {
							const Icon = section.icon
							return (
								<TabsTrigger
									key={section.value}
									value={section.value}
									className={`group h-auto min-h-12 min-w-fit justify-start rounded-xl border-0 px-3 py-2.5 text-left shadow-none data-[state=active]:bg-brand-50 data-[state=active]:text-brand-800 data-[state=active]:shadow-none lg:w-full dark:data-[state=active]:bg-brand-950/50 dark:data-[state=active]:text-brand-200 ${
										section.destructive
											? "text-destructive data-[state=active]:bg-danger-soft data-[state=active]:text-destructive"
											: ""
									}`}
								>
									<span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition group-data-[state=active]:bg-card group-data-[state=active]:text-brand-700">
										<Icon className="size-4" />
									</span>
									<span className="hidden min-w-0 flex-1 lg:block">
										<span className="block font-semibold text-sm">{section.title}</span>
										<span className="mt-0.5 block font-normal text-[11px] text-muted-foreground">
											{section.description}
										</span>
									</span>
									<span className="font-semibold text-sm lg:hidden">{section.title}</span>
								</TabsTrigger>
							)
						})}
					</TabsList>
				</aside>

				<div className="min-w-0">
					{settingsSections.map((section) => (
						<TabsContent key={section.value} value={section.value} className="m-0 space-y-5">
							<section.component />
						</TabsContent>
					))}
				</div>
			</Tabs>
		</div>
	)
}
