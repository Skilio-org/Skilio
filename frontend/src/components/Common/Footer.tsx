import { useAccountRole } from "@/hooks/useAccountRole";

export function Footer() {
  const freelancer = useAccountRole() === "freelancer";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border/70 bg-background border-t">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <p className="text-muted-foreground text-xs font-medium whitespace-nowrap">© {currentYear} Freelancer</p>

          <span aria-hidden="true" className="text-border hidden sm:inline">
            ·
          </span>

          <p className="text-muted-foreground/80 hidden truncate text-xs sm:block">Better talent. Brighter outcomes.</p>
        </div>

        <p className="text-muted-foreground text-xs">{freelancer ? "Freelancer workspace" : "Client workspace"}</p>
      </div>
    </footer>
  );
}
