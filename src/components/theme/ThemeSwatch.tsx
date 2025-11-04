import React from "react";
import { ThemeDefinition, ThemeId } from "@/design-system";
import { cn } from "@/lib/utils";

interface ThemeSwatchProps {
  theme: ThemeDefinition;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: (themeId: ThemeId) => void;
  compact?: boolean;
}

const categoryLabels: Record<string, string> = {
  core: "Core",
  accessibility: "A11y",
  industry: "Industry",
  faithful: "Lore",
  premium: "Premium",
  limited: "Limited",
};

export const ThemeSwatch: React.FC<ThemeSwatchProps> = ({
  theme,
  selected,
  onSelect,
  disabled,
  compact,
}) => {
  const handleClick = () => {
    if (disabled) return;
    onSelect?.(theme.id);
  };

  const badge = categoryLabels[theme.category] ?? theme.category;

  const gradientStyle: React.CSSProperties = theme.accentGradient
    ? { backgroundImage: theme.accentGradient }
    : {
        backgroundImage:
          "linear-gradient(135deg, rgba(255,128,0,0.32) 0%, rgba(0,168,255,0.28) 100%)",
      };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "group flex w-full flex-col gap-2 rounded-xl border border-border/40 bg-background/60 px-3 py-3 text-left transition-all",
        "hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        disabled && "cursor-not-allowed opacity-60",
        selected && "border-primary/70 bg-primary/5 shadow-lg shadow-primary/30",
      )}
    >
      <div
        className={cn(
          "relative flex h-20 w-full items-center justify-center overflow-hidden rounded-lg",
          "border border-border/30 bg-card",
          compact && "h-14",
        )}
        style={gradientStyle}
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/90">
          <span>{theme.shortName ?? theme.name}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-foreground/90">{theme.name}</div>
          <div
            className={cn(
              "rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide",
              "bg-primary/10 text-primary/90",
              theme.premium && "bg-amber-500/15 text-amber-300",
              theme.category === "accessibility" && "bg-emerald-400/15 text-emerald-300",
              theme.category === "limited" && "bg-red-500/15 text-red-300",
            )}
          >
            {theme.premium ? "Premium" : badge}
          </div>
        </div>
        {!compact && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{theme.description}</p>
        )}
        {theme.tags && theme.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1">
            {theme.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-border/30 px-2 py-0.5 text-[0.625rem] uppercase tracking-wide text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
};
