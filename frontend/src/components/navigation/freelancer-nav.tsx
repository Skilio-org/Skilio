import { Link, useRouterState } from "@tanstack/react-router"
import {
	Bell,
	Boxes,
	BriefcaseBusiness,
	Check,
	ChevronDown,
	LogOut,
	Menu,
	Moon,
	Search,
	Settings,
	UserRound,
} from "lucide-react"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useAuth from "@/hooks/useAuth"

const links = [
	["/freelancer-dashboard", "Overview"],
	["/freelancer-jobs", "Find Work"],
	["/freelancer-saved-jobs", "Saved Jobs"],
	["/freelancer-proposals", "Proposals"],
	["/freelancer-messages", "Messages"],
] as const

export function FreelancerNav() {
	const { user, logout } = useAuth()

	const path = useRouterState({
		select: (state) => state.location.pathname,
	})

	const fullName = user?.full_name?.trim() || "User"
	const email = user?.email || ""

	return (
		<header className="fixed top-0 right-0 left-0 z-50 w-full border-outline-variant border-b bg-surface-container-lowest/95 backdrop-blur-md">
			<div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
				{/* Left */}
				<div className="flex h-full min-w-0 items-center gap-7">
					<Link to="/freelancer-dashboard" className="group flex shrink-0 items-center gap-2">
						<span className="flex size-6 items-center justify-center rounded-lg bg-primary text-surface-bright">
							<Boxes className="size-4" strokeWidth={2} />
						</span>

						<span className="font-headline-sm font-semibold text-headline-sm text-on-surface tracking-tight">
							Freelancer
						</span>
					</Link>

					<nav aria-label="Freelancer workspace" className="hidden h-full items-center gap-5 md:flex">
						{links.map(([to, label]) => {
							const active = path === to

							return (
								<Link
									key={to}
									to={to}
									aria-current={active ? "page" : undefined}
									className={
										active
											? "flex h-full items-center whitespace-nowrap border-primary border-b-2 px-0 font-label-md font-medium text-label-md text-primary transition-colors"
											: "flex h-full items-center whitespace-nowrap border-transparent border-b-2 px-0 font-label-md font-medium text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
									}
								>
									{label}
								</Link>
							)
						})}
					</nav>
				</div>

				{/* Right */}
				<div className="flex shrink-0 items-center gap-3">
					{/* Search */}
					<label className="relative hidden items-center sm:flex">
						<Search className="pointer-events-none absolute left-2 size-[18px] text-outline" />

						<span className="sr-only">Search jobs and contracts</span>

						<input
							type="search"
							placeholder="Search jobs, contracts..."
							className="h-8 w-52 rounded-lg border border-outline-variant bg-surface-container-lowest pr-10 pl-8 font-body-sm text-body-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container lg:w-64 [&::-webkit-search-cancel-button]:hidden"
						/>

						<kbd className="pointer-events-none absolute right-1 rounded border border-outline-variant bg-surface-container px-1.5 py-0.5 font-caption text-caption text-outline">
							⌘K
						</kbd>
					</label>

					{/* Notifications */}
					<button
						type="button"
						aria-label="Notifications"
						className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
					>
						<Bell className="size-[18px]" />

						<span aria-hidden="true" className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-error" />
					</button>

					{/* dark/light mode toggle*/}
					<button
						type="button"
						aria-label="Theme Mode"
						className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
					>
						<Moon className="size-[18px]" />
					</button>

					<div className="hidden h-4 w-px bg-outline-variant sm:block" />

					{/* Account menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								className="group hidden items-center gap-2 rounded-lg py-1 pr-1 pl-1 text-left outline-none transition-colors hover:bg-surface-container lg:flex"
							>
								<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
									<UserRound className="size-[18px]" strokeWidth={2} />
								</span>

								<span className="flex min-w-0 flex-col">
									<span className="max-w-32 truncate font-label-sm font-medium text-label-sm text-on-surface leading-none">
										{fullName}
									</span>

									<span className="mt-1 font-caption text-caption text-on-surface-variant leading-none">
										Freelancer
									</span>
								</span>

								<ChevronDown className="size-4 text-outline transition-colors group-hover:text-on-surface" />
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="end"
							sideOffset={8}
							className="w-[280px] rounded-lg border border-outline-variant bg-surface-container-lowest p-0 shadow-lg"
						>
							{/* Account header */}
							<div className="flex items-center gap-3 px-3.5 py-3.5">
								<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
									<UserRound className="size-[19px]" />
								</div>

								<div className="min-w-0 flex-1">
									<p className="truncate font-label-md font-medium text-label-md text-on-surface">{fullName}</p>

									{email && (
										<p className="mt-0.5 truncate font-caption text-caption text-on-surface-variant">{email}</p>
									)}
								</div>
							</div>

							<DropdownMenuSeparator className="m-0 bg-outline-variant" />

							{/* Workspace switcher */}
							<div className="p-2">
								<DropdownMenuLabel className="px-2 py-1.5 font-caption font-semibold text-caption text-outline uppercase tracking-wider">
									Workspaces
								</DropdownMenuLabel>

								<DropdownMenuItem asChild className="cursor-pointer rounded p-0 focus:bg-surface-container">
									<Link to="/freelancer-dashboard" className="flex min-h-11 w-full items-center gap-3 px-2.5 py-2">
										<span className="grid size-8 shrink-0 place-items-center rounded border border-outline-variant bg-surface-container text-primary">
											<UserRound className="size-4" />
										</span>

										<span className="min-w-0 flex-1">
											<span className="block font-label-md font-medium text-label-md text-on-surface">Freelancer</span>

											<span className="mt-0.5 block font-caption text-caption text-on-surface-variant">
												Find work and manage proposals
											</span>
										</span>

										<Check className="size-4 shrink-0 text-primary" />
									</Link>
								</DropdownMenuItem>

								<DropdownMenuItem asChild className="cursor-pointer rounded p-0 focus:bg-surface-container">
									<Link to="/client-dashboard" className="flex min-h-11 w-full items-center gap-3 px-2.5 py-2">
										<span className="grid size-8 shrink-0 place-items-center rounded border border-outline-variant bg-surface-container text-on-surface-variant">
											<BriefcaseBusiness className="size-4" />
										</span>

										<span className="min-w-0 flex-1">
											<span className="block font-label-md font-medium text-label-md text-on-surface">Client</span>

											<span className="mt-0.5 block font-caption text-caption text-on-surface-variant">
												Hire talent and manage projects
											</span>
										</span>
									</Link>
								</DropdownMenuItem>
							</div>

							<DropdownMenuSeparator className="m-0 bg-outline-variant" />

							<div className="p-2">
								<DropdownMenuItem asChild className="cursor-pointer rounded p-0 focus:bg-surface-container">
									<Link
										to="/freelancer"
										className="flex min-h-9 items-center gap-2.5 px-2.5 font-label-md text-label-md text-on-surface"
									>
										<UserRound className="size-4 text-outline" />
										Freelancer profile
									</Link>
								</DropdownMenuItem>

								<DropdownMenuItem asChild className="cursor-pointer rounded p-0 focus:bg-surface-container">
									<Link
										to="/settings"
										className="flex min-h-9 items-center gap-2.5 px-2.5 font-label-md text-label-md text-on-surface"
									>
										<Settings className="size-4 text-outline" />
										Settings
									</Link>
								</DropdownMenuItem>
							</div>

							<DropdownMenuSeparator className="m-0 bg-outline-variant" />

							<div className="p-2">
								<DropdownMenuItem
									onSelect={() => logout()}
									className="min-h-9 cursor-pointer rounded px-2.5 font-label-md text-error text-label-md focus:bg-error-container focus:text-error"
								>
									<LogOut className="mr-2.5 size-4" />
									Log out
								</DropdownMenuItem>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Mobile navigation */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="Open workspace navigation"
								className="flex size-8 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
							>
								<Menu className="size-[18px]" />
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="end"
							className="w-56 rounded-lg border-outline-variant bg-surface-container-lowest p-1"
						>
							{links.map(([to, label]) => (
								<DropdownMenuItem key={to} asChild>
									<Link to={to} className="min-h-9 font-label-md text-label-md">
										{label}
									</Link>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
