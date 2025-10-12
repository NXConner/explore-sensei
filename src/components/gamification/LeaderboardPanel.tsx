import React from "react";
import { Card } from "@/components/ui/card";
import { useGamification } from "@/hooks/useGamification";
import { useGamificationToggle } from "@/context/GamificationContext";

export const LeaderboardPanel: React.FC = () => {
  const { enabled } = useGamificationToggle();
  if (!enabled) return null;
  const { leaderboardQuery } = useGamification();
  const board = leaderboardQuery.data?.leaderboard ?? [];

  return (
    <Card className="tactical-panel p-4">
      <h3 className="font-bold text-primary mb-2">Leaderboard</h3>
      <div className="space-y-1 text-sm">
        {board.map((row: any, idx: number) => (
          <div key={row.user_id} className="flex items-center justify-between">
            <div className="text-muted-foreground">#{idx + 1}</div>
            <div className="flex-1 px-2 truncate">{row.user_id}</div>
            <div className="font-mono">{row.points}</div>
          </div>
        ))}
        {board.length === 0 && (
          <div className="text-xs text-muted-foreground">No data yet</div>
        )}
      </div>
    </Card>
  );
};
