import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, CheckCircle2, ImageUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UsersService } from "@/client";

import { Monogram, WorkspacePageHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { markAccountAvatarUpdated, useAccountAvatarUrl } from "@/hooks/useAccountAvatar";
import useAuth from "@/hooks/useAuth";
import { getInitials } from "@/utils";

export const Route = createFileRoute("/_layout/client-profile")({
  component: ClientProfile,
  head: () => ({ meta: [{ title: "Client profile | Freelancer" }] }),
});

function ClientProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoUpdated, setPhotoUpdated] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const displayName = user?.full_name || "Your name";
  const avatarUrl = useAccountAvatarUrl(user?.id);
  useEffect(() => setAvatarFailed(false), []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    toast.success("Client profile saved");
  };

  return (
    <div className="space-y-8">
      <WorkspacePageHeader
        eyebrow="Your presence"
        title="Client profile"
        description="Help independent professionals understand who you are and what working with you will feel like."
        action=""
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={handleSubmit}
          className="border-border bg-card shadow-card space-y-8 rounded-2xl border p-5 sm:p-8"
        >
          <div className="border-border flex flex-col gap-5 border-b pb-8 sm:flex-row sm:items-center">
            <Monogram className="bg-brand-100 text-brand-800 relative size-24 text-2xl">
              {avatarUrl && !avatarFailed ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="absolute inset-0 size-full rounded-xl object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                getInitials(displayName)
              )}
              <button
                type="button"
                aria-label="Change profile photo"
                onClick={() => setPhotoDialogOpen(true)}
                className="border-card bg-foreground text-background hover:bg-brand-700 absolute -right-2 -bottom-2 grid size-10 place-items-center rounded-full border-4 hover:text-white"
              >
                <Camera className="size-4" />
              </button>
            </Monogram>
            <div>
              <h2 className="font-display text-xl font-semibold">Profile photo</h2>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {photoUpdated
                  ? "Your new profile image is ready across the workspace."
                  : "A clear photo or company logo makes your messages easier to recognize."}
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">About you</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              The essentials freelancers see when you start a conversation.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                id="full-name"
                defaultValue={user?.full_name ?? ""}
                placeholder="Your full name"
              />
              <Field label="Company" id="company" placeholder="Company or studio" />
              <Field label="Role" id="role" placeholder="e.g. Product lead" />
              <Field label="Company website" id="website" type="url" placeholder="https://company.com" />
              <Field label="Location" id="location" placeholder="City, country" />
              <div className="space-y-2">
                <Label id="company-size-label">Company size</Label>
                <Select>
                  <SelectTrigger aria-labelledby="company-size-label" className="h-12 w-full">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="solo">Just me</SelectItem>
                    <SelectItem value="2-10">2–10 people</SelectItem>
                    <SelectItem value="11-50">11–50 people</SelectItem>
                    <SelectItem value="51-200">51–200 people</SelectItem>
                    <SelectItem value="201-plus">201+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="border-border flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
            {saved && (
              <span className="mr-auto inline-flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="size-4" />
                Changes saved
              </span>
            )}
            <Button
              type="reset"
              onClick={() => setSaved(false)}
              variant="outline"
              className="min-h-11 rounded-full px-5"
            >
              Cancel
            </Button>
            <Button type="submit" className="min-h-11 rounded-full px-6">
              Save profile
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update profile photo</DialogTitle>
            <DialogDescription>
              Choose the image clients and independent professionals see when they review your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="border-brand-200 bg-brand-50/45 dark:border-brand-900 dark:bg-brand-950/25 rounded-2xl border border-dashed p-7 text-center">
            <span className="bg-card text-brand-700 mx-auto grid size-12 place-items-center rounded-xl shadow-sm">
              <ImageUp className="size-5" />
            </span>
            <p className="mt-3 text-sm font-semibold">Choose a clear headshot or company logo</p>
            <p className="text-muted-foreground mt-1 text-xs leading-5">JPG or PNG, at least 400px square.</p>
            <label
              htmlFor="client-photo-upload"
              className="border-border bg-card hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition"
            >
              <Camera className="size-4" />
              Choose image
              <input
                id="client-photo-upload"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedPhoto(file);
                  setSelectedPhotoName(file?.name ?? "");
                }}
                className="sr-only"
              />
            </label>
            {selectedPhotoName && (
              <p className="mt-3 text-xs font-medium text-emerald-700">Selected: {selectedPhotoName}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedPhotoName("");
                setSelectedPhoto(null);
                setPhotoDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedPhoto || uploading}
              onClick={async () => {
                if (!selectedPhoto || uploading || !user) return;
                setUploading(true);
                try {
                  const response = await UsersService.uploadAvatar({
                    body: { file: selectedPhoto },
                  });
                  if (response.data.status !== "Ok") throw new Error("Upload failed");
                  markAccountAvatarUpdated(user.id);
                  await queryClient.invalidateQueries({
                    queryKey: ["currentUser"],
                  });
                  setPhotoUpdated(true);
                  setPhotoDialogOpen(false);
                  toast.success("Profile photo uploaded");
                } catch {
                  toast.error("Couldn’t upload your photo. Please try again.");
                } finally {
                  setUploading(false);
                }
              }}
            >
              {uploading ? "Uploading…" : "Apply photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, id, ...props }: { label: string; id: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}
