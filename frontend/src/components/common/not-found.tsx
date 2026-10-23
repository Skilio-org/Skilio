import { Link } from "@tanstack/react-router"
import { ArrowLeft, Compass } from "lucide-react"

import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"

const NotFound = () => {
	return (
		<div className="min-h-svh bg-muted/35" data-testid="not-found">
			<header className="mx-auto flex h-18 max-w-330 items-center px-5 sm:px-8">
				<Logo className="h-8" />
			</header>
			<main className="mx-auto grid min-h-[calc(100svh-72px)] max-w-330 place-items-center px-5 pb-20 sm:px-8">
				<section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-floating sm:p-11">
					<div aria-hidden="true" className="absolute -top-16 -right-16 size-48 rounded-full bg-brand-100 blur-3xl" />
					<div className="relative">
						<div className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
							<Compass className="size-6" />
						</div>
						<p className="mt-8 font-bold text-brand-700 text-xs uppercase tracking-[0.2em]">Error 404</p>
						<h1 className="mt-3 font-display font-medium text-4xl tracking-[-0.04em] sm:text-5xl">
							This page wandered off.
						</h1>
						<p className="mt-4 max-w-md text-muted-foreground leading-7">
							The link may be outdated, or the page may have moved. Head back home and continue exploring talent.
						</p>
						<Button asChild size="lg" className="mt-8 min-h-11">
							<Link to="/">
								<ArrowLeft className="size-4" />
								Back home
							</Link>
						</Button>
					</div>
				</section>
			</main>
		</div>
	)
}

export default NotFound
