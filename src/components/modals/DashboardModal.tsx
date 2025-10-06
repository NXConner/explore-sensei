import { X, Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardModalProps {
  onClose: () => void;
}

export const DashboardModal = ({ onClose }: DashboardModalProps) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[80vh] tactical-panel m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">
              Tactical Dashboard
            </h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Active Jobs", value: "23", icon: Activity, color: "text-primary" },
              { label: "Revenue MTD", value: "$847K", icon: TrendingUp, color: "text-success" },
              { label: "Alerts", value: "5", icon: AlertTriangle, color: "text-destructive" },
              { label: "Completed", value: "89", icon: CheckCircle, color: "text-success" },
            ].map((stat) => (
              <div key={stat.label} className="tactical-panel p-4">
                <stat.icon className={`w-8 h-8 mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-glow">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="tactical-panel p-4">
              <h3 className="text-sm font-bold text-primary mb-4 uppercase">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { event: "Job Completed: Route 22", time: "2 hours ago", status: "success" },
                  { event: "Equipment Alert: Paver #3", time: "4 hours ago", status: "warning" },
                  { event: "New Client Added", time: "6 hours ago", status: "info" },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{activity.event}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tactical-panel p-4">
              <h3 className="text-sm font-bold text-primary mb-4 uppercase">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {["New Job", "Schedule Crew", "Request Quote", "Fleet Status"].map((action) => (
                  <Button key={action} variant="outline" className="w-full text-xs">
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
