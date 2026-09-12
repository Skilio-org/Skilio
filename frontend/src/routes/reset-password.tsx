import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link as RouterLink, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, KeyRound, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LoginService } from "@/client";

import { AuthLayout } from "@/components/Common/AuthLayout";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";

import { isLoggedIn } from "@/hooks/useAuth";
import useCustomToast from "@/hooks/useCustomToast";

import { handleError } from "@/utils";

/* =========================================================
   SEARCH PARAMS
   ========================================================= */

const searchSchema = z.object({
  token: z.string().catch(""),
});

/* =========================================================
   VALIDATION
   ========================================================= */

const formSchema = z
  .object({
    new_password: z
      .string()
      .min(1, {
        message: "Password is required.",
      })
      .min(8, {
        message: "Password must be at least 8 characters.",
      }),

    confirm_password: z.string().min(1, {
      message: "Please confirm your password.",
    }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "The passwords don't match.",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof formSchema>;

/* =========================================================
   ROUTE
   ========================================================= */

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,

  validateSearch: searchSchema,

  beforeLoad: async ({ search }) => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/dashboard",
      });
    }

    if (!search.token) {
      throw redirect({
        to: "/login",
      });
    }
  },

  head: () => ({
    meta: [
      {
        title: "Reset password | Freelancer",
      },
      {
        name: "description",
        content: "Choose a new password for your Freelancer account.",
      },
    ],
  }),
});

/* =========================================================
   RESET PASSWORD
   ========================================================= */

function ResetPassword() {
  const { token } = Route.useSearch();

  const { showSuccessToast, showErrorToast } = useCustomToast();

  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),

    mode: "onBlur",
    criteriaMode: "all",

    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = form.watch("new_password");
  const confirmPassword = form.watch("confirm_password");

  const hasMinLength = newPassword.length >= 8;

  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  /* =======================================================
     API
     ======================================================= */

  const mutation = useMutation({
    mutationFn: (data: { new_password: string; token: string }) =>
      LoginService.resetPassword({
        body: data,
      }),

    onSuccess: () => {
      showSuccessToast("Your password has been updated successfully.");

      form.reset();

      navigate({
        to: "/login",
      });
    },

    onError: handleError.bind(showErrorToast),
  });

  /* =======================================================
     SUBMIT
     ======================================================= */

  const onSubmit = (data: FormData) => {
    if (mutation.isPending) return;

    mutation.mutate({
      new_password: data.new_password,
      token,
    });
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[460px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="w-full">
            {/* =================================================
                BACK
                ================================================= */}

            <RouterLink
              to="/login"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/30 mb-8 inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
            >
              <ArrowLeft className="size-4" />
              Back to login
            </RouterLink>

            {/* =================================================
                HEADER
                ================================================= */}

            <div className="mb-8">
              <div className="border-primary/20 bg-accent text-accent-foreground mb-5 flex size-12 items-center justify-center rounded-xl border shadow-sm">
                <KeyRound className="size-5" />
              </div>

              <h1 className="font-display text-foreground text-[42px] leading-[0.98] font-bold tracking-[-0.045em] sm:text-[46px]">
                Create a new <br />
                password.
              </h1>

              <p className="text-muted-foreground mt-4 max-w-[400px] text-sm leading-6">
                Choose a strong password that you haven't used before. You'll use it to sign in to your account.
              </p>
            </div>

            {/* =================================================
                FORM FIELDS
                ================================================= */}

            <div className="space-y-5">
              {/* =================================================
                  NEW PASSWORD
                  ================================================= */}

              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-foreground text-[13px] font-medium">New password</FormLabel>

                    <FormControl>
                      <PasswordInput
                        data-testid="new-password-input"
                        autoComplete="new-password"
                        placeholder="Create a new password"
                        disabled={mutation.isPending}
                        className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* =================================================
                  CONFIRM PASSWORD
                  ================================================= */}

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-foreground text-[13px] font-medium">Confirm password</FormLabel>

                    <FormControl>
                      <PasswordInput
                        data-testid="confirm-password-input"
                        autoComplete="new-password"
                        placeholder="Confirm your new password"
                        disabled={mutation.isPending}
                        className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* =================================================
                  PASSWORD REQUIREMENTS
                  ================================================= */}

              <div className="border-border bg-card/60 rounded-xl border p-4">
                <div className="text-foreground mb-3 flex items-center gap-2 text-[12px] font-semibold">
                  <LockKeyhole className="text-muted-foreground size-3.5" />
                  Password requirements
                </div>

                <div className="space-y-2.5">
                  <div
                    className={`flex items-center gap-2 text-xs transition-colors ${hasMinLength ? "text-success" : "text-muted-foreground"} `}
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded-full border transition-colors ${
                        hasMinLength
                          ? `border-success/30 bg-success/10 text-success`
                          : `border-border bg-muted/40 text-muted-foreground`
                      } `}
                    >
                      <Check className="size-2.5" strokeWidth={3} />
                    </div>
                    At least 8 characters
                  </div>

                  <div
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      passwordsMatch ? "text-success" : "text-muted-foreground"
                    } `}
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded-full border transition-colors ${
                        passwordsMatch
                          ? `border-success/30 bg-success/10 text-success`
                          : `border-border bg-muted/40 text-muted-foreground`
                      } `}
                    >
                      <Check className="size-2.5" strokeWidth={3} />
                    </div>
                    Both passwords match
                  </div>
                </div>
              </div>

              {/* =================================================
                  SUBMIT
                  ================================================= */}

              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                disabled={mutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 focus-visible:ring-ring/30 h-12 w-full gap-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
              >
                Reset password
                {!mutation.isPending && <ArrowRight className="size-4" />}
              </LoadingButton>
            </div>

            {/* =================================================
                FOOTER
                ================================================= */}

            <div className="border-border/70 text-muted-foreground mt-7 border-t pt-6 text-center text-sm">
              Remember your password?{" "}
              <RouterLink
                to="/login"
                className="text-foreground decoration-border hover:text-primary hover:decoration-primary/40 font-medium underline underline-offset-4 transition-colors"
              >
                Log in
              </RouterLink>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
