import { Link } from "@tanstack/react-router"
import { ArrowLeft, TriangleAlert } from "lucide-react"

import { Logo } from "@/components/Common/Logo"
import { Button } from "@/components/ui/button"

const ErrorComponent = () => {
  return (
    <div className="min-h-svh bg-muted/35" data-testid="error-component">
      <header className="mx-auto flex h-[72px] max-w-[1320px] items-center px-5 sm:px-8">
        <Logo className="h-8" />
      </header>
      <main className="mx-auto grid min-h-[calc(100svh-72px)] max-w-[1320px] place-items-center px-5 pb-20 sm:px-8">
        <section className="w-full max-w-xl rounded-3xl border border-border bg-card p-7 shadow-floating sm:p-11">
          <div className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <TriangleAlert className="size-6" />
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            Something went wrong
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
            We hit an unexpected snag.
          </h1>
          <p className="mt-4 max-w-md leading-7 text-muted-foreground">
            Your work is safe. Return home and try again, or refresh the page if
            the problem continues.
          </p>
          <Button asChild size="lg" className="mt-8 min-h-11">
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back home
            </Link>
          </Button>
        </section>
      </main>
    </div>
  )
}

export default ErrorComponent
