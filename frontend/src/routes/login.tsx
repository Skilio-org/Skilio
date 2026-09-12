import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link as RouterLink, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { FaApple, FaLinkedinIn } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";
import type { Body_login_login_access_token as AccessToken } from "@/client";
import { AuthLayout } from "@/components/Common/AuthLayout";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

const socialProviders = [
  {
    id: "google",
    label: "Continue with Google",
    icon: FcGoogle,
    href: import.meta.env.VITE_GOOGLE_OAUTH_URL as string | undefined,
  },
  {
    id: "apple",
    label: "Continue with Apple",
    icon: FaApple,
    href: import.meta.env.VITE_APPLE_OAUTH_URL as string | undefined,
  },
  {
    id: "linkedin",
    label: "Continue with LinkedIn",
    icon: FaLinkedinIn,
    href: import.meta.env.VITE_LINKEDIN_OAUTH_URL as string | undefined,
  },
];

export const Route = createFileRoute("/login")({
  component: Login,

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
        title: "Log in | Freelancer",
      },
      {
        name: "description",
        content: "Log in to your Freelancer account.",
      },
    ],
  }),
});

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

  const handleSocialLogin = (href: string | undefined) => {
    if (!href) return;

    window.location.assign(href);
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-115">
        <div className="mb-8 space-y-3 text-center">
          <h1 className="font-display text-foreground text-[42px] leading-[0.98] font-bold tracking-[-0.045em] sm:text-[46px]">
            Login to your <br />
            account.
          </h1>

          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-6">
            Welcome back. Enter your details to continue to your account.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-foreground text-[13px] font-medium">Email</FormLabel>

                  <FormControl>
                    <Input
                      data-testid="email-input"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={loginMutation.isPending}
                      className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel className="text-foreground text-[13px] font-medium">Password</FormLabel>

                    <RouterLink
                      to="/recover-password"
                      className="text-muted-foreground hover:text-primary text-xs font-medium transition-colors"
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
                      className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <LoadingButton
              type="submit"
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 focus-visible:ring-ring/30 mt-1 h-12 w-full rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
            >
              Log in
            </LoadingButton>
          </form>
        </Form>

        {/* =================================================
            SOCIAL LOGIN
            ================================================= */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {socialProviders.map(({ id, label, icon: Icon, href }) => {
            const isConfigured = Boolean(href);

            return (
              <button
                key={id}
                type="button"
                disabled={!isConfigured}
                onClick={() => handleSocialLogin(href)}
                title={isConfigured ? label : `${label} is not configured yet`}
                className="group border-border bg-card text-foreground hover:border-primary/20 hover:bg-accent/50 focus-visible:ring-ring/25 flex h-12 items-center justify-center gap-2.5 rounded-xl border px-3 text-[13px] font-medium shadow-[0_1px_2px_rgb(16_24_40/0.02)] transition-all duration-200 hover:-translate-y-px hover:shadow-sm focus-visible:ring-[3px] focus-visible:outline-none active:translate-y-0 disabled:pointer-events-none disabled:opacity-45"
              >
                <Icon className={`size-4.5 shrink-0 ${id === "linkedin" ? "text-[#0A66C2]" : ""} `} />

                <span className="hidden whitespace-nowrap xl:inline">
                  {id === "google" && "Google"}
                  {id === "apple" && "Apple"}
                  {id === "linkedin" && "LinkedIn"}
                </span>

                <span className="whitespace-nowrap xl:hidden">
                  {id === "google" && "Google"}
                  {id === "apple" && "Apple"}
                  {id === "linkedin" && "LinkedIn"}
                </span>
              </button>
            );
          })}
        </div>

        {/* =================================================
            SIGNUP
            ================================================= */}

        <div className="text-muted-foreground mt-7 text-center text-sm">
          Don't have an account yet?{" "}
          <RouterLink
            to="/signup"
            className="text-foreground decoration-border hover:text-primary hover:decoration-primary/40 font-medium underline underline-offset-4 transition-colors"
          >
            Sign up
          </RouterLink>
        </div>
      </div>
    </AuthLayout>
  );
}
