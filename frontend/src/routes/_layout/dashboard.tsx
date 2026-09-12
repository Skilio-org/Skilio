import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header";
import { ProfileProgress } from "@/components/dashboard/dashboard-profile-progress";
import { RecommendedFreelancers } from "@/components/dashboard/dashboard-recommended";
import { Stats } from "@/components/dashboard/dashboard-stats";
import { TalentSearch } from "@/components/dashboard/dashboard-talent-search";
import useAuth from "@/hooks/useAuth";

export const Route = createFileRoute("/_layout/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Overview | Freelancer" }] }),
});

function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.full_name?.trim().split(/\s+/)[0];
  return (
    <div className="space-y-8">
      <WorkspacePageHeader
        eyebrow="Overview"
        title={firstName ? `Good to see you, ${firstName}.` : "Find your next collaborator."}
        description="Continue your search or review professionals selected for you."
        action={
          <Link to="/client-profile" className={workspaceStyles.secondaryAction}>
            Complete client profile <ArrowRight className="size-4" />
          </Link>
        }
      />
      <TalentSearch />
      <Stats />
      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <RecommendedFreelancers />

        <aside className="space-y-6">
          <ProfileProgress />

          {/* <div className="shadow-card rounded-2xl bg-slate-950 p-6 text-white">
            <Clock3 className="text-brand-300 size-5" />
            <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Saved search</p>
            <h2 className="font-display mt-2 text-xl font-semibold">Senior product designers</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">18 new matching profiles since your last visit.</p>
            <Link
              to="/talent"
              search={{ q: undefined }}
              className="hover:text-brand-200 mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white"
            >
              Review matches <ArrowRight className="size-4" />
            </Link>
          </div> */}
        </aside>
      </section>
    </div>
  );
}
