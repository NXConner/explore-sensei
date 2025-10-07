import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scan, Upload, MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportAIReportToPDF } from "@/lib/pdfExport";
import { useMap } from "@/components/map/MapContext";

interface AIAsphaltDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAsphaltDetectionModal = ({ isOpen, onClose }: AIAsphaltDetectionModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const { map } = useMap();

  const analyzeImage = async (imageDataUrl: string) => {
    try {
      setIsAnalyzing(true);
      setProgress(10);
      setError("");
      setResults(null);

      console.log('Calling AI analysis function...');

      const { data, error: functionError } = await supabase.functions.invoke('analyze-asphalt', {
        body: { imageData: imageDataUrl }
      });

      setProgress(90);

      if (functionError) {
        throw functionError;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Analysis failed');
      }

      setProgress(100);
      setResults(data.analysis);

      toast({
        title: "Analysis Complete",
        description: `Surface condition: ${data.analysis.condition}. Confidence: ${data.analysis.confidence_score}%`,
      });

    } catch (err: any) {
      console.error('Analysis error:', err);
      const errorMsg = err.message || 'Failed to analyze image';
      setError(errorMsg);
      toast({
        title: "Analysis Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing Image",
      description: "Converting image for AI analysis...",
    });

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);
      await analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUseCurrentView = async () => {
    try {
      setError("");
      if (!map) {
        toast({
          title: "Map Unavailable",
          description: "Map not initialized yet. Please try again in a moment.",
          variant: "destructive",
        });
        return;
      }

      const center = map.getCenter();
      const zoom = map.getZoom() || 18;
      if (!center) {
        toast({
          title: "Center Not Found",
          description: "Unable to read current map center.",
          variant: "destructive",
        });
        return;
      }

      const lat = center.lat();
      const lng = center.lng();

      const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string;
      if (!apiKey || apiKey === "undefined") {
        toast({
          title: "API Key Missing",
          description: "Google Maps API key not configured.",
          variant: "destructive",
        });
        return;
      }

      setIsAnalyzing(true);
      setProgress(10);
      toast({ title: "Capturing Map View", description: "Fetching static map image..." });

      const staticUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=800x600&maptype=satellite&scale=2&key=${apiKey}`;

      const resp = await fetch(staticUrl);
      if (!resp.ok) throw new Error("Failed to fetch static map image");
      const blob = await resp.blob();
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setSelectedImage(dataUrl);
      await analyzeImage(dataUrl);
    } catch (e: any) {
      setError(e?.message || "Failed to analyze current map view");
      toast({ title: "Capture Failed", description: e?.message || "Could not capture map view.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
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
              variant="outline"
            >
              <MapPin className="w-6 h-6" />
              <span>Analyze Current View</span>
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="h-24 flex flex-col gap-2"
            >
              <Upload className="w-6 h-6" />
              <span>Upload Aerial Image</span>
              <span className="text-xs">AI-Powered Analysis</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {selectedImage && (
            <div className="border rounded-lg p-2">
              <img 
                src={selectedImage} 
                alt="Selected for analysis" 
                className="w-full h-48 object-cover rounded"
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>AI analyzing asphalt surface...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Using Gemini 2.5 Flash vision model for surface analysis
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-4 animate-fade-in">
              <div className="border rounded-lg p-4 bg-accent/20">
                <h3 className="font-semibold mb-3">AI Analysis Results</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Condition</div>
                    <div className="text-xl font-bold text-primary">
                      {results.condition}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                    <div className="text-xl font-bold text-primary">
                      {results.confidence_score}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Priority</div>
                    <div className="text-xl font-bold text-primary">
                      {results.priority}
                    </div>
                  </div>
                </div>

                {results.area_sqft > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-background rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Area (Imperial)</div>
                      <div className="text-lg font-bold">
                        {results.area_sqft.toLocaleString()} ft²
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Area (Metric)</div>
                      <div className="text-lg font-bold">
                        {results.area_sqm.toLocaleString()} m²
                      </div>
                    </div>
                  </div>
                )}

                {results.detected_issues && results.detected_issues.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold mb-2">Detected Issues</div>
                    <div className="space-y-2">
                      {results.detected_issues.map((issue: any, idx: number) => (
                        <div key={idx} className="border rounded p-2 bg-background text-sm">
                          <span className="font-semibold capitalize">{issue.type.replace(/_/g, ' ')}</span>
                          {' - '}
                          <span className="text-muted-foreground">
                            {issue.severity} ({issue.location})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.recommendations && results.recommendations.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold mb-2">Recommendations</div>
                    <ul className="space-y-1 text-sm">
                      {results.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.estimated_repair_cost && (
                  <div className="p-3 bg-background rounded-lg mb-4">
                    <div className="text-sm text-muted-foreground">Estimated Repair Cost</div>
                    <div className="text-lg font-bold">{results.estimated_repair_cost}</div>
                  </div>
                )}

                {results.ai_notes && (
                  <div className="text-sm p-3 bg-background rounded-lg border-l-4 border-primary">
                    <div className="font-semibold mb-1">AI Notes:</div>
                    <div className="text-muted-foreground">{results.ai_notes}</div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      // TODO: Wire to estimate module with prefilled line items from results
                      toast({
                        title: "Estimate Generation",
                        description: "Prefill coming from AI results is in progress.",
                      });
                    }}
                  >
                    Generate Estimate
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      if (results) {
                        exportAIReportToPDF(results, selectedImage);
                        toast({
                          title: "PDF Exported",
                          description: "AI analysis report has been exported to PDF",
                        });
                      }
                    }}
                  >
                    Export Report
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p><strong>AI-Powered Analysis:</strong></p>
            <p>• Upload aerial or ground-level images of asphalt surfaces</p>
            <p>• AI analyzes condition, detects issues (cracks, potholes, wear)</p>
            <p>• Provides detailed recommendations and cost estimates</p>
            <p>• Powered by Google Gemini 2.5 Flash vision model</p>
            <p className="text-yellow-600 dark:text-yellow-500 font-semibold pt-2">
              ⚠️ Free Gemini models until Oct 13, 2025
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
