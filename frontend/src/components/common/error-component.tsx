import { Link } from "@tanstack/react-router"
import { ArrowLeft, TriangleAlert } from "lucide-react"

import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"

const ErrorComponent = () => {
  return (
    <div className="bg-muted/35 min-h-svh" data-testid="error-component">
      <header className="mx-auto flex h-[72px] max-w-[1320px] items-center px-5 sm:px-8">
        <Logo className="h-8" />
      </header>
      <main className="mx-auto grid min-h-[calc(100svh-72px)] max-w-[1320px] place-items-center px-5 pb-20 sm:px-8">
        <section className="border-border bg-card shadow-floating w-full max-w-xl rounded-3xl border p-7 sm:p-11">
          <div className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <TriangleAlert className="size-6" />
          </div>
          <p className="mt-8 text-xs font-bold tracking-[0.2em] text-amber-700 uppercase">
            Something went wrong
          </p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
            We hit an unexpected snag.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md leading-7">
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
