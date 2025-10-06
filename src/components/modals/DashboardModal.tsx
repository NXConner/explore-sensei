import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKPIData } from "@/hooks/useKPIData";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, DollarSign, Truck } from "lucide-react";
import { ReportsDashboard } from "@/components/reports/ReportsDashboard";

interface DashboardModalProps {
  onClose: () => void;
}

export const DashboardModal = ({ onClose }: DashboardModalProps) => {
  const { data: kpiData } = useKPIData();

  const kpis = [
    {
      title: "Active Jobs",
      value: kpiData?.activeJobs || 0,
      icon: Briefcase,
      color: "text-blue-400",
    },
    {
      title: "Crew Members",
      value: kpiData?.crewMembers || 0,
      icon: Users,
      color: "text-green-400",
    },
    {
      title: "Revenue MTD",
      value: `$${((kpiData?.totalRevenue || 0) / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "text-yellow-400",
    },
    {
      title: "Fleet Utilization",
      value: `${kpiData?.fleetUtilization || 0}%`,
      icon: Truck,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-7xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow">Tactical Dashboard</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.title} className="hud-element border-primary/30 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                    <p className="text-3xl font-bold text-glow">{kpi.value}</p>
                  </div>
                  <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
                </div>
              </Card>
            ))}
          </div>

          <ReportsDashboard />
        </div>
      </div>
    </div>
  );
};
