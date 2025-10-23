import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Check if user is admin via compatibility view that exposes role text
        const { data } = await (supabase as any)
          .from("user_roles_v_legacy")
          .select("role")
          .eq("user_id", session.user.id)
          .in("role", ["Super Administrator", "Administrator"])
          .maybeSingle();

        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await (supabase as any)
          .from("user_roles_v_legacy")
          .select("role")
          .eq("user_id", session.user.id)
          .in("role", ["Super Administrator", "Administrator"])
          .maybeSingle();

        setIsAdmin(!!data);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    signOut,
  };
};
