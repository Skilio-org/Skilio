export type Entry = {
  id: string
  title: string
  organization: string
  detail: string
  url: string
}
export type Profile = {
  name: string
  title: string
  location: string
  photo: string
  category: string
  skills: string[]
  bio: string
  languages: string
  rate: string
  availability: string
  hours: string
  experience: Entry[]
  education: Entry[]
  portfolio: Entry[]
  finished: boolean
}
export const empty: Profile = {
  name: "",
  title: "",
  location: "",
  photo: "",
  category: "",
  skills: [],
  bio: "",
  languages: "",
  rate: "",
  availability: "",
  hours: "",
  experience: [],
  education: [],
  portfolio: [],
  finished: false,
}

export function restoreProfile(value: unknown): Profile {
  if (!value || typeof value !== "object") return { ...empty }
  const source = value as Record<string, unknown>
  const result = { ...empty }
  for (const name of [
    "name",
    "title",
    "location",
    "photo",
    "category",
    "bio",
    "languages",
    "rate",
    "availability",
    "hours",
  ] as const) {
    result[name] = typeof source[name] === "string" ? source[name] : ""
  }
  result.skills = Array.isArray(source.skills)
    ? source.skills
        .filter((s): s is string => typeof s === "string")
        .slice(0, 15)
    : []
  for (const name of ["experience", "education", "portfolio"] as const) {
    result[name] = Array.isArray(source[name])
      ? source[name].filter(
          (entry): entry is Entry =>
            !!entry &&
            typeof entry === "object" &&
            ["id", "title", "organization", "detail", "url"].every(
              (key) => typeof entry[key] === "string",
            ),
        )
      : []
  }
  result.finished = source.finished === true
  return result
}
export const steps = [
  "The basics",
  "Your expertise",
  "Your introduction",
  "Work & education",
  "Portfolio",
  "Rates & availability",
  "Review",
]
export const descriptions = [
  "Put a face and a name to your work.",
  "Help clients find you for the work you do best.",
  "Tell clients what you bring to their project.",
  "Give your work some context. You can add these later.",
  "Show the thinking and craft behind your work.",
  "Set expectations for your next collaboration.",
  "Take a moment to see your profile as a client would.",
]
export const suggested = [
  "Product design",
  "UX research",
  "Figma",
  "React",
  "TypeScript",
  "Python",
  "Brand strategy",
  "Copywriting",
  "SEO",
  "Video editing",
  "AI automation",
  "Webflow",
]
export const fieldClass =
  "mt-2 min-h-12 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
export const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
export const secondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

export function completion(p: Profile) {
  return [
    !!(p.name.trim() && p.title.trim() && p.location.trim()),
    !!(p.category && p.skills.length),
    p.bio.trim().length >= 80 && !!p.languages.trim(),
    p.experience.length > 0 || p.education.length > 0,
    p.portfolio.length > 0,
    Number.isFinite(Number(p.rate)) &&
      Number(p.rate) > 0 &&
      !!p.availability &&
      !!p.hours,
  ]
}
