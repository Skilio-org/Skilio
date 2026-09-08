export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <p className="whitespace-nowrap text-xs font-medium text-muted-foreground">
            © {currentYear} Freelancer
          </p>

          <span aria-hidden="true" className="hidden text-border sm:inline">
            ·
          </span>

          <p className="hidden truncate text-xs text-muted-foreground/80 sm:block">
            Better talent. Brighter outcomes.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">Client workspace</p>
      </div>
    </footer>
  )
}
