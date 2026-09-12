import { TriangleAlert } from "lucide-react"

import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  return (
    <section className="overflow-hidden rounded-2xl border border-destructive/20 bg-card shadow-card">
      <header className="border-b border-destructive/15 p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-destructive">
          Danger zone
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold">
          Delete account
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Permanently close your Freelancer account and remove its associated
          information.
        </p>
      </header>
      <div className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 rounded-2xl border border-destructive/30 bg-danger-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-destructive shadow-sm ring-1 ring-destructive/15">
              <TriangleAlert className="size-4" />
            </span>
            <div>
              <h3 className="font-semibold text-destructive">
                This cannot be undone
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Download anything you need before continuing.
              </p>
            </div>
          </div>
          <DeleteConfirmation />
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Your profile, saved talent, conversations, and account data will be
          removed. Download anything you need before continuing.
        </p>
      </div>
    </section>
  )
}

export default DeleteAccount
