import {
  ArrowUpRight,
  Code2,
  Palette,
  ScanLine,
  TrendingUp,
} from "lucide-react"

const categories = [
  {
    icon: Code2,
    name: "Development & IT",
    detail: "Build something that works.",
    value: "Development",
  },
  {
    icon: Palette,
    name: "Design & Creative",
    detail: "Make your vision tangible.",
    value: "Design",
  },
  {
    icon: TrendingUp,
    name: "Sales & Marketing",
    detail: "Reach the right people.",
    value: "Marketing",
  },
  {
    icon: ScanLine,
    name: "AI Services",
    detail: "Put new possibilities to work.",
    value: "AI",
  },
]

export function LandingCategories({
  onSelect,
}: {
  onSelect: (value: string) => void
}) {
  const selectCategory = (value: string) => {
    onSelect(value)
    document.getElementById("talent")?.scrollIntoView({ block: "start" })
  }
  return (
    <section
      id="categories"
      className="border-border bg-muted/40 scroll-mt-24 border-y py-12 sm:py-16"
    >
      <div className="landing-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            What are you working on?
          </h2>
          <button
            type="button"
            onClick={() => selectCategory("All talent")}
            className="landing-text-link text-sm"
          >
            Explore all talent <ArrowUpRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ icon: Icon, name, detail, value }) => (
            <button
              key={name}
              type="button"
              onClick={() => selectCategory(value)}
              className="category-link group border-border bg-card hover:border-primary/40 hover:bg-accent rounded-xl border p-6 text-left transition-colors"
            >
              <span className="mb-8 flex justify-between">
                <Icon className="text-primary size-6" strokeWidth={1.5} />
                <ArrowUpRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="block font-medium tracking-tight">{name}</span>
              <span className="text-muted-foreground mt-2 block text-sm">
                {detail}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
