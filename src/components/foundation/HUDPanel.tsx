import React from "react";
import { cn } from "@/lib/utils";

type HUDPanelVariant = "default" | "ghost" | "warning" | "success";

interface HUDPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: HUDPanelVariant;
  withGlow?: boolean;
  chrome?: boolean;
}

const variantMap: Record<HUDPanelVariant, string> = {
  default:
    "border-primary/25 bg-background/70 text-foreground shadow-[0_22px_48px_rgba(3,7,18,0.45)]",
  ghost: "border-primary/15 bg-background/40 text-muted-foreground shadow-none",
  warning:
    "border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-background/70 to-background/90 text-amber-100 shadow-[0_18px_42px_rgba(245,158,11,0.35)]",
  success:
    "border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 via-background/70 to-background/90 text-emerald-100 shadow-[0_18px_42px_rgba(52,211,153,0.33)]",
};

export const HUDPanel = React.forwardRef<HTMLDivElement, HUDPanelProps>(
  (
    { className, variant = "default", withGlow = false, chrome = true, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl border px-5 py-5 transition-shadow duration-200",
          variantMap[variant],
          withGlow && "shadow-primary/40",
          chrome && "backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
          "before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent", // top chrome line
          "after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/20 after:to-transparent",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

HUDPanel.displayName = "HUDPanel";
