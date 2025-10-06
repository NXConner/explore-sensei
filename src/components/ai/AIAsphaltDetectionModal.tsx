import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scan, Upload, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface AIAsphaltDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAsphaltDetectionModal = ({ isOpen, onClose }: AIAsphaltDetectionModalProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress(0);

    // Simulate AI analysis progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setResults({
            surfaces: [
              {
                id: 1,
                type: "Parking Lot",
                area_sqft: 15420,
                area_sqm: 1432,
                condition: "Good",
                confidence: 0.94,
              },
              {
                id: 2,
                type: "Road Surface",
                area_sqft: 8650,
                area_sqm: 803,
                condition: "Fair",
                confidence: 0.89,
              },
              {
                id: 3,
                type: "Driveway",
                area_sqft: 3280,
                area_sqm: 305,
                condition: "Excellent",
                confidence: 0.96,
              },
            ],
            total_area_sqft: 27350,
            total_area_sqm: 2540,
          });
          toast({
            title: "Analysis Complete",
            description: "AI has detected and measured all asphalt surfaces.",
          });
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleUseCurrentView = () => {
    toast({
      title: "Capturing Map View",
      description: "Analyzing current visible area...",
    });
    handleAnalyze();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-cyan-500" />
            AI Asphalt Surface Detection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleUseCurrentView}
              disabled={isAnalyzing}
              className="h-24 flex flex-col gap-2"
            >
              <MapPin className="w-6 h-6" />
              <span>Analyze Current View</span>
            </Button>
            <Button
              variant="outline"
              disabled={isAnalyzing}
              className="h-24 flex flex-col gap-2"
            >
              <Upload className="w-6 h-6" />
              <span>Upload Aerial Image</span>
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analyzing surfaces...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {results && (
            <div className="space-y-4 animate-fade-in">
              <div className="border rounded-lg p-4 bg-accent/20">
                <h3 className="font-semibold mb-3">Detection Results</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Area</div>
                    <div className="text-2xl font-bold text-primary">
                      {results.total_area_sqft.toLocaleString()} ft²
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ({results.total_area_sqm.toLocaleString()} m²)
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Surfaces Detected</div>
                    <div className="text-2xl font-bold text-primary">
                      {results.surfaces.length}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {results.surfaces.map((surface: any) => (
                    <div key={surface.id} className="border rounded-lg p-3 bg-background">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">{surface.type}</div>
                          <div className="text-sm text-muted-foreground">
                            Condition: {surface.condition}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Confidence</div>
                          <div className="font-semibold">{(surface.confidence * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Area:</span>{" "}
                          <span className="font-semibold">{surface.area_sqft.toLocaleString()} ft²</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Metric:</span>{" "}
                          <span className="font-semibold">{surface.area_sqm.toLocaleString()} m²</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">
                    Generate Estimate
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Export Report
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p><strong>How it works:</strong></p>
            <p>• AI analyzes aerial/satellite imagery to identify asphalt surfaces</p>
            <p>• Automatically outlines and measures detected areas</p>
            <p>• Provides area calculations in both imperial and metric units</p>
            <p>• Estimates surface condition based on visual analysis</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
