import { Link } from "@tanstack/react-router"

import { Logo } from "@/components/common/logo"

export function LandingHeader() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
        <Logo className="h-8" />

        <nav
          aria-label="Main navigation"
          className="text-muted-foreground ml-14 hidden items-center gap-8 text-sm font-medium md:flex"
        >
          <a className="hover:text-foreground transition-colors" href="#talent">
            Find talent
          </a>
          <a
            className="hover:text-foreground transition-colors"
            href="#categories"
          >
            Categories
          </a>
          <a
            className="hover:text-foreground transition-colors"
            href="#how-it-works"
          >
            How it works
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="hover:text-brand-700 hidden min-h-11 items-center px-4 text-sm font-semibold transition-colors sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-600 inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-5"
          >
            Create account
          </Link>
        </div>
      </div>
    </header>
  )
}
