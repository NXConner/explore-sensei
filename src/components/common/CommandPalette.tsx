import React, { useState, useEffect, useCallback } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  Search, Calendar, Users, Briefcase, Clock, FileText, 
  Settings, MapPin, DollarSign, TrendingUp, Shield, Wrench 
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (module: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange, onNavigate }) => {
  const [search, setSearch] = useState("");

  const commands = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp, keywords: ["home", "overview", "stats"] },
    { id: "schedule", label: "Schedule", icon: Calendar, keywords: ["calendar", "timeline", "events"] },
    { id: "jobs", label: "Jobs", icon: Briefcase, keywords: ["projects", "work", "tasks"] },
    { id: "clients", label: "Clients", icon: Users, keywords: ["customers", "contacts"] },
    { id: "fleet", label: "Fleet", icon: Wrench, keywords: ["vehicles", "equipment"] },
    { id: "time", label: "Time Tracking", icon: Clock, keywords: ["hours", "timesheet", "clock"] },
    { id: "invoicing", label: "Invoicing", icon: DollarSign, keywords: ["billing", "payments", "invoice"] },
    { id: "field-reports", label: "Field Reports", icon: FileText, keywords: ["reports", "documentation"] },
    { id: "safety", label: "Safety & Compliance", icon: Shield, keywords: ["compliance", "safety", "regulations"] },
    { id: "estimate", label: "Estimate Calculator", icon: DollarSign, keywords: ["calculator", "quote", "pricing"] },
    { id: "settings", label: "Settings", icon: Settings, keywords: ["preferences", "config", "options"] },
  ];

  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(kw => kw.includes(searchLower))
    );
  });

  const handleSelect = useCallback((commandId: string) => {
    onNavigate(commandId);
    onOpenChange(false);
    setSearch("");
  }, [onNavigate, onOpenChange]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border border-primary/30 shadow-lg">
        <CommandInput 
          placeholder="Search commands or modules..." 
          value={search}
          onValueChange={setSearch}
          className="border-none"
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Modules">
            {filteredCommands.map((cmd) => (
              <CommandItem
                key={cmd.id}
                onSelect={() => handleSelect(cmd.id)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-primary/20"
              >
                <cmd.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{cmd.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem className="flex items-center gap-3 px-4 py-3">
              <Search className="w-5 h-5 text-primary" />
              <span className="text-sm">Search Address</span>
            </CommandItem>
            <CommandItem className="flex items-center gap-3 px-4 py-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm">Create Job</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
