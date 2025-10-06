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

const Index = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);

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
    </div>
  );
};

export default Index;
