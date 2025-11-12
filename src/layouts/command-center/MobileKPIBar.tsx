import React from "react";
import { useKPIData } from "@/hooks/useKPIData";
import { useWeatherAlerts } from "@/hooks/useWeatherAlerts";
import { DollarSign, Calendar, Truck, Users, AlertTriangle } from "lucide-react";

export const MobileKPIBar = () => {
  const { data: kpiData } = useKPIData();
  const { data: alerts } = useWeatherAlerts();

  const items = [
    {
      icon: DollarSign,
      label: "Revenue",
      value: `$${((kpiData?.totalRevenue || 0) / 1_000_000).toFixed(1)}M`,
    },
    {
      icon: Calendar,
      label: "Active Jobs",
      value: String(kpiData?.activeJobs || 0),
    },
    {
      icon: Truck,
      label: "Fleet",
      value: `${kpiData?.fleetUtilization ?? 0}%`,
    },
    {
      icon: Users,
      label: "Crew",
      value: String(kpiData?.crewMembers || 0),
    },
    {
      icon: AlertTriangle,
      label: "Alerts",
      value: String(alerts?.length || 0),
    },
  ];

  return (
    <div className="fixed bottom-[68px] left-0 right-0 z-[9997] border-t border-primary/20 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-2xl">
      <div className="flex items-center gap-3 overflow-x-auto px-4 py-3 scrollbar-thin scrollbar-thumb-primary/20">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex min-w-[88px] flex-col gap-1 rounded-lg border border-primary/20 bg-background/70 px-3 py-2"
          >
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <item.icon className="h-3.5 w-3.5 text-primary" />
              <span>{item.label}</span>
            </div>
            <p className="text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
