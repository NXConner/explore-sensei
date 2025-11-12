import React from "react";
import { LayoutFrameProps } from "./CommandCenterLayout";
import { useLayoutContext } from "@/context/LayoutContext";
import { TopBar } from "@/components/layout/TopBar";
import { HorizontalOpsBar } from "@/components/layout/HorizontalOpsBar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { MapContainer } from "@/components/map/MapContainer";
import { KPITicker } from "@/components/dashboard/KPITicker";
import { CornerBrackets } from "@/components/hud/CornerBrackets";
import { CompassRose } from "@/components/hud/CompassRose";
import { CoordinateDisplay } from "@/components/hud/CoordinateDisplay";
import { ZoomIndicator } from "@/components/hud/ZoomIndicator";
import { ScaleBar } from "@/components/hud/ScaleBar";
import { CommandPalette } from "@/components/common/CommandPalette";
import { MobileDock } from "./MobileDock";
import { MobileSheets } from "./MobileSheets";
import { cn } from "@/lib/utils";
import { MobileKPIBar } from "./MobileKPIBar";
import { MiniMap } from "@/components/hud/MiniMap";
import { HUDNotifications } from "@/components/hud/HUDNotifications";
import { useHUDSettings } from "@/hooks/useHUDSettings";
import { useHUDPresetHotkeys } from "@/hooks/useHUDPresetHotkeys";

export const LayoutFrame = ({ controller, children }: LayoutFrameProps) => {
  const { isMobile, isTablet } = useLayoutContext();
  const [hudSettings] = useHUDSettings();
  useHUDPresetHotkeys();
  const showDesktopSidebars = !(isMobile || isTablet);

  // Set global shake intensity for notifications
  React.useEffect(() => {
    (window as any).__hudShakeIntensity = hudSettings.shakeIntensity || 5;
  }, [hudSettings.shakeIntensity]);

  const missionRibbon = (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-[var(--z-objective)] top-[84px] transition-all",
        "max-w-[calc(100%-1.5rem)] sm:max-w-[540px]",
      )}
    >
      <div className="hud-element px-4 py-2 text-xs flex items-center gap-3 overflow-hidden">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="uppercase tracking-widest whitespace-nowrap">Active Mission</span>
        <span className="text-muted-foreground truncate">
          {controller.scheduleItems?.length
            ? `${controller.scheduleItems.length} scheduled`
            : "No active schedule"}
        </span>
        <span className="hidden sm:block text-muted-foreground">
          {controller.scheduleItems?.[0]?.start_time
            ? `ETA ${new Date(controller.scheduleItems[0].start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "ETA —"}
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="relative h-screen w-screen max-h-screen max-w-screen overflow-hidden bg-background text-foreground"
      data-testid="command-center-shell"
    >
      {controller.isOffline && (
        <div className="absolute top-0 left-0 right-0 z-[9999] bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-4 py-2 text-center text-xs sm:text-sm font-medium">
          Offline Mode • Changes will sync when connection is restored
        </div>
        )}

        <TopBar onModuleClick={controller.setActiveModule} />

        <HorizontalOpsBar
          className={cn(
            "top-[48px] sm:top-[56px]",
            isMobile ? "px-2 py-2" : undefined,
          )}
          activeMode={controller.mapState.activeMode}
          onModeChange={controller.mapControls.changeMode}
          onClear={controller.mapControls.clear}
        />

        {missionRibbon}

        <main
          id="main-content"
          role="main"
          aria-label="Command Center Main Content"
          className={cn(
            "relative w-full overflow-hidden",
            isMobile 
              ? "h-[calc(100vh-120px-152px)] pt-[120px] pb-[152px]" 
              : controller.isOffline 
                ? "h-[calc(100vh-140px-64px-40px)] pt-[140px] pb-[64px]"
                : "h-[calc(100vh-140px-64px)] pt-[140px] pb-[64px]",
          )}
        >
          <div
            className={cn(
              "relative flex h-full w-full max-w-full",
              showDesktopSidebars ? "items-stretch gap-2 lg:gap-3" : undefined,
            )}
          >
            {showDesktopSidebars && (
              <div className="hidden lg:flex h-full flex-none flex-shrink-0">
                <RightSidebar
                  side="left"
                  layoutMode="docked"
                  onAIClick={() => controller.toggleModal("aiAssistant", true)}
                  onSettingsClick={() => controller.openModal("settings")}
                  onLocateMe={controller.mapControls.locateMe}
                  onToggleTraffic={controller.mapControls.toggleTraffic}
                  showTraffic={controller.mapState.showTraffic}
                  onToggleStreetView={controller.mapControls.toggleStreetView}
                  onAIDetect={() => controller.openModal("aiDetection")}
                  onToggleEmployeeTracking={controller.mapControls.toggleEmployee}
                  showEmployeeTracking={controller.mapState.showEmployeeTracking}
                  onToggleWeatherRadar={controller.mapControls.toggleWeatherRadar}
                  showWeatherRadar={controller.mapState.showWeatherRadar}
                  onToggleParcels={controller.mapControls.toggleParcels}
                  showParcels={controller.mapState.showParcels}
                  onModeChange={controller.mapControls.changeMode}
                  activeMode={controller.mapState.activeMode}
                  onClear={controller.mapControls.clear}
                  onSave={controller.mapControls.save}
                  onExport={() => controller.openModal("export")}
                  onImageryChange={controller.mapControls.setImagery}
                  imagery={controller.mapState.imagery}
                />
              </div>
            )}

            <div className="relative flex-1 min-w-0 min-h-0 overflow-hidden">
              <MapContainer ref={controller.mapContainerRef} initialMapTheme={controller.mapTheme} />
              {/* HUD Overlays - conditionally rendered based on settings */}
              {hudSettings.hudCornerBrackets && <CornerBrackets />}
              {hudSettings.hudCompassRose && <CompassRose />}
              {hudSettings.hudCoordinateDisplay && <CoordinateDisplay lat={controller.mapState.lat} lng={controller.mapState.lng} />}
              {hudSettings.hudZoomIndicator && <ZoomIndicator zoom={controller.mapState.zoom} />}
              {hudSettings.hudScaleBar && <ScaleBar lat={controller.mapState.lat} zoom={controller.mapState.zoom} />}
              {hudSettings.hudMiniMap && <MiniMap variant="overlay" />}
              <HUDNotifications />
            </div>

            {showDesktopSidebars && (
              <div className="hidden lg:flex h-full flex-none flex-shrink-0 relative w-80 max-w-[320px]">
                <div className="pointer-events-none absolute inset-0 z-[var(--z-sidebars)]">
                  <div className="corner-bracket-md corner-tl" />
                  <div className="corner-bracket-md corner-tr" />
                  <div className="corner-bracket-md corner-bl" />
                  <div className="corner-bracket-md corner-br" />
                </div>
                <LeftSidebar side="right" layoutMode="docked" />
              </div>
            )}
          </div>
        </main>

      {isMobile ? (
        <>
          <MobileKPIBar />
          <MobileDock controller={controller} />
          <MobileSheets controller={controller} />
        </>
      ) : (
        <KPITicker />
      )}

      <CommandPalette
        open={controller.modalState.commandPalette}
        onOpenChange={(open) => controller.toggleModal("commandPalette", open)}
        onNavigate={(module) => controller.setActiveModule(module as never)}
      />

      {children}
    </div>
  );
};
