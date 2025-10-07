import React, { useState } from "react";
import { MapContainer } from "@/components/map/MapContainer";
import { TopBar } from "@/components/layout/TopBar";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { KPITicker } from "@/components/dashboard/KPITicker";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { DashboardModal } from "@/components/modals/DashboardModal";
import { ScheduleModal } from "@/components/modals/ScheduleModal";
import { ClientsModal } from "@/components/modals/ClientsModal";
import { FleetModal } from "@/components/modals/FleetModal";
import { FinanceModal } from "@/components/modals/FinanceModal";
import { AnalyticsModal } from "@/components/modals/AnalyticsModal";
import { ChatModal } from "@/components/modals/ChatModal";
import { AutomationModal } from "@/components/modals/AutomationModal";
import { PayrollModal } from "@/components/modals/PayrollModal";
import { JobsModal } from "@/components/jobs/JobsModal";
import { TimeTrackingModal } from "@/components/time/TimeTrackingModal";
import { PhotoDocumentationModal } from "@/components/photos/PhotoDocumentationModal";
import { EquipmentModal } from "@/components/equipment/EquipmentModal";
import { InvoicingModal } from "@/components/invoicing/InvoicingModal";
import { FieldReportsModal } from "@/components/reports/FieldReportsModal";
import { SafetyComplianceModal } from "@/components/safety/SafetyComplianceModal";
import { CostCatalogModal } from "@/components/catalog/CostCatalogModal";
import { EstimateCalculatorModal } from "@/components/estimate/EstimateCalculatorModal";
import { AIAsphaltDetectionModal } from "@/components/ai/AIAsphaltDetectionModal";
import { RouteOptimizationModal } from "@/components/route/RouteOptimizationModal";
import { ScreensaverMode } from "@/components/screensaver/ScreensaverMode";
import { DocumentsModal } from "@/components/modals/DocumentsModal";
import { ContractsModal } from "@/components/modals/ContractsModal";
import { ReceiptsModal } from "@/components/modals/ReceiptsModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { EODPlaybackModal } from "@/components/modals/EODPlaybackModal";
import { EmployeeComplianceModal } from "@/components/compliance/EmployeeComplianceModal";
import { BusinessManagementHub } from "@/components/business/BusinessManagementHub";
import { HRManagementModal } from "@/components/business/HRManagementModal";
import { WeatherRadarModal } from "@/components/weather/WeatherRadarModal";
import { VeteranModal } from "@/components/modals/VeteranModal";

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

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Main Map */}
      <MapContainer />

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
      />

      {/* KPI Ticker */}
      <KPITicker />

      {/* AI Assistant */}
      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
      
      {/* AI Asphalt Detection */}
      <AIAsphaltDetectionModal 
        isOpen={showAIDetection} 
        onClose={() => setShowAIDetection(false)} 
      />

      {/* Modals */}
      {activeModule === "dashboard" && (
        <DashboardModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "schedule" && (
        <ScheduleModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "clients" && (
        <ClientsModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "fleet" && (
        <FleetModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "finance" && (
        <FinanceModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "payroll" && (
        <PayrollModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "jobs" && (
        <JobsModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "time" && (
        <TimeTrackingModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "photos" && (
        <PhotoDocumentationModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "equipment" && (
        <EquipmentModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "invoicing" && (
        <InvoicingModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "field-reports" && (
        <FieldReportsModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "safety" && (
        <SafetyComplianceModal onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "catalog" && (
        <CostCatalogModal isOpen={true} onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "estimate" && (
        <EstimateCalculatorModal isOpen={true} onClose={() => setActiveModule(null)} />
      )}
      {activeModule === "route" && (
        <RouteOptimizationModal isOpen={true} onClose={() => setActiveModule(null)} />
      )}
      
      {showAnalytics && <AnalyticsModal onClose={() => setShowAnalytics(false)} />}
      {showChat && <ChatModal onClose={() => setShowChat(false)} />}
      {showAutomation && <AutomationModal onClose={() => setShowAutomation(false)} />}
      {showScreensaver && <ScreensaverMode onClose={() => setShowScreensaver(false)} />}
      {showDocuments && <DocumentsModal onClose={() => setShowDocuments(false)} />}
      {showContracts && <ContractsModal onClose={() => setShowContracts(false)} />}
      {showReceipts && <ReceiptsModal onClose={() => setShowReceipts(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showEODPlayback && <EODPlaybackModal onClose={() => setShowEODPlayback(false)} />}
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
      {activeModule === "hr_compliance" && <EmployeeComplianceModal onClose={() => setActiveModule(null)} />}
      {activeModule === "hr" && <HRManagementModal onClose={() => setActiveModule(null)} />}
      {activeModule === "documents" && <DocumentsModal onClose={() => setActiveModule(null)} />}
      {activeModule === "contracts" && <ContractsModal onClose={() => setActiveModule(null)} />}
      {activeModule === "receipts" && <ReceiptsModal onClose={() => setActiveModule(null)} />}
      {activeModule === "eod-playback" && <EODPlaybackModal onClose={() => setActiveModule(null)} />}
      
      {/* Standalone Modals */}
      {showWeatherRadar && <WeatherRadarModal onClose={() => setShowWeatherRadar(false)} />}
      {showVeteran && <VeteranModal onClose={() => setShowVeteran(false)} />}
    </div>
  );
};

export default Index;
