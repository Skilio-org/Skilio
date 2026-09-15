import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link as RouterLink, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Divider from "@/components/auth/auth-divider";
import { AuthInput } from "@/components/auth/auth-input";
import RoleSelectButton from "@/components/auth/auth-role-select-button";
import SocialAuth from "@/components/auth/auth-social";
import { AuthLayout } from "@/components/common/auth-layout";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/loading-button";
import useAuth, { isLoggedIn } from "@/hooks/useAuth";

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

export const Route = createFileRoute("/signup")({
  component: SignUp,
  validateSearch: (search: Record<string, unknown>): { role?: "client" | "freelancer" } => ({
    role: search.role === "client" || search.role === "freelancer" ? search.role : undefined,
  }),

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

function SignUp() {
  const { signUpMutation } = useAuth();
  const { role } = Route.useSearch();

  const [step, setStep] = useState<SignupStep>(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),

    mode: "onBlur",
    criteriaMode: "all",

    defaultValues: {
      role: role ?? "freelancer",
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const selectedRole = form.watch("role");

  const goToDetails = async () => {
    const valid = await form.trigger("role");
    if (!valid) return;
    setStep(2);
  };

  const goBackToRole = () => {
    setStep(1);
  };

  const onSubmit = (data: FormData) => {
    if (signUpMutation.isPending) return;

    const { confirm_password: _confirmPassword, ...submitData } = data;

    signUpMutation.mutate(submitData);
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-115">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="mb-9 text-center">
                  <h1 className="font-display text-foreground text-[42px] leading-[0.98] font-bold tracking-[-0.045em] sm:text-[46px]">
                    How do you want <br />
                    to use Freelancer?
                  </h1>

                  <p className="text-muted-foreground mx-auto mt-4 max-w-95 text-sm leading-6">
                    Choose how you'd like to get started. You can manage your account settings later.
                  </p>
                </div>
                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-3.5">
                          <RoleSelectButton
                            field={field}
                            signUpMutation={signUpMutation}
                            userRole="freelancer"
                            title="I want to find work"
                            description="Create a freelancer profile, showcase your skills, and work with clients."
                          />
                          <RoleSelectButton
                            field={field}
                            signUpMutation={signUpMutation}
                            userRole="client"
                            title="I want to hire talent"
                            description="Find skilled freelancers, manage projects, and get high-quality work done."
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="mt-2 text-xs" />
                    </FormItem>
                  )}
                />
                <LoadingButton
                  type="button"
                  onClick={goToDetails}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 focus-visible:ring-ring/30 mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] focus-visible:outline-none active:translate-y-0"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </LoadingButton>

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

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <button
                  type="button"
                  onClick={goBackToRole}
                  disabled={signUpMutation.isPending}
                  className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
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
                <div className="space-y-4">
                  <AuthInput
                    control={form.control}
                    inputName="full_name"
                    inputLabel="Full name"
                    inputPlaceHolder="Your full name"
                    inputDataTestId="full-name-input"
                    inputType="text"
                    disabled={signUpMutation.isPending}
                  />
                  <AuthInput
                    control={form.control}
                    inputName="email"
                    inputLabel="Email"
                    inputPlaceHolder="you@example.com"
                    inputDataTestId="email-input"
                    inputType="email"
                    disabled={signUpMutation.isPending}
                  />

                  <AuthInput
                    control={form.control}
                    inputName="password"
                    inputLabel="Password"
                    inputPlaceHolder="Create a password"
                    inputDataTestId="password-input"
                    inputType="password"
                    disabled={signUpMutation.isPending}
                  />

                  <AuthInput
                    control={form.control}
                    inputName="confirm_password"
                    inputLabel="Confirm password"
                    inputPlaceHolder="Confirm your password"
                    inputDataTestId="confirm-password-input"
                    inputType="password"
                    disabled={signUpMutation.isPending}
                  />

                  <LoadingButton
                    type="submit"
                    loading={signUpMutation.isPending}
                    disabled={signUpMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 focus-visible:ring-ring/30 mt-2 h-12 w-full rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] active:translate-y-0"
                  >
                    {selectedRole === "freelancer" ? "Create freelancer account" : "Create client account"}
                  </LoadingButton>
                </div>

                <Divider text="Or sign up with" />

                <SocialAuth />

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
