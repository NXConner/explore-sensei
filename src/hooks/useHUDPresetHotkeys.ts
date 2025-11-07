import { useEffect } from "react";
import { useHUDSettings } from "./useHUDSettings";

export function useHUDPresetHotkeys() {
  const [settings, updateSettings] = useHUDSettings();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "1":
          updateSettings({ hudPreset: "minimal" });
          break;
        case "2":
          updateSettings({ hudPreset: "standard" });
          break;
        case "3":
          updateSettings({ hudPreset: "tactical" });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [updateSettings]);
}
