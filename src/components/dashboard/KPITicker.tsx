import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Truck, Users, Calendar, AlertTriangle, Cloud, HardHat, Wrench, Shield, FileText, ClipboardList, Package } from "lucide-react";
import { useKPIData } from "@/hooks/useKPIData";
import { useWeatherAlerts } from "@/hooks/useWeatherAlerts";

export const KPITicker = () => {
  const { data: kpiData } = useKPIData();
  const { data: alerts } = useWeatherAlerts();

  const kpis = [
    {
      label: "Revenue",
      value: `$${((kpiData?.totalRevenue || 0) / 1000000).toFixed(1)}M`,
      change: "+12%",
      trend: "up",
      icon: DollarSign,
    },
    {
      label: "Active Jobs",
      value: String(kpiData?.activeJobs || 0),
      change: "+3",
      trend: "up",
      icon: Calendar,
    },
    {
      label: "Fleet Utilization",
      value: `${kpiData?.fleetUtilization || 0}%`,
      change: "-2%",
      trend: "down",
      icon: Truck,
    },
    {
      label: "Crew Members",
      value: String(kpiData?.crewMembers || 0),
      change: "+8",
      trend: "up",
      icon: Users,
    },
  ];

  const extras = [
    { label: "Alerts", value: String(alerts?.length || 0), change: alerts?.length ? "!" : "0", trend: alerts && alerts.length > 0 ? "down" : "up", icon: AlertTriangle },
    { label: "Weather Cells", value: String((kpiData as any)?.weatherCells || 0), change: "+1", trend: "down", icon: Cloud },
    { label: "Incidents", value: String((kpiData as any)?.safetyIncidents || 0), change: "0", trend: "up", icon: Shield },
    { label: "POs Open", value: String((kpiData as any)?.purchaseOrdersOpen || 0), change: "+2", trend: "up", icon: FileText },
    { label: "Reports Due", value: String((kpiData as any)?.reportsDue || 0), change: "-1", trend: "up", icon: ClipboardList },
    { label: "Equipment Down", value: String((kpiData as any)?.equipmentDown || 0), change: "+1", trend: "down", icon: Wrench },
    { label: "Crews Onsite", value: String((kpiData as any)?.crewsOnsite || 0), change: "+1", trend: "up", icon: HardHat },
    { label: "Orders", value: String((kpiData as any)?.materialOrders || 0), change: "+4", trend: "up", icon: Package },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] hud-element border-t border-primary/30 overflow-hidden">
      <div className="flex animate-marquee">
        {/* Duplicate KPIs for continuous scroll */}
        {[...kpis, ...extras, ...kpis, ...extras].map((kpi, idx) => (
          <div
            key={`${kpi.label}-${idx}`}
            className="flex items-center gap-3 px-8 py-2 flex-shrink-0"
          >
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center animate-pulse">
              <kpi.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-glow">{kpi.value}</span>
                <span
                  className={`text-xs flex items-center gap-1 ${
                    kpi.trend === "up" ? "text-success" : "text-destructive"
                  }`}
                >
                  {kpi.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {kpi.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
