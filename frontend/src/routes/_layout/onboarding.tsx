import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { WorkspacePageHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccountRole } from "@/hooks/useAccountRole";

export const Route = createFileRoute("/_layout/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Account Setup & Onboarding | Skilio" },
      {
        name: "description",
        content:
          "Complete your profile setup to start discovering projects or connecting with top independent talent.",
      },
    ],
  }),
});

/* ==================================================================
   TYPES & SHARED CONFIG
   ================================================================== */

type Role = "freelancer" | "client";

interface FreelancerForm {
  title: string;
  category: string;
  skills: string[];
  hourlyRate: string;
  availability: string;
  bio: string;
}

interface ClientForm {
  company: string;
  companyRole: string;
  industry: string;
  companySize: string;
  talentCategory: string;
  typicalBudget: string;
}

const CATEGORIES = [
  "Development & IT",
  "Design & Creative",
  "AI & Machine Learning",
  "Marketing & Content",
  "Product & Management",
];

const SUGGESTED_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "Next.js",
  "Figma",
  "UI/UX Design",
  "Python",
  "FastAPI",
  "PostgreSQL",
  "Docker",
  "GraphQL",
];

const COMPANY_SIZES = [
  "1-10 employees (Startup)",
  "11-50 employees (Growing)",
  "51-200 employees (Mid-market)",
  "200+ employees (Enterprise)",
];

const AVAILABILITY_OPTIONS = [
  "Full-time (40h/week)",
  "Part-time (20h/week)",
  "Contract / Flexible",
];

/* ==================================================================
   REUSABLE WIZARD SHELL (Reduces repetitive markup across steps)
   ================================================================== */

interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  title: string;
  description: string;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  children: React.ReactNode;
}

function WizardShell({
  currentStep,
  totalSteps,
  stepTitles,
  title,
  description,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Continue",
  children,
}: WizardShellProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Step Indicators Bar */}
      <div className="flex items-center justify-between gap-2 px-2">
        {stepTitles.map((stepTitle, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={stepTitle} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-2 border-primary text-link"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="size-3.5" /> : idx + 1}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:inline ${
                    isCurrent
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {stepTitle}
                </span>
              </div>
              {idx < totalSteps - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    isDone ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Step Card */}
      <Card className="border bg-card/70 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="border-border border-b pb-4">
            <Badge variant="outline" className="mb-2 text-[10px] font-medium text-link border-primary/30">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              {title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Form Content */}
          <div className="py-2">{children}</div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between border-border border-t pt-5">
            {!isFirstStep && !isLastStep ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBack}
                className="gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              size="sm"
              disabled={nextDisabled}
              onClick={onNext}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>{nextLabel}</span>
              {!isLastStep && <ArrowRight className="size-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ==================================================================
   MAIN ONBOARDING COMPONENT
   ================================================================== */

function OnboardingPage() {
  const detectedRole = useAccountRole();
  const navigate = useNavigate();

  // Active role can be toggled if user wants to set up the opposite profile
  const [role, setRole] = useState<Role>(
    detectedRole === "client" ? "client" : "freelancer"
  );
  const [step, setStep] = useState(0);

  // Freelancer state
  const [freelancerData, setFreelancerData] = useState<FreelancerForm>({
    title: "",
    category: CATEGORIES[0],
    skills: ["React", "TypeScript"],
    hourlyRate: "65",
    availability: AVAILABILITY_OPTIONS[0],
    bio: "",
  });
  const [customSkill, setCustomSkill] = useState("");

  // Client state
  const [clientData, setClientData] = useState<ClientForm>({
    company: "",
    companyRole: "Founder / Project Lead",
    industry: "Technology & Software",
    companySize: COMPANY_SIZES[0],
    talentCategory: CATEGORIES[0],
    typicalBudget: "$3,000 - $10,000",
  });

  const FREELANCER_STEPS = ["Expertise", "Skills", "Availability", "Complete"];
  const CLIENT_STEPS = ["Company", "Requirements", "Budget", "Complete"];

  // Skill management helpers
  const toggleSkill = (skill: string) => {
    setFreelancerData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkill.trim();
    if (trimmed && !freelancerData.skills.includes(trimmed)) {
      setFreelancerData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setCustomSkill("");
    }
  };

  // Validation per step
  const canContinue = () => {
    if (role === "freelancer") {
      if (step === 0) return Boolean(freelancerData.title.trim());
      if (step === 1) return freelancerData.skills.length >= 1;
      if (step === 2) return Boolean(freelancerData.hourlyRate.trim());
      return true;
    } else {
      if (step === 0) return Boolean(clientData.company.trim());
      if (step === 1) return Boolean(clientData.talentCategory);
      if (step === 2) return Boolean(clientData.typicalBudget);
      return true;
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem("skilio_onboarding_completed", "true");
      localStorage.setItem(
        `skilio_${role}_onboarding_profile`,
        JSON.stringify(role === "freelancer" ? freelancerData : clientData)
      );
    } catch (e) {
      console.error(e);
    }

    toast.success("Welcome aboard!", {
      description: "Your workspace profile has been successfully initialized.",
    });

    if (role === "freelancer") {
      navigate({ to: "/freelancer-jobs" });
    } else {
      navigate({ to: "/talent", search: { q: "", category: "" } });
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Page Header with Role Switcher */}
      <WorkspacePageHeader
        eyebrow="Account Setup"
        title="Welcome to Skilio"
        description="Let's tailor your experience. Tell us a bit about your work to get matched with the right opportunities."
        action={
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => {
                setRole("freelancer");
                setStep(0);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                role === "freelancer"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="size-3.5" />
              <span>Freelancer Setup</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("client");
                setStep(0);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                role === "client"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="size-3.5" />
              <span>Client Setup</span>
            </button>
          </div>
        }
      />

      {/* ==============================================================
          FREELANCER FLOW
          ============================================================== */}
      {role === "freelancer" && (
        <>
          {/* Step 1: Professional Title & Category */}
          {step === 0 && (
            <WizardShell
              currentStep={step}
              totalSteps={FREELANCER_STEPS.length}
              stepTitles={FREELANCER_STEPS}
              title="What is your primary craft?"
              description="Your headline is the first thing prospective clients see on your proposals."
              onBack={() => setStep(0)}
              onNext={() => setStep(1)}
              nextDisabled={!canContinue()}
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Professional Headline</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Full-Stack React & Node.js Engineer"
                    value={freelancerData.title}
                    onChange={(e) =>
                      setFreelancerData({ ...freelancerData, title: e.target.value })
                    }
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Be specific about your seniority and primary stack.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Primary Domain Category</Label>
                  <Select
                    value={freelancerData.category}
                    onValueChange={(val: string) =>
                      setFreelancerData({ ...freelancerData, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </WizardShell>
          )}

          {/* Step 2: Skills & Expertise */}
          {step === 1 && (
            <WizardShell
              currentStep={step}
              totalSteps={FREELANCER_STEPS.length}
              stepTitles={FREELANCER_STEPS}
              title="Highlight your core technical skills"
              description="Select the skills you use every day so job algorithms can surface relevant listings."
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
              nextDisabled={!canContinue()}
            >
              <div className="space-y-5">
                {/* Selected Skills Chips */}
                <div className="space-y-2">
                  <Label>Selected Skills ({freelancerData.skills.length})</Label>
                  <div className="flex flex-wrap gap-1.5 min-h-10 p-2.5 rounded-lg border bg-muted/20">
                    {freelancerData.skills.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="gap-1 pr-1 text-xs py-1 bg-primary/10 text-link border-primary/20"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => toggleSkill(s)}
                          className="rounded-full hover:bg-primary/20 p-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    {freelancerData.skills.length === 0 && (
                      <span className="text-xs text-muted-foreground self-center">
                        No skills selected yet. Click from suggestions below.
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Add Suggestions */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Suggested for you:</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_SKILLS.map((skill) => {
                      const selected = freelancerData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Skill Input */}
                <form onSubmit={addCustomSkill} className="flex gap-2">
                  <Input
                    placeholder="Add a custom skill..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Add
                  </Button>
                </form>
              </div>
            </WizardShell>
          )}

          {/* Step 3: Hourly Rate & Availability */}
          {step === 2 && (
            <WizardShell
              currentStep={step}
              totalSteps={FREELANCER_STEPS.length}
              stepTitles={FREELANCER_STEPS}
              title="Set your target rate & working schedule"
              description="You can adjust this anytime on your profile or when submitting bids."
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextDisabled={!canContinue()}
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rate">Target Hourly Rate (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-semibold">
                      $
                    </span>
                    <Input
                      id="rate"
                      type="number"
                      min="10"
                      max="500"
                      className="pl-7"
                      placeholder="65"
                      value={freelancerData.hourlyRate}
                      onChange={(e) =>
                        setFreelancerData({
                          ...freelancerData,
                          hourlyRate: e.target.value,
                        })
                      }
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                      / hour
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Weekly Availability</Label>
                  <Select
                    value={freelancerData.availability}
                    onValueChange={(val: string) =>
                      setFreelancerData({ ...freelancerData, availability: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </WizardShell>
          )}

          {/* Step 4: Complete! */}
          {step === 3 && (
            <WizardShell
              currentStep={step}
              totalSteps={FREELANCER_STEPS.length}
              stepTitles={FREELANCER_STEPS}
              title="You're ready to find work!"
              description="Your profile foundation is set up and ready to bid or connect."
              onBack={() => setStep(2)}
              onNext={handleFinish}
              nextLabel="Go to Job Board"
            >
              <div className="rounded-xl border bg-muted/20 p-5 space-y-4 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-link">
                  <CheckCircle2 className="size-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {freelancerData.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {freelancerData.category} · ${freelancerData.hourlyRate}/hr
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {freelancerData.skills.map((s) => (
                    <Badge key={s} variant="outline" className="text-[11px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </WizardShell>
          )}
        </>
      )}

      {/* ==============================================================
          CLIENT FLOW
          ============================================================== */}
      {role === "client" && (
        <>
          {/* Step 1: Company Info */}
          {step === 0 && (
            <WizardShell
              currentStep={step}
              totalSteps={CLIENT_STEPS.length}
              stepTitles={CLIENT_STEPS}
              title="Tell us about your organization"
              description="Freelancers review company context when evaluating incoming project inquiries."
              onBack={() => setStep(0)}
              onNext={() => setStep(1)}
              nextDisabled={!canContinue()}
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company or Organization Name</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Apex Labs / Solis Health"
                    value={clientData.company}
                    onChange={(e) =>
                      setClientData({ ...clientData, company: e.target.value })
                    }
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Company Size</Label>
                  <Select
                    value={clientData.companySize}
                    onValueChange={(val: string) =>
                      setClientData({ ...clientData, companySize: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </WizardShell>
          )}

          {/* Step 2: What You're Looking For */}
          {step === 1 && (
            <WizardShell
              currentStep={step}
              totalSteps={CLIENT_STEPS.length}
              stepTitles={CLIENT_STEPS}
              title="What kind of talent do you need?"
              description="We will tailor your directory recommendations to match your primary hiring needs."
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
              nextDisabled={!canContinue()}
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Primary Domain Category</Label>
                  <Select
                    value={clientData.talentCategory}
                    onValueChange={(val: string) =>
                      setClientData({ ...clientData, talentCategory: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </WizardShell>
          )}

          {/* Step 3: Project Budget Range */}
          {step === 2 && (
            <WizardShell
              currentStep={step}
              totalSteps={CLIENT_STEPS.length}
              stepTitles={CLIENT_STEPS}
              title="Estimated project budget scale"
              description="Helps us filter specialists whose typical project scope aligns with your goals."
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextDisabled={!canContinue()}
            >
              <div className="space-y-3">
                {[
                  { label: "Starter", range: "$1,000 - $3,000", desc: "Small tasks, audits, quick sprints" },
                  { label: "Standard", range: "$3,000 - $10,000", desc: "Core feature builds, design systems" },
                  { label: "Extensive", range: "$10,000+", desc: "Full product overhauls, dedicated staff" },
                ].map(({ label, range, desc }) => (
                  <div
                    key={label}
                    onClick={() => setClientData({ ...clientData, typicalBudget: range })}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                      clientData.typicalBudget === range
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">{range}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    {clientData.typicalBudget === range && (
                      <Check className="size-4 text-link" />
                    )}
                  </div>
                ))}
              </div>
            </WizardShell>
          )}

          {/* Step 4: Complete! */}
          {step === 3 && (
            <WizardShell
              currentStep={step}
              totalSteps={CLIENT_STEPS.length}
              stepTitles={CLIENT_STEPS}
              title="Your client workspace is ready!"
              description="You can now explore verified freelancers and send direct connection requests."
              onBack={() => setStep(2)}
              onNext={handleFinish}
              nextLabel="Explore Talent Directory"
            >
              <div className="rounded-xl border bg-muted/20 p-5 space-y-3 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-link">
                  <Building2 className="size-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {clientData.company}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hiring for {clientData.talentCategory} · Budget: {clientData.typicalBudget}
                  </p>
                </div>
              </div>
            </WizardShell>
          )}
        </>
      )}
    </div>
  );
}
