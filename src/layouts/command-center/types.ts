import type { DrawingMode } from "@/hooks/useMapDrawing";
import type { MapContainerRef } from "@/components/map/MapContainer";

export type CommandModule =
  | "dashboard"
  | "schedule"
  | "clients"
  | "fleet"
  | "finance"
  | "payroll"
  | "jobs"
  | "time"
  | "photos"
  | "equipment"
  | "invoicing"
  | "field-reports"
  | "safety"
  | "catalog"
  | "estimate"
  | "route"
  | "hr_compliance"
  | "hr"
  | "documents"
  | "contracts"
  | "receipts"
  | "eod-playback"
  | "settings"
  | "weather"
  | "screensaver"
  | "export"
  | "veteran"
  | "business_hub"
  | null;

export type ModalKey =
  | "aiAssistant"
  | "aiDetection"
  | "commandPalette"
  | "analytics"
  | "chat"
  | "automation"
  | "screensaver"
  | "documents"
  | "contracts"
  | "receipts"
  | "settings"
  | "eodPlayback"
  | "businessHub"
  | "hrCompliance"
  | "hrManagement"
  | "weatherRadar"
  | "veteran"
  | "export";

export type ModalState = Record<ModalKey, boolean>;

export type MobilePanel = "layers" | "tools" | "missions" | "intel" | "themes" | null;

export interface MapUIState {
  showTraffic: boolean;
  showEmployeeTracking: boolean;
  showWeatherRadar: boolean;
  showParcels: boolean;
  activeMode: DrawingMode;
  imagery: "none" | "naip" | "usgs";
  lat: number;
  lng: number;
  zoom: number;
}

export interface MapControls {
  changeMode: (mode: DrawingMode) => void;
  clear: () => void;
  toggleTraffic: () => void;
  toggleEmployee: () => void;
  toggleParcels: () => void;
  toggleStreetView: () => void;
  toggleWeatherRadar: () => void;
  locateMe: () => void;
  save: () => void;
  setImagery: (imagery: "none" | "naip" | "usgs") => void;
}

export interface CommandCenterController {
  isOffline: boolean;
  mapTheme: "division" | "animus";
  mapContainerRef: React.RefObject<MapContainerRef>;
  mapState: MapUIState;
  mapControls: MapControls;
  scheduleItems: any[] | undefined;
  activeModule: CommandModule;
  setActiveModule: (module: CommandModule) => void;
  clearActiveModule: () => void;
  modalState: ModalState;
  openModal: (key: ModalKey) => void;
  closeModal: (key: ModalKey) => void;
  toggleModal: (key: ModalKey, value?: boolean) => void;
  mobilePanel: MobilePanel;
  setMobilePanel: (panel: MobilePanel | null) => void;
}
