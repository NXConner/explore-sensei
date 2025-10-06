import { Bot, Bell, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RightSidebarProps {
  onAIClick: () => void;
}

export const RightSidebar = ({ onAIClick }: RightSidebarProps) => {
  return (
    <div className="absolute right-0 top-16 bottom-20 w-16 z-[900] hud-element border-l border-primary/30">
      <div className="h-full flex flex-col items-center py-4 gap-4">
        {/* AI Assistant */}
        <Button
          onClick={onAIClick}
          variant="ghost"
          size="icon"
          className="relative w-12 h-12 rounded hover:bg-primary/20 hover:border-primary border border-transparent animate-pulse-glow"
        >
          <Bot className="w-6 h-6 text-primary" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-success text-xs">
            AI
          </Badge>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative w-12 h-12 rounded hover:bg-primary/20 hover:border-primary border border-transparent"
        >
          <Bell className="w-6 h-6" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-destructive text-xs">
            3
          </Badge>
        </Button>

        {/* Messages */}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded hover:bg-primary/20 hover:border-primary border border-transparent"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>

        <div className="flex-1" />

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded hover:bg-primary/20 hover:border-primary border border-transparent"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};
