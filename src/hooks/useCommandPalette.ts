import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  action: () => void;
  keywords?: string[];
  category?: string;
}

export const useCommandPalette = (commands: Command[]) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(searchLower))
    );
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const executeCommand = (command: Command) => {
    command.action();
    setIsOpen(false);
    setSearch("");
  };

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    filteredCommands,
    executeCommand,
  };
};