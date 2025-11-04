import React from "react";
import { cn } from "@/lib/utils";

interface MissionPillProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subtle?: boolean;
}

export const MissionPill: React.FC<MissionPillProps> = ({
  icon,
  label,
  value,
  subtle,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-2 text-xs uppercase tracking-[0.32em] text-primary/80 shadow-primary/10",
        subtle && "border-primary/10 bg-background/40 text-muted-foreground",
        className,
      )}
      {...props}
    >
      {icon && <span className="text-primary/90">{icon}</span>}
      <span aria-hidden className="font-semibold">
        {label}
      </span>
      <span className="font-bold normal-case tracking-[0.08em] text-foreground">{value}</span>
    </div>
  );
};
