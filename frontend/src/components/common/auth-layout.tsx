import { Logo } from "@/components/common/logo"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Footer } from "./footer"

interface AuthLayoutProps {
	children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex min-h-svh flex-col bg-background">
			<header className="border-b border-border/70 bg-card">
				<div className="mx-auto grid h-18 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
					<div />
					<Logo to="/" className="h-10" />
					<div className="justify-self-end">
						<ThemeToggle />
					</div>
				</div>
			</header>
			<main
				id="main-content"
				tabIndex={-1}
				className="flex flex-1 items-center justify-center px-4 py-8 outline-none sm:py-12"
			>
				<div className="w-full max-w-130 rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-10">
					{children}
				</div>
			</main>
			<Footer variant="auth" />
		</div>
	)
}
