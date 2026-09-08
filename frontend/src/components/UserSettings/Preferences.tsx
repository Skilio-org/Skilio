import {
  Bell,
  Check,
  Eye,
  type LucideIcon,
  Mail,
  MessageSquare,
  Monitor,
  Moon,
  Search,
  ShieldCheck,
  Smartphone,
  Sun,
  UserRoundSearch,
} from "lucide-react"
import { useState } from "react"

import { type Theme, useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    messages: true,
    recommendations: true,
    account: true,
    digest: false,
  })

  return (
    <SettingsPanel
      eyebrow="Communication"
      title="Notifications"
      description="Choose which updates deserve your attention and where you receive them."
      icon={Bell}
    >
      <div className="divide-y divide-border">
        <ToggleRow
          icon={MessageSquare}
          title="New messages"
          description="Replies and new conversations from freelancers."
          checked={settings.messages}
          onChange={(checked) =>
            setSettings((current) => ({ ...current, messages: checked }))
          }
          channel="Email & in-app"
        />
        <ToggleRow
          icon={UserRoundSearch}
          title="Talent recommendations"
          description="Shortlists and professionals matched to your interests."
          checked={settings.recommendations}
          onChange={(checked) =>
            setSettings((current) => ({
              ...current,
              recommendations: checked,
            }))
          }
          channel="Weekly"
        />
        <ToggleRow
          icon={ShieldCheck}
          title="Security and account"
          description="Important sign-in, password, and account notices."
          checked={settings.account}
          onChange={(checked) =>
            setSettings((current) => ({ ...current, account: checked }))
          }
          channel="Always on"
          locked
        />
        <ToggleRow
          icon={Mail}
          title="Product digest"
          description="Occasional platform tips and new feature announcements."
          checked={settings.digest}
          onChange={(checked) =>
            setSettings((current) => ({ ...current, digest: checked }))
          }
          channel="Monthly"
        />
      </div>
      <PanelFooter label="Notification preferences are saved automatically." />
    </SettingsPanel>
  )
}

export function PrivacySettings() {
  const [personalization, setPersonalization] = useState(true)
  const [recentSearches, setRecentSearches] = useState(true)
  const [archiveRequested, setArchiveRequested] = useState(false)

  return (
    <div className="space-y-5">
      <SettingsPanel
        eyebrow="Privacy"
        title="Personalization & data"
        description="Control how your activity is used to improve talent discovery."
        icon={Eye}
      >
        <div className="divide-y divide-border">
          <ToggleRow
            icon={UserRoundSearch}
            title="Personalized recommendations"
            description="Use saved profiles and browsing activity to improve your matches."
            checked={personalization}
            onChange={setPersonalization}
            channel="Recommended"
          />
          <ToggleRow
            icon={Search}
            title="Remember recent searches"
            description="Keep recent talent searches available across your sessions."
            checked={recentSearches}
            onChange={setRecentSearches}
            channel="On this account"
          />
        </div>
      </SettingsPanel>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <h3 className="font-display text-lg font-semibold">
              Download your account data
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Request a portable copy of your profile, saved talent, and
              conversation history.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setArchiveRequested(true)}
            className="self-start"
          >
            {archiveRequested ? "Archive requested" : "Request archive"}
          </Button>
        </div>
        {archiveRequested && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Check className="size-4" />
            We'll notify you when your account archive is ready.
          </p>
        )}
      </section>
    </div>
  )
}

const themes: {
  value: Theme
  title: string
  description: string
  icon: LucideIcon
}[] = [
  {
    value: "light",
    title: "Light",
    description: "Clean and bright",
    icon: Sun,
  },
  {
    value: "dark",
    title: "Dark",
    description: "Easy on the eyes",
    icon: Moon,
  },
  {
    value: "system",
    title: "System",
    description: "Match your device",
    icon: Monitor,
  },
]

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <SettingsPanel
      eyebrow="Display"
      title="Appearance"
      description="Select the visual theme that feels best for your workspace."
      icon={Monitor}
    >
      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
        {themes.map((option) => {
          const Icon = option.icon
          const selected = theme === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={selected}
              className={cn(
                "group relative min-h-44 overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected
                  ? "border-brand-500 ring-4 ring-brand-100 dark:ring-brand-950"
                  : "border-border",
              )}
            >
              <span
                className={cn(
                  "absolute inset-x-4 top-4 h-20 overflow-hidden rounded-lg border",
                  option.value === "dark"
                    ? "border-slate-700 bg-slate-950"
                    : "border-slate-200 bg-white",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-2 top-2 h-2 rounded-full",
                    option.value === "dark" ? "bg-slate-800" : "bg-slate-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-2 left-2 top-7 w-1/4 rounded",
                    option.value === "dark" ? "bg-slate-800" : "bg-slate-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-2 left-[34%] right-2 top-7 rounded",
                    option.value === "dark" ? "bg-slate-900" : "bg-[#eef3ff]",
                  )}
                />
              </span>
              <span className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {option.title}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {option.description}
                  </span>
                </span>
                {selected && (
                  <span className="ml-auto grid size-5 place-items-center rounded-full bg-brand-600 text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
      <PanelFooter label="Your theme preference applies across Freelancer." />
    </SettingsPanel>
  )
}

function SettingsPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <header className="flex items-start gap-4 border-b border-border p-5 sm:p-7">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/50">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </header>
      {children}
    </section>
  )
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  channel,
  checked,
  onChange,
  locked = false,
}: {
  icon: LucideIcon
  title: string
  description: string
  channel: string
  checked: boolean
  onChange: (checked: boolean) => void
  locked?: boolean
}) {
  return (
    <div className="flex items-start gap-3 p-5 sm:items-center sm:gap-4 sm:px-7 sm:py-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{title}</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {channel}
          </span>
        </div>
        <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={title}
        aria-checked={checked}
        disabled={locked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0",
          checked ? "bg-brand-600" : "bg-muted-foreground/25",
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1 size-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  )
}

function PanelFooter({ label }: { label: string }) {
  return (
    <footer className="flex items-center gap-2 border-t border-border bg-muted/30 px-5 py-3 text-xs text-muted-foreground sm:px-7">
      <Smartphone className="size-3.5" />
      {label}
    </footer>
  )
}
