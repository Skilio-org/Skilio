import { FaLinkedinIn } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export const SocialAuth = () => {
  const handleSocialLogin = (href: string | undefined) => {
    if (!href) return;

    window.location.assign(href);
  };

  const socialProviders = [
    {
      id: "google",
      label: "Continue with Google",
      icon: FcGoogle,
      href: import.meta.env.VITE_GOOGLE_OAUTH_URL as string | undefined,
    },
    {
      id: "linkedin",
      label: "Continue with LinkedIn",
      icon: FaLinkedinIn,
      href: import.meta.env.VITE_LINKEDIN_OAUTH_URL as string | undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
              {id === "linkedin" && "LinkedIn"}
            </span>

            <span className="whitespace-nowrap xl:hidden">
              {id === "google" && "Google"}
              {id === "linkedin" && "LinkedIn"}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SocialAuth;
