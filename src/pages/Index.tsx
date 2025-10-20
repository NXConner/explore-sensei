import React, { Suspense, lazy, useState, useRef, useEffect } from "react";
import { MapContainer, MapContainerRef } from "@/components/map/MapContainer";
import { DrawingMode } from "@/hooks/useMapDrawing";
import { TopBar } from "@/components/layout/TopBar";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { KPITicker } from "@/components/dashboard/KPITicker";
import { AIAssistant } from "@/components/ai/AIAssistant";
const DashboardModal = lazy(() =>
  import("@/components/modals/DashboardModal").then((m) => ({ default: m.DashboardModal })),
);
const ScheduleModal = lazy(() =>
  import("@/components/modals/ScheduleModal").then((m) => ({ default: m.ScheduleModal })),
);
const ClientsModal = lazy(() =>
  import("@/components/modals/ClientsModal").then((m) => ({ default: m.ClientsModal })),
);
const FleetModal = lazy(() =>
  import("@/components/modals/FleetModal").then((m) => ({ default: m.FleetModal })),
);
const FinanceModal = lazy(() =>
  import("@/components/modals/FinanceModal").then((m) => ({ default: m.FinanceModal })),
);
const AnalyticsModal = lazy(() =>
  import("@/components/modals/AnalyticsModal").then((m) => ({ default: m.AnalyticsModal })),
);
const ChatModal = lazy(() =>
  import("@/components/modals/ChatModal").then((m) => ({ default: m.ChatModal })),
);
const AutomationModal = lazy(() =>
  import("@/components/modals/AutomationModal").then((m) => ({ default: m.AutomationModal })),
);
const PayrollModal = lazy(() =>
  import("@/components/modals/PayrollModal").then((m) => ({ default: m.PayrollModal })),
);
const JobsModal = lazy(() =>
  import("@/components/jobs/JobsModal").then((m) => ({ default: m.JobsModal })),
);
const TimeTrackingModal = lazy(() =>
  import("@/components/time/TimeTrackingModal").then((m) => ({ default: m.TimeTrackingModal })),
);
const PhotoDocumentationModal = lazy(() =>
  import("@/components/photos/PhotoDocumentationModal").then((m) => ({
    default: m.PhotoDocumentationModal,
  })),
);
const EquipmentModal = lazy(() =>
  import("@/components/equipment/EquipmentModal").then((m) => ({ default: m.EquipmentModal })),
);
const InvoicingModal = lazy(() =>
  import("@/components/invoicing/InvoicingModal").then((m) => ({ default: m.InvoicingModal })),
);
const FieldReportsModal = lazy(() =>
  import("@/components/reports/FieldReportsModal").then((m) => ({ default: m.FieldReportsModal })),
);
const SafetyComplianceModal = lazy(() =>
  import("@/components/safety/SafetyComplianceModal").then((m) => ({
    default: m.SafetyComplianceModal,
  })),
);
const CostCatalogModal = lazy(() =>
  import("@/components/catalog/CostCatalogModal").then((m) => ({ default: m.CostCatalogModal })),
);
const EstimateCalculatorModal = lazy(() =>
  import("@/components/estimate/EstimateCalculatorModal").then((m) => ({
    default: m.EstimateCalculatorModal,
  })),
);
const AIAsphaltDetectionModal = lazy(() =>
  import("@/components/ai/AIAsphaltDetectionModal").then((m) => ({
    default: m.AIAsphaltDetectionModal,
  })),
);
const RouteOptimizationModal = lazy(() =>
  import("@/components/route/RouteOptimizationModal").then((m) => ({
    default: m.RouteOptimizationModal,
  })),
);
const ScreensaverMode = lazy(() =>
  import("@/components/screensaver/ScreensaverMode").then((m) => ({ default: m.ScreensaverMode })),
);
const DocumentsModal = lazy(() =>
  import("@/components/modals/DocumentsModal").then((m) => ({ default: m.DocumentsModal })),
);
const ContractsModal = lazy(() =>
  import("@/components/modals/ContractsModal").then((m) => ({ default: m.ContractsModal })),
);
const ReceiptsModal = lazy(() =>
  import("@/components/modals/ReceiptsModal").then((m) => ({ default: m.ReceiptsModal })),
);
const SettingsModal = lazy(() =>
  import("@/components/modals/SettingsModal").then((m) => ({ default: m.SettingsModal })),
);
const EODPlaybackModal = lazy(() =>
  import("@/components/modals/EODPlaybackModal").then((m) => ({ default: m.EODPlaybackModal })),
);
const EmployeeComplianceModal = lazy(() =>
  import("@/components/compliance/EmployeeComplianceModal").then((m) => ({
    default: m.EmployeeComplianceModal,
  })),
);
const BusinessManagementHub = lazy(() =>
  import("@/components/business/BusinessManagementHub").then((m) => ({
    default: m.BusinessManagementHub,
  })),
);
const HRManagementModal = lazy(() =>
  import("@/components/business/HRManagementModal").then((m) => ({ default: m.HRManagementModal })),
);
const WeatherRadarModal = lazy(() =>
  import("@/components/weather/WeatherRadarModal").then((m) => ({ default: m.WeatherRadarModal })),
);
const VeteranModal = lazy(() =>
  import("@/components/modals/VeteranModal").then((m) => ({ default: m.VeteranModal })),
);
import { JobStatusLegend } from "@/components/map/JobStatusLegend";
import { ClockInStatus } from "@/components/time/ClockInStatus";

const Index = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showAIDetection, setShowAIDetection] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const [showScreensaver, setShowScreensaver] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEODPlayback, setShowEODPlayback] = useState(false);
  const [showBusinessHub, setShowBusinessHub] = useState(false);
  const [showHRCompliance, setShowHRCompliance] = useState(false);
  const [showHRManagement, setShowHRManagement] = useState(false);
  const [showWeatherRadar, setShowWeatherRadar] = useState(false);
  const [showVeteran, setShowVeteran] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [pendingEstimateFromAI, setPendingEstimateFromAI] = useState<any | null>(null);
  const mapContainerRef = useRef<MapContainerRef>(null);
  const [mapTheme, setMapTheme] = useState<"division" | "animus">("division");
  const [mapState, setMapState] = useState({
    showTraffic: false,
    showEmployeeTracking: false,
    showWeatherRadar: false,
    activeMode: null as DrawingMode,
    imagery: "none" as "none" | "naip" | "usgs",
    showParcels: false,
  });

  // Load map theme from settings, default to division, and react to changes
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("aos_settings");
        if (!raw) { setMapTheme("division"); return; }
        const parsed = JSON.parse(raw);
        setMapTheme(parsed.mapTheme === "animus" ? "animus" : "division");
      } catch { setMapTheme("division"); }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "aos_settings") return;
      load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Sync map state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (mapContainerRef.current) {
        setMapState({
          showTraffic: mapContainerRef.current.getShowTraffic(),
          showEmployeeTracking: mapContainerRef.current.getShowEmployeeTracking(),
          showWeatherRadar: mapContainerRef.current.getShowWeatherRadar(),
          activeMode: mapContainerRef.current.getActiveMode(),
          imagery: (mapContainerRef.current as any).getImagery?.() || "none",
          showParcels: (mapContainerRef.current as any).getShowParcels?.() || false,
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const analysis = e?.detail?.analysis;
      if (!analysis) return;
      setPendingEstimateFromAI(analysis);
      setActiveModule("estimate");
    };
    window.addEventListener('ai-detection-estimate', handler as any);
    return () => window.removeEventListener('ai-detection-estimate', handler as any);
  }, []);

  useEffect(() => {
    if (activeModule === 'estimate' && pendingEstimateFromAI) {
      // ensure modal has mounted, then dispatch analysis payload
      const t = setTimeout(() => {
        const evt = new CustomEvent('ai-detection-estimate', { detail: { analysis: pendingEstimateFromAI } });
        window.dispatchEvent(evt);
        setPendingEstimateFromAI(null);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [activeModule, pendingEstimateFromAI]);

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-background"
      data-testid="root-shell"
    >
      {/* Main Map */}
      <MapContainer ref={mapContainerRef} initialMapTheme={mapTheme} />

      {/* Top Bar */}
      <TopBar
        onModuleClick={setActiveModule}
        onShowAnalytics={() => setShowAnalytics(true)}
        onShowChat={() => setShowChat(true)}
        onShowAutomation={() => setShowAutomation(true)}
        onShowBusinessHub={() => setShowBusinessHub(true)}
      />

      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Right Sidebar */}
      <RightSidebar
        onAIClick={() => setShowAI(true)}
        onSettingsClick={() => setShowSettings(true)}
        onLocateMe={() => mapContainerRef.current?.handleLocateMe()}
        onToggleTraffic={() => mapContainerRef.current?.handleToggleTraffic()}
        showTraffic={mapState.showTraffic}
        onToggleStreetView={() => mapContainerRef.current?.handleToggleStreetView()}
        onAIDetect={() => setShowAIDetection(true)}
        onToggleEmployeeTracking={() => mapContainerRef.current?.toggleEmployeeTracking()}
        showEmployeeTracking={mapState.showEmployeeTracking}
        onToggleWeatherRadar={() => mapContainerRef.current?.toggleWeatherRadar()}
        showWeatherRadar={mapState.showWeatherRadar}
        onModeChange={(mode) => mapContainerRef.current?.handleModeChange(mode)}
        activeMode={mapState.activeMode}
        onClear={() => mapContainerRef.current?.handleClear()}
        onSave={() => mapContainerRef.current?.handleSave()}
        onExport={() => setShowExport(true)}
        onImageryChange={(mode) => (mapContainerRef.current as any)?.setImagery?.(mode)}
        imagery={mapState.imagery}
      />

      {/* KPI Ticker */}
      <KPITicker />

      {/* Job Status Legend */}
      <JobStatusLegend />

      {/* Clock In/Out Status */}
      <ClockInStatus />

      {/* AI Assistant */}
      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}

      {/* AI Asphalt Detection */}
      <AIAsphaltDetectionModal isOpen={showAIDetection} onClose={() => setShowAIDetection(false)} />

      {/* Modals */}
      {activeModule === "dashboard" && (
        <Suspense fallback={null}>
          <DashboardModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "schedule" && (
        <Suspense fallback={null}>
          <ScheduleModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "clients" && (
        <Suspense fallback={null}>
          <ClientsModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "fleet" && (
        <Suspense fallback={null}>
          <FleetModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "finance" && (
        <Suspense fallback={null}>
          <FinanceModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "payroll" && (
        <Suspense fallback={null}>
          <PayrollModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "jobs" && (
        <Suspense fallback={null}>
          <JobsModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "time" && (
        <Suspense fallback={null}>
          <TimeTrackingModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "photos" && (
        <Suspense fallback={null}>
          <PhotoDocumentationModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "equipment" && (
        <Suspense fallback={null}>
          <EquipmentModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "invoicing" && (
        <Suspense fallback={null}>
          <InvoicingModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "field-reports" && (
        <Suspense fallback={null}>
          <FieldReportsModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "safety" && (
        <Suspense fallback={null}>
          <SafetyComplianceModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "catalog" && (
        <Suspense fallback={null}>
          <CostCatalogModal isOpen={true} onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "estimate" && (
        <Suspense fallback={null}>
          <EstimateCalculatorModal isOpen={true} onClose={() => setActiveModule(null)} />
        </Suspense>
      )}
      {activeModule === "route" && (
        <Suspense fallback={null}>
          <RouteOptimizationModal onClose={() => setActiveModule(null)} />
        </Suspense>
      )}

      {showAnalytics && (
        <Suspense fallback={null}>
          <AnalyticsModal onClose={() => setShowAnalytics(false)} />
        </Suspense>
      )}
      {showChat && (
        <Suspense fallback={null}>
          <ChatModal onClose={() => setShowChat(false)} />
        </Suspense>
      )}
      {showAutomation && (
        <Suspense fallback={null}>
          <AutomationModal onClose={() => setShowAutomation(false)} />
        </Suspense>
      )}
      {showScreensaver && (
        <Suspense fallback={null}>
          <ScreensaverMode onClose={() => setShowScreensaver(false)} />
        </Suspense>
      )}
      {showDocuments && (
        <Suspense fallback={null}>
          <DocumentsModal onClose={() => setShowDocuments(false)} />
        </Suspense>
      )}
      {showContracts && (
        <Suspense fallback={null}>
          <ContractsModal onClose={() => setShowContracts(false)} />
        </Suspense>
      )}
      {showReceipts && (
        <Suspense fallback={null}>
          <ReceiptsModal onClose={() => setShowReceipts(false)} />
        </Suspense>
      )}
      {showSettings && (
        <Suspense fallback={null}>
          <SettingsModal onClose={() => setShowSettings(false)} />
        </Suspense>
      )}
      {showEODPlayback && (
        <Suspense fallback={null}>
          <EODPlaybackModal onClose={() => setShowEODPlayback(false)} />
        </Suspense>
      )}
      {showBusinessHub && (
        <BusinessManagementHub
          onClose={() => setShowBusinessHub(false)}
          onNavigate={(module) => {
            setActiveModule(module);
            if (module === "hr_compliance") {
              setShowHRCompliance(true);
            } else if (module === "hr") {
              setShowHRManagement(true);
            } else if (module === "veteran") {
              setShowVeteran(true);
            }
          }}
        />
      )}
      {showHRCompliance && <EmployeeComplianceModal onClose={() => setShowHRCompliance(false)} />}
      {showHRManagement && <HRManagementModal onClose={() => setShowHRManagement(false)} />}
      {activeModule === "hr_compliance" && (
        <EmployeeComplianceModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "hr" && <HRManagementModal onClose={() => setActiveModule(null)} />}
      {activeModule === "documents" && <DocumentsModal onClose={() => setActiveModule(null)} />}
      {activeModule === "contracts" && <ContractsModal onClose={() => setActiveModule(null)} />}
      {activeModule === "receipts" && <ReceiptsModal onClose={() => setActiveModule(null)} />}
      {activeModule === "eod-playback" && (
        <EODPlaybackModal onClose={() => setActiveModule(null)} />
      )}

      {/* Standalone Modals */}
      {showWeatherRadar && (
        <Suspense fallback={null}>
          <WeatherRadarModal onClose={() => setShowWeatherRadar(false)} />
        </Suspense>
      )}
      {showVeteran && (
        <Suspense fallback={null}>
          <VeteranModal onClose={() => setShowVeteran(false)} />
        </Suspense>
      )}

      {/* Export Modal */}
      {showExport && (
        <Suspense fallback={null}>
          {React.createElement(
            lazy(() =>
              import("@/components/export/MeasurementExportModal").then((m) => ({
                default: m.MeasurementExportModal,
              })),
            ),
            { isOpen: showExport, onClose: () => setShowExport(false) },
          )}
        </Suspense>
      )}
    </div>
  );
};

export default Index;
