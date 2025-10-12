import { Activity, Calendar, Users, Truck, DollarSign, User, Briefcase, Clock, Camera, HardHat, FileText, ClipboardList, Shield, Wallet, BookOpen, Calculator, Route, LogOut, TrendingUp, MessageSquare, Zap, FolderOpen, Receipt, Cloud, MapPin, Play, Tv, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGamificationToggle } from "@/context/GamificationContext";
import { useUserRole } from "@/hooks/useUserRole";

interface TopBarProps {
  onModuleClick: (module: string) => void;
  onShowAnalytics?: () => void;
  onShowChat?: () => void;
  onShowAutomation?: () => void;
  onShowBusinessHub?: () => void;
}

export const TopBar = ({ onModuleClick, onShowAnalytics, onShowChat, onShowAutomation, onShowBusinessHub }: TopBarProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { enabled: gamifyEnabled, setEnabled: setGamifyEnabled } = useGamificationToggle();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/auth");
  };

  const allModules = [
    { id: "dashboard", icon: Activity, label: "DASH" },
    { id: "jobs", icon: Briefcase, label: "JOBS" },
    { id: "time", icon: Clock, label: "TIME" },
    { id: "photos", icon: Camera, label: "PHOTOS" },
    { id: "equipment", icon: HardHat, label: "EQUIP" },
    { id: "invoicing", icon: FileText, label: "INVOICE" },
    { id: "field-reports", icon: ClipboardList, label: "REPORTS" },
    { id: "safety", icon: Shield, label: "SAFETY" },
    { id: "catalog", icon: BookOpen, label: "CATALOG" },
    { id: "estimate", icon: Calculator, label: "ESTIMATE" },
    { id: "route", icon: Route, label: "ROUTE" },
    { id: "schedule", icon: Calendar, label: "SCHEDULE" },
    { id: "clients", icon: Users, label: "CLIENTS" },
    { id: "fleet", icon: Truck, label: "FLEET" },
    { id: "finance", icon: DollarSign, label: "FINANCE" },
    { id: "payroll", icon: Wallet, label: "PAYROLL" },
    { id: "documents", icon: FolderOpen, label: "DOCS" },
    { id: "contracts", icon: FileText, label: "CONTRACTS" },
    { id: "receipts", icon: Receipt, label: "RECEIPTS" },
    { id: "eod-playback", icon: Play, label: "EOD" },
  ];

  // Filter modules by role; clients (Viewer) get a Client Portal entry only
  const modules = (() => {
    if (!role || role === "Viewer") {
      return [
        { id: "client-portal", icon: Tv, label: "CLIENT" },
      ];
    }
    if (role === "Operator") {
      return allModules.filter((m) => [
        "dashboard","jobs","time","photos","equipment","route","clients","documents","eod-playback"
      ].includes(m.id));
    }
    if (role === "Manager") {
      return allModules.filter((m) => [
        "dashboard","jobs","schedule","route","clients","invoicing","estimate","documents","receipts","fleet","photos"
      ].includes(m.id));
    }
    // Admins see everything
    return allModules;
  })();

  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] hud-element animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-3 gap-2 border-b border-primary/30">
        {/* Top row on mobile: Logo and Profile */}
        <div className="flex items-center justify-between w-full md:w-auto flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded flex items-center justify-center">
              <span className="text-lg md:text-xl font-bold">AOS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xs md:text-sm font-bold text-glow text-primary tracking-wider">
                ASPHALT OVERWATCH
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground">Tactical Operations System</p>
            </div>
          </div>

          {/* User Profile - visible on mobile */}
          <a href="/profile" className="flex md:hidden items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </a>
        </div>

        {/* Module Buttons - scrollable */}
        <div className="flex gap-1 md:gap-2 overflow-x-auto w-full md:flex-1 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent pb-1 md:pb-0 hover:scrollbar-thumb-primary/50">
          {modules.map((module) => (
            <Button
              key={module.id}
              onClick={() => {
                if (module.id === "client-portal") {
                  window.location.href = "/client";
                } else {
                  onModuleClick(module.id);
                }
              }}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 transition-all whitespace-nowrap px-2 md:px-3 hover-scale"
            >
              <module.icon className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">{module.label}</span>
            </Button>
          ))}
        </div>

        {/* User Profile - visible on desktop */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Button
            variant={gamifyEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setGamifyEnabled(!gamifyEnabled)}
            className="hover:bg-primary/20 px-2 gap-2"
            title={gamifyEnabled ? "Gamification ON" : "Gamification OFF"}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold">GAMIFY</span>
          </Button>
          {/* Premium Features */}
          <NotificationCenter />
          {onShowChat && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowChat}
              className="hover:bg-primary/20"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
          {isAdmin && onShowAnalytics && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowAnalytics}
              className="hover:bg-primary/20"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          )}
          {isAdmin && onShowAutomation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowAutomation}
              className="hover:bg-primary/20"
            >
              <Zap className="w-4 h-4" />
            </Button>
          )}
          {onShowBusinessHub && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowBusinessHub}
              className="hover:bg-primary/20 px-3 gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span className="text-xs font-bold">BUSINESS</span>
            </Button>
          )}
          
          {user ? (
            <>
              <a href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="text-right">
                  <p className="text-xs font-bold">OPERATOR</p>
                  <p className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                    {user.email}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hover:bg-primary/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
