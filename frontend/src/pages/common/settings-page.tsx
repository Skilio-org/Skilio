import { KeyRound, Palette, Trash2, UserRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { WorkspacePageHeader } from "@/components/dashboard/dashboard-header"
import ChangePassword from "@/components/user-settings/change-password"
import DeleteAccount from "@/components/user-settings/delete-account"
import { AppearanceSettings } from "@/components/user-settings/preferences"
import UserInformation from "@/components/user-settings/user-information"
import { useAccountRole } from "@/hooks/useAccountRole"
import type { SettingsSection } from "@/lib/settings"
import { cn } from "@/lib/utils"

const settingsSections = [
	{ value: "profile", title: "Profile", icon: UserRound, component: UserInformation },
	{ value: "password", title: "Password & security", icon: KeyRound, component: ChangePassword },
	{ value: "appearance", title: "Appearance", icon: Palette, component: AppearanceSettings },
	{ value: "danger-zone", title: "Delete account", icon: Trash2, component: DeleteAccount, destructive: true },
] as const

const sectionId = (value: string) => `settings-${value}`

// How far below the top of the window a section's heading counts as "current" (clears the sticky navigation).
const trackingOffset = 140

export function SettingsPage({
	section,
}: {
	section: SettingsSection
	// Kept so the routes can still pass it; the page now scrolls instead of switching tabs.
	onSectionChange?: (value: SettingsSection) => void
}) {
	const role = useAccountRole()
	const [active, setActive] = useState<SettingsSection>(section)
	// While set, the highlight stays on the section that was clicked (or linked to), however far the page ends up
	// scrolling. It is released as soon as the user scrolls themselves.
	const locked = useRef<SettingsSection | null>(null)

	// A link such as /settings?section=password opens the page scrolled to that section.
	useEffect(() => {
		if (section === "profile") return
		locked.current = section
		setActive(section)
		document.getElementById(sectionId(section))?.scrollIntoView({ block: "start" })
	}, [section])

	// Highlight the section that is currently under the top of the screen while scrolling.
	useEffect(() => {
		let frame = 0
		const release = () => {
			locked.current = null
		}
		const update = () => {
			frame = 0
			if (locked.current) return
			const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
			let current: SettingsSection = settingsSections[0].value
			for (const item of settingsSections) {
				const element = document.getElementById(sectionId(item.value))
				if (element && element.getBoundingClientRect().top <= trackingOffset) current = item.value
			}
			if (atBottom) current = settingsSections[settingsSections.length - 1].value
			setActive(current)
		}
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update)
		}
		update()
		window.addEventListener("scroll", onScroll, { passive: true })
		window.addEventListener("resize", onScroll)
		window.addEventListener("wheel", release, { passive: true })
		window.addEventListener("touchmove", release, { passive: true })
		window.addEventListener("keydown", release)
		return () => {
			window.removeEventListener("scroll", onScroll)
			window.removeEventListener("resize", onScroll)
			window.removeEventListener("wheel", release)
			window.removeEventListener("touchmove", release)
			window.removeEventListener("keydown", release)
			if (frame) cancelAnimationFrame(frame)
		}
	}, [])

	const goTo = (value: SettingsSection) => {
		locked.current = value
		setActive(value)
		document.getElementById(sectionId(value))?.scrollIntoView({ behavior: "smooth", block: "start" })
	}

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 md:px-6">
			<WorkspacePageHeader
				eyebrow={`${role === "client" ? "Client" : "Freelancer"} workspace`}
				title="Settings"
				description="Update your profile, password and how Skilio looks."
			/>
			<div className="gap-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
				<nav
					aria-label="Settings sections"
					className="sticky top-16 z-20 -mx-4 mb-6 flex gap-1 overflow-x-auto border-outline-variant border-b bg-background/90 px-4 py-2 backdrop-blur lg:top-20 lg:mx-0 lg:mb-0 lg:flex-col lg:self-start lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
				>
					{settingsSections.map((item) => {
						const Icon = item.icon
						const current = active === item.value
						const destructive = "destructive" in item && item.destructive
						return (
							<button
								key={item.value}
								type="button"
								aria-current={current ? "true" : undefined}
								onClick={() => goTo(item.value)}
								className={cn(
									"flex h-10 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-left font-medium text-sm transition-colors lg:w-full",
									destructive
										? cn("text-destructive hover:bg-danger-soft lg:mt-3", current && "bg-danger-soft")
										: current
											? "bg-surface-container text-on-surface"
											: "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
								)}
							>
								<Icon className="size-4 shrink-0" />
								{item.title}
							</button>
						)
					})}
				</nav>

				<div className="min-w-0 space-y-8 pb-24">
					{settingsSections.map((item) => (
						<div key={item.value} id={sectionId(item.value)} className="scroll-mt-32">
							<item.component />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
