import React from "react";
import { User, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  onModuleClick: (module: string) => void;
}

export const TopBar = ({ onModuleClick }: TopBarProps) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] hud-element animate-fade-in top-bar">
      <div className="flex items-center justify-between p-2 md:p-3 gap-2 border-b border-primary/30">
        {/* Brand */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded flex items-center justify-center">
            <span className="text-lg md:text-xl font-bold">AOS</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xs md:text-sm font-bold text-glow text-primary tracking-wider">
              Asphalt Overwatch Tactical Operations Systems
            </h1>
          </div>
        </div>

        {/* | Settings | Profile */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <span className="text-muted-foreground">|</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs md:text-sm px-1 md:px-2"
            onClick={() => onModuleClick("settings")}
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4 mr-1" />
            Settings
          </Button>
          <span className="text-muted-foreground">|</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs md:text-sm px-1 md:px-2"
            onClick={() => navigate("/profile")}
            title="Profile"
          >
            <User className="w-4 h-4 mr-1" />
            Profile
          </Button>
        </div>
      </div>
    </div>
  );
};
