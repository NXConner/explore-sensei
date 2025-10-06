import { Bot, Bell, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RightSidebarProps {
  onAIClick: () => void;
}

export const RightSidebar = ({ onAIClick }: RightSidebarProps) => {
  return (
    <div className="absolute right-0 top-16 bottom-0 w-16 z-[900] hud-element border-l border-primary/30 flex flex-col">
      <div className="flex flex-col items-center gap-4 p-2">
        <Button
          onClick={onAIClick}
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0 hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 transition-all"
        >
          <Bot className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0 hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 transition-all"
        >
          <Bell className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0 hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 transition-all"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0 hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 transition-all"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};
