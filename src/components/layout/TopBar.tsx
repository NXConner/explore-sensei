import React from "react";
import { User, Settings as SettingsIcon, MapPin, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeQuickSwitcher } from "@/components/theme";

interface TopBarProps {
  onModuleClick: (module: string) => void;
}

export const TopBar = ({ onModuleClick }: TopBarProps) => {
  const navigate = useNavigate();

  return (
    <div className="absolute left-0 right-0 top-0 z-[1000] h-14 bg-[radial-gradient(circle_at_top,rgba(255,140,0,0.18),rgba(10,15,25,0.92))] backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-3 border-b border-primary/30 px-4">
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

        <div className="hidden flex-1 items-center justify-center gap-6 text-xs text-muted-foreground lg:flex">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="uppercase tracking-[0.32em] text-foreground/80">Mission</span>
            <span className="text-foreground">Sanctuary Renewal – Phase II</span>
          </div>
          <div className="hidden items-center gap-2 xl:flex">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="uppercase tracking-[0.32em] text-foreground/80">Site</span>
            <span className="text-foreground">First Grace Church • Norfolk, VA</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeQuickSwitcher onOpenSettings={() => onModuleClick("settings")} premiumAccess />
          <Button
            variant="ghost"
            size="sm"
            className="text-xs md:text-sm"
            onClick={() => onModuleClick("settings")}
            title="Settings"
          >
            <SettingsIcon className="mr-1 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs md:text-sm"
            onClick={() => navigate("/profile")}
            title="Profile"
          >
            <User className="mr-1 h-4 w-4" />
            Profile
          </Button>
        </div>
      </div>
    </div>
  );
};
