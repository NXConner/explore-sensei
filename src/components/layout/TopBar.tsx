import { Activity, Calendar, Users, Truck, DollarSign, User, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onModuleClick: (module: string) => void;
}

export const TopBar = ({ onModuleClick }: TopBarProps) => {
  const modules = [
    { id: "dashboard", icon: Activity, label: "DASHBOARD" },
    { id: "jobs", icon: Briefcase, label: "JOBS" },
    { id: "time", icon: Clock, label: "TIME" },
    { id: "schedule", icon: Calendar, label: "SCHEDULE" },
    { id: "clients", icon: Users, label: "CLIENTS" },
    { id: "fleet", icon: Truck, label: "FLEET" },
    { id: "finance", icon: DollarSign, label: "FINANCE" },
    { id: "payroll", icon: User, label: "PAYROLL" },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] hud-element">
      <div className="flex items-center justify-between p-2 border-b border-primary/30">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
            <span className="text-xl font-bold">AOS</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-glow text-primary tracking-wider">
              ASPHALT OVERWATCH
            </h1>
            <p className="text-xs text-muted-foreground">Tactical Operations System</p>
          </div>
        </div>

        {/* Module Buttons */}
        <div className="flex gap-2">
          {modules.map((module) => (
            <Button
              key={module.id}
              onClick={() => onModuleClick(module.id)}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 transition-all"
            >
              <module.icon className="w-4 h-4" />
              {module.label}
            </Button>
          ))}
        </div>

        {/* User Profile */}
        <a href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="text-right">
            <p className="text-xs font-bold">OPERATOR</p>
            <p className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">ADMIN</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </a>
      </div>
    </div>
  );
};
