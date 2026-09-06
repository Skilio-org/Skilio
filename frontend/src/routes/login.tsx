import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  redirect,
  Link as RouterLink,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Body_login_login_access_token as AccessToken } from "@/client";
import { AuthLayout } from "@/components/Common/AuthLayout";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";

import useAuth, { isLoggedIn } from "@/hooks/useAuth";

/* =========================================================
   VALIDATION
   ========================================================= */

const formSchema = z.object({
  username: z.email({
    message: "Please enter a valid email address.",
  }),

  password: z
    .string()
    .min(1, {
      message: "Password is required.",
    })
    .min(8, {
      message: "Password must be at least 8 characters.",
    }),
}) satisfies z.ZodType<AccessToken>;

type FormData = z.infer<typeof formSchema>;

/* =========================================================
   ROUTE
   ========================================================= */

export const Route = createFileRoute("/login")({
  component: Login,

  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      });
    }
  },

  head: () => ({
    meta: [
      {
        title: "Log in | Freelancer",
      },
      {
        name: "description",
        content: "Log in to your Freelancer account.",
      },
    ],
  }),
});

/* =========================================================
   LOGIN
   ========================================================= */

function Login() {
  const { loginMutation } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),

    mode: "onBlur",
    criteriaMode: "all",

    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: FormData) => {
    if (loginMutation.isPending) return;

    loginMutation.mutate(data);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-100 mx-auto">
        <div className="mb-8 space-y-3 text-center">
          <h1
            className="
              font-display
              text-4xl
              font-bold
              leading-[0.98]
              tracking-[-0.04em]
              text-foreground
              sm:text-[42px]
            "
          >
            Login to your
            <br />
            account.
          </h1>

          <p
            className="
              mx-auto
              max-w-sm
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Welcome back. Enter your details to continue to your account.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Email */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel
                    className="
                      text-[13px]
                      font-medium
                      text-foreground
                    "
                  >
                    Email
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-testid="email-input"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={loginMutation.isPending}
                      className="
                        h-11
                        rounded-lg
                        bg-card
                        px-3.5
                        text-sm
                        shadow-none
                        transition-[border-color,box-shadow,background-color]
                        placeholder:text-muted-foreground/70
                        hover:border-foreground/20
                        focus-visible:border-brand-400
                        focus-visible:ring-[3px]
                        focus-visible:ring-brand-100
                      "
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel
                      className="
                        text-[13px]
                        font-medium
                        text-foreground
                      "
                    >
                      Password
                    </FormLabel>

                    <RouterLink
                      to="/recover-password"
                      className="
                        text-xs
                        font-medium
                        text-muted-foreground
                        transition-colors
                        hover:text-brand-600
                      "
                    >
                      Forgot your password?
                    </RouterLink>
                  </div>

                  <FormControl>
                    <PasswordInput
                      data-testid="password-input"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={loginMutation.isPending}
                      className="
                        h-11
                        rounded-lg
                        bg-card
                        px-3.5
                        text-sm
                        shadow-none
                        transition-[border-color,box-shadow,background-color]
                        placeholder:text-muted-foreground/70
                        hover:border-foreground/20
                        focus-visible:border-brand-400
                        focus-visible:ring-[3px]
                        focus-visible:ring-brand-100
                      "
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Submit */}
            <LoadingButton
              type="submit"
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
              className="
                mt-1
                h-11
                w-full
                rounded-lg
                bg-primary
                text-sm
                font-semibold
                text-primary-foreground
                shadow-[0_1px_2px_rgb(16_24_40/0.06),0_4px_12px_rgb(70_88_232/0.16)]
                transition-all
                duration-200
                hover:-translate-y-px
                hover:bg-brand-700
                hover:shadow-[0_2px_4px_rgb(16_24_40/0.06),0_8px_20px_rgb(70_88_232/0.20)]
                active:translate-y-0
                active:bg-brand-800
              "
            >
              Log in
            </LoadingButton>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account yet?{" "}
          <RouterLink
            to="/signup"
            className="
              font-medium
              text-foreground
              underline
              decoration-border
              underline-offset-4
              transition-colors
              hover:text-brand-600
              hover:decoration-brand-300
            "
          >
            Sign up
          </RouterLink>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;
