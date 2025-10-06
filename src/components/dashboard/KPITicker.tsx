import { TrendingUp, TrendingDown, DollarSign, Truck, Users, Calendar } from "lucide-react";

export const KPITicker = () => {
  const kpis = [
    { label: "Revenue", value: "$2.4M", change: "+12%", trend: "up", icon: DollarSign },
    { label: "Active Jobs", value: "23", change: "+3", trend: "up", icon: Calendar },
    { label: "Fleet Utilization", value: "87%", change: "-2%", trend: "down", icon: Truck },
    { label: "Crew Members", value: "156", change: "+8", trend: "up", icon: Users },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] hud-element border-t border-primary/30">
      <div className="flex items-center justify-around p-2">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <kpi.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {kpi.label}
              </p>
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
