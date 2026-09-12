import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  MapPin,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { type ReactNode, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/freelancer")({
  component: FreelancerWorkspace,
  head: () => ({ meta: [{ title: "Your freelancer profile | Freelancer" }] }),
})

type Entry = {
  id: string
  title: string
  organization: string
  detail: string
  url: string
}
type Profile = {
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
const empty: Profile = {
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

function restoreProfile(value: unknown): Profile {
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
const steps = [
  "The basics",
  "Your expertise",
  "Your introduction",
  "Work & education",
  "Portfolio",
  "Rates & availability",
  "Review",
]
const descriptions = [
  "Put a face and a name to your work.",
  "Help clients find you for the work you do best.",
  "Tell clients what you bring to their project.",
  "Give your work some context. You can add these later.",
  "Show the thinking and craft behind your work.",
  "Set expectations for your next collaboration.",
  "Take a moment to see your profile as a client would.",
]
const suggested = [
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
const fieldClass =
  "mt-2 min-h-12 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
const secondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

function completion(p: Profile) {
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

function FreelancerWorkspace() {
  const { user } = useAuth()
  const key = `freelancer-profile-v1:${user?.id ?? "preview"}`
  const [profile, setProfile] = useState<Profile>(empty)
  const [loadedKey, setLoadedKey] = useState("")
  const [view, setView] = useState<"home" | "edit" | "preview">("home")
  const [step, setStep] = useState(0)
  const [error, setError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [skill, setSkill] = useState("")
  const [editor, setEditor] = useState<{
    kind: "experience" | "education" | "portfolio"
    entry: Entry
  } | null>(null)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      const parsed = restoreProfile(stored ? JSON.parse(stored) : null)
      setProfile({
        ...empty,
        ...parsed,
        name: parsed.name || user?.full_name || "",
      })
    } catch {
      setSaveError("We couldn’t restore this draft. You can start again here.")
    }
    setLoadedKey(key)
  }, [key, user?.full_name])
  useEffect(() => {
    if (loadedKey !== key) return
    try {
      localStorage.setItem(key, JSON.stringify(profile))
      setSaveError("")
    } catch {
      setSaveError(
        "Your latest changes couldn’t be saved on this device. Free up browser storage and try again.",
      )
    }
  }, [profile, loadedKey, key])
  const update = <K extends keyof Profile>(name: K, value: Profile[K]) =>
    setProfile((p) => ({
      ...p,
      [name]: value,
      finished: name === "finished" ? Boolean(value) : false,
    }))
  const done = completion(profile)
  const percent = Math.round((done.filter(Boolean).length / done.length) * 100)
  function edit(index: number) {
    setStep(index)
    setError("")
    setView("edit")
  }
  function next() {
    if ([0, 1, 2, 5].includes(step) && !done[step]) {
      setError(
        step === 2
          ? "Add an introduction of at least 80 characters and your languages."
          : "Complete the required fields before continuing.",
      )
      return
    }
    setError("")
    setStep((s) => Math.min(s + 1, 6))
  }
  function addSkill(value: string) {
    const text = value.trim()
    if (
      !text ||
      profile.skills.some((s) => s.toLowerCase() === text.toLowerCase())
    )
      return
    if (profile.skills.length >= 15) {
      setError("Choose up to 15 skills.")
      return
    }
    update("skills", [...profile.skills, text.slice(0, 40)])
    setSkill("")
    setError("")
  }
  async function upload(file?: File) {
    if (!file) return
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError("Choose a JPG, PNG or WebP image under 2 MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      update("photo", String(reader.result))
      setError("")
    }
    reader.onerror = () =>
      setError("This image couldn’t be read. Try another file.")
    reader.readAsDataURL(file)
  }
  const input = (
    label: string,
    name: "name" | "title" | "location" | "languages" | "rate",
    placeholder: string,
    type = "text",
  ) => (
    <label className="block text-sm font-medium">
      {label}
      <input
        className={fieldClass}
        value={profile[name]}
        onChange={(e) => update(name, e.target.value)}
        placeholder={placeholder}
        type={type}
        min={type === "number" ? "1" : undefined}
        maxLength={120}
      />
    </label>
  )
  const select = (
    label: string,
    name: "category" | "availability" | "hours",
    options: string[],
  ) => (
    <label className="block text-sm font-medium">
      {label}
      <select
        className={fieldClass}
        value={profile[name]}
        onChange={(e) => update(name, e.target.value)}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Freelancer workspace
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            {view === "home"
              ? "Your next chapter starts here."
              : view === "preview"
                ? "Profile preview"
                : "Let’s build your profile."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {view === "home"
              ? "A little about you. A lot of possibility."
              : "Make it easy for the right clients to find you."}
          </p>
        </div>
        <div className="flex gap-2">
          {view !== "home" && (
            <button
              className={secondary}
              onClick={() => setView("home")}
              type="button"
            >
              <ArrowLeft className="size-4" /> Workspace
            </button>
          )}
          {view !== "preview" && (
            <button
              className={secondary}
              onClick={() => setView("preview")}
              type="button"
            >
              <Eye className="size-4" /> Preview
            </button>
          )}
        </div>
      </header>
      {saveError && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {saveError}
        </p>
      )}
      {view === "home" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium">
                  {profile.finished
                    ? "Profile draft complete"
                    : "Make a strong first impression"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {done.filter(Boolean).length} of 6 sections
                </span>
              </div>
              <div
                className="my-5 h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Profile completion"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Your profile is {percent}% complete
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Introduce yourself, choose your skills, and show a little of
                what you can do. You can come back and edit anything.
              </p>
              <button
                type="button"
                className={`${primary} mt-6`}
                onClick={() =>
                  edit(
                    Math.max(
                      0,
                      done.findIndex((v) => !v),
                    ),
                  )
                }
              >
                {percent ? "Continue your profile" : "Get started"}
                <ArrowRight className="size-4" />
              </button>
            </section>
            <section>
              <h2 className="mb-4 text-lg font-semibold">
                Your profile checklist
              </h2>
              <div className="divide-y divide-border rounded-xl border border-border bg-card">
                {steps.slice(0, 6).map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    className="flex w-full items-center gap-4 p-5 text-left hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => edit(i)}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full ${done[i] ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}
                    >
                      {done[i] ? <Check className="size-4" /> : i + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">
                        {name}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {descriptions[i]}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </section>
          </div>
          <aside className="space-y-5">
            <section className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Profile status
              </p>
              <h2 className="mt-3 text-lg font-semibold">
                {profile.finished ? "Ready for publishing" : "Private draft"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your profile is only visible to you. Publishing and identity
                review aren’t available yet.
              </p>
              <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
                Drafts are saved in this browser. Use the same device to pick up
                where you left off.
              </p>
            </section>
            <section className="p-2">
              <h2 className="font-semibold">A profile that sounds like you</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Be specific about the problems you solve. A clear introduction
                and one thoughtful project tell clients more than a long list of
                buzzwords.
              </p>
            </section>
          </aside>
        </div>
      ) : view === "preview" ? (
        <>
          <ProfilePreview profile={profile} />
          <div className="mt-6 flex justify-end">
            <button className={primary} type="button" onClick={() => edit(0)}>
              Edit profile
            </button>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="min-w-0">
            <nav
              aria-label="Profile setup steps"
              className="flex gap-2 overflow-x-auto pb-3 lg:block lg:space-y-1"
            >
              {steps.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  aria-current={step === i ? "step" : undefined}
                  onClick={() => edit(i)}
                  className={`flex min-h-12 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-sm lg:w-full ${step === i ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <span
                    className={`grid size-6 place-items-center rounded-full border ${step === i ? "border-primary" : "border-border"}`}
                  >
                    {done[i] ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  {name}
                </button>
              ))}
            </nav>
            <p className="mt-6 hidden text-xs leading-5 text-muted-foreground lg:block">
              Your progress is saved as you go.
              <br />
              You can finish this later.
            </p>
          </aside>
          <section className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-8">
            <p className="text-xs font-medium text-muted-foreground">
              STEP {step + 1} OF 7
              {step === 3 || step === 4 ? " · OPTIONAL" : ""}
            </p>
            <h2
              tabIndex={-1}
              className="mt-3 text-2xl font-semibold tracking-tight"
            >
              {steps[step]}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {descriptions[step]}
            </p>
            <div className="mt-8 space-y-6">
              {step === 0 && (
                <>
                  <div className="flex items-center gap-5">
                    <Avatar profile={profile} />
                    <div>
                      <label className={`${secondary} cursor-pointer`}>
                        <Upload className="size-4" /> Add photo
                        <input
                          aria-label="Upload profile photo"
                          className="sr-only"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) => void upload(e.target.files?.[0])}
                        />
                      </label>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Optional · JPG, PNG or WebP, up to 2 MB
                      </p>
                      {profile.photo && (
                        <button
                          type="button"
                          className="mt-2 text-xs text-destructive underline"
                          onClick={() => update("photo", "")}
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                  </div>
                  {input("Full name *", "name", "Your name")}
                  {input(
                    "Professional title *",
                    "title",
                    "e.g. Product designer for early-stage teams",
                  )}
                  {input(
                    "City and country *",
                    "location",
                    "e.g. Casablanca, Morocco",
                  )}
                </>
              )}
              {step === 1 && (
                <>
                  {select("Main area of work *", "category", [
                    "Design & creative",
                    "Development & IT",
                    "Sales & marketing",
                    "Writing & translation",
                    "Video & audio",
                    "Business & consulting",
                    "AI & automation",
                  ])}
                  <div>
                    <label
                      htmlFor="skill-entry"
                      className="text-sm font-medium"
                    >
                      Your skills *{" "}
                      <span className="font-normal text-muted-foreground">
                        ({profile.skills.length}/15)
                      </span>
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        id="skill-entry"
                        className={fieldClass.replace("mt-2", "")}
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        maxLength={40}
                        placeholder="Add a skill"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addSkill(skill)
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={secondary}
                        onClick={() => addSkill(skill)}
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {profile.skills.map((s) => (
                        <button
                          type="button"
                          key={s}
                          aria-label={`Remove ${s}`}
                          className="flex min-h-10 items-center gap-2 rounded-lg bg-primary/10 px-3 text-sm text-primary"
                          onClick={() =>
                            update(
                              "skills",
                              profile.skills.filter((v) => v !== s),
                            )
                          }
                        >
                          {s}
                          <X className="size-3" />
                        </button>
                      ))}
                    </div>
                    <p className="mt-6 text-xs text-muted-foreground">
                      Suggestions
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggested
                        .filter((s) => !profile.skills.includes(s))
                        .map((s) => (
                          <button
                            type="button"
                            className={secondary}
                            key={s}
                            onClick={() => addSkill(s)}
                          >
                            <Plus className="size-3" />
                            {s}
                          </button>
                        ))}
                    </div>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <label className="block text-sm font-medium">
                    About you *
                    <textarea
                      className={fieldClass}
                      rows={8}
                      maxLength={3000}
                      value={profile.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      placeholder="What do you do, who do you help, and what makes your approach different?"
                    />
                    <span className="mt-2 flex justify-between text-xs font-normal text-muted-foreground">
                      <span>
                        At least 80 characters. Write in your own voice.
                      </span>
                      <span>{profile.bio.length}/3000</span>
                    </span>
                  </label>
                  {input(
                    "Languages and proficiency *",
                    "languages",
                    "e.g. English — fluent, Arabic — native",
                  )}
                </>
              )}
              {(step === 3 || step === 4) &&
                (step === 3
                  ? (["experience", "education"] as const)
                  : (["portfolio"] as const)
                ).map((kind) => (
                  <section key={kind}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">
                        {kind === "experience"
                          ? "Work experience"
                          : kind === "education"
                            ? "Education"
                            : "Selected projects"}
                      </h3>
                      <button
                        className={secondary}
                        type="button"
                        onClick={() =>
                          setEditor({
                            kind,
                            entry: {
                              id: crypto.randomUUID(),
                              title: "",
                              organization: "",
                              detail: "",
                              url: "",
                            },
                          })
                        }
                      >
                        <Plus className="size-4" />
                        Add
                      </button>
                    </div>
                    {profile[kind].length ? (
                      <div className="space-y-3">
                        {profile[kind].map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-start gap-3 rounded-lg border border-border p-4"
                          >
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left"
                              onClick={() => setEditor({ kind, entry })}
                            >
                              <span className="block font-medium">
                                {entry.title}
                              </span>
                              <span className="mt-1 block text-sm text-muted-foreground">
                                {entry.organization}
                              </span>
                              <span className="mt-2 block truncate text-xs text-muted-foreground">
                                {entry.detail}
                              </span>
                              <span className="mt-3 block text-xs text-primary">
                                Edit details
                              </span>
                            </button>
                            <button
                              type="button"
                              className="grid size-11 place-items-center rounded-lg hover:bg-muted"
                              aria-label={`Remove ${entry.title}`}
                              onClick={() =>
                                update(
                                  kind,
                                  profile[kind].filter(
                                    (e) => e.id !== entry.id,
                                  ),
                                )
                              }
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border p-8 text-center">
                        <p className="text-sm font-medium">
                          {kind === "portfolio"
                            ? "Give your work a place to shine"
                            : `No ${kind} added yet`}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {kind === "portfolio"
                            ? "Add a project, describe your contribution, and link to the finished work. Personal projects count, too."
                            : "Add relevant details, or skip this for now."}
                        </p>
                      </div>
                    )}
                  </section>
                ))}
              {step === 5 && (
                <>
                  {input("Hourly rate (USD) *", "rate", "50", "number")}
                  <p className="text-sm text-muted-foreground">
                    This is the starting rate shown on your profile. Agree on
                    the final scope and price with each client.
                  </p>
                  {select("Availability *", "availability", [
                    "Available now",
                    "Available this week",
                    "Available next month",
                    "Not currently available",
                  ])}
                  {select("Weekly capacity *", "hours", [
                    "Less than 10 hours",
                    "10–20 hours",
                    "20–30 hours",
                    "30+ hours",
                  ])}
                  <div className="rounded-lg bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
                    You can change your rate and availability at any time.
                  </div>
                </>
              )}
              {step === 6 && (
                <>
                  <ProfilePreview profile={profile} compact />
                  <div className="rounded-lg bg-muted p-4 text-sm leading-6 text-muted-foreground">
                    Finishing saves your profile draft. It won’t publish it or
                    submit an identity review.
                  </div>
                  {[0, 1, 2, 5]
                    .filter((i) => !done[i])
                    .map((i) => (
                      <button
                        key={i}
                        className="block text-sm text-destructive underline"
                        type="button"
                        onClick={() => edit(i)}
                      >
                        Complete {steps[i].toLowerCase()}
                      </button>
                    ))}
                </>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-5 text-sm text-destructive">
                {error}
              </p>
            )}
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
              <button
                type="button"
                className={secondary}
                onClick={() => (step ? edit(step - 1) : setView("home"))}
              >
                <ArrowLeft className="size-4" />
                {step ? "Back" : "Save & exit"}
              </button>
              <span className="text-xs text-muted-foreground" role="status">
                {saveError ? "Not saved" : "Saved on this device"}
              </span>
              {step < 6 ? (
                <button type="button" className={primary} onClick={next}>
                  {(step === 3 || step === 4) && !done[step]
                    ? "Skip for now"
                    : "Continue"}
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  className={primary}
                  onClick={() => {
                    if ([0, 1, 2, 5].some((i) => !done[i])) {
                      setError(
                        "Complete the required sections before finishing.",
                      )
                      return
                    }
                    update("finished", true)
                    setView("home")
                  }}
                >
                  <CheckCircle2 className="size-4" />
                  Finish profile
                </button>
              )}
            </footer>
          </section>
        </div>
      )}
      {editor && (
        <EntryDialog
          kind={editor.kind}
          entry={editor.entry}
          close={() => setEditor(null)}
          save={(entry) => {
            const list = profile[editor.kind]
            update(
              editor.kind,
              list.some((e) => e.id === entry.id)
                ? list.map((e) => (e.id === entry.id ? entry : e))
                : [...list, entry],
            )
            setEditor(null)
          }}
        />
      )}
    </div>
  )
}

function Avatar({ profile }: { profile: Profile }) {
  return profile.photo ? (
    <img
      className="size-20 shrink-0 rounded-full object-cover"
      src={profile.photo}
      alt={profile.name || "Profile photo"}
    />
  ) : (
    <span className="grid size-20 shrink-0 place-items-center rounded-full bg-brand-100 text-2xl font-medium text-brand-800">
      {profile.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join("") || "You"}
    </span>
  )
}

function ProfilePreview({
  profile: p,
  compact = false,
}: {
  profile: Profile
  compact?: boolean
}) {
  return (
    <article
      className={
        compact
          ? "space-y-6"
          : "rounded-xl border border-border bg-card p-6 sm:p-10"
      }
    >
      <div className="flex flex-wrap items-center gap-5">
        <Avatar profile={p} />
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-2xl font-semibold">
            {p.name || "Your name"}
          </h2>
          <p className="mt-1 text-lg text-muted-foreground">
            {p.title || "Your professional title"}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {p.location || "Add your location"}
          </p>
        </div>
        <div>
          <p className="text-2xl font-semibold">
            {p.rate ? `$${p.rate}` : "—"}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / hour
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {p.availability || "Availability not set"}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {p.skills.map((s) => (
          <span className="rounded-lg bg-muted px-3 py-2 text-xs" key={s}>
            {s}
          </span>
        ))}
      </div>
      <PreviewSection title="About">
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
          {p.bio || "Your introduction will appear here."}
        </p>
      </PreviewSection>
      {p.languages && (
        <p className="mt-4 text-sm">
          <span className="font-medium">Languages: </span>
          {p.languages}
        </p>
      )}
      {p.hours && (
        <p className="mt-3 text-sm">
          <span className="font-medium">Weekly capacity: </span>
          {p.hours}
        </p>
      )}
      {(["portfolio", "experience", "education"] as const).map(
        (kind) =>
          p[kind].length > 0 && (
            <PreviewSection
              key={kind}
              title={
                kind === "portfolio"
                  ? "Selected work"
                  : kind === "experience"
                    ? "Work experience"
                    : "Education"
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {p[kind].map((e) => (
                  <section
                    className="min-w-0 rounded-lg border border-border p-5"
                    key={e.id}
                  >
                    <h4 className="break-words font-semibold">{e.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {e.organization}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                      {e.detail}
                    </p>
                    {/^https?:\/\//i.test(e.url) && (
                      <a
                        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline"
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View project <ArrowRight className="ml-2 size-4" />
                      </a>
                    )}
                  </section>
                ))}
              </div>
            </PreviewSection>
          ),
      )}
    </article>
  )
}
function PreviewSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="mt-7 border-t border-border pt-6">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function EntryDialog({
  kind,
  entry,
  close,
  save,
}: {
  kind: string
  entry: Entry
  close: () => void
  save: (e: Entry) => void
}) {
  const [value, setValue] = useState(entry)
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {kind === "portfolio"
              ? "Project details"
              : kind === "education"
                ? "Education details"
                : "Experience details"}
          </DialogTitle>
          <DialogDescription>
            Add the details you want clients to see.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            save({ ...value, title: value.title.trim() })
          }}
        >
          <label className="block text-sm font-medium">
            {kind === "portfolio"
              ? "Project title"
              : kind === "education"
                ? "Degree or qualification"
                : "Job title"}{" "}
            *
            <input
              required
              pattern=".*\S.*"
              maxLength={120}
              className={fieldClass}
              value={value.title}
              onChange={(e) => setValue({ ...value, title: e.target.value })}
            />
          </label>
          <label className="block text-sm font-medium">
            {kind === "portfolio"
              ? "Client or personal project"
              : kind === "education"
                ? "School and dates"
                : "Company and dates"}
            <input
              className={fieldClass}
              maxLength={160}
              value={value.organization}
              onChange={(e) =>
                setValue({ ...value, organization: e.target.value })
              }
            />
          </label>
          <label className="block text-sm font-medium">
            {kind === "portfolio"
              ? "Your contribution and results"
              : "Description"}
            <textarea
              rows={4}
              maxLength={2000}
              className={fieldClass}
              value={value.detail}
              onChange={(e) => setValue({ ...value, detail: e.target.value })}
            />
          </label>
          {kind === "portfolio" && (
            <label className="block text-sm font-medium">
              Project link
              <input
                type="url"
                pattern="https?://.*"
                placeholder="https://"
                className={fieldClass}
                value={value.url}
                onChange={(e) => setValue({ ...value, url: e.target.value })}
              />
            </label>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" className={secondary} onClick={close}>
              Cancel
            </button>
            <button className={primary} type="submit">
              Save details
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
