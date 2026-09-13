import { Paperclip, Search } from "lucide-react";

import type { MessageToolDialog } from "@/components/messages/message-types";
import { workspaceStyles } from "@/components/dashboard/dashboard-header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MessageToolDialogView({ toolDialog, onClose }: { toolDialog: MessageToolDialog; onClose: () => void }) {
  return (
    <Dialog open={toolDialog !== null} onOpenChange={() => onClose()}>
      <DialogContent>
        {toolDialog === "search" && (
          <>
            <DialogHeader>
              <DialogTitle>Search this conversation</DialogTitle>
              <DialogDescription>Find names, topics, or brief details in the current thread.</DialogDescription>
            </DialogHeader>
            <label className={`${workspaceStyles.inputShell} min-h-12`}>
              <Search className="text-muted-foreground size-4" />
              <span className="sr-only">Conversation search</span>
              <input
                placeholder="Search messages"
                className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none md:text-sm"
              />
            </label>
          </>
        )}
        {toolDialog === "attachment" && (
          <>
            <DialogHeader>
              <DialogTitle>Attach a file</DialogTitle>
              <DialogDescription>
                Add a brief, requirements, or references when this conversation is ready for shared files.
              </DialogDescription>
            </DialogHeader>
            <div className="border-border bg-background rounded-xl border border-dashed p-6 text-center">
              <Paperclip className="text-brand-600 mx-auto size-5" />
              <p className="mt-3 text-sm font-semibold">Shared files</p>
            </div>
          </>
        )}
        {toolDialog === "brief" && (
          <>
            <DialogHeader>
              <DialogTitle>Add a project brief</DialogTitle>
              <DialogDescription>Draft a short scope that can be sent into this conversation.</DialogDescription>
            </DialogHeader>
            <textarea
              rows={5}
              placeholder="Summarize the goal, timeline, and screens you want prioritized."
              className="border-input bg-background focus:border-brand-600 focus:ring-brand-100 w-full rounded-xl border px-4 py-3 text-sm leading-6 outline-none focus:ring-4"
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
