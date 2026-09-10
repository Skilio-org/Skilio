import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BadgeCheck, Building2, Mail, Pencil, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { UsersService, type UserUpdateMe } from "@/client"
import { Monogram } from "@/components/Common/WorkspaceUI"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  full_name: z.string().max(30).optional(),
  email: z.email({ message: "Invalid email address" }),
})

type FormData = z.infer<typeof formSchema>

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [editMode, setEditMode] = useState(false)
  const { user: currentUser } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name ?? "",
      email: currentUser?.email ?? "",
    },
  })

  useEffect(() => {
    if (!currentUser || editMode) return

    form.reset({
      full_name: currentUser.full_name ?? "",
      email: currentUser.email,
    })
  }, [currentUser, editMode, form])

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ body: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully")
      setEditMode(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => queryClient.invalidateQueries(),
  })

  const onSubmit = (data: FormData) => {
    const updateData: UserUpdateMe = {}
    if (data.full_name !== currentUser?.full_name) {
      updateData.full_name = data.full_name
    }
    if (data.email !== currentUser?.email) updateData.email = data.email
    mutation.mutate(updateData)
  }

  const onCancel = () => {
    form.reset()
    setEditMode(false)
  }

  const displayName = currentUser?.full_name || "Client account"
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-brand-50 via-violet-50/70 to-emerald-50 dark:from-brand-950/50 dark:via-violet-950/20 dark:to-emerald-950/30" />
        <div className="relative flex flex-col justify-between gap-5 pt-7 sm:flex-row sm:items-end">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Monogram className="size-20 border-4 border-card bg-brand-100 text-xl text-brand-800 shadow-card dark:bg-brand-950 dark:text-brand-200">
                {initials}
              </Monogram>
              <span className="absolute bottom-0 right-0 grid size-6 place-items-center rounded-full border-2 border-card bg-emerald-500 text-white">
                <BadgeCheck className="size-3.5" />
              </span>
            </div>
            <div className="pb-1">
              <p className="font-display text-xl font-semibold">
                {displayName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Client account
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/45">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Account active
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <header className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              Identity
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              Personal details
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Your name and email appear across your client workspace.
            </p>
          </div>
          {!editMode && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditMode(true)}
              className="self-start"
            >
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
              <div className="divide-y divide-border px-5 sm:px-7">
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
                <InformationRow
                  icon={Building2}
                  label="Account type"
                  value="Client workspace"
                />
              </div>
            )}

            {editMode && (
              <footer className="flex flex-col-reverse gap-3 border-t border-border bg-muted/30 p-4 sm:flex-row sm:justify-end sm:px-7">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  loading={mutation.isPending}
                  disabled={!form.formState.isDirty}
                >
                  Save changes
                </LoadingButton>
              </footer>
            )}
          </form>
        </Form>
      </section>
    </div>
  )
}

function InformationRow({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: typeof UserRound
  label: string
  value: string
  badge?: string
}) {
  return (
    <div className="flex items-center gap-4 py-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>
      {badge && (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/45">
          {badge}
        </span>
      )}
    </div>
  )
}

export default UserInformation
