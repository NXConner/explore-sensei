import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface GamificationState {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const GamificationCtx = createContext<GamificationState | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("gamification_enabled");
      if (raw !== null) setEnabled(raw === "true");
    } catch {}
  }, []);

  const setEnabledPersist = useCallback((v: boolean) => {
    setEnabled(v);
    try { localStorage.setItem("gamification_enabled", String(v)); } catch {}
  }, []);

  const value = useMemo(() => ({ enabled, setEnabled: setEnabledPersist }), [enabled, setEnabledPersist]);

  return <GamificationCtx.Provider value={value}>{children}</GamificationCtx.Provider>;
};

export function useGamificationToggle() {
  const ctx = useContext(GamificationCtx);
  if (!ctx) throw new Error("useGamificationToggle must be used within GamificationProvider");
  return ctx;
}
