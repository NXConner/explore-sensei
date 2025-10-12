import React from "react";
import { Card } from "@/components/ui/card";
import { useQuests } from "@/hooks/useQuests";
import { useGamificationToggle } from "@/context/GamificationContext";

export const QuestCenter: React.FC = () => {
  const { enabled } = useGamificationToggle();
  const { data, isLoading } = useQuests();
  if (!enabled) return null;

  return (
    <Card className="tactical-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-primary">Quest Center</h3>
      </div>
      {isLoading && <div className="text-xs text-muted-foreground">Loading quests...</div>}
      {!isLoading && (!data || data.length === 0) && (
        <div className="text-xs text-muted-foreground">No active quests</div>
      )}
      <div className="space-y-2">
        {data?.map((q) => (
          <div key={q.quest_code} className="p-2 border border-primary/30 rounded">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{q.quest_code}</div>
              <div className="text-xs text-muted-foreground">{q.status}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {Object.entries(q.progress || {}).map(([k, v]) => (
                <span key={k} className="mr-2">{k}: {String(v)}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
