import React from "react";
import { Layers, Scan, Settings, Sparkles, LayoutDashboard } from "lucide-react";
import type { CommandCenterController, MobilePanel } from "./types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileDockProps {
  controller: CommandCenterController;
}

const DOCK_HEIGHT = 68;

const DockButton = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Layers;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className={cn(
      "flex h-12 w-16 flex-col items-center justify-center rounded-xl px-0 text-[11px] font-medium transition-colors",
      "touch-manipulation", // Optimize touch handling
      "min-h-[48px] min-w-[48px]", // Ensure minimum touch target size
      active ? "text-primary" : "text-muted-foreground",
    )}
    onClick={onClick}
    aria-label={label}
  >
    <Icon className={cn("h-5 w-5 mb-1 transition-transform", active && "scale-110")} aria-hidden="true" />
    <span>{label}</span>
  </Button>
);

export const MobileDock = ({ controller }: MobileDockProps) => {
  const openPanel = (panel: MobilePanel) => {
    controller.setMobilePanel(controller.mobilePanel === panel ? null : panel);
  };

  const dockItems: Array<{
    key: string;
    icon: typeof Layers;
    label: string;
    onPress: () => void;
    active?: boolean;
  }> = [
    {
      key: "missions",
      icon: LayoutDashboard,
      label: "Missions",
      onPress: () => controller.setActiveModule("dashboard"),
    },
    {
      key: "layers",
      icon: Layers,
      label: "Layers",
      onPress: () => openPanel("layers"),
      active: controller.mobilePanel === "layers",
    },
    {
      key: "scan",
      icon: Scan,
      label: "Scan",
      onPress: () => controller.openModal("aiDetection"),
    },
    {
      key: "intel",
      icon: Sparkles,
      label: "Intel",
      onPress: () => openPanel("intel"),
      active: controller.mobilePanel === "intel",
    },
    {
      key: "settings",
      icon: Settings,
      label: "Settings",
      onPress: () => controller.openModal("settings"),
      active: controller.modalState.settings,
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-2xl border-t border-primary/20"
      style={{ height: DOCK_HEIGHT }}
    >
      <div className="mx-auto flex h-full max-w-lg items-center justify-between px-4">
        {dockItems.map((item) => (
          <DockButton
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={item.active}
            onClick={item.onPress}
          />
        ))}
      </div>
    </div>
  );
};
