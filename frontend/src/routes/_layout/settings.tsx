import { createFileRoute } from "@tanstack/react-router"
import {
  Bell,
  Eye,
  KeyRound,
  Palette,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react"
import { z } from "zod"

import { Monogram } from "@/components/Common/WorkspaceUI"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import {
  AppearanceSettings,
  NotificationSettings,
  PrivacySettings,
} from "@/components/UserSettings/Preferences"
import UserInformation from "@/components/UserSettings/UserInformation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"

const settingsSectionSchema = z.enum([
  "profile",
  "password",
  "notifications",
  "privacy",
  "appearance",
  "danger-zone",
])

type SettingsSection = z.infer<typeof settingsSectionSchema>

const settingsSections = [
  {
    value: "profile",
    title: "Account profile",
    description: "Identity and contact details",
    icon: UserRound,
    component: UserInformation,
  },
  {
    value: "password",
    title: "Login & security",
    description: "Password and protection",
    icon: KeyRound,
    component: ChangePassword,
  },
  {
    value: "notifications",
    title: "Notifications",
    description: "Alerts and email updates",
    icon: Bell,
    component: NotificationSettings,
  },
  {
    value: "privacy",
    title: "Privacy",
    description: "Personalization and data",
    icon: Eye,
    component: PrivacySettings,
  },
  {
    value: "appearance",
    title: "Appearance",
    description: "Theme and display",
    icon: Palette,
    component: AppearanceSettings,
  },
  {
    value: "danger-zone",
    title: "Account deletion",
    description: "Permanently close account",
    icon: Trash2,
    component: DeleteAccount,
    destructive: true,
  },
]

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  validateSearch: z.object({
    section: settingsSectionSchema.optional(),
  }),
  head: () => ({
    meta: [{ title: "Account settings | Freelancer" }],
  }),
})

function UserSettings() {
  const { user: currentUser } = useAuth()
  const { section = "profile" } = Route.useSearch()
  const navigate = Route.useNavigate()

  const displayName = currentUser?.full_name || "Client account"
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-[28px] border border-border bg-card px-5 py-7 shadow-card sm:px-8 sm:py-9">
        <div className="absolute inset-y-0 right-0 w-2/5 bg-gradient-to-l from-brand-50/80 to-transparent dark:from-brand-950/40" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
              <ShieldCheck className="size-4" />
              Client workspace
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Your account, your way.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Manage your identity, security, communication preferences, and how
              Freelancer works for you.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/80 p-3 pr-5 backdrop-blur-sm">
            <Monogram className="size-11 bg-brand-100 text-sm text-brand-800 dark:bg-brand-950 dark:text-brand-200">
              {initials}
            </Monogram>
            <div className="min-w-0">
              <p className="max-w-48 truncate text-sm font-semibold">
                {displayName}
              </p>
              <p className="max-w-48 truncate text-xs text-muted-foreground">
                {currentUser?.email || "client@example.com"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <Tabs
        value={section}
        onValueChange={(value) =>
          navigate({
            search: { section: value as SettingsSection },
            replace: true,
          })
        }
        orientation="vertical"
        className="gap-6 lg:grid lg:grid-cols-[270px_minmax(0,1fr)]"
      >
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 hidden px-2 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Settings
            </p>
          </div>
          <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-card lg:flex-col lg:overflow-visible">
            {settingsSections.map((section) => {
              const Icon = section.icon
              return (
                <TabsTrigger
                  key={section.value}
                  value={section.value}
                  className={`group h-auto min-h-12 min-w-fit justify-start rounded-xl border-0 px-3 py-2.5 text-left shadow-none data-[state=active]:bg-brand-50 data-[state=active]:text-brand-800 data-[state=active]:shadow-none dark:data-[state=active]:bg-brand-950/50 dark:data-[state=active]:text-brand-200 lg:w-full ${
                    section.destructive
                      ? "text-destructive data-[state=active]:bg-danger-soft data-[state=active]:text-destructive"
                      : ""
                  }`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition group-data-[state=active]:bg-card group-data-[state=active]:text-brand-700">
                    <Icon className="size-4" />
                  </span>
                  <span className="hidden min-w-0 flex-1 lg:block">
                    <span className="block text-sm font-semibold">
                      {section.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {section.description}
                    </span>
                  </span>
                  <span className="text-sm font-semibold lg:hidden">
                    {section.title}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>
          <div className="mt-4 hidden rounded-2xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-950/35 lg:block">
            <ShieldCheck className="size-4 text-brand-700" />
            <p className="mt-2 text-xs font-semibold">Account protected</p>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              Your identity and sign-in details are handled securely.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          {settingsSections.map((section) => (
            <TabsContent
              key={section.value}
              value={section.value}
              className="m-0 space-y-5"
            >
              <section.component />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
