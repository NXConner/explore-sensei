import React from "react";
import { Card } from "@/components/ui/card";
import { useGamification } from "@/hooks/useGamification";

export const AchievementsPanel: React.FC = () => {
  const { profileQuery } = useGamification();
  const profile = profileQuery.data?.profile;
  const badges = profileQuery.data?.badges ?? [];

  return (
    <Card className="tactical-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-primary">Achievements</h3>
        <div className="text-xs text-muted-foreground">Lvl {profile?.level ?? 1}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Points</div>
        <div className="text-right font-mono">{profile?.points ?? 0}</div>
        <div>XP</div>
        <div className="text-right font-mono">{profile?.xp ?? 0}</div>
        <div>Streak</div>
        <div className="text-right font-mono">{profile?.streak_current ?? 0} / {profile?.streak_longest ?? 0}</div>
      </div>
      <div className="mt-2">
        <div className="text-xs mb-2 text-muted-foreground">Badges</div>
        <div className="flex flex-wrap gap-2">
          {badges.length === 0 && (
            <div className="text-xs text-muted-foreground">No badges yet</div>
          )}
          {badges.map((b: any) => (
            <div key={b.badge_code} className="px-2 py-1 border border-primary/30 rounded text-xs">
              {b.title ?? b.badge_code}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
