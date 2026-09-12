export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-border border-y px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1344px]">
        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
          <div>
            <h2 className="font-display text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
              A clearer way to choose.
            </h2>
            <p className="text-muted-foreground mt-5 max-w-md text-lg leading-8">
              Search, compare, and connect without wading through noisy feeds or
              irrelevant listings.
            </p>
          </div>
          <ol className="border-border border-t">
            {[
              [
                "Search with context",
                "Filter by expertise, location, rate, and availability.",
              ],
              [
                "Review relevant work",
                "Compare portfolios, experience, feedback, and work history.",
              ],
              [
                "Contact your shortlist",
                "Message the professionals whose work fits the brief.",
              ],
            ].map(([title, copy]) => (
              <li
                key={title}
                className="border-border grid gap-3 border-b py-7 sm:grid-cols-[.8fr_1.2fr] sm:items-start sm:gap-8"
              >
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground leading-7">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
