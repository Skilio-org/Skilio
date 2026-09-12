export function LandingStats() {
  return (
    <section aria-label="Platform statistics" className="border-b border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-white/15 lg:grid-cols-4">
        {[
          ["12k+", "reviewed profiles"],
          ["140", "specialist disciplines"],
          ["92", "countries represented"],
          ["4.9/5", "average talent rating"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="border-b border-white/15 px-5 py-8 last:border-b-0 sm:px-8 lg:border-b-0 lg:px-12"
          >
            <p className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{value}</p>
            <p className="mt-1 text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
