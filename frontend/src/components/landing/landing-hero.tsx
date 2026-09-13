import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-container grid items-center gap-10 py-12 md:grid-cols-[1.08fr_1fr] md:gap-12 md:py-16 lg:gap-16 lg:py-20">
        <div className="hero-copy min-w-0">
          <p className="text-muted-foreground mb-6 text-sm font-medium">Independent talent. Shared ambition.</p>
          <h1 className="font-display text-[clamp(2.85rem,5.6vw,5.4rem)] leading-[1.04] font-medium tracking-[-0.055em]">
            Good people.
            <br />
            <span className="text-primary">Great work.</span>
          </h1>
          <p className="text-muted-foreground mt-7 max-w-[27rem] text-base leading-7 lg:text-lg lg:leading-8">
            Find independent talent with the skills, experience, and care your next project deserves.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
            <a href="#talent" className="landing-primary">
              Find talent <ArrowUpRight className="size-4" />
            </a>
            <Link to="/signup" search={{ role: "freelancer" }} className="landing-text-link">
              Find work <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
        <figure className="hero-image min-w-0">
          <div className="bg-muted overflow-hidden rounded-2xl">
            <img
              src="/assets/images/landing-studio-v2.webp"
              srcSet="/assets/images/landing-studio-v2-small.webp 800w, /assets/images/landing-studio-v2.webp 1448w"
              sizes="(min-width: 1280px) 550px, (min-width: 768px) 45vw, calc(100vw - 40px)"
              alt="Creative professional arranging visual studies in a daylight studio"
              width={1448}
              height={1086}
              fetchPriority="high"
              className="aspect-[1.12] w-full object-cover md:aspect-[.98]"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
