import { Link } from "@tanstack/react-router"
import { ArrowRight, House, RefreshCw, TriangleAlert } from "lucide-react"

import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"

const ErrorComponent = ({
  error,
  reset,
}: {
  error?: Error
  reset?: () => void
}) => {
  return (
    <div className="bg-background min-h-svh" data-testid="error-component">
      <header className="mx-auto flex h-[72px] max-w-[1320px] items-center px-5 sm:px-8">
        <Logo className="h-8" />
      </header>
      <main className="mx-auto flex min-h-[calc(100svh-72px)] max-w-5xl items-center px-5 pb-24 sm:px-8">
        <section
          role="alert"
          className="border-border w-full border-y py-12 sm:py-16"
        >
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-16">
            <div>
              <div className="bg-warning-soft text-warning grid size-12 place-items-center rounded-xl">
                <TriangleAlert className="size-5" strokeWidth={1.75} />
              </div>
              <p className="text-muted-foreground mt-5 text-xs font-medium tracking-[0.14em] uppercase">
                Error 500
              </p>
            </div>
            <div className="max-w-2xl">
              <p className="text-primary text-sm font-medium">
                We couldn’t load this page
              </p>
              <h1 className="font-display mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
                Let’s get you back to work.
              </h1>
              <p className="text-muted-foreground mt-5 max-w-xl text-base leading-7">
                Something interrupted this page, but your saved work is still
                safe. Try loading it again or return to your workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {reset && (
                  <Button size="lg" className="min-h-12" onClick={reset}>
                    <RefreshCw className="size-4" />
                    Try again
                  </Button>
                )}
                <Button
                  asChild
                  size="lg"
                  variant={reset ? "outline" : "default"}
                  className="min-h-12"
                >
                  <Link to="/">
                    <House className="size-4" />
                    Return home
                  </Link>
                </Button>
              </div>
              <p className="text-muted-foreground mt-8 flex items-center gap-2 text-xs">
                If this keeps happening, refresh the browser and try once more.
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </p>
              {import.meta.env.DEV && error?.message && (
                <details className="border-border bg-muted/40 mt-6 rounded-xl border p-4 text-left">
                  <summary className="cursor-pointer text-xs font-medium">
                    Development details
                  </summary>
                  <code className="text-muted-foreground mt-3 block overflow-x-auto text-xs leading-5">
                    {error.message}
                  </code>
                </details>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ErrorComponent
