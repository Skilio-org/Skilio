import {
  Check,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { useTheme, type Theme } from "@/components/theme-provider";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

/* =========================================================
   CONFIG
   ========================================================= */

type ThemeOption = {
  value: Theme;
  label: string;
  description: string;
  icon: LucideIcon;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description: "Always use light mode",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always use dark mode",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Match your device",
    icon: Monitor,
  },
];

const ICON_MAP: Record<Theme, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const LABEL_MAP: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

/* =========================================================
   THEME OPTION
   ========================================================= */

interface ThemeOptionItemProps {
  value: Theme;
  label: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}

function ThemeOptionItem({
  value,
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
}: ThemeOptionItemProps) {
  return (
    <DropdownMenuItem
      data-testid={`${value}-mode`}
      onSelect={onSelect}
      className={`
        group
        flex
        min-h-[58px]
        cursor-pointer
        items-center
        gap-3
        rounded-xl
        border
        px-3
        py-2
        outline-none
        transition-all
        duration-150

        ${
          selected
            ? `
              border-primary/20
              bg-accent/45

              data-[highlighted]:border-primary/25
              data-[highlighted]:bg-accent/55
            `
            : `
              border-transparent
              bg-transparent

              data-[highlighted]:border-transparent
              data-[highlighted]:bg-muted/60
            `
        }
      `}
    >
      {/* =====================================================
          ICON
          ===================================================== */}

      <div
        className={`
          flex
          size-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          transition-colors
          duration-150

          ${
            selected
              ? `
                bg-primary/10
                text-primary
              `
              : `
                bg-muted
                text-muted-foreground

                group-data-[highlighted]:bg-background
                group-data-[highlighted]:text-foreground
              `
          }
        `}
      >
        <Icon className="size-[17px]" />
      </div>

      {/* =====================================================
          LABEL
          ===================================================== */}

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>

        <div
          className="
            mt-0.5
            text-[11px]
            leading-4
            text-muted-foreground
          "
        >
          {description}
        </div>
      </div>

      {/* =====================================================
          SELECTED INDICATOR
          ===================================================== */}

      {selected && (
        <div
          className="
            flex
            size-5
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-primary
            text-primary-foreground
            shadow-sm
          "
        >
          <Check className="size-3 text-white" strokeWidth={3} />
        </div>
      )}
    </DropdownMenuItem>
  );
}

/* =========================================================
   SIDEBAR APPEARANCE
   ========================================================= */

export function SidebarAppearance() {
  const { isMobile } = useSidebar();

  const { theme, setTheme } = useTheme();

  const ActiveIcon = ICON_MAP[theme];
  const activeLabel = LABEL_MAP[theme];

  return (
    <SidebarMenuItem>
      <DropdownMenu modal={false}>
        {/* =================================================
            TRIGGER
            ================================================= */}

        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip="Appearance"
            data-testid="theme-button"
            className="
              h-11
              rounded-lg
              px-3
              text-[14px]
              font-medium
              text-sidebar-foreground
              transition-colors
              duration-150

              hover:bg-muted/50
              hover:text-sidebar-foreground

              data-[state=open]:bg-muted/55
              data-[state=open]:text-sidebar-foreground
            "
          >
            <ActiveIcon
              className="
                size-[19px]
                shrink-0
                text-muted-foreground
              "
            />

            <span className="flex-1">Appearance</span>

            <span
              className="
                text-xs
                font-normal
                text-muted-foreground

                group-data-[collapsible=icon]:hidden
              "
            >
              {activeLabel}
            </span>

            <ChevronRight
              className="
                ml-1
                size-4
                shrink-0
                text-muted-foreground

                group-data-[collapsible=icon]:hidden
              "
            />

            <span className="sr-only">Change appearance</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        {/* =================================================
            MENU
            ================================================= */}

        <DropdownMenuContent
          side={isMobile ? "top" : "right"}
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="
            w-[250px]
            rounded-2xl
            border
            border-border
            bg-popover
            p-1.5
            text-popover-foreground
            shadow-floating
          "
        >
          {THEME_OPTIONS.map((option) => (
            <ThemeOptionItem
              key={option.value}
              {...option}
              selected={theme === option.value}
              onSelect={() => setTheme(option.value)}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

/* =========================================================
   STANDALONE APPEARANCE
   Used on auth screens
   ========================================================= */

export function Appearance() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu modal={false}>
      {/* ===================================================
          TRIGGER
          =================================================== */}

      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-testid="theme-button"
          className="
            relative
            size-9
            rounded-lg
            border
            border-border
            bg-card/80
            text-muted-foreground
            shadow-sm
            backdrop-blur-sm
            transition-all
            duration-150

            hover:border-foreground/10
            hover:bg-muted/60
            hover:text-foreground

            data-[state=open]:border-foreground/10
            data-[state=open]:bg-muted/60
            data-[state=open]:text-foreground

            focus-visible:ring-[3px]
            focus-visible:ring-ring/20
          "
        >
          {isDark ? (
            <Moon className="size-[17px]" />
          ) : (
            <Sun className="size-[17px]" />
          )}

          <span className="sr-only">Change appearance</span>
        </Button>
      </DropdownMenuTrigger>

      {/* ===================================================
          MENU
          =================================================== */}

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="
          w-[250px]
          rounded-2xl
          border
          border-border
          bg-popover
          p-1.5
          text-popover-foreground
          shadow-floating
        "
      >
        {THEME_OPTIONS.map((option) => (
          <ThemeOptionItem
            key={option.value}
            {...option}
            selected={theme === option.value}
            onSelect={() => setTheme(option.value)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
