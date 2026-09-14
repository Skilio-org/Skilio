import { ArrowRight, MapPin } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  type Entry,
  fieldClass,
  type Profile,
  primary,
  secondary,
} from "@/components/freelancer/freelancer-profile-model";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Avatar({ profile }: { profile: Profile }) {
  return profile.photo ? (
    <img
      className="size-20 shrink-0 rounded-full object-cover"
      src={profile.photo}
      alt={profile.name || "Profile photo"}
    />
  ) : (
    <span className="bg-brand-100 text-brand-800 grid size-20 shrink-0 place-items-center rounded-full text-2xl font-medium">
      {profile.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join("") || "You"}
    </span>
  );
}

export function ProfilePreview({ profile: p, compact = false }: { profile: Profile; compact?: boolean }) {
  return (
    <article className={compact ? "space-y-6" : "border-border bg-card rounded-xl border p-6 sm:p-10"}>
      <div className="flex flex-wrap items-center gap-5">
        <Avatar profile={p} />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold break-words">{p.name || "Your name"}</h2>
          <p className="text-muted-foreground mt-1 text-lg">{p.title || "Your professional title"}</p>
          <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
            <MapPin className="size-4" />
            {p.location || "Add your location"}
          </p>
        </div>
        <div>
          <p className="text-2xl font-semibold">
            {p.rate ? `$${p.rate}` : "—"}
            <span className="text-muted-foreground text-sm font-normal"> / hour</span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm">{p.availability || "Availability not set"}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {p.skills.map((s) => (
          <span className="bg-muted rounded-lg px-3 py-2 text-xs" key={s}>
            {s}
          </span>
        ))}
      </div>
      <PreviewSection title="About">
        <p className="text-muted-foreground text-sm leading-7 break-words whitespace-pre-wrap">
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
              title={kind === "portfolio" ? "Selected work" : kind === "experience" ? "Work experience" : "Education"}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {p[kind].map((e) => (
                  <section className="border-border min-w-0 rounded-lg border p-5" key={e.id}>
                    <h4 className="font-semibold break-words">{e.title}</h4>
                    <p className="text-muted-foreground mt-1 text-sm">{e.organization}</p>
                    <p className="text-muted-foreground mt-3 text-sm leading-6 break-words whitespace-pre-wrap">
                      {e.detail}
                    </p>
                    {/^https?:\/\//i.test(e.url) && (
                      <a
                        className="text-primary mt-4 inline-flex min-h-11 items-center text-sm font-medium underline"
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
  );
}
function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-border mt-7 border-t pt-6">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export function EntryDialog({
  kind,
  entry,
  close,
  save,
}: {
  kind: string;
  entry: Entry;
  close: () => void;
  save: (e: Entry) => void;
}) {
  const [value, setValue] = useState(entry);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
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
          <DialogDescription>Add the details you want clients to see.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            save({ ...value, title: value.title.trim() });
          }}
        >
          <label className="block text-sm font-medium">
            {kind === "portfolio" ? "Project title" : kind === "education" ? "Degree or qualification" : "Job title"} *
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
              onChange={(e) => setValue({ ...value, organization: e.target.value })}
            />
          </label>
          <label className="block text-sm font-medium">
            {kind === "portfolio" ? "Your contribution and results" : "Description"}
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
  );
}
