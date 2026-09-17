import { FileText } from "lucide-react";
import { useState } from "react";
import { workspaceStyles } from "@/components/dashboard/dashboard-header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MessageToolDialogView({
  onClose,
  onInsert,
}: {
  onClose: () => void;
  onInsert: (brief: string) => void;
}) {
  const [brief, setBrief] = useState("");
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <span className="bg-accent text-primary mb-2 grid size-11 place-items-center rounded-xl">
            <FileText className="size-5" />
          </span>
          <DialogTitle>Add a project brief</DialogTitle>
          <DialogDescription>
            Give your collaborator a clear starting point. You can review it in your message before sending.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (brief.trim()) onInsert(brief.trim());
          }}
          className="space-y-5"
        >
          <label className="block text-sm font-medium">
            What do you have in mind?
            <textarea
              autoFocus
              required
              value={brief}
              maxLength={8000}
              onChange={(event) => setBrief(event.target.value)}
              rows={7}
              placeholder={
                "Project goal\nWhat you'd like to create or improve\n\nScope and deliverables\n\nTimeline and budget"
              }
              className="border-input bg-background focus:border-primary focus:ring-primary/15 mt-2 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-7 outline-none focus:ring-2"
            />
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" className={workspaceStyles.secondaryAction} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!brief.trim()}
              className={`${workspaceStyles.primaryAction} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Add to message
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
