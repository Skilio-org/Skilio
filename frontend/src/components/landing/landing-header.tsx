import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Menu } from "lucide-react"
import { Logo } from "@/components/common/logo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const links = [
	["#talent", "Find talent"],
	["#categories", "Categories"],
	["#testimonials", "Testimonials"],
	["#how-it-works", "How it works"],
]

export function LandingHeader() {
	return (
		<header className="sticky top-0 z-50 border-border border-b bg-card/95 backdrop-blur-md">
			<div className="landing-container flex h-[76px] items-center gap-3">
				<Logo variant="icon" className="size-8" />
				<nav
					aria-label="Main navigation"
					className="ml-12 hidden items-center gap-7 font-medium text-muted-foreground text-sm lg:flex"
				>
					{links.map(([href, label]) => (
						<a key={href} className="landing-nav-link" href={href}>
							{label}
						</a>
					))}
				</nav>
				<div className="ml-auto flex items-center gap-2 sm:gap-4">
					<Link to="/login" className="landing-nav-link inline-flex min-h-11 items-center px-2 font-medium text-sm">
						Log in
					</Link>
					<Link to="/signup" className="landing-primary min-h-11 gap-3 px-4 text-sm sm:px-5">
						<span className="hidden sm:inline">Create account</span>
						<span className="sm:hidden">Join</span>
						<ArrowUpRight className="size-4" />
					</Link>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="Open navigation"
								className="grid size-11 place-items-center rounded-lg hover:bg-muted lg:hidden"
							>
								<Menu className="size-5" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56 p-2">
							{links.map(([href, label]) => (
								<DropdownMenuItem asChild key={href}>
									<a className="min-h-11" href={href}>
										{label}
									</a>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
