import { Link } from "@tanstack/react-router"

import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import icon from "/assets/images/freelancer-icon.png"
import iconLight from "/assets/images/freelancer-icon-light.png"
import logo from "/assets/images/freelancer-logo.png"
import logoLight from "/assets/images/freelancer-logo-light.png"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
  to?: "/" | "/dashboard"
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
  to = "/",
}: LogoProps) {
  const { resolvedTheme } = useTheme()

  const isDark = resolvedTheme === "dark"

  const fullLogo = isDark ? logoLight : logo
  const iconLogo = isDark ? iconLight : icon

  const content =
    variant === "responsive" ? (
      <>
        {/* Full logo */}
        <img
          src={fullLogo}
          alt="Freelancer"
          draggable={false}
          className={cn(
            `
              h-9
              w-auto
              object-contain
              select-none
              group-data-[collapsible=icon]:hidden
            `,
            className,
          )}
        />

        {/* Collapsed sidebar icon */}
        <img
          src={iconLogo}
          alt="Freelancer"
          draggable={false}
          className={cn(
            `
              hidden
              size-8
              object-contain
              select-none
              group-data-[collapsible=icon]:block
            `,
            className,
          )}
        />
      </>
    ) : (
      <img
        src={variant === "full" ? fullLogo : iconLogo}
        alt="Freelancer"
        draggable={false}
        className={cn(
          variant === "full"
            ? `
                h-9
                w-auto
                object-contain
                select-none
              `
            : `
                size-8
                object-contain
                select-none
              `,
          className,
        )}
      />
    )

  if (!asLink) {
    return content
  }

  return (
    <Link
      to={to}
      aria-label="Freelancer home"
      className="
        inline-flex
        shrink-0
        items-center
        outline-none
        focus-visible:ring-2
        focus-visible:ring-ring
        focus-visible:ring-offset-2
      "
    >
      {content}
    </Link>
  )
}
