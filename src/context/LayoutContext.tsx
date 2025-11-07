import React, { createContext, useContext, useMemo } from "react";
import { useViewport, ViewportState } from "@/hooks/useViewport";

interface LayoutContextValue extends ViewportState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isUltrawide: boolean;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const viewport = useViewport();

  const value = useMemo<LayoutContextValue>(() => {
    const { device } = viewport;
    return {
      ...viewport,
      isMobile: device === "mobile",
      isTablet: device === "tablet",
      isDesktop: device === "desktop",
      isUltrawide: device === "ultrawide",
    };
  }, [viewport]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export const useLayoutContext = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error("useLayoutContext must be used within a LayoutProvider");
  }
  return ctx;
};
