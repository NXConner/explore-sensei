import React from "react";
import { X, Building2, DollarSign, Users, Truck, Shield, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BusinessManagementHubProps {
  onClose: () => void;
  onNavigate: (module: string) => void;
}

export const BusinessManagementHub = ({ onClose, onNavigate }: BusinessManagementHubProps) => {
  const modules = [
    {
      id: "finance",
      title: "Finance Center",
      description: "Revenue, expenses, profit margins, and financial reports",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      id: "payroll",
      title: "Payroll Management",
      description: "Employee wages, bonuses, time tracking, and payment processing",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "fleet",
      title: "Fleet Management",
      description: "Vehicle tracking, maintenance schedules, and equipment status",
      icon: Truck,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "hr_compliance",
      title: "HR & Compliance",
      description: "Employee violations, disciplinary actions, and compliance tracking",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      id: "safety",
      title: "Safety Management",
      description: "Safety incidents, training records, and compliance monitoring",
      icon: Shield,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      id: "analytics",
      title: "Business Analytics",
      description: "Performance metrics, trends, and predictive insights",
      icon: TrendingUp,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[80vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-glow">Business Management Hub</h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Comprehensive Business Operations</h3>
            <p className="text-sm text-muted-foreground">
              Manage all aspects of your business from finance to compliance in one centralized hub.
              Similar to QuickBooks, but tailored for field service operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.id}
                  className="hud-element border-primary/30 p-6 cursor-pointer hover:border-primary/60 transition-all"
                  onClick={() => {
                    onNavigate(module.id);
                    onClose();
                  }}
                >
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{module.title}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </Card>
              );
            })}
          </div>

          <Card className="hud-element border-primary/30 p-6 mt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Business Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Business Address:</span> 337 Ayers Orchard Road, Stuart, VA 24171</p>
              <p><span className="text-muted-foreground">Employees:</span> 2 Full-time, 1 Part-time ($20/hr)</p>
              <p><span className="text-muted-foreground">Material Supplier:</span> SealMaster, 703 West Decatur Street, Madison, NC 27025</p>
              <p><span className="text-muted-foreground">Business Type:</span> Asphalt Maintenance & Sealcoating</p>
            </div>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};
