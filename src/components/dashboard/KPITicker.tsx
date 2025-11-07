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

  const allItems = [...kpis, ...extras];
  const doubledItems = [...allItems, ...allItems]; // Double for seamless loop

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 z-[var(--z-kpi-ticker)] hud-element border-t border-primary/30 bg-background/80 backdrop-blur-md overflow-hidden">
      {/* Corner brackets for KPI Ticker */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="corner-bracket-sm corner-tl" />
        <div className="corner-bracket-sm corner-tr" />
      </div>
      <div className="flex items-center h-full px-2 relative z-10">
        <div className="flex gap-8 whitespace-nowrap animate-marquee">
          {doubledItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2 px-4 flex-shrink-0">
                <Icon className="icon-sm text-primary" />
                <span className="text-xs font-mono uppercase">{item.label}:</span>
                <span className="text-xs font-bold text-primary">{item.value}</span>
                {item.change && (
                  <span className={`text-xs ${item.trend === "up" ? "text-success" : "text-destructive"}`}>
                    {item.trend === "up" ? "↑" : "↓"} {item.change}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
