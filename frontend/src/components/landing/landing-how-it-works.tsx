export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-slate-200 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1344px]">
        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
          <div>
            <p className="text-brand-700 text-sm font-semibold">How it works</p>
            <h2 className="font-display mt-3 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
              A clearer way to choose.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
              Search, compare, and connect without wading through noisy feeds or irrelevant listings.
            </p>
          </div>
          <ol className="border-t border-slate-300">
            {[
              ["01", "Search with context", "Filter by expertise, location, rate, and availability."],
              ["02", "Evaluate real evidence", "Review portfolios, experience, feedback, and work history."],
              ["03", "Save and connect", "Build a shortlist and message the people who stand out."],
            ].map(([number, title, copy]) => (
              <li
                key={number}
                className="grid gap-3 border-b border-slate-300 py-7 sm:grid-cols-[72px_1fr_1fr] sm:items-start sm:gap-6"
              >
                <span className="text-brand-700 font-mono text-sm">{number}</span>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="leading-7 text-slate-600">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
