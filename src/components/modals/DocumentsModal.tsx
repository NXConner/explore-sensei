import React, { useState } from "react";
import { X, Upload, Search, FileText, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentsModalProps {
  onClose: () => void;
}

export const DocumentsModal = ({ onClose }: DocumentsModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const companyDocs = [
    { id: 1, name: "Company Handbook.pdf", size: "2.3 MB", date: "2024-01-15" },
    { id: 2, name: "Safety Guidelines.pdf", size: "1.8 MB", date: "2024-02-01" },
    { id: 3, name: "Equipment Manual.pdf", size: "5.2 MB", date: "2024-01-20" },
  ];

  const hrDocs = [
    { id: 4, name: "Employment Agreement.pdf", size: "450 KB", date: "2024-01-10" },
    { id: 5, name: "Benefits Overview.pdf", size: "1.2 MB", date: "2024-01-15" },
    { id: 6, name: "Time Off Policy.pdf", size: "320 KB", date: "2024-02-05" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">DOCUMENTS CENTER</h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-primary/30">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="company" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="company">Company Documents</TabsTrigger>
            <TabsTrigger value="hr">HR Documents</TabsTrigger>
            <TabsTrigger value="veteran">Veteran Resources</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="company" className="mt-0">
              <div className="space-y-2">
                {companyDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="tactical-panel p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.size} • {doc.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hr" className="mt-0">
              <div className="space-y-2">
                {hrDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="tactical-panel p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.size} • {doc.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="veteran" className="mt-0">
              <div className="tactical-panel p-6 text-center">
                <p className="text-muted-foreground">
                  Veteran resources and support documentation will be displayed here.
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};