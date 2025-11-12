import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapContainerRef } from "@/components/map/MapContainer";
import type { DrawingMode } from "@/hooks/useMapDrawing";
import { useSchedule } from "@/hooks/useSchedule";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import type { CommandCenterController, CommandModule, MapUIState, ModalKey, ModalState, MobilePanel } from "./types";

const DEFAULT_MODAL_STATE: ModalState = {
  aiAssistant: false,
  aiDetection: false,
  commandPalette: false,
  analytics: false,
  chat: false,
  automation: false,
  screensaver: false,
  documents: false,
  contracts: false,
  receipts: false,
  settings: false,
  eodPlayback: false,
  businessHub: false,
  hrCompliance: false,
  hrManagement: false,
  weatherRadar: false,
  veteran: false,
  export: false,
};

const DEFAULT_MAP_STATE: MapUIState = {
  showTraffic: false,
  showEmployeeTracking: false,
  showWeatherRadar: false,
  showParcels: false,
  activeMode: null,
  imagery: "none",
  lat: 0,
  lng: 0,
  zoom: 15,
};

const MODULE_TO_MODAL: Partial<Record<Exclude<CommandModule, null>, ModalKey>> = {
  settings: "settings",
  weather: "weatherRadar",
  screensaver: "screensaver",
  export: "export",
  veteran: "veteran",
  business_hub: "businessHub",
};

export const useCommandCenterController = (): CommandCenterController => {
  const isOffline = useOfflineDetection();
  const { data: scheduleItems } = useSchedule();
  const mapContainerRef = useRef<MapContainerRef>(null);
  const [mapTheme, setMapTheme] = useState<"division" | "animus">("division");
  const [mapState, setMapState] = useState<MapUIState>(DEFAULT_MAP_STATE);
  const [activeModule, internalSetActiveModule] = useState<CommandModule>(null);
  const [modalState, setModalState] = useState<ModalState>(DEFAULT_MODAL_STATE);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [pendingEstimateFromAI, setPendingEstimateFromAI] = useState<any | null>(null);
  const updateMobilePanel = useCallback((panel: MobilePanel | null) => {
    setMobilePanel(panel);
  }, []);

  const openModal = useCallback((key: ModalKey) => {
    setModalState((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  }, []);

  const closeModal = useCallback((key: ModalKey) => {
    setModalState((prev) => {
      if (!prev[key]) return prev;
      return { ...prev, [key]: false };
    });
  }, []);

  const toggleModal = useCallback((key: ModalKey, value?: boolean) => {
    setModalState((prev) => {
      const next = typeof value === "boolean" ? value : !prev[key];
      if (prev[key] === next) return prev;
      return { ...prev, [key]: next };
    });
  }, []);

  const setActiveModule = useCallback(
    (module: CommandModule) => {
      internalSetActiveModule(module);
      updateMobilePanel(null);
    },
    [updateMobilePanel],
  );

  const clearActiveModule = useCallback(() => {
    internalSetActiveModule(null);
  }, []);

  useEffect(() => {
    const loadTheme = () => {
      try {
        const raw = localStorage.getItem("aos_settings");
        if (!raw) {
          setMapTheme("division");
          return;
        }
        const parsed = JSON.parse(raw);
        setMapTheme(parsed.mapTheme === "animus" ? "animus" : "division");
      } catch {
        setMapTheme("division");
      }
    };

    loadTheme();
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "aos_settings") return;
      loadTheme();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const handleMapStateChange = (event: Event) => {
      const detail = (event as CustomEvent<Partial<MapUIState>>).detail;
      if (!detail) return;
      setMapState((prev) => ({ ...prev, ...detail }));
    };
    window.addEventListener("map-state-change", handleMapStateChange as EventListener);
    return () => window.removeEventListener("map-state-change", handleMapStateChange as EventListener);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const analysis = (event as CustomEvent)?.detail?.analysis;
      if (!analysis) return;
      setPendingEstimateFromAI(analysis);
      internalSetActiveModule("estimate");
    };
    window.addEventListener("ai-detection-estimate", handler as EventListener);
    return () => window.removeEventListener("ai-detection-estimate", handler as EventListener);
  }, []);

  useEffect(() => {
    if (activeModule === "estimate" && pendingEstimateFromAI) {
      const timeout = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("ai-detection-estimate", { detail: { analysis: pendingEstimateFromAI } }));
        setPendingEstimateFromAI(null);
      }, 50);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [activeModule, pendingEstimateFromAI]);

  useEffect(() => {
    if (!activeModule) return;
    if (activeModule in MODULE_TO_MODAL) {
      const modalKey = MODULE_TO_MODAL[activeModule as Exclude<CommandModule, null>];
      if (modalKey) {
        openModal(modalKey);
        internalSetActiveModule(null);
      }
    }
  }, [activeModule, openModal]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInputField = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      const isModKey = event.metaKey || event.ctrlKey;

      if (isModKey && event.key === "k") {
        event.preventDefault();
        toggleModal("commandPalette", true);
        return;
      }

      if (isModKey && !isInputField) {
        switch (event.key) {
          case "n":
            event.preventDefault();
            internalSetActiveModule("jobs");
            break;
          case "b":
            event.preventDefault();
            internalSetActiveModule("dashboard");
            break;
          case "/":
            event.preventDefault();
            (document.querySelector(".address-search-input") as HTMLInputElement | null)?.focus();
            break;
          case "s":
            event.preventDefault();
            mapContainerRef.current?.handleSave?.();
            break;
          case ".":
            event.preventDefault();
            openModal("settings");
            break;
          default:
            break;
        }
        return;
      }

      if (!isModKey && !event.shiftKey && !event.altKey && !isInputField) {
        switch (event.key) {
          case "Escape":
            if (activeModule) {
              internalSetActiveModule(null);
            } else {
              const openModalKey = (Object.keys(modalState) as ModalKey[]).find((key) => modalState[key]);
              if (openModalKey) {
                closeModal(openModalKey);
              }
            }
            break;
          case "a":
            event.preventDefault();
            toggleModal("aiAssistant");
            break;
          case "m":
            event.preventDefault();
            mapContainerRef.current?.handleModeChange?.("measure" as DrawingMode);
            break;
          case "t":
            event.preventDefault();
            mapContainerRef.current?.handleToggleTraffic?.();
            break;
          case "w":
            event.preventDefault();
            mapContainerRef.current?.toggleWeatherRadar?.();
            break;
          case "e":
            event.preventDefault();
            mapContainerRef.current?.toggleEmployeeTracking?.();
            break;
          case "1":
            event.preventDefault();
            mapContainerRef.current?.handleModeChange?.("marker" as DrawingMode);
            break;
          case "2":
            event.preventDefault();
            mapContainerRef.current?.handleModeChange?.("polyline" as DrawingMode);
            break;
          case "3":
            event.preventDefault();
            mapContainerRef.current?.handleModeChange?.("circle" as DrawingMode);
            break;
          case "4":
            event.preventDefault();
            mapContainerRef.current?.handleModeChange?.("rectangle" as DrawingMode);
            break;
          case "p":
            event.preventDefault();
            window.dispatchEvent(new CustomEvent("manual-pulse-trigger"));
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeModule, closeModal, modalState, openModal, toggleModal]);

  const mapControls = useMemo(() => {
    const updateState = (patch: Partial<MapUIState>) => {
      setMapState((prev) => ({ ...prev, ...patch }));
    };

    return {
      changeMode: (mode: DrawingMode) => {
        mapContainerRef.current?.handleModeChange?.(mode);
        updateState({ activeMode: mode });
      },
      clear: () => {
        mapContainerRef.current?.handleClear?.();
        updateState({ activeMode: null });
      },
      toggleTraffic: () => {
        mapContainerRef.current?.handleToggleTraffic?.();
        updateState({ showTraffic: !mapState.showTraffic });
      },
      toggleEmployee: () => {
        mapContainerRef.current?.toggleEmployeeTracking?.();
        updateState({ showEmployeeTracking: !mapState.showEmployeeTracking });
      },
      toggleParcels: () => {
        mapContainerRef.current?.toggleParcels?.();
        updateState({ showParcels: !mapState.showParcels });
      },
      toggleStreetView: () => {
        mapContainerRef.current?.handleToggleStreetView?.();
      },
      toggleWeatherRadar: () => {
        mapContainerRef.current?.toggleWeatherRadar?.();
        updateState({ showWeatherRadar: !mapState.showWeatherRadar });
      },
      locateMe: () => {
        mapContainerRef.current?.handleLocateMe?.();
      },
      save: () => {
        mapContainerRef.current?.handleSave?.();
      },
      setImagery: (imagery: "none" | "naip" | "usgs") => {
        (mapContainerRef.current as any)?.setImagery?.(imagery);
        updateState({ imagery });
      },
    };
  }, [mapState]);

  return useMemo<CommandCenterController>(
    () => ({
      isOffline,
      mapTheme,
      mapState,
      mapControls,
      mapContainerRef,
      scheduleItems,
      activeModule,
      setActiveModule,
      clearActiveModule,
      modalState,
      openModal,
      closeModal,
      toggleModal,
      mobilePanel,
      setMobilePanel: updateMobilePanel,
    }),
    [
      activeModule,
      clearActiveModule,
      closeModal,
      isOffline,
      mapControls,
      mapState,
      mapTheme,
      modalState,
      mobilePanel,
      openModal,
      scheduleItems,
      setActiveModule,
      updateMobilePanel,
      toggleModal,
    ],
  );
};
