import { createFileRoute } from "@tanstack/react-router"
import { Bell, Eye, KeyRound, Palette, Trash2, UserRound } from "lucide-react"
import { z } from "zod"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChangePassword from "@/components/user-settings/change-password"
import DeleteAccount from "@/components/user-settings/delete-account"
import {
  AppearanceSettings,
  NotificationSettings,
  PrivacySettings,
} from "@/components/user-settings/preferences"
import UserInformation from "@/components/user-settings/user-information"

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
  const { section = "profile" } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <div className="space-y-7">
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
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
              Settings
            </p>
          </div>
          <TabsList className="border-border bg-card shadow-card flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border p-2 lg:flex-col lg:overflow-visible">
            {settingsSections.map((section) => {
              const Icon = section.icon
              return (
                <TabsTrigger
                  key={section.value}
                  value={section.value}
                  className={`group data-[state=active]:bg-brand-50 data-[state=active]:text-brand-800 dark:data-[state=active]:bg-brand-950/50 dark:data-[state=active]:text-brand-200 h-auto min-h-12 min-w-fit justify-start rounded-xl border-0 px-3 py-2.5 text-left shadow-none data-[state=active]:shadow-none lg:w-full ${
                    section.destructive
                      ? "text-destructive data-[state=active]:bg-danger-soft data-[state=active]:text-destructive"
                      : ""
                  }`}
                >
                  <span className="bg-muted text-muted-foreground group-data-[state=active]:bg-card group-data-[state=active]:text-brand-700 grid size-9 shrink-0 place-items-center rounded-lg transition">
                    <Icon className="size-4" />
                  </span>
                  <span className="hidden min-w-0 flex-1 lg:block">
                    <span className="block text-sm font-semibold">
                      {section.title}
                    </span>
                    <span className="text-muted-foreground mt-0.5 block text-[11px] font-normal">
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
