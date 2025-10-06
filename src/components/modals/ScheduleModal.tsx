import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";

interface ScheduleModalProps {
  onClose: () => void;
}

export const ScheduleModal = ({ onClose }: ScheduleModalProps) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[80vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-2xl font-bold text-glow">Operations Schedule</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <ScheduleCalendar />
        </div>
      </div>
    </div>
  );
};
