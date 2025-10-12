import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, TrendingUp, DollarSign, Clock, Fuel } from "lucide-react";

interface InfoCardProps {
  type: "employee" | "vehicle";
  data: {
    name: string;
    status: string;
    speed?: number;
    avgSpeed?: number;
    timeWorked?: string;
    distance?: number;
    fuelCost?: number;
    wastedTime?: number;
    wastedMoney?: number;
    isMoving?: boolean;
    activity?: string;
  };
  onCardClick?: () => void;
}

export const EmployeeFleetInfoCard = ({ type, data, onCardClick }: InfoCardProps) => {
  const hasWaste =
    (data.wastedTime && data.wastedTime > 0) || (data.wastedMoney && data.wastedMoney > 0);

  return (
    <Card
      className="absolute z-[9999] p-4 bg-background/95 backdrop-blur-sm border-primary/30 shadow-lg min-w-[280px] cursor-pointer hover:border-primary transition-all"
      onClick={onCardClick}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">{data.name}</h3>
          <Badge variant={data.status === "active" ? "default" : "secondary"} className="text-xs">
            {data.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <div className="text-muted-foreground">Time Today</div>
              <div className="font-semibold">{data.timeWorked || "00:00"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <div>
              <div className="text-muted-foreground">{data.isMoving ? "Moving" : "Stationary"}</div>
              <div className="font-semibold">{data.activity || "Unknown"}</div>
            </div>
          </div>

          {data.speed !== undefined && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <div className="text-muted-foreground">Speed</div>
                <div className="font-semibold">{data.speed} mph</div>
              </div>
            </div>
          )}

          {data.avgSpeed !== undefined && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Avg Speed</div>
                <div className="font-semibold">{data.avgSpeed} mph</div>
              </div>
            </div>
          )}

          {data.distance !== undefined && (
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              <div>
                <div className="text-muted-foreground">Distance</div>
                <div className="font-semibold">{data.distance.toFixed(1)} mi</div>
              </div>
            </div>
          )}

          {data.fuelCost !== undefined && (
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-primary" />
              <div>
                <div className="text-muted-foreground">Fuel Cost</div>
                <div className="font-semibold">${data.fuelCost.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        {hasWaste && (
          <div className="border-t border-destructive/30 pt-2 mt-2">
            <div className="text-xs font-semibold text-destructive mb-1">⚠️ Waste Detected</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {data.wastedTime && data.wastedTime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-destructive" />
                  <span>{data.wastedTime} min idle</span>
                </div>
              )}
              {data.wastedMoney && data.wastedMoney > 0 && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-destructive" />
                  <span>${data.wastedMoney.toFixed(2)} lost</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground pt-2 border-t">
          Click to view {type === "employee" ? "HR page" : "vehicle details"}
        </div>
      </div>
    </Card>
  );
};
