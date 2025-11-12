import React from "react";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ManualPulseTriggerProps {
  onTrigger: () => void;
}

export const ManualPulseTrigger: React.FC<ManualPulseTriggerProps> = ({ onTrigger }) => {
  return (
    <div className="absolute bottom-24 right-4 z-[var(--z-hud-elements)]">
      <Button
        size="icon"
        variant="outline"
        className="h-12 w-12 tactical-panel border-primary/30 hover:border-primary/60 hover:bg-primary/10"
        onClick={onTrigger}
        title="Fire Tactical Pulse (P)"
        aria-label="Fire tactical pulse scan"
      >
        <Radio className="h-6 w-6 text-primary" />
      </Button>
    </div>
  );
};
