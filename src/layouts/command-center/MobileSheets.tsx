import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Bot,
  ChartPie,
  Cloud,
  FileText,
  Layers,
  Settings2,
  Users,
} from "lucide-react";
import type { CommandCenterController } from "./types";
import { cn } from "@/lib/utils";

interface MobileSheetsProps {
  controller: CommandCenterController;
}

export const MobileSheets = ({ controller }: MobileSheetsProps) => {
  const { mobilePanel, setMobilePanel, mapState, mapControls } = controller;
  const open = Boolean(mobilePanel);

  const close = () => setMobilePanel(null);

  return (
    <Sheet open={open} onOpenChange={(value) => (!value ? close() : undefined)}>
      <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto border-t border-primary/20 bg-background/95 backdrop-blur-xl">
        {mobilePanel === "layers" && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Map Layers
              </SheetTitle>
              <SheetDescription>Toggle tactical overlays and situational awareness tools.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <LayerToggle
                label="Traffic Overlay"
                description="Live congestion and route impacts."
                icon={Activity}
                checked={mapState.showTraffic}
                onChange={mapControls.toggleTraffic}
              />
              <LayerToggle
                label="Weather Radar"
                description="Storm cells and precipitation zones."
                icon={Cloud}
                checked={mapState.showWeatherRadar}
                onChange={mapControls.toggleWeatherRadar}
              />
              <LayerToggle
                label="Crew Tracking"
                description="Real-time field crew positions."
                icon={Users}
                checked={mapState.showEmployeeTracking}
                onChange={mapControls.toggleEmployee}
              />
              <LayerToggle
                label="Parcel Boundaries"
                description="County parcel outlines for bids."
                icon={FileText}
                checked={mapState.showParcels}
                onChange={mapControls.toggleParcels}
              />
            </div>
          </>
        )}

        {mobilePanel === "intel" && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ChartPie className="h-5 w-5 text-primary" />
                Mission Intel
              </SheetTitle>
              <SheetDescription>Launch AI assistants, analytics, and reporting surfaces.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <IntelButton
                icon={Bot}
                label="AI Assistant"
                description="Ask field intel questions."
                onClick={() => {
                  close();
                  controller.openModal("aiAssistant");
                }}
              />
              <IntelButton
                icon={ChartPie}
                label="Analytics"
                description="KPIs and mission dashboards."
                onClick={() => {
                  close();
                  controller.openModal("analytics");
                }}
              />
              <IntelButton
                icon={Activity}
                label="Automation"
                description="Process automations & alerts."
                onClick={() => {
                  close();
                  controller.openModal("automation");
                }}
              />
              <IntelButton
                icon={Settings2}
                label="Business Hub"
                description="Ops, HR, and compliance center."
                onClick={() => {
                  close();
                  controller.openModal("businessHub");
                }}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const LayerToggle = ({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: typeof Activity;
  checked: boolean;
  onChange: () => void;
}) => (
  <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-background/70 p-4">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
  </div>
);

const IntelButton = ({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: typeof ChartPie;
  label: string;
  description: string;
  onClick: () => void;
}) => (
  <Button
    variant="outline"
    className={cn(
      "h-auto flex flex-col items-start gap-2 rounded-xl border-primary/20 bg-background/70 px-4 py-3 text-left",
      "hover:border-primary/60 hover:bg-primary/5",
    )}
    onClick={onClick}
  >
    <Icon className="h-5 w-5 text-primary" />
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </Button>
);
