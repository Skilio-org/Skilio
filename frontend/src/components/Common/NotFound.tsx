import { Link } from "@tanstack/react-router";
import { ArrowLeft, Compass } from "lucide-react";

import { Logo } from "@/components/Common/Logo";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="bg-muted/35 min-h-svh" data-testid="not-found">
      <header className="mx-auto flex h-[72px] max-w-[1320px] items-center px-5 sm:px-8">
        <Logo className="h-8" />
      </header>
      <main className="mx-auto grid min-h-[calc(100svh-72px)] max-w-[1320px] place-items-center px-5 pb-20 sm:px-8">
        <section className="border-border bg-card shadow-floating relative w-full max-w-xl overflow-hidden rounded-3xl border p-7 sm:p-11">
          <div aria-hidden="true" className="bg-brand-100 absolute -top-16 -right-16 size-48 rounded-full blur-3xl" />
          <div className="relative">
            <div className="bg-brand-50 text-brand-700 grid size-12 place-items-center rounded-2xl">
              <Compass className="size-6" />
            </div>
            <p className="text-brand-700 mt-8 text-xs font-bold tracking-[0.2em] uppercase">Error 404</p>
            <h1 className="font-display mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
              This page wandered off.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md leading-7">
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
  );
};

export default NotFound;
