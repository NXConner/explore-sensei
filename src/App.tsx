import React, { lazy, Suspense, useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
const Index = lazy(() => import("./pages/Index"));
const Profile = lazy(() => import("./pages/Profile").then((m) => ({ default: m.Profile })));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ClientAppLazy = lazy(() => import("./pages/client/ClientApp").then(m => ({ default: m.ClientApp })));
import { initAnalytics, trackPageView } from "@/lib/analytics";
import { GamificationProvider } from "@/context/GamificationContext";
import { applySavedThemeFromLocalStorage, listenForThemeChanges } from "@/lib/theme";
import { ProtectedFeature } from "@/components/ProtectedFeature";

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
    } catch (_err) {
      // noop
    }
  }, [location.pathname]);
  // Optional ISAC-style boot overlay
  const BootOverlay = useMemo(() => () => {
    try {
      const raw = localStorage.getItem('aos_settings');
      const s = raw ? JSON.parse(raw) : {};
      if (s.bootOverlay === false) return null;
    } catch {}
    return (
      <div id="boot-overlay" className="fixed inset-0 z-[99999] pointer-events-none select-none" style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.96) 60%, rgba(0,0,0,0.92) 100%)'}}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[260px] h-[260px]">
            <div className="absolute inset-0 rounded-full" style={{
              background: 'conic-gradient(from 0deg, rgba(255,140,0,0) 0deg, rgba(255,140,0,0.35) 20deg, rgba(255,140,0,0) 40deg)'
            }} />
            <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'hsl(var(--primary) / 0.35)'}} />
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div>
                <div className="text-sm tracking-widest text-primary/80">SYSTEMS ONLINE</div>
                <div className="mt-2 text-xs text-muted-foreground">Initializing modules…</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, []);

  useEffect(() => {
    // Auto-hide boot overlay shortly after mount
    const id = setTimeout(() => {
      const el = document.getElementById('boot-overlay');
      if (!el) return;
      el.style.transition = 'opacity 420ms ease-out';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 500);
    }, 1200);
    return () => clearTimeout(id);
  }, []);

  return <BootOverlay />;
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
              {/* Client-facing app */}
              <Route
                path="/client/*"
                element={
                  <ProtectedFeature
                    allowed={["Viewer","Operator","Manager","Administrator","Super Administrator"]}
                  >
                    <ClientAppLazy />
                  </ProtectedFeature>
                }
              />
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
