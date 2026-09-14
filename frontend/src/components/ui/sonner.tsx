"use client";

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group professional-toaster"
      position="bottom-right"
      duration={3800}
      visibleToasts={3}
      gap={8}
      offset={16}
      mobileOffset={12}
      icons={{
        success: (
          <span className="bg-success-soft text-success grid size-8 place-items-center rounded-lg">
            <CircleCheckIcon className="size-4" />
          </span>
        ),
        info: (
          <span className="bg-accent text-primary grid size-8 place-items-center rounded-lg">
            <InfoIcon className="size-4" />
          </span>
        ),
        warning: (
          <span className="bg-warning-soft text-warning grid size-8 place-items-center rounded-lg">
            <TriangleAlertIcon className="size-4" />
          </span>
        ),
        error: (
          <span className="bg-danger-soft text-destructive grid size-8 place-items-center rounded-lg">
            <OctagonXIcon className="size-4" />
          </span>
        ),
        loading: (
          <span className="bg-muted text-muted-foreground grid size-8 place-items-center rounded-lg">
            <Loader2Icon className="size-4 animate-spin" />
          </span>
        ),
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            "!w-[min(21rem,calc(100vw-1.5rem))] !min-h-14 !rounded-xl !border-border !bg-popover !px-3.5 !py-3 !pr-10 !text-popover-foreground !shadow-card-hover",
          content: "!gap-0.5",
          title: "!text-[13px] !font-semibold !leading-5 !tracking-[-0.01em]",
          description: "!text-muted-foreground !text-xs !leading-[1.125rem]",
          icon: "!mr-0.5 !size-8",
          success: "!border-l-[3px] !border-l-success",
          info: "!border-l-[3px] !border-l-primary",
          warning: "!border-l-[3px] !border-l-warning",
          error: "!border-l-[3px] !border-l-destructive",
          closeButton:
            "!top-1/2 !right-2 !left-auto !size-7 !translate-x-0 !-translate-y-1/2 !border-0 !bg-transparent !text-muted-foreground hover:!bg-muted hover:!text-foreground",
          actionButton: "!h-8 !rounded-lg !bg-primary !px-3 !text-xs !font-semibold !text-primary-foreground",
          cancelButton: "!h-8 !rounded-lg !bg-muted !px-3 !text-xs !font-semibold !text-foreground",
          ...toastOptions?.classNames,
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
