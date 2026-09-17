export function Footer({ variant = "workspace" }: { variant?: "workspace" | "auth" }) {
	const currentYear = new Date().getFullYear()

	return (
		<footer className={variant === "auth" ? "shrink-0 bg-transparent pt-4" : "border-border/70 border-t bg-background"}>
			<div
				className={
					variant === "auth"
						? "mx-auto flex w-full items-center justify-center gap-6 py-2"
						: "mx-auto flex w-full max-w-330 items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8"
				}
			>
				<div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
					<p className="whitespace-nowrap font-medium text-muted-foreground text-xs">© {currentYear} Freelancer</p>

					<span aria-hidden="true" className="hidden text-border sm:inline">
						·
					</span>

					<p className="hidden truncate text-muted-foreground/80 text-xs sm:block">Better talent. Brighter outcomes.</p>
				</div>
			</div>
		</footer>
	)
}
