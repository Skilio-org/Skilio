import { Link } from "@tanstack/react-router"

import { Logo } from "@/components/common/logo"

export function LandingFooter() {
	return (
		<footer className="border-border border-t bg-background py-12 sm:py-16">
			<div className="landing-container">
				<div className="flex flex-col gap-8 border-border border-b pb-10 sm:flex-row sm:items-center sm:justify-between">
					<Logo className="h-8 w-auto self-start" />
					<nav aria-label="Footer navigation" className="flex flex-wrap gap-x-7 gap-y-3 text-muted-foreground text-sm">
						<a href="#talent" className="transition-colors hover:text-foreground">
							Find talent
						</a>
						<a href="#categories" className="transition-colors hover:text-foreground">
							Categories
						</a>
						<a href="#testimonials" className="transition-colors hover:text-foreground">
							Testimonials
						</a>
						<a href="#how-it-works" className="transition-colors hover:text-foreground">
							How it works
						</a>
						<Link to="/privacy" className="transition-colors hover:text-foreground">
							Privacy Policy
						</Link>
						<Link to="/terms" className="transition-colors hover:text-foreground">
							Terms of Service
						</Link>
						<Link to="/login" className="transition-colors hover:text-foreground">
							Log in
						</Link>
					</nav>
				</div>
				<div className="flex flex-col gap-3 pt-7 text-muted-foreground text-xs sm:flex-row sm:items-center sm:justify-between">
					<p>© {new Date().getFullYear()} Skilio. All rights reserved.</p>
					<div className="flex items-center gap-4">
						<Link to="/privacy" className="transition-colors hover:text-foreground">
							Privacy
						</Link>
						<span>·</span>
						<Link to="/terms" className="transition-colors hover:text-foreground">
							Terms
						</Link>
						<span>·</span>
						<span>Independent work, clearly presented.</span>
					</div>
				</div>
			</div>
		</footer>
	)
}
