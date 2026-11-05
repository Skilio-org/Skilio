import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Menu } from "lucide-react"
import { Logo } from "@/components/common/logo"
import { ThemeToggle } from "@/components/common/theme-toggle"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const links = [
	["#talent", "Find talent"],
	["#contracts", "Active contracts"],
	["#difference", "Why Skilio"],
	["#how-it-works", "How it works"],
	["#testimonials", "Stories"],
]

export function LandingHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
			<div className="landing-container flex h-[70px] sm:h-[74px] items-center justify-between gap-3 sm:gap-4">
				<div className="flex items-center gap-6 lg:gap-12">
					<Logo className="h-7 sm:h-8" />
					<nav
						aria-label="Main navigation"
						className="hidden items-center gap-7 font-medium text-muted-foreground text-sm lg:flex"
					>
						{links.map(([href, label]) => (
							<a
								key={href}
								href={href}
								className="transition-colors hover:text-foreground text-sm font-medium"
							>
								{label}
							</a>
						))}
					</nav>
				</div>

				<div className="flex items-center gap-2 sm:gap-3.5">
					<ThemeToggle />

					<Link
						to="/login"
						className="hidden sm:inline-flex min-h-10 items-center px-3 font-medium text-sm text-foreground/90 hover:text-foreground transition-colors"
					>
						Log in
					</Link>

					<Link
						to="/signup"
						className="inline-flex h-9 items-center gap-1.5 sm:gap-2 rounded-lg bg-primary px-3.5 sm:px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
					>
						<span className="hidden xs:inline sm:inline">Join Skilio</span>
						<span className="xs:hidden sm:hidden">Join</span>
						<ArrowUpRight className="size-3.5 sm:size-4" />
					</Link>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="Open navigation"
								className="grid size-9 sm:size-10 place-items-center rounded-lg border border-border bg-card text-foreground hover:bg-muted lg:hidden"
							>
								<Menu className="size-5" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56 p-2">
							{links.map(([href, label]) => (
								<DropdownMenuItem asChild key={href}>
									<a className="min-h-10 w-full" href={href}>
										{label}
									</a>
								</DropdownMenuItem>
							))}
							<DropdownMenuItem asChild>
								<Link to="/login" className="min-h-10 w-full font-medium">
									Log in
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link
									to="/signup"
									className="min-h-10 w-full font-semibold text-link"
								>
									Create account
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
