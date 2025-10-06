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

const Index = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showAIDetection, setShowAIDetection] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Main Map */}
      <MapContainer />

      {/* Top Bar */}
      <TopBar onModuleClick={setActiveModule} />

      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Right Sidebar */}
      <RightSidebar onAIClick={() => setShowAI(true)} />

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
    </div>
  );
};

export default Index;
