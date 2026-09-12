import { TriangleAlert } from "lucide-react";

import DeleteConfirmation from "./DeleteConfirmation";

const DeleteAccount = () => {
  return (
    <section className="border-destructive/20 bg-card shadow-card overflow-hidden rounded-2xl border">
      <header className="border-destructive/15 border-b p-5 sm:p-7">
        <p className="text-destructive text-xs font-bold tracking-[0.16em] uppercase">Danger zone</p>
        <h2 className="font-display mt-1 text-2xl font-semibold">Delete account</h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
          Permanently close your Freelancer account and remove its associated information.
        </p>
      </header>
      <div className="p-5 sm:p-7">
        <div className="border-destructive/30 bg-danger-soft flex flex-col gap-5 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="bg-card text-destructive ring-destructive/15 grid size-10 shrink-0 place-items-center rounded-xl shadow-sm ring-1">
              <TriangleAlert className="size-4" />
            </span>
            <div>
              <h3 className="text-destructive font-semibold">This cannot be undone</h3>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                Download anything you need before continuing.
              </p>
            </div>
          </div>
          <DeleteConfirmation />
        </div>
        <p className="text-muted-foreground mt-4 text-xs leading-5">
          Your profile, saved talent, conversations, and account data will be removed. Download anything you need before
          continuing.
        </p>
      </div>
    </section>
  );
};

export default DeleteAccount;
