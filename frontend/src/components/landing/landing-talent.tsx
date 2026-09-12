import { Link } from "@tanstack/react-router"
import { ArrowRight, MapPin } from "lucide-react"

import { freelancers } from "@/data/freelancers"

const people = freelancers.slice(0, 3)

export function LandingTalent() {
  return (
    <section
      id="talent"
      className="bg-muted px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1344px]">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-medium tracking-[-0.035em] text-balance sm:text-5xl">
            Work worth looking through.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-8">
            Compare specialties, working styles, and recent experience before
            you start a conversation.
          </p>
        </div>

        <div className="border-border mt-10 grid border-y lg:grid-cols-[1.15fr_.85fr]">
          {people.map((person, index) => (
            <article
              key={person.id}
              className={
                index === 0
                  ? "border-border px-0 py-9 sm:p-9 lg:row-span-2 lg:border-r lg:p-12"
                  : `border-border px-0 py-9 sm:p-9 lg:p-10 ${index === 2 ? "border-t" : ""}`
              }
            >
              {index === 0 && (
                <img
                  src="/assets/images/featured-product-designer.png"
                  alt="Product designer reviewing sketches in her studio"
                  width={1448}
                  height={1086}
                  loading="lazy"
                  className="mb-10 aspect-4/3 w-full rounded-xl object-cover"
                />
              )}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3
                    className={`font-display font-semibold tracking-[-0.025em] ${index === 0 ? "text-3xl sm:text-4xl" : "text-2xl"}`}
                  >
                    {person.name}
                  </h3>
                  <p className="text-muted-foreground mt-2">{person.title}</p>
                </div>
                <p className="shrink-0 font-semibold tabular-nums">
                  ${person.rate}/hr
                </p>
              </div>

              <p
                className={`text-muted-foreground leading-7 ${index === 0 ? "mt-10 max-w-2xl text-lg sm:text-xl sm:leading-8" : "mt-7"}`}
              >
                {person.bio}
              </p>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
                {person.skills.slice(0, index === 0 ? 4 : 3).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <p className="text-muted-foreground mt-8 flex items-center gap-2 text-sm">
                <MapPin className="size-4" aria-hidden="true" />
                {person.location}
              </p>
            </article>
          ))}
        </div>

        <Link
          to="/signup"
          className="text-brand-700 hover:text-brand-800 mt-8 inline-flex min-h-11 items-center gap-2 font-semibold"
        >
          Create account <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
