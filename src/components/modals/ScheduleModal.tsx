import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScheduleModalProps {
  onClose: () => void;
}

export const ScheduleModal = ({ onClose }: ScheduleModalProps) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[80vh] tactical-panel m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">
              Operations Schedule
            </h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <p className="text-muted-foreground">Schedule module - Coming soon</p>
        </ScrollArea>
      </div>
    </div>
  );
};
