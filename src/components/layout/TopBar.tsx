import React from "react";
import { User, Settings as SettingsIcon, MapPin, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeQuickSwitcher } from "@/components/theme";
import { MissionPill } from "@/components/foundation";

interface TopBarProps {
  onModuleClick: (module: string) => void;
}

export const TopBar = ({ onModuleClick }: TopBarProps) => {
  const navigate = useNavigate();

  return (
    <div className="absolute left-0 right-0 top-0 z-[var(--z-topbar)] h-12 bg-[radial-gradient(circle_at_top,rgba(255,140,0,0.12),rgba(10,15,25,0.25))] backdrop-blur supports-[backdrop-filter]:backdrop-blur-2xl">
      {/* Corner brackets */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="corner-bracket-sm corner-tl" />
        <div className="corner-bracket-sm corner-tr" />
      </div>
      <div className="flex h-full items-center justify-between gap-3 border-b border-primary/20 px-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/90 shadow-lg shadow-primary/30">
            <span className="text-base font-bold text-primary-foreground">AOS</span>
          </div>
          <div className="hidden md:flex md:flex-col">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-primary/80">
              Pavement Performance Suite
            </span>
            <span className="text-xs text-muted-foreground">
              Command &amp; Control for Church + Commercial Asphalt Ops
            </span>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-4 lg:flex">
          <MissionPill
            icon={<CalendarDays className="h-4 w-4" aria-hidden />}
            label="Mission"
            value={<span className="tracking-[0.08em]">Sanctuary Renewal – Phase II</span>}
          />
          <MissionPill
            icon={<MapPin className="h-4 w-4" aria-hidden />}
            label="Site"
            value={<span className="tracking-[0.08em]">First Grace Church • Norfolk, VA</span>}
            className="hidden xl:inline-flex"
          />
        </div>

        <div className="flex items-center gap-2">
          <ThemeQuickSwitcher onOpenSettings={() => onModuleClick("settings")} premiumAccess />
          <Button
            variant="ghost"
            size="sm"
            className="text-xs md:text-sm"
            onClick={() => onModuleClick("settings")}
            title="Settings (Cmd+.)"
            aria-label="Open settings"
          >
            <SettingsIcon className="icon-sm mr-1" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs md:text-sm"
            onClick={() => navigate("/profile")}
            title="Profile"
            aria-label="View profile"
          >
            <User className="icon-sm mr-1" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
