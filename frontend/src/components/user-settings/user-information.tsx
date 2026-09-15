import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Mail, Pencil, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { UsersService, type UserUpdateMe } from "@/client";
import { Monogram } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { useAccountAvatarUrl } from "@/hooks/useAccountAvatar";
import { useAccountRole } from "@/hooks/useAccountRole";
import useAuth from "@/hooks/useAuth";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const formSchema = z.object({
  full_name: z.string().max(30).optional(),
  email: z.email({ message: "Invalid email address" }),
});

type FormData = z.infer<typeof formSchema>;

const UserInformation = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [editMode, setEditMode] = useState(false);
  const { user: currentUser } = useAuth();
  const accountLabel = useAccountRole() === "freelancer" ? "Freelancer account" : "Client account";
  const avatarUrl = useAccountAvatarUrl(currentUser?.id);
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => setAvatarFailed(false), []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name ?? "",
      email: currentUser?.email ?? "",
    },
  });

  useEffect(() => {
    if (!currentUser || editMode) return;

    form.reset({
      full_name: currentUser.full_name ?? "",
      email: currentUser.email,
    });
  }, [currentUser, editMode, form]);

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) => UsersService.updateUserMe({ body: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully");
      setEditMode(false);
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => queryClient.invalidateQueries(),
  });

  const onSubmit = (data: FormData) => {
    const updateData: UserUpdateMe = {};
    if (data.full_name !== currentUser?.full_name) {
      updateData.full_name = data.full_name;
    }
    if (data.email !== currentUser?.email) updateData.email = data.email;
    mutation.mutate(updateData);
  };

  const onCancel = () => {
    form.reset();
    setEditMode(false);
  };

  const displayName = currentUser?.full_name || accountLabel;
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-5">
      <section className="border-border bg-card shadow-card relative overflow-hidden rounded-2xl border p-5 sm:p-7">
        <div className="from-brand-50 dark:from-brand-950/50 absolute inset-x-0 top-0 h-20 bg-gradient-to-r via-violet-50/70 to-emerald-50 dark:via-violet-950/20 dark:to-emerald-950/30" />
        <div className="relative flex flex-col justify-between gap-5 pt-7 sm:flex-row sm:items-end">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Monogram className="border-card bg-brand-100 text-brand-800 shadow-card dark:bg-brand-950 dark:text-brand-200 size-20 overflow-hidden border-4 text-xl">
                {avatarUrl && !avatarFailed ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-full rounded-lg object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  initials
                )}
              </Monogram>
              <span className="border-card absolute right-0 bottom-0 grid size-6 place-items-center rounded-full border-2 bg-emerald-500 text-white">
                <BadgeCheck className="size-3.5" />
              </span>
            </div>
            <div className="pb-1">
              <p className="font-display text-xl font-semibold">{displayName}</p>
              <p className="text-muted-foreground mt-1 text-sm">{accountLabel}</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/45">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Account active
          </span>
        </div>
      </section>

      <section className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
        <header className="border-border flex flex-col justify-between gap-4 border-b p-5 sm:flex-row sm:items-start sm:p-7">
          <div>
            <p className="text-brand-700 text-xs font-semibold tracking-[0.16em] uppercase">Identity</p>
            <h2 className="font-display mt-1 text-2xl font-semibold">Personal details</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              Your name and email appear across your workspace.
            </p>
          </div>
          {!editMode && (
            <Button type="button" variant="outline" onClick={() => setEditMode(true)} className="self-start">
              <Pencil className="size-4" /> Edit details
            </Button>
          )}
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {editMode ? (
              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input type="text" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="divide-border divide-y px-5 sm:px-7">
                <InformationRow
                  icon={UserRound}
                  label="Full name"
                  value={form.getValues("full_name") || "Not added yet"}
                />
                <InformationRow
                  icon={Mail}
                  label="Email address"
                  value={form.getValues("email") || "Not available"}
                  badge={currentUser?.email ? "Verified" : undefined}
                />
              </div>
            )}

            {editMode && (
              <footer className="border-border bg-muted/30 flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:justify-end sm:px-7">
                <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
                  Cancel
                </Button>
                <LoadingButton type="submit" loading={mutation.isPending} disabled={!form.formState.isDirty}>
                  Save changes
                </LoadingButton>
              </footer>
            )}
          </form>
        </Form>
      </section>
    </div>
  );
};

function InformationRow({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-4 py-5">
      <span className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-xl">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>
      {badge && (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/45">
          {badge}
        </span>
      )}
    </div>
  );
}

export default UserInformation;
