import { Link } from "@tanstack/react-router"
import { ArrowRight, Search } from "lucide-react"

export function LandingHero() {
  return (
    <section className="border-border border-b">
      <div className="mx-auto grid max-w-[1440px] lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[1.02fr_.98fr]">
        <div className="flex min-w-0 flex-col justify-center px-5 py-16 sm:px-8 sm:py-20 lg:border-r lg:px-12 lg:py-20 xl:px-20">
          <h1 className="font-display max-w-[760px] text-[clamp(3.25rem,6vw,6.25rem)] leading-[0.96] font-medium tracking-[-0.055em] text-balance">
            Hire by proof, not promises.
          </h1>
          <p className="text-muted-foreground mt-7 max-w-xl text-lg leading-8 sm:text-xl">
            Browse detailed profiles, see real work, and connect directly with
            independent professionals who fit your standards.
          </p>

          <div className="border-input bg-card focus-within:border-brand-600 focus-within:ring-brand-100 dark:focus-within:ring-brand-950 mt-9 flex max-w-2xl items-center rounded-xl border p-2 shadow-[0_18px_50px_-32px_rgba(37,64,120,.55)] focus-within:ring-4">
            <Search
              className="text-muted-foreground ml-3 size-5 shrink-0"
              aria-hidden="true"
            />
            <label htmlFor="talent-search" className="sr-only">
              Search by skill or role
            </label>
            <input
              id="talent-search"
              type="search"
              placeholder="Try “React developer” or “brand designer”"
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none"
            />
            <Link
              to="/signup"
              aria-label="Search talent"
              className="bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-600 grid size-12 shrink-0 place-items-center rounded-lg text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
            >
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>

        <div className="bg-muted min-w-0 p-5 sm:p-8 lg:p-10 xl:p-12">
          <img
            src="/assets/images/landing-studio-professional.png"
            alt="Independent product designer working in a daylight studio"
            width={1448}
            height={1086}
            fetchPriority="high"
            className="h-full min-h-[420px] w-full rounded-2xl object-cover object-center lg:min-h-0"
          />
        </div>
      </div>
    </section>
  )
}
