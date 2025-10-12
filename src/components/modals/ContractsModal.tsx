import React, { useState } from "react";
import { X, Plus, FileText, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ContractsModalProps {
  onClose: () => void;
}

export const ContractsModal = ({ onClose }: ContractsModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const contracts = [
    {
      id: 1,
      customer: "ABC Construction",
      jobId: "JOB-001",
      status: "signed",
      date: "2024-01-15",
      value: "$125,000",
    },
    {
      id: 2,
      customer: "XYZ Development",
      jobId: "JOB-003",
      status: "pending",
      date: "2024-02-01",
      value: "$89,500",
    },
    {
      id: 3,
      customer: "City Municipal",
      jobId: "JOB-007",
      status: "signed",
      date: "2024-01-28",
      value: "$245,000",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-success/20 text-success border-success/30";
      case "pending":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">CONTRACTS</h2>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Contract
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-primary/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="tactical-panel p-4 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold">{contract.customer}</p>
                      <Badge variant="outline" className="text-xs">
                        {contract.jobId}
                      </Badge>
                      <Badge className={getStatusColor(contract.status)}>{contract.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Date: {contract.date}</span>
                      <span>Value: {contract.value}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
