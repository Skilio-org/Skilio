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
} from "lucide-react";
import { useState } from "react";

import { type Theme, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccountRole } from "@/hooks/useAccountRole";

export function NotificationSettings() {
  const freelancer = useAccountRole() === "freelancer";
  const [settings, setSettings] = useState({
    messages: true,
    recommendations: true,
    account: true,
    digest: false,
  });

  return (
    <SettingsPanel
      eyebrow="Communication"
      title="Notifications"
      description="Choose which updates deserve your attention and where you receive them."
      icon={Bell}
    >
      <div className="divide-border divide-y">
        <ToggleRow
          icon={MessageSquare}
          title="New messages"
          description={`Replies and new conversations from ${freelancer ? "clients" : "freelancers"}.`}
          checked={settings.messages}
          onChange={(checked) => setSettings((current) => ({ ...current, messages: checked }))}
          channel="Email & in-app"
        />
        <ToggleRow
          icon={UserRoundSearch}
          title={freelancer ? "Job recommendations" : "Talent recommendations"}
          description={freelancer ? "Projects matched to your skills and interests." : "Shortlists and professionals matched to your interests."}
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
          onChange={(checked) => setSettings((current) => ({ ...current, account: checked }))}
          channel="Always on"
          locked
        />
        <ToggleRow
          icon={Mail}
          title="Product digest"
          description="Occasional platform tips and new feature announcements."
          checked={settings.digest}
          onChange={(checked) => setSettings((current) => ({ ...current, digest: checked }))}
          channel="Monthly"
        />
      </div>
      <PanelFooter label="Notification preferences are saved automatically." />
    </SettingsPanel>
  );
}

export function PrivacySettings() {
  const freelancer = useAccountRole() === "freelancer";
  const [personalization, setPersonalization] = useState(true);
  const [recentSearches, setRecentSearches] = useState(true);
  const [archiveRequested, setArchiveRequested] = useState(false);

  return (
    <div className="space-y-5">
      <SettingsPanel
        eyebrow="Privacy"
        title="Personalization & data"
        description={`Control how your activity is used to improve ${freelancer ? "job discovery" : "talent discovery"}.`}
        icon={Eye}
      >
        <div className="divide-border divide-y">
          <ToggleRow
            icon={UserRoundSearch}
            title="Personalized recommendations"
            description={`Use saved ${freelancer ? "jobs" : "profiles"} and browsing activity to improve your matches.`}
            checked={personalization}
            onChange={setPersonalization}
            channel="Recommended"
          />
          <ToggleRow
            icon={Search}
            title="Remember recent searches"
            description={`Keep recent ${freelancer ? "job" : "talent"} searches available across your sessions.`}
            checked={recentSearches}
            onChange={setRecentSearches}
            channel="On this account"
          />
        </div>
      </SettingsPanel>

      <section className="border-border bg-card shadow-card rounded-2xl border p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <h3 className="font-display text-lg font-semibold">Download your account data</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              Request a portable copy of your profile, saved {freelancer ? "jobs" : "talent"}, and conversation history.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => setArchiveRequested(true)} className="self-start">
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
  );
}

const themes: {
  value: Theme;
  title: string;
  description: string;
  icon: LucideIcon;
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
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsPanel
      eyebrow="Display"
      title="Appearance"
      description="Select the visual theme that feels best for your workspace."
      icon={Monitor}
    >
      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
        {themes.map((option) => {
          const Icon = option.icon;
          const selected = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={selected}
              className={cn(
                "group hover:shadow-card focus-visible:outline-ring relative min-h-44 overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2",
                selected ? "border-brand-500 ring-brand-100 dark:ring-brand-950 ring-4" : "border-border",
              )}
            >
              <span
                className={cn(
                  "absolute inset-x-4 top-4 h-20 overflow-hidden rounded-lg border",
                  option.value === "dark" ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white",
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
                    "absolute top-7 bottom-2 left-2 w-1/4 rounded",
                    option.value === "dark" ? "bg-slate-800" : "bg-slate-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute top-7 right-2 bottom-2 left-[34%] rounded",
                    option.value === "dark" ? "bg-slate-900" : "bg-[#eef3ff]",
                  )}
                />
              </span>
              <span className="absolute right-4 bottom-4 left-4 flex items-center gap-3">
                <span className="bg-muted text-muted-foreground group-hover:text-foreground grid size-9 place-items-center rounded-lg">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{option.title}</span>
                  <span className="text-muted-foreground block text-[11px]">{option.description}</span>
                </span>
                {selected && (
                  <span className="bg-brand-600 ml-auto grid size-5 place-items-center rounded-full text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <PanelFooter label="Your theme preference applies across Freelancer." />
    </SettingsPanel>
  );
}

function SettingsPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
      <header className="border-border flex items-start gap-4 border-b p-5 sm:p-7">
        <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/50 grid size-11 shrink-0 place-items-center rounded-xl">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-brand-700 text-xs font-semibold tracking-[0.16em] uppercase">{eyebrow}</p>
          <h2 className="font-display mt-1 text-2xl font-semibold">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
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
  icon: LucideIcon;
  title: string;
  description: string;
  channel: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-5 sm:items-center sm:gap-4 sm:px-7 sm:py-5">
      <span className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-xl">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{title}</p>
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
            {channel}
          </span>
        </div>
        <p className="text-muted-foreground mt-1 max-w-xl text-xs leading-5 sm:text-sm">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={title}
        aria-checked={checked}
        disabled={locked}
        onClick={() => onChange(!checked)}
        className={cn(
          "focus-visible:outline-ring relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0",
          checked ? "bg-brand-600" : "bg-muted-foreground/25",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

function PanelFooter({ label }: { label: string }) {
  return (
    <footer className="border-border bg-muted/30 text-muted-foreground flex items-center gap-2 border-t px-5 py-3 text-xs sm:px-7">
      <Smartphone className="size-3.5" />
      {label}
    </footer>
  );
}
