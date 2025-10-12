import React, { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
const Index = lazy(() => import("./pages/Index"));
const Profile = lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
import { initAnalytics, trackPageView } from "@/lib/analytics";
import { GamificationProvider } from "@/context/GamificationContext";
import { applySavedThemeFromLocalStorage, listenForThemeChanges } from "@/lib/theme";

const queryClient = new QueryClient();

const AnalyticsListener = () => {
  const location = useLocation();
  useEffect(() => {
    initAnalytics();
  }, []);
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  // HUD: route-change glitch effect based on settings
  useEffect(() => {
    // Apply saved theme on first route event
    applySavedThemeFromLocalStorage();
    const stopListen = listenForThemeChanges();
    try {
      const raw = localStorage.getItem("aos_settings");
      const settings = raw ? JSON.parse(raw) : {};
      if (settings?.glitchEffect !== false && settings?.glitchOnPageTransition !== false) {
        document.body.classList.add("glitch-distortion");
        const t = setTimeout(() => document.body.classList.remove("glitch-distortion"), 220);
        return () => {
          clearTimeout(t);
          stopListen?.();
        };
      }
    } catch {}
  }, [location.pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GamificationProvider>
        <BrowserRouter>
          <AnalyticsListener />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </GamificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
