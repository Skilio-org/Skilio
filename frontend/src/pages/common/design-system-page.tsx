import {
	Bell,
	Bookmark,
	Briefcase,
	Check,
	Download,
	MessageSquare,
	Search,
	Star,
	Trash2,
	Upload,
	Users,
	X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Logo } from "@/components/common/logo"
import { EmptyState } from "@/components/common/empty-state"
import { LeavePageDialog } from "@/components/common/leave-page-dialog"
import { LoadingImage } from "@/components/common/loading-image"
import CitySelect from "@/components/common/city-select"
import { SkillsSelect } from "@/components/common/skills-select"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { RemoveConnectionDialog } from "@/components/connections/remove-connection-dialog"
import { Monogram, SkillTag, WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { ProfileTextField } from "@/components/freelancer/profile-editor/profile-fields"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { StarRatingDisplay, StarRatingInput } from "@/components/reviews/review-stars"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { Skeleton } from "@/components/ui/skeleton"

// ---------------------------------------------------------------------------------------------
// Colour palette. Each token is defined once in styles/globals.css, for the light and the dark theme.
// ---------------------------------------------------------------------------------------------
const palette = [
	{
		group: "Brand",
		tokens: [
			["primary", "bg-primary", "Main actions and highlights"],
			["primary-hover", "bg-primary-hover", "Hover state of primary"],
			["on-primary", "bg-on-primary", "Text and icons on primary"],
			["link", "bg-link", "Accent text and links"],
		],
	},
	{
		group: "Surfaces",
		tokens: [
			["background", "bg-background", "Page background"],
			["surface-container-lowest", "bg-surface-container-lowest", "Cards and panels"],
			["surface-container-low", "bg-surface-container-low", "Subtle fills"],
			["surface-container", "bg-surface-container", "Chips and inputs"],
			["surface-container-high", "bg-surface-container-high", "Raised elements"],
		],
	},
	{
		group: "Text and lines",
		tokens: [
			["on-surface", "bg-on-surface", "Main text"],
			["on-surface-variant", "bg-on-surface-variant", "Secondary text"],
			["outline", "bg-outline", "Strong borders and icons"],
			["outline-variant", "bg-outline-variant", "Normal borders"],
			["border-input", "bg-border-input", "Form field borders"],
		],
	},
	{
		group: "Status",
		tokens: [
			["destructive", "bg-destructive", "Errors and dangerous actions"],
			["success", "bg-success", "Success messages"],
			["warning", "bg-warning", "Warnings"],
			["ring", "bg-ring", "Keyboard focus ring"],
		],
	},
]

// A colour box. It reads the real colour from the page, so it also updates when the theme changes.
function Swatch({ token, className, note }: { token: string; className: string; note: string }) {
	const box = useRef<HTMLSpanElement>(null)
	const [color, setColor] = useState("")

	useEffect(() => {
		const read = () => box.current && setColor(toHex(getComputedStyle(box.current).backgroundColor))
		read()
		const observer = new MutationObserver(read)
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
		return () => observer.disconnect()
	}, [])

	return (
		<li className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
			<span ref={box} className={`size-12 shrink-0 rounded-md border border-outline-variant ${className}`} />
			<div className="min-w-0">
				<p className="truncate font-medium text-on-surface text-sm">--{token}</p>
				<p className="truncate text-on-surface-variant text-xs">{note}</p>
				<p className="font-numeric-data text-numeric-data text-outline">{color}</p>
			</div>
		</li>
	)
}

// "rgb(184, 239, 13)" -> "#b8ef0d". Anything else is shown as the browser gives it.
function toHex(value: string) {
	const match = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
	if (!match) return value
	return `#${[match[1], match[2], match[3]].map((part) => Number(part).toString(16).padStart(2, "0")).join("")}`
}

// ---------------------------------------------------------------------------------------------
// Typography: one font family (Geist) and a named scale. The sizes live in styles/globals.css.
// ---------------------------------------------------------------------------------------------
const typeScale = [
	["text-headline-xl", "Headline XL", "font-headline-xl text-headline-xl font-semibold"],
	["text-headline-lg", "Headline L", "font-headline-lg text-headline-lg font-semibold"],
	["text-headline-md", "Headline M", "font-headline-md text-headline-md font-medium"],
	["text-headline-sm", "Headline S", "font-headline-sm text-headline-sm font-semibold"],
	["text-body-sm", "Body: clear text for reading", "font-body-sm text-body-sm"],
	["text-label-md", "Label M: buttons and form labels", "font-label-md text-label-md font-medium"],
	["text-label-sm", "Label S: small labels", "font-label-sm text-label-sm font-medium"],
	["text-caption", "Caption: hints and metadata", "font-caption text-caption"],
	["text-numeric-data", "1,250 DH · 4.9 · 12 reviews", "font-numeric-data text-numeric-data"],
] as const

// ---------------------------------------------------------------------------------------------
// Icons: the lucide set, always used at one of these sizes, plus the Skilio logo mark.
// ---------------------------------------------------------------------------------------------
const iconSizes = [
	["size-3", "12px: inside small badges"],
	["size-3.5", "14px: compact buttons"],
	["size-4", "16px: standard buttons and menus"],
	["size-5", "20px: tiles and dialogs"],
	["size-6", "24px: empty states"],
] as const
const icons = [Search, Bookmark, MessageSquare, Briefcase, Star, Users, Bell, Upload, Download, Check, X, Trash2]

function Section({
	id,
	title,
	description,
	children,
}: {
	id: string
	title: string
	description: string
	children: React.ReactNode
}) {
	return (
		<section id={id} className="scroll-mt-24">
			<h2 className="font-display font-semibold text-2xl tracking-tight">{title}</h2>
			<p className="mt-2 max-w-3xl text-muted-foreground text-sm leading-relaxed">{description}</p>
			<div className="mt-6">{children}</div>
		</section>
	)
}

// A framed example with its component name underneath.
function Demo({ name, children, className = "" }: { name: string; children: React.ReactNode; className?: string }) {
	return (
		<div className="flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest">
			<div className={`flex flex-1 flex-wrap items-center gap-3 p-5 ${className}`}>{children}</div>
			<p className="border-outline-variant border-t px-5 py-2.5 font-numeric-data text-numeric-data text-on-surface-variant">
				{name}
			</p>
		</div>
	)
}

export default function DesignSystemPage() {
	const [rating, setRating] = useState(4)
	const [skills, setSkills] = useState(["React", "Figma"])
	const [city, setCity] = useState("")
	const [text, setText] = useState("")
	const [removeOpen, setRemoveOpen] = useState(false)
	const [leaveOpen, setLeaveOpen] = useState(false)
	const [loading, setLoading] = useState(false)

	return (
		<div className="landing-page flex min-h-dvh flex-col bg-background text-foreground">
			<LandingHeader />

			<main id="main-content" tabIndex={-1} className="flex-1 py-12 outline-none sm:py-16">
				<div className="landing-container space-y-16">
					<header className="border-border border-b pb-8">
						<p className="mb-3 font-medium text-link text-sm">Skilio design system</p>
						<h1 className="font-display font-semibold text-3xl tracking-tight sm:text-5xl">One look, built once</h1>
						<p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
							Every screen in Skilio is made from the same colours, the same type scale, the same icons and the same
							reusable components. This page shows them live, in the current theme. Switch the theme to see both
							palettes.
						</p>
						<div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
							<a href="#colors" className="text-link hover:underline">
								Colours
							</a>
							<a href="#typography" className="text-link hover:underline">
								Typography
							</a>
							<a href="#icons" className="text-link hover:underline">
								Icons
							</a>
							<a href="#components" className="text-link hover:underline">
								Components
							</a>
						</div>
					</header>

					<Section
						id="colors"
						title="Colour palette"
						description="Colours are never typed into a component. They are named tokens defined once in globals.css, with a light and a dark value. The brand colour is a bright lime, always paired with dark text for contrast."
					>
						<div className="space-y-8">
							{palette.map((group) => (
								<div key={group.group}>
									<h3 className="mb-3 font-medium text-on-surface text-sm">{group.group}</h3>
									<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{group.tokens.map(([token, className, note]) => (
											<Swatch key={token} token={token} className={className} note={note} />
										))}
									</ul>
								</div>
							))}
						</div>
					</Section>

					<Section
						id="typography"
						title="Typography"
						description="One family, Geist, with a named scale. Each style sets size, line height, spacing and weight together, so text looks the same everywhere."
					>
						<ul className="divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
							{typeScale.map(([token, sample, classes]) => (
								<li
									key={token}
									className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
								>
									<span className={classes}>{sample}</span>
									<code className="shrink-0 text-on-surface-variant text-xs">{token}</code>
								</li>
							))}
						</ul>
					</Section>

					<Section
						id="icons"
						title="Icons"
						description="Icons come from one set (lucide) and are only used at the five sizes below, so they always line up with the text beside them. The Skilio mark is our own."
					>
						<div className="grid gap-6 lg:grid-cols-2">
							<Demo name="Icon sizes" className="gap-6">
								{iconSizes.map(([size, note]) => (
									<div key={size} className="flex flex-col items-center gap-2 text-center">
										<Search className={size} />
										<code className="text-xs">{size}</code>
										<span className="max-w-24 text-on-surface-variant text-xs">{note}</span>
									</div>
								))}
							</Demo>
							<Demo name="Icon set in use">
								{icons.map((Icon, index) => (
									<span
										key={index}
										className="grid size-10 place-items-center rounded-lg bg-surface-container text-on-surface"
									>
										<Icon className="size-5" />
									</span>
								))}
								<Logo asLink={false} className="h-9" />
							</Demo>
						</div>
					</Section>

					<Section
						id="components"
						title="Reusable components"
						description="These components are built once and used across many pages. Each example below is the real component, not a picture."
					>
						<div className="grid gap-6 lg:grid-cols-2">
							<Demo name="Buttons: workspaceStyles.primaryAction, secondaryAction, destructiveAction, iconButton">
								<button type="button" className={workspaceStyles.primaryAction}>
									<Search className="size-4" /> Primary
								</button>
								<button type="button" className={workspaceStyles.secondaryAction}>
									Secondary
								</button>
								<button type="button" className={workspaceStyles.destructiveAction}>
									<Trash2 className="size-4" /> Destructive
								</button>
								<button type="button" aria-label="Bookmark" className={workspaceStyles.iconButton}>
									<Bookmark className="size-4" />
								</button>
							</Demo>

							<Demo name="LoadingButton">
								<LoadingButton
									loading={loading}
									onClick={() => {
										setLoading(true)
										setTimeout(() => setLoading(false), 1500)
									}}
								>
									{loading ? "Saving…" : "Click to see loading"}
								</LoadingButton>
							</Demo>

							<Demo name="Badge: success, pending, default, secondary, outline, destructive">
								<Badge variant="success">Accepted</Badge>
								<Badge variant="pending">Pending</Badge>
								<Badge>Default</Badge>
								<Badge variant="secondary">Draft</Badge>
								<Badge variant="outline">Outline</Badge>
								<Badge variant="destructive">Declined</Badge>
							</Demo>

							<Demo name="SkillTag and Monogram">
								<SkillTag>React</SkillTag>
								<SkillTag>TypeScript</SkillTag>
								<SkillTag>UI design</SkillTag>
								<Monogram className="size-10 text-sm">SK</Monogram>
								<Monogram className="size-12 rounded-lg text-base">AB</Monogram>
							</Demo>

							<Demo name="Input, PasswordInput and ProfileTextField" className="flex-col items-stretch">
								<Input placeholder="Input" />
								<PasswordInput placeholder="PasswordInput" />
								<ProfileTextField
									label="ProfileTextField"
									value={text}
									onChange={setText}
									placeholder="With a counter"
									maxLength={40}
									showCount
								/>
							</Demo>

							<Demo name="StarRatingInput and StarRatingDisplay" className="flex-col items-start">
								<StarRatingInput value={rating} onChange={setRating} />
								<StarRatingDisplay rating={rating} showScore showCount={12} size="md" />
							</Demo>

							<Demo name="SkillsSelect" className="items-stretch">
								<div className="w-full">
									<SkillsSelect inputId="ds-skills" label="Skills" value={skills} onChange={setSkills} />
								</div>
							</Demo>

							<Demo name="CitySelect" className="items-stretch">
								<div className="w-full">
									<CitySelect
										value={city}
										onValueChange={setCity}
										emptyLabel="Select city"
										className="h-11 w-full max-w-none rounded-lg border border-input bg-surface-container-lowest px-3 text-sm"
									/>
								</div>
							</Demo>

							<Demo name="LoadingImage and Skeleton">
								<LoadingImage
									src="/assets/images/skilio-logo.svg"
									alt="Skilio logo"
									className="size-16 rounded-lg object-contain"
								/>
								<Skeleton className="h-10 w-40 rounded-lg" />
								<Skeleton className="size-10 rounded-full" />
							</Demo>

							<Demo name="Confirmation dialogs: RemoveConnectionDialog, LeavePageDialog">
								<button type="button" className={workspaceStyles.secondaryAction} onClick={() => setRemoveOpen(true)}>
									Open remove dialog
								</button>
								<button type="button" className={workspaceStyles.secondaryAction} onClick={() => setLeaveOpen(true)}>
									Open leave dialog
								</button>
							</Demo>

							<Demo name="Logo and ThemeToggle">
								<Logo asLink={false} />
								<ThemeToggle />
							</Demo>
						</div>

						<div className="mt-6 space-y-6">
							<Demo name="WorkspacePageHeader" className="block">
								<WorkspacePageHeader
									eyebrow="Client workspace"
									title="Page title"
									description="The same header opens every page in the workspace."
									meta={<span className="font-medium text-link">3 open jobs</span>}
									action={
										<button type="button" className={workspaceStyles.primaryAction}>
											Primary action
										</button>
									}
								/>
							</Demo>

							<Demo name="EmptyState" className="block">
								<EmptyState
									icon={Users}
									title="Nothing here yet"
									description="Empty lists explain what will appear and what to do next."
									action={
										<button type="button" className={workspaceStyles.secondaryAction}>
											Find talent
										</button>
									}
								/>
							</Demo>
						</div>
					</Section>
				</div>
			</main>

			<RemoveConnectionDialog
				personName={removeOpen ? "Sample Person" : null}
				isRemoving={false}
				onClose={() => setRemoveOpen(false)}
				onConfirm={() => setRemoveOpen(false)}
			/>
			<LeavePageDialog
				open={leaveOpen}
				message="You have changes that are not saved. If you leave now, they will be lost."
				onStay={() => setLeaveOpen(false)}
				onLeave={() => setLeaveOpen(false)}
			/>

			<LandingFooter />
		</div>
	)
}
