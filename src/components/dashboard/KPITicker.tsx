import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Truck, Users, Calendar } from "lucide-react";
import { useKPIData } from "@/hooks/useKPIData";

export const KPITicker = () => {
  const { data: kpiData } = useKPIData();

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

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] hud-element border-t border-primary/30 overflow-hidden">
      <div className="flex animate-marquee">
        {/* Duplicate KPIs for continuous scroll */}
        {[...kpis, ...kpis].map((kpi, idx) => (
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
