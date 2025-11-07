import React, { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";
import { AIAssistant } from "@/components/ai/AIAssistant";
import type { CommandCenterController, CommandModule, ModalKey } from "./types";

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
  import("@/components/business/HRManagementModal").then((m) => ({
    default: m.HRManagementModal,
  })),
);
const WeatherRadarModal = lazy(() =>
  import("@/components/weather/WeatherRadarModal").then((m) => ({ default: m.WeatherRadarModal })),
);
const VeteranModal = lazy(() =>
  import("@/components/modals/VeteranModal").then((m) => ({ default: m.VeteranModal })),
);
const AIAsphaltDetectionModal = lazy(() =>
  import("@/components/ai/AIAsphaltDetectionModal").then((m) => ({
    default: m.AIAsphaltDetectionModal,
  })),
);
const MeasurementExportModal = lazy(() =>
  import("@/components/export/MeasurementExportModal").then((m) => ({
    default: m.MeasurementExportModal,
  })),
);

interface CommandCenterModalsProps {
  controller: CommandCenterController;
}

const createCloseHandler =
  (
    controller: CommandCenterController,
    options: { module?: CommandModule; modal?: ModalKey } = {},
  ) =>
  () => {
    if (options.modal) {
      controller.closeModal(options.modal);
    }
    if (options.module && controller.activeModule === options.module) {
      controller.clearActiveModule();
    }
  };

export const CommandCenterModals = ({ controller }: CommandCenterModalsProps) => {
  const { activeModule, modalState } = controller;

  const renderModule = (module: CommandModule, fallback: React.ReactNode, element: React.ReactNode) =>
    activeModule === module ? <Suspense fallback={fallback}>{element}</Suspense> : null;

  return (
    <>
      {modalState.aiAssistant && <AIAssistant onClose={createCloseHandler(controller, { modal: "aiAssistant" })} />}

      <Suspense fallback={null}>
        <AIAsphaltDetectionModal
          isOpen={modalState.aiDetection}
          onClose={createCloseHandler(controller, { modal: "aiDetection" })}
        />
      </Suspense>

      {renderModule(
        "dashboard",
        <SkeletonLoader type="modal" />,
        <DashboardModal onClose={createCloseHandler(controller, { module: "dashboard" })} />,
      )}

      {renderModule(
        "schedule",
        <LoadingSpinner text="Loading Schedule..." size="lg" variant="primary" />,
        <ScheduleModal onClose={createCloseHandler(controller, { module: "schedule" })} />,
      )}

      {renderModule(
        "clients",
        <LoadingSpinner text="Loading Clients..." size="lg" variant="primary" />,
        <ClientsModal onClose={createCloseHandler(controller, { module: "clients" })} />,
      )}

      {renderModule(
        "fleet",
        <LoadingSpinner text="Loading Fleet..." size="lg" variant="primary" />,
        <FleetModal onClose={createCloseHandler(controller, { module: "fleet" })} />,
      )}

      {renderModule(
        "finance",
        <LoadingSpinner text="Loading Finance..." size="lg" variant="primary" />,
        <FinanceModal onClose={createCloseHandler(controller, { module: "finance" })} />,
      )}

      {renderModule(
        "payroll",
        <LoadingSpinner text="Loading Payroll..." size="lg" variant="primary" />,
        <PayrollModal onClose={createCloseHandler(controller, { module: "payroll" })} />,
      )}

      {renderModule("jobs", null, <JobsModal onClose={createCloseHandler(controller, { module: "jobs" })} />)}

      {renderModule(
        "time",
        null,
        <TimeTrackingModal onClose={createCloseHandler(controller, { module: "time" })} />,
      )}

      {renderModule(
        "photos",
        null,
        <PhotoDocumentationModal onClose={createCloseHandler(controller, { module: "photos" })} />,
      )}

      {renderModule(
        "equipment",
        null,
        <EquipmentModal onClose={createCloseHandler(controller, { module: "equipment" })} />,
      )}

      {renderModule(
        "invoicing",
        null,
        <InvoicingModal onClose={createCloseHandler(controller, { module: "invoicing" })} />,
      )}

      {renderModule(
        "field-reports",
        null,
        <FieldReportsModal onClose={createCloseHandler(controller, { module: "field-reports" })} />,
      )}

      {renderModule(
        "safety",
        null,
        <SafetyComplianceModal onClose={createCloseHandler(controller, { module: "safety" })} />,
      )}

      {renderModule(
        "catalog",
        null,
        <CostCatalogModal isOpen onClose={createCloseHandler(controller, { module: "catalog" })} />,
      )}

      {renderModule(
        "estimate",
        null,
        <EstimateCalculatorModal isOpen onClose={createCloseHandler(controller, { module: "estimate" })} />,
      )}

      {renderModule(
        "route",
        null,
        <RouteOptimizationModal onClose={createCloseHandler(controller, { module: "route" })} />,
      )}

      {(activeModule === "documents" || modalState.documents) && (
        <Suspense fallback={null}>
          <DocumentsModal
            onClose={() => {
              controller.closeModal("documents");
              if (controller.activeModule === "documents") controller.clearActiveModule();
            }}
          />
        </Suspense>
      )}

      {(activeModule === "contracts" || modalState.contracts) && (
        <Suspense fallback={null}>
          <ContractsModal
            onClose={() => {
              controller.closeModal("contracts");
              if (controller.activeModule === "contracts") controller.clearActiveModule();
            }}
          />
        </Suspense>
      )}

      {(activeModule === "receipts" || modalState.receipts) && (
        <Suspense fallback={null}>
          <ReceiptsModal
            onClose={() => {
              controller.closeModal("receipts");
              if (controller.activeModule === "receipts") controller.clearActiveModule();
            }}
          />
        </Suspense>
      )}

      {(activeModule === "eod-playback" || modalState.eodPlayback) && (
        <Suspense fallback={null}>
          <EODPlaybackModal
            onClose={() => {
              controller.closeModal("eodPlayback");
              if (controller.activeModule === "eod-playback") controller.clearActiveModule();
            }}
          />
        </Suspense>
      )}

      {(activeModule === "hr_compliance" || modalState.hrCompliance) && (
        <Suspense fallback={null}>
          <EmployeeComplianceModal
            onClose={() => {
              controller.closeModal("hrCompliance");
              if (controller.activeModule === "hr_compliance") controller.clearActiveModule();
            }}
          />
        </Suspense>
      )}

      {(activeModule === "hr" || modalState.hrManagement) && (
        <Suspense fallback={null}>
          <HRManagementModal
            onClose={() => {
              controller.closeModal("hrManagement");
              if (controller.activeModule === "hr") controller.clearActiveModule();
            }}
          />
        </Suspense>
      )}

      {(modalState.analytics) && (
        <Suspense fallback={null}>
          <AnalyticsModal onClose={createCloseHandler(controller, { modal: "analytics" })} />
        </Suspense>
      )}

      {modalState.chat && (
        <Suspense fallback={null}>
          <ChatModal onClose={createCloseHandler(controller, { modal: "chat" })} />
        </Suspense>
      )}

      {modalState.automation && (
        <Suspense fallback={null}>
          <AutomationModal onClose={createCloseHandler(controller, { modal: "automation" })} />
        </Suspense>
      )}

      {(modalState.screensaver || activeModule === "screensaver") && (
        <Suspense fallback={null}>
          <ScreensaverMode
            onClose={() => {
              controller.closeModal("screensaver");
              if (controller.activeModule === "screensaver") controller.clearActiveModule();
            }}
          />
        </Suspense>
      )}

      {modalState.settings && (
        <Suspense fallback={null}>
          <SettingsModal onClose={createCloseHandler(controller, { modal: "settings" })} />
        </Suspense>
      )}

      {modalState.businessHub && (
        <Suspense fallback={null}>
          <BusinessManagementHub
            onClose={createCloseHandler(controller, { modal: "businessHub" })}
            onNavigate={(module) => controller.setActiveModule(module as CommandModule)}
          />
        </Suspense>
      )}

      {modalState.weatherRadar && (
        <Suspense fallback={null}>
          <WeatherRadarModal onClose={createCloseHandler(controller, { modal: "weatherRadar" })} />
        </Suspense>
      )}

      {modalState.veteran && (
        <Suspense fallback={null}>
          <VeteranModal onClose={createCloseHandler(controller, { modal: "veteran" })} />
        </Suspense>
      )}

      {modalState.export && (
        <Suspense fallback={null}>
          <MeasurementExportModal
            isOpen
            onClose={() => controller.closeModal("export")}
          />
        </Suspense>
      )}
    </>
  );
};
