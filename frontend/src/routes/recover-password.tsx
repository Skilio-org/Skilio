import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link as RouterLink, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LoginService } from "@/client";

import { AuthLayout } from "@/components/Common/AuthLayout";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";

import { isLoggedIn } from "@/hooks/useAuth";
import useCustomToast from "@/hooks/useCustomToast";

import { handleError } from "@/utils";

/* =========================================================
   VALIDATION
   ========================================================= */

const formSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
});

type FormData = z.infer<typeof formSchema>;

/* =========================================================
   ROUTE
   ========================================================= */

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,

  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },

  head: () => ({
    meta: [
      {
        title: "Recover password | Freelancer",
      },
      {
        name: "description",
        content: "Recover access to your Freelancer account by requesting a password reset link.",
      },
    ],
  }),
});

/* =========================================================
   RECOVER PASSWORD
   ========================================================= */

function RecoverPassword() {
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),

    mode: "onBlur",

    defaultValues: {
      email: "",
    },
  });

  /* =======================================================
     API
     ======================================================= */

  const recoverPassword = async (data: FormData) => {
    await LoginService.recoverPassword({
      path: {
        email: data.email,
      },
    });
  };

  const mutation = useMutation({
    mutationFn: recoverPassword,

    onSuccess: () => {
      showSuccessToast("Password recovery email sent successfully.");

      form.reset();
    },

    onError: handleError.bind(showErrorToast),
  });

  /* =======================================================
     SUBMIT
     ======================================================= */

  const onSubmit = (data: FormData) => {
    if (mutation.isPending) return;

    mutation.mutate(data);
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[460px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="w-full">
            {/* =================================================
                BACK TO LOGIN
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
              {/* <div
                className="
                  mb-5
                  flex
                  size-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-primary/20
                  bg-accent
                  text-accent-foreground
                  shadow-sm
                "
              >
                <Mail className="size-5" />
              </div> */}

              <h1 className="font-display text-foreground text-[42px] leading-[0.98] font-bold tracking-[-0.045em] sm:text-[46px]">
                Forgot your <br />
                password?
              </h1>

              <p className="text-muted-foreground mt-4 max-w-[400px] text-sm leading-6">
                No problem. Enter the email address associated with your account and we'll send you a link to reset your
                password.
              </p>
            </div>

            {/* =================================================
                EMAIL
                ================================================= */}

            <div className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-foreground text-[13px] font-medium">Email address</FormLabel>

                    <FormControl>
                      <div className="relative">
                        <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />

                        <Input
                          data-testid="email-input"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          disabled={mutation.isPending}
                          className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl pr-4 pl-11 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                          {...field}
                        />
                      </div>
                    </FormControl>

                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* =================================================
                  SUBMIT
                  ================================================= */}

              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                disabled={mutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 focus-visible:ring-ring/30 h-12 w-full gap-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
              >
                Send recovery link
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
