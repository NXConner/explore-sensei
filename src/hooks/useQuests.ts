import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useQuests() {
  const query = useQuery({
    queryKey: ["gamification","quests"],
    queryFn: async () => {
      // Table 'game_quests' doesn't exist in current schema
      // Return empty array until table is created
      return [];
      
      // Uncomment when table is available:
      // const { data, error } = await supabase
      //   .from("game_quests")
      //   .select("quest_code, status, progress, started_at, completed_at")
      //   .order("started_at", { ascending: false });
      // if (error) throw error;
      // return data ?? [];
    },
    staleTime: 30_000,
  });
  return query;
}
