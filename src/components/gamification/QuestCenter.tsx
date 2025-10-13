import React from "react";
import { Card } from "@/components/ui/card";
import { useGamificationToggle } from "@/context/GamificationContext";

export const QuestCenter: React.FC = () => {
  const { enabled } = useGamificationToggle();
  if (!enabled) return null;

  // QuestCenter temporarily disabled - game_quests table needs to be created
  return (
    <Card className="tactical-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-primary">Quest Center</h3>
      </div>
      <div className="text-xs text-muted-foreground">Quest system coming soon...</div>
    </Card>
  );
};
