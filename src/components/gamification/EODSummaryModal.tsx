import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  onClose: () => void;
  awarded?: number;
}

export const EODSummaryModal: React.FC<Props> = ({ onClose, awarded = 0 }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="tactical-panel p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-primary mb-2">Mission Debrief</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You earned <span className="font-bold text-primary">{awarded}</span> points today. Keep the streak alive tomorrow.
        </p>
        <div className="flex justify-end">
          <Button onClick={onClose}>Acknowledge</Button>
        </div>
      </Card>
    </div>
  );
};
