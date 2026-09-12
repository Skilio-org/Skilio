import { ArrowRight, Code2, Palette, Sparkles, TrendingUp } from "lucide-react"

const categories = [
  {
    icon: Code2,
    name: "Development & IT",
    detail: "Web, mobile, cloud, and infrastructure",
  },
  {
    icon: Palette,
    name: "Design & Creative",
    detail: "Product, brand, research, and content",
  },
  {
    icon: TrendingUp,
    name: "Sales & Marketing",
    detail: "Strategy, growth, SEO, and campaigns",
  },
  {
    icon: Sparkles,
    name: "AI Services",
    detail: "Automation, applied AI, and evaluation",
  },
]

export function LandingCategories() {
  return (
    <section
      id="categories"
      className="border-border border-b px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1344px]">
        <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-brand-700 text-sm font-semibold">
              Explore expertise
            </p>
            <h2 className="font-display mt-3 max-w-md text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
              Start with the skill. Find the person.
            </h2>
          </div>
          <div className="border-border border-t">
            {categories.map((category) => (
              <a
                key={category.name}
                href="#talent"
                className="border-border hover:bg-muted group grid min-h-24 grid-cols-[auto_1fr_auto] items-center gap-4 border-b transition-colors sm:gap-6 sm:px-4"
              >
                <category.icon
                  className="text-brand-600 size-5"
                  aria-hidden="true"
                />
                <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                  <h3 className="font-display text-lg font-semibold sm:text-xl">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm sm:mt-0">
                    {category.detail}
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-brand-600 size-5 transition-transform group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
