import { Link, useRouterState } from "@tanstack/react-router"
import { Menu } from "lucide-react"
import { Logo } from "@/components/common/logo"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User } from "@/components/sidebar/user"
import { useAccountRole } from "@/hooks/useAccountRole"
import useAuth from "@/hooks/useAuth"

const links = [
	["#talent", "Find talent"],
	["#contracts", "Active contracts"],
	["#how-it-works", "How it works"],
	["#testimonials", "Stories"],
]

export function LandingHeader() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	})
	const isStatusPage = pathname === "/status"
	const { user } = useAuth()
	const role = useAccountRole()

	return (
		<header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur-md dark:border-border-subtle dark:bg-surface-panel/95">
			<div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
				{/* Left */}
				<div className="flex h-full min-w-0 items-center gap-7">
					<Logo
						variant="full"
						to={user ? (role === "freelancer" ? "/freelancer-dashboard" : "/dashboard") : "/"}
						iconClassName="h-8 translate-y-px"
					/>

					{!isStatusPage && (
						<nav
							aria-label="Main navigation"
							className="hidden h-full items-center gap-6 md:flex"
						>
							{links.map(([href, label]) => (
								<a
									key={href}
									href={pathname === "/" ? href : `/${href}`}
									className="flex h-full items-center whitespace-nowrap font-label-md font-medium text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
								>
									{label}
								</a>
							))}
						</nav>
					)}
				</div>

				{/* Right */}
				<div className="flex shrink-0 items-center gap-3">
					<ThemeToggle />

					{!user ? (
						<>
							<Link
								to="/login"
								className="hidden sm:flex h-8 items-center px-3 font-label-md font-medium text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
							>
								Log in
							</Link>

							<Link
								to="/signup"
								className="flex h-8 items-center justify-center rounded-lg bg-primary px-3.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
							>
								Join Skilio
							</Link>
						</>
					) : (
						<>
							<div className="hidden h-4 w-px bg-outline-variant sm:block" />
							<User user={user} />
						</>
					)}

					{/* Mobile Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="Open navigation"
								className="flex size-8 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
							>
								<Menu className="size-4.5" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-56 rounded-lg border-outline-variant bg-surface-container-lowest p-1"
						>
							{!isStatusPage &&
								links.map(([href, label]) => (
									<DropdownMenuItem key={href} asChild>
										<a
											href={pathname === "/" ? href : `/${href}`}
											className="flex min-h-9 items-center font-label-md text-label-md"
										>
											{label}
										</a>
									</DropdownMenuItem>
								))}
							{!user ? (
								<>
									<DropdownMenuItem asChild>
										<Link to="/login" className="flex min-h-9 items-center font-label-md text-label-md">
											Log in
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to="/signup"
											className="flex min-h-9 items-center font-label-md text-label-md font-semibold text-link"
										>
											Join Skilio
										</Link>
									</DropdownMenuItem>
								</>
							) : (
								<DropdownMenuItem asChild>
									<Link
										to={role === "freelancer" ? "/freelancer-dashboard" : "/dashboard"}
										className="flex min-h-9 items-center font-label-md text-label-md font-semibold text-link"
									>
										Go to Dashboard
									</Link>
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
