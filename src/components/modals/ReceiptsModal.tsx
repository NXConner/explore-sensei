import React, { useState } from "react";
import { X, Upload, Camera, Search, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ReceiptsModalProps {
  onClose: () => void;
}

export const ReceiptsModal = ({ onClose }: ReceiptsModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const receipts = [
    {
      id: 1,
      vendor: "Home Depot",
      total: 342.56,
      category: "Materials",
      date: "2024-02-15",
      status: "processed",
    },
    {
      id: 2,
      vendor: "Shell Gas Station",
      total: 87.23,
      category: "Fuel",
      date: "2024-02-14",
      status: "processed",
    },
    {
      id: 3,
      vendor: "Ace Hardware",
      total: 156.78,
      category: "Tools",
      date: "2024-02-13",
      status: "pending",
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "processed"
      ? "bg-success/20 text-success border-success/30"
      : "bg-warning/20 text-warning border-warning/30";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">RECEIPTS & OCR</h2>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2">
              <Camera className="w-4 h-4" />
              Scan
            </Button>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
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
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="tactical-panel p-4 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold">{receipt.vendor}</p>
                      <Badge variant="outline" className="text-xs">
                        {receipt.category}
                      </Badge>
                      <Badge className={getStatusColor(receipt.status)}>{receipt.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Date: {receipt.date}</span>
                      <span className="text-primary font-semibold">
                        ${receipt.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Summary Footer */}
        <div className="p-4 border-t border-primary/30">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {receipts.length} receipts • {receipts.filter((r) => r.status === "pending").length}{" "}
              pending review
            </p>
            <p className="text-lg font-bold">
              Total: ${receipts.reduce((sum, r) => sum + r.total, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
