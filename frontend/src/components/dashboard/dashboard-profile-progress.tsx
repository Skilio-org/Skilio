import { Link } from "@tanstack/react-router";
import { ArrowRight, Users } from "lucide-react";
import { WorkspaceSurface, workspaceStyles } from "./dashboard-header";

export const ProfileProgress = () => {
  return (
    <WorkspaceSurface className="p-6">
      <div className="flex items-center justify-between">
        <span className="bg-brand-50 text-brand-700 grid size-10 place-items-center rounded-full">
          <Users className="size-5" />
        </span>
        <span className="text-brand-700 text-sm font-semibold">3 of 5</span>
      </div>
      <h2 className="font-display mt-6 text-xl font-semibold">Build your first shortlist</h2>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        Save a few strong profiles, then compare their skills and experience side by side.
      </p>
      <div className="bg-muted mt-5 h-1.5">
        <div className="bg-brand-600 h-full w-3/5" />
      </div>
      <Link
        to="/talent"
        search={{ q: undefined }}
        className={`${workspaceStyles.secondaryAction} mt-6 w-full justify-between`}
      >
        Continue exploring <ArrowRight className="size-4" />
      </Link>
    </WorkspaceSurface>
  );
};
