import React from "react";
import { ThemeDefinition, ThemeId } from "@/design-system";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ThemeSwatchProps {
  theme: ThemeDefinition;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: (themeId: ThemeId) => void;
  compact?: boolean;
}

const categoryLabel: Record<string, string> = {
  core: "Core",
  accessibility: "A11y",
  industry: "Industry",
  faithful: "Lore",
  premium: "Premium",
  limited: "Limited",
};

const buildAccentStyle = (theme: ThemeDefinition): React.CSSProperties => {
  if (theme.accentGradient) {
    return { backgroundImage: theme.accentGradient };
  }
  const glow = theme.cssVars["--primary"] ?? "30 100% 54%";
  return { background: `linear-gradient(135deg, hsla(${glow} / 0.24), hsla(${glow} / 0.05))` };
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

  const badge = categoryLabel[theme.category] ?? theme.category;
  const accentStyle = buildAccentStyle(theme);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "group relative flex w-full flex-col gap-3 rounded-2xl border border-border/50 bg-background/60 p-4 text-left transition-all",
        "hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        disabled && "cursor-not-allowed opacity-60",
        selected && "border-primary/70 bg-primary/5 shadow-[0_20px_55px_rgba(255,111,15,0.28)]",
      )}
      style={{
        backgroundImage: `linear-gradient(160deg, hsla(0,0%,0%,0.36), transparent 60%)`,
      }}
    >
      <div
        className={cn(
          "relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-border/40",
          compact && "h-16",
        )}
        style={accentStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/40 to-background/10 transition-opacity group-hover:opacity-70" />
        <div className="relative flex flex-col items-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/80 drop-shadow">
            {theme.shortName ?? theme.name}
          </span>
          {theme.badges && theme.badges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1">
              {theme.badges.map((label) => (
                <Badge key={label} variant="secondary" className="bg-background/75 text-[0.625rem] uppercase tracking-widest">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-foreground/90">{theme.name}</div>
          <Badge
            className={cn(
              "uppercase tracking-[0.22em]",
              theme.premium && "bg-amber-500/15 text-amber-300",
              theme.category === "accessibility" && "bg-emerald-500/15 text-emerald-300",
              theme.category === "limited" && "bg-rose-500/15 text-rose-300",
            )}
            variant={theme.premium ? "default" : "outline"}
          >
            {theme.premium ? "Premium" : badge}
          </Badge>
        </div>
        {!compact && (
          <p className="line-clamp-3 text-sm text-muted-foreground/90">{theme.description}</p>
        )}
        {!compact && theme.tags && theme.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {theme.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-border/50 bg-background/70 text-[0.625rem] uppercase tracking-widest"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </button>
  );
};
