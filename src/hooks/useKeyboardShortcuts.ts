import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Shortcut {
  id: string;
  action: string;
  shortcut: string;
  is_custom: boolean;
}

const DEFAULT_SHORTCUTS: Omit<Shortcut, "id" | "is_custom">[] = [
  { action: "open_command_palette", shortcut: "Cmd+K" },
  { action: "new_job", shortcut: "Cmd+N" },
  { action: "search", shortcut: "Cmd+/" },
  { action: "toggle_sidebar", shortcut: "Cmd+B" },
  { action: "save", shortcut: "Cmd+S" },
  { action: "close_modal", shortcut: "Escape" },
];

export const useKeyboardShortcuts = () => {
  const queryClient = useQueryClient();

  const { data: shortcuts } = useQuery({
    queryKey: ["keyboard-shortcuts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("user_shortcuts").select("*");
      if (error) throw error;

      // Merge with defaults
      const customShortcuts = data as unknown as Shortcut[];
      const allShortcuts = DEFAULT_SHORTCUTS.map((def) => {
        const custom = customShortcuts.find((c) => c.action === def.action);
        return custom || { ...def, id: def.action, is_custom: false };
      });

      return allShortcuts;
    },
  });

  const updateShortcut = useMutation({
    mutationFn: async ({ action, shortcut }: { action: string; shortcut: string }) => {
      const { error } = await (supabase as any)
        .from("user_shortcuts")
        .upsert({ action, shortcut, is_custom: true });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keyboard-shortcuts"] });
    },
  });

  const resetToDefaults = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("user_shortcuts")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keyboard-shortcuts"] });
    },
  });

  const registerShortcut = (action: string, handler: () => void) => {
    useEffect(() => {
      const shortcut = shortcuts?.find((s) => s.action === action);
      if (!shortcut) return;

      const handleKeyPress = (e: KeyboardEvent) => {
        const parts = shortcut.shortcut.split("+");
        const key = parts[parts.length - 1];
        const needsCmd = parts.includes("Cmd");
        const needsCtrl = parts.includes("Ctrl");
        const needsShift = parts.includes("Shift");
        const needsAlt = parts.includes("Alt");

        if (
          e.key === key &&
          (!needsCmd || e.metaKey || e.ctrlKey) &&
          (!needsCtrl || e.ctrlKey) &&
          (!needsShift || e.shiftKey) &&
          (!needsAlt || e.altKey)
        ) {
          e.preventDefault();
          handler();
        }
      };

      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }, [shortcuts, action, handler]);
  };

  return {
    shortcuts: shortcuts || [],
    updateShortcut: updateShortcut.mutate,
    resetToDefaults: resetToDefaults.mutate,
    registerShortcut,
  };
};
