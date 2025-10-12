import { useCallback } from "react";
import { emitGamificationEvent, fetchGamificationProfile, fetchLeaderboard } from "@/lib/gamificationClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useGamification() {
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["gamification","profile"],
    queryFn: () => fetchGamificationProfile(),
    staleTime: 30_000,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["gamification","leaderboard"],
    queryFn: () => fetchLeaderboard(),
    staleTime: 30_000,
  });

  const emitMutation = useMutation({
    mutationFn: emitGamificationEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gamification","profile"] });
      qc.invalidateQueries({ queryKey: ["gamification","leaderboard"] });
    }
  });

  const emitEvent = useCallback((event: Parameters<typeof emitGamificationEvent>[0]) => {
    return emitMutation.mutateAsync(event);
  }, [emitMutation]);

  return {
    emitEvent,
    profileQuery,
    leaderboardQuery,
    isEmitting: emitMutation.isPending,
  };
}
