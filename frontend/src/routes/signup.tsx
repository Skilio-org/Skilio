import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link as RouterLink, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaApple, FaLinkedinIn } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";

import { AuthLayout } from "@/components/Common/AuthLayout";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";

import useAuth, { isLoggedIn } from "@/hooks/useAuth";

/* =========================================================
   VALIDATION
   ========================================================= */

const formSchema = z
  .object({
    role: z.enum(["freelancer", "client"], {
      message: "Please choose an account type.",
    }),

    full_name: z
      .string()
      .trim()
      .min(1, {
        message: "Full name is required.",
      })
      .min(2, {
        message: "Full name must be at least 2 characters.",
      }),

    email: z.email({
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

    confirm_password: z.string().min(1, {
      message: "Please confirm your password.",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The passwords don't match.",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof formSchema>;

type SignupStep = 1 | 2;

type AccountRole = "freelancer" | "client";

/* =========================================================
   SOCIAL AUTH
   ========================================================= */

/*
 * Configure these when your backend OAuth endpoints exist:
 *
 * VITE_GOOGLE_OAUTH_URL=http://localhost:8000/api/v1/auth/google
 * VITE_APPLE_OAUTH_URL=http://localhost:8000/api/v1/auth/apple
 * VITE_LINKEDIN_OAUTH_URL=http://localhost:8000/api/v1/auth/linkedin
 *
 * The selected role will be appended:
 *
 * ?role=freelancer
 * ?role=client
 */

const socialProviders = [
  {
    id: "google",
    label: "Google",
    icon: FcGoogle,
    href: import.meta.env.VITE_GOOGLE_OAUTH_URL as string | undefined,
  },
  {
    id: "apple",
    label: "Apple",
    icon: FaApple,
    href: import.meta.env.VITE_APPLE_OAUTH_URL as string | undefined,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedinIn,
    href: import.meta.env.VITE_LINKEDIN_OAUTH_URL as string | undefined,
  },
];

/* =========================================================
   ROUTE
   ========================================================= */

export const Route = createFileRoute("/signup")({
  component: SignUp,

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
        title: "Create account | Freelancer",
      },
      {
        name: "description",
        content: "Create your account as a freelancer or client and start working together.",
      },
    ],
  }),
});

/* =========================================================
   SIGN UP
   ========================================================= */

function SignUp() {
  const { signUpMutation } = useAuth();

  const [step, setStep] = useState<SignupStep>(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),

    mode: "onBlur",
    criteriaMode: "all",

    defaultValues: {
      role: "freelancer",
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const selectedRole = form.watch("role");

  /* =======================================================
     STEP NAVIGATION
     ======================================================= */

  const goToDetails = async () => {
    const valid = await form.trigger("role");

    if (!valid) return;

    setStep(2);
  };

  const goBackToRole = () => {
    setStep(1);
  };

  /* =======================================================
     EMAIL / PASSWORD SIGNUP
     ======================================================= */

  const onSubmit = (data: FormData) => {
    if (signUpMutation.isPending) return;

    const { confirm_password: _confirmPassword, ...submitData } = data;

    signUpMutation.mutate(submitData);
  };

  /* =======================================================
     SOCIAL SIGNUP
     ======================================================= */

  const handleSocialSignup = (href: string | undefined, role: AccountRole) => {
    if (!href) return;

    /*
     * Handles absolute backend URLs cleanly.
     *
     * Example:
     *
     * http://localhost:8000/api/v1/auth/google
     *
     * becomes:
     *
     * http://localhost:8000/api/v1/auth/google?role=freelancer
     */

    const url = new URL(href);

    url.searchParams.set("role", role);

    window.location.assign(url.toString());
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[460px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {/* =================================================
                STEP 1 — CHOOSE ROLE
                ================================================= */}

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                {/* =============================================
                    HEADER
                    ============================================= */}

                <div className="mb-9 text-center">
                  <div className="border-primary/25 bg-accent text-accent-foreground mb-5 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
                    Get started
                  </div>

                  <h1 className="font-display text-foreground text-[42px] leading-[0.98] font-bold tracking-[-0.045em] sm:text-[46px]">
                    How do you want <br />
                    to use Freelancer?
                  </h1>

                  <p className="text-muted-foreground mx-auto mt-4 max-w-[380px] text-sm leading-6">
                    Choose how you'd like to get started. You can manage your account settings later.
                  </p>
                </div>

                {/* =============================================
                    ROLE SELECTION
                    ============================================= */}

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-3.5">
                          {/* ===================================
                              FREELANCER
                              =================================== */}

                          <button
                            type="button"
                            aria-pressed={field.value === "freelancer"}
                            disabled={signUpMutation.isPending}
                            onClick={() => field.onChange("freelancer")}
                            className={`group focus-visible:ring-ring/30 relative flex min-h-28 w-full items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 ${
                              field.value === "freelancer"
                                ? `border-primary/40 bg-accent shadow-card`
                                : `border-border bg-card hover:border-primary/25 hover:bg-accent/40 hover:shadow-card-hover hover:-translate-y-px`
                            } `}
                          >
                            <div
                              className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                                field.value === "freelancer"
                                  ? `bg-primary text-primary-foreground shadow-sm`
                                  : `bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground`
                              } `}
                            >
                              <UserRound className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-foreground text-[15px] font-semibold">I want to find work</div>

                              <p className="text-muted-foreground mt-1.5 text-[13px] leading-5">
                                Create a freelancer profile, showcase your skills, and work with great clients.
                              </p>
                            </div>

                            <div
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                                field.value === "freelancer"
                                  ? `border-primary bg-primary text-primary-foreground`
                                  : `border-border bg-background text-transparent`
                              } `}
                            >
                              <Check className="size-3.5" strokeWidth={3} />
                            </div>
                          </button>

                          {/* ===================================
                              CLIENT
                              =================================== */}

                          <button
                            type="button"
                            aria-pressed={field.value === "client"}
                            disabled={signUpMutation.isPending}
                            onClick={() => field.onChange("client")}
                            className={`group focus-visible:ring-ring/30 relative flex min-h-28 w-full items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 ${
                              field.value === "client"
                                ? `border-primary/40 bg-accent shadow-card`
                                : `border-border bg-card hover:border-primary/25 hover:bg-accent/40 hover:shadow-card-hover hover:-translate-y-px`
                            } `}
                          >
                            <div
                              className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                                field.value === "client"
                                  ? `bg-primary text-primary-foreground shadow-sm`
                                  : `bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground`
                              } `}
                            >
                              <BriefcaseBusiness className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-foreground text-[15px] font-semibold">I want to hire talent</div>

                              <p className="text-muted-foreground mt-1.5 text-[13px] leading-5">
                                Find skilled freelancers, manage projects, and get high-quality work done.
                              </p>
                            </div>

                            <div
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                                field.value === "client"
                                  ? `border-primary bg-primary text-primary-foreground`
                                  : `border-border bg-background text-transparent`
                              } `}
                            >
                              <Check className="size-3.5" strokeWidth={3} />
                            </div>
                          </button>
                        </div>
                      </FormControl>

                      <FormMessage className="mt-2 text-xs" />
                    </FormItem>
                  )}
                />

                {/* =============================================
                    CONTINUE
                    ============================================= */}

                <button
                  type="button"
                  onClick={goToDetails}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 focus-visible:ring-ring/30 mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] focus-visible:outline-none active:translate-y-0"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </button>

                {/* =============================================
                    LOGIN
                    ============================================= */}

                <div className="text-muted-foreground mt-6 text-center text-sm">
                  Already have an account?{" "}
                  <RouterLink
                    to="/login"
                    className="text-foreground decoration-border hover:text-primary hover:decoration-primary/40 font-medium underline underline-offset-4 transition-colors"
                  >
                    Log in
                  </RouterLink>
                </div>
              </div>
            )}

            {/* =================================================
                STEP 2 — ACCOUNT DETAILS
                ================================================= */}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                {/* =============================================
                    BACK
                    ============================================= */}

                <button
                  type="button"
                  onClick={goBackToRole}
                  disabled={signUpMutation.isPending}
                  className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>

                {/* =============================================
                    HEADER
                    ============================================= */}

                <div className="mb-7">
                  <h1 className="font-display text-foreground text-[42px] leading-[0.98] font-bold tracking-[-0.045em] sm:text-[46px]">
                    Create your
                    <br />
                    account.
                  </h1>

                  <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-6">
                    You're joining as{" "}
                    <span className="text-foreground font-medium">
                      {selectedRole === "freelancer" ? "a freelancer" : "a client"}
                    </span>
                    .
                  </p>
                </div>

                {/* =============================================
                    SELECTED ROLE
                    ============================================= */}

                <div className="border-primary/25 bg-accent mb-6 flex items-center gap-3.5 rounded-xl border p-3.5">
                  <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg shadow-sm">
                    {selectedRole === "freelancer" ? (
                      <UserRound className="size-4.5" />
                    ) : (
                      <BriefcaseBusiness className="size-4.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-foreground text-[13px] font-semibold">
                      {selectedRole === "freelancer" ? "Freelancer account" : "Client account"}
                    </div>

                    <div className="text-muted-foreground mt-0.5 text-xs">
                      {selectedRole === "freelancer"
                        ? "Find work and build your career."
                        : "Hire talent and manage projects."}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={goBackToRole}
                    disabled={signUpMutation.isPending}
                    className="text-accent-foreground hover:bg-primary/10 hover:text-primary rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
                  >
                    Change
                  </button>
                </div>

                {/* =============================================
                    ACCOUNT FIELDS
                    ============================================= */}

                <div className="space-y-4">
                  {/* FULL NAME */}

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-foreground text-[13px] font-medium">Full name</FormLabel>

                        <FormControl>
                          <Input
                            data-testid="full-name-input"
                            type="text"
                            autoComplete="name"
                            placeholder="Your full name"
                            disabled={signUpMutation.isPending}
                            className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px]"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* EMAIL */}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-foreground text-[13px] font-medium">Email</FormLabel>

                        <FormControl>
                          <Input
                            data-testid="email-input"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            disabled={signUpMutation.isPending}
                            className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px]"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* PASSWORD */}

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-foreground text-[13px] font-medium">Password</FormLabel>

                        <FormControl>
                          <PasswordInput
                            data-testid="password-input"
                            autoComplete="new-password"
                            placeholder="Create a password"
                            disabled={signUpMutation.isPending}
                            className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px]"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* CONFIRM PASSWORD */}

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
                            placeholder="Confirm your password"
                            disabled={signUpMutation.isPending}
                            className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px]"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* ===========================================
                      EMAIL SIGNUP
                      =========================================== */}

                  <LoadingButton
                    type="submit"
                    loading={signUpMutation.isPending}
                    disabled={signUpMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 focus-visible:ring-ring/30 mt-2 h-12 w-full rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] active:translate-y-0"
                  >
                    {selectedRole === "freelancer" ? "Create freelancer account" : "Create client account"}
                  </LoadingButton>
                </div>

                {/* =============================================
                    SOCIAL DIVIDER
                    ============================================= */}

                <div className="my-7 flex items-center gap-4">
                  <div className="bg-border h-px flex-1" />

                  <span className="text-muted-foreground shrink-0 text-xs font-medium">Or sign up with</span>

                  <div className="bg-border h-px flex-1" />
                </div>

                {/* =============================================
                    SOCIAL SIGNUP
                    ============================================= */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {socialProviders.map(({ id, label, icon: Icon, href }) => {
                    const configured = Boolean(href);

                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={!configured}
                        onClick={() => handleSocialSignup(href, selectedRole)}
                        title={configured ? `Continue with ${label}` : `${label} signup is not configured yet`}
                        className="group border-border bg-card text-foreground hover:border-primary/20 hover:bg-accent/50 focus-visible:ring-ring/25 flex h-12 items-center justify-center gap-2.5 rounded-xl border px-3 text-[13px] font-medium shadow-[0_1px_2px_rgb(16_24_40/0.02)] transition-all duration-200 hover:-translate-y-px hover:shadow-sm focus-visible:ring-[3px] focus-visible:outline-none active:translate-y-0 disabled:pointer-events-none disabled:opacity-45"
                      >
                        <Icon className={`size-[18px] shrink-0 ${id === "linkedin" ? "text-[#0A66C2]" : ""} `} />

                        <span className="whitespace-nowrap">{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* =============================================
                    LOGIN LINK
                    ============================================= */}

                <div className="text-muted-foreground mt-7 text-center text-sm">
                  Already have an account?{" "}
                  <RouterLink
                    to="/login"
                    className="text-foreground decoration-border hover:text-primary hover:decoration-primary/40 font-medium underline underline-offset-4 transition-colors"
                  >
                    Log in
                  </RouterLink>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
