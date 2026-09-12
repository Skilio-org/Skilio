import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"

export function LandingCta() {
  return (
    <section className="bg-brand-600 px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto grid max-w-[1344px] gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 className="font-display max-w-4xl text-4xl leading-[1.05] font-medium tracking-[-0.04em] sm:text-6xl">
            Find the specialist your work needs.
          </h2>
          <p className="text-brand-100 mt-5 max-w-xl text-lg leading-8">
            Create an account, compare relevant work, and contact your
            shortlist.
          </p>
        </div>
        <Link
          to="/signup"
          className="text-brand-800 hover:bg-brand-50 inline-flex min-h-14 items-center justify-between gap-10 rounded-full bg-white px-6 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Create account <ArrowRight className="size-5" />
        </Link>
      </div>
    </section>
  )
}
