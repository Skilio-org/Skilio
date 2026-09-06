import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  redirect,
  Link as RouterLink,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

/* =========================================================
   ROUTE
   ========================================================= */

export const Route = createFileRoute("/signup")({
  component: SignUp,

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
        title: "Create account | Freelancer",
      },
      {
        name: "description",
        content:
          "Create your account as a freelancer or client and start working together.",
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
    const isRoleValid = await form.trigger("role");

    if (!isRoleValid) return;

    setStep(2);
  };

  const goBackToRole = () => {
    setStep(1);
  };

  /* =======================================================
     SUBMIT
     ======================================================= */

  const onSubmit = (data: FormData) => {
    if (signUpMutation.isPending) return;

    const { confirm_password: _confirmPassword, ...submitData } = data;

    signUpMutation.mutate(submitData);
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[400px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {/* =================================================
                STEP 1 — ACCOUNT TYPE
                ================================================= */}

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                {/* Header */}

                <div className="mb-8 text-center">
                  <div
                    className="
                      mb-4
                      inline-flex
                      items-center
                      rounded-full
                      border
                      border-brand-200
                      bg-brand-50
                      px-3
                      py-1
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-brand-700
                    "
                  >
                    Get started
                  </div>

                  <h1
                    className="
                      font-display
                      text-[40px]
                      font-bold
                      leading-[0.98]
                      tracking-[-0.045em]
                      text-foreground
                    "
                  >
                    How do you want
                    <br />
                    to use Freelancer?
                  </h1>

                  <p
                    className="
                      mx-auto
                      mt-4
                      max-w-[330px]
                      text-sm
                      leading-6
                      text-muted-foreground
                    "
                  >
                    Choose how you'd like to get started. You can manage your
                    account settings later.
                  </p>
                </div>

                {/* Role Selection */}

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-3">
                          {/* Freelancer */}

                          <button
                            type="button"
                            aria-pressed={field.value === "freelancer"}
                            disabled={signUpMutation.isPending}
                            onClick={() => field.onChange("freelancer")}
                            className={`
                              group
                              relative
                              flex
                              w-full
                              items-center
                              gap-4
                              rounded-2xl
                              border
                              p-5
                              text-left
                              transition-all
                              duration-200
                              focus-visible:outline-none
                              focus-visible:ring-[3px]
                              focus-visible:ring-brand-100

                              ${
                                field.value === "freelancer"
                                  ? `
                                    border-brand-300
                                    bg-brand-50/80
                                    shadow-[0_1px_2px_rgb(16_24_40/0.03),0_6px_18px_rgb(70_88_232/0.08)]
                                  `
                                  : `
                                    border-border
                                    bg-card
                                    hover:-translate-y-px
                                    hover:border-brand-200
                                    hover:bg-brand-50/30
                                    hover:shadow-[0_6px_20px_rgb(16_24_40/0.05)]
                                  `
                              }
                            `}
                          >
                            <div
                              className={`
                                flex
                                size-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                transition-all
                                duration-200

                                ${
                                  field.value === "freelancer"
                                    ? `
                                      bg-primary
                                      text-primary-foreground
                                      shadow-[0_4px_12px_rgb(70_88_232/0.22)]
                                    `
                                    : `
                                      bg-muted
                                      text-muted-foreground
                                      group-hover:bg-brand-50
                                      group-hover:text-brand-600
                                    `
                                }
                              `}
                            >
                              <UserRound className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="
                                    text-[15px]
                                    font-semibold
                                    text-foreground
                                  "
                                >
                                  I want to find work
                                </span>
                              </div>

                              <p
                                className="
                                  mt-1
                                  text-[13px]
                                  leading-5
                                  text-muted-foreground
                                "
                              >
                                Create a freelancer profile, showcase your
                                skills, and work with clients.
                              </p>
                            </div>

                            <div
                              className={`
                                flex
                                size-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                transition-all

                                ${
                                  field.value === "freelancer"
                                    ? `
                                      border-primary
                                      bg-primary
                                      text-primary-foreground
                                    `
                                    : `
                                      border-border
                                      bg-card
                                      text-transparent
                                    `
                                }
                              `}
                            >
                              <Check className="size-3.5" strokeWidth={3} />
                            </div>
                          </button>

                          {/* Client */}

                          <button
                            type="button"
                            aria-pressed={field.value === "client"}
                            disabled={signUpMutation.isPending}
                            onClick={() => field.onChange("client")}
                            className={`
                              group
                              relative
                              flex
                              w-full
                              items-center
                              gap-4
                              rounded-2xl
                              border
                              p-5
                              text-left
                              transition-all
                              duration-200
                              focus-visible:outline-none
                              focus-visible:ring-[3px]
                              focus-visible:ring-brand-100

                              ${
                                field.value === "client"
                                  ? `
                                    border-brand-300
                                    bg-brand-50/80
                                    shadow-[0_1px_2px_rgb(16_24_40/0.03),0_6px_18px_rgb(70_88_232/0.08)]
                                  `
                                  : `
                                    border-border
                                    bg-card
                                    hover:-translate-y-px
                                    hover:border-brand-200
                                    hover:bg-brand-50/30
                                    hover:shadow-[0_6px_20px_rgb(16_24_40/0.05)]
                                  `
                              }
                            `}
                          >
                            <div
                              className={`
                                flex
                                size-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                transition-all
                                duration-200

                                ${
                                  field.value === "client"
                                    ? `
                                      bg-primary
                                      text-primary-foreground
                                      shadow-[0_4px_12px_rgb(70_88_232/0.22)]
                                    `
                                    : `
                                      bg-muted
                                      text-muted-foreground
                                      group-hover:bg-brand-50
                                      group-hover:text-brand-600
                                    `
                                }
                              `}
                            >
                              <BriefcaseBusiness className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="
                                    text-[15px]
                                    font-semibold
                                    text-foreground
                                  "
                                >
                                  I want to hire talent
                                </span>
                              </div>

                              <p
                                className="
                                  mt-1
                                  text-[13px]
                                  leading-5
                                  text-muted-foreground
                                "
                              >
                                Find skilled freelancers, manage projects, and
                                get great work done.
                              </p>
                            </div>

                            <div
                              className={`
                                flex
                                size-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                transition-all

                                ${
                                  field.value === "client"
                                    ? `
                                      border-primary
                                      bg-primary
                                      text-primary-foreground
                                    `
                                    : `
                                      border-border
                                      bg-card
                                      text-transparent
                                    `
                                }
                              `}
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

                {/* Continue */}

                <button
                  type="button"
                  onClick={goToDetails}
                  className="
                    mt-6
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
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
                  Continue
                  <ArrowRight className="size-4" />
                </button>

                {/* Login */}

                <div
                  className="
                    mt-6
                    text-center
                    text-sm
                    text-muted-foreground
                  "
                >
                  Already have an account?{" "}
                  <RouterLink
                    to="/login"
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
                {/* Back */}

                <button
                  type="button"
                  onClick={goBackToRole}
                  disabled={signUpMutation.isPending}
                  className="
                    mb-6
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                    disabled:pointer-events-none
                    disabled:opacity-50
                  "
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>

                {/* Header */}

                <div className="mb-7">
                  <h1
                    className="
                      font-display
                      text-[40px]
                      font-bold
                      leading-[0.98]
                      tracking-[-0.045em]
                      text-foreground
                    "
                  >
                    Create your
                    <br />
                    account.
                  </h1>

                  <p
                    className="
                      mt-3
                      max-w-sm
                      text-sm
                      leading-6
                      text-muted-foreground
                    "
                  >
                    You're joining as{" "}
                    <span className="font-medium text-foreground">
                      {selectedRole === "freelancer"
                        ? "a freelancer"
                        : "a client"}
                    </span>
                    .
                  </p>
                </div>

                {/* Selected Role */}

                <div
                  className="
                    mb-6
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-brand-200
                    bg-brand-50/60
                    p-3
                  "
                >
                  <div
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-primary
                      text-primary-foreground
                    "
                  >
                    {selectedRole === "freelancer" ? (
                      <UserRound className="size-4" />
                    ) : (
                      <BriefcaseBusiness className="size-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                        text-[13px]
                        font-semibold
                        text-foreground
                      "
                    >
                      {selectedRole === "freelancer"
                        ? "Freelancer account"
                        : "Client account"}
                    </div>

                    <div
                      className="
                        mt-0.5
                        text-xs
                        text-muted-foreground
                      "
                    >
                      {selectedRole === "freelancer"
                        ? "Find work and build your career."
                        : "Hire talent and manage projects."}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={goBackToRole}
                    disabled={signUpMutation.isPending}
                    className="
                      rounded-md
                      px-2
                      py-1
                      text-xs
                      font-medium
                      text-brand-700
                      transition-colors
                      hover:bg-brand-100
                      disabled:pointer-events-none
                      disabled:opacity-50
                    "
                  >
                    Change
                  </button>
                </div>

                {/* Fields */}

                <div className="space-y-4">
                  {/* Full name */}

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel
                          className="
                            text-[13px]
                            font-medium
                            text-foreground
                          "
                        >
                          Full name
                        </FormLabel>

                        <FormControl>
                          <Input
                            data-testid="full-name-input"
                            type="text"
                            autoComplete="name"
                            placeholder="Your full name"
                            disabled={signUpMutation.isPending}
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

                  {/* Email */}

                  <FormField
                    control={form.control}
                    name="email"
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
                            disabled={signUpMutation.isPending}
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
                        <FormLabel
                          className="
                            text-[13px]
                            font-medium
                            text-foreground
                          "
                        >
                          Password
                        </FormLabel>

                        <FormControl>
                          <PasswordInput
                            data-testid="password-input"
                            autoComplete="new-password"
                            placeholder="Create a password"
                            disabled={signUpMutation.isPending}
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

                  {/* Confirm Password */}

                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel
                          className="
                            text-[13px]
                            font-medium
                            text-foreground
                          "
                        >
                          Confirm password
                        </FormLabel>

                        <FormControl>
                          <PasswordInput
                            data-testid="confirm-password-input"
                            autoComplete="new-password"
                            placeholder="Confirm your password"
                            disabled={signUpMutation.isPending}
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
                    loading={signUpMutation.isPending}
                    disabled={signUpMutation.isPending}
                    className="
                      mt-2
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
                    {selectedRole === "freelancer"
                      ? "Create freelancer account"
                      : "Create client account"}
                  </LoadingButton>
                </div>

                {/* Login */}

                <div
                  className="
                    mt-5
                    text-center
                    text-sm
                    text-muted-foreground
                  "
                >
                  Already have an account?{" "}
                  <RouterLink
                    to="/login"
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

export default SignUp;
