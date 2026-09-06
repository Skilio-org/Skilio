import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const socialLinks = [
  {
    icon: FaGithub,
    href: "https://github.com/your-account",
    label: "GitHub",
  },
  {
    icon: FaXTwitter,
    href: "https://x.com/your-account",
    label: "X",
  },
  {
    icon: FaLinkedinIn,
    href: "https://linkedin.com/company/your-company",
    label: "LinkedIn",
  },
].filter(
  (
    link,
  ): link is {
    icon: typeof FaGithub;
    href: string;
    label: string;
  } => Boolean(link.href),
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="
        border-t
        border-border/70
        bg-background
        px-5
        py-5
        sm:px-6
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          items-center
          justify-between
          gap-6
        "
      >
        <div
          className="
            flex
            min-w-0
            flex-col
            gap-1
            sm:flex-row
            sm:items-center
            sm:gap-2
          "
        >
          <p
            className="
              whitespace-nowrap
              text-xs
              font-medium
              text-muted-foreground
            "
          >
            © {currentYear} Freelancer
          </p>

          <span
            aria-hidden="true"
            className="
              hidden
              text-border
              sm:inline
            "
          >
            ·
          </span>

          <p
            className="
              hidden
              truncate
              text-xs
              text-muted-foreground/80
              sm:block
            "
          >
            Work without limits.
          </p>
        </div>

        {/* =================================================
            SOCIAL LINKS
            ================================================= */}

        {socialLinks.length > 0 && (
          <div
            className="
              flex
              shrink-0
              items-center
              gap-1
            "
          >
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="
                    group
                    flex
                    size-9
                    items-center
                    justify-center
                    rounded-lg
                    text-muted-foreground
                    transition-all
                    duration-200
                    hover:bg-accent
                    hover:text-accent-foreground
                    focus-visible:outline-none
                    focus-visible:ring-[3px]
                    focus-visible:ring-ring/30
                  "
              >
                <Icon
                  className="
                      size-4.25
                      transition-transform
                      duration-200
                      group-hover:scale-105
                    "
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
