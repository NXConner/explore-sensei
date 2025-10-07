import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VeteranSection } from "@/components/veteran/VeteranSection";

interface VeteranModalProps {
  onClose: () => void;
}

export const VeteranModal = ({ onClose }: VeteranModalProps) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel w-full max-w-6xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <h2 className="text-xl font-bold">VETERAN PROGRAMS</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <VeteranSection onClose={onClose} />
        </ScrollArea>
      </div>
    </div>
  );
};
