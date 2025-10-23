import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scan, Upload, MapPin, AlertCircle, Download, Share2, Camera, FileImage, Zap, TrendingUp, Shield, Clock, Edit3, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportAIReportToPDF } from "@/lib/pdfExport";
import { logger } from "@/lib/monitoring";
import { getGoogleMapsApiKey, getMlApiUrl } from "@/config/env";
import { useMap } from "@/components/map/MapContext";
import { LoadingSpinner, LoadingOverlay } from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AnimatedDiv, HoverAnimation } from "@/components/ui/Animations";
import { AsphaltOverlayViewer } from "./AsphaltOverlayViewer";
import { AsphaltOverlayEditor } from "./AsphaltOverlayEditor";
import { saveDetection } from "@/lib/asphaltDetections";
import { type StaticMapContext } from "@/lib/geoTransform";

interface AIAsphaltDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AsphaltArea {
  id: string;
  coordinates: Array<{ x: number; y: number }>;
  area_sqft: number;
  condition: string;
}

interface DetectedIssue {
  type: string;
  severity: string;
  location: string;
}

interface AnalysisResult {
  id: string;
  image: string;
  condition_score: number;
  detected_issues: DetectedIssue[] | string[];
  recommendations: string[];
  confidence_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost: number;
  priority: number;
  timestamp: string;
  condition?: string;
  area_sqft?: number;
  area_sqm?: number;
  estimated_repair_cost?: string;
  ai_notes?: string;
  asphalt_areas?: AsphaltArea[];
}

interface BatchAnalysis {
  id: string;
  name: string;
  results: AnalysisResult[];
  total_cost: number;
  average_condition: number;
  critical_issues: number;
  created_at: string;
}

export const AIAsphaltDetectionModal = ({ isOpen, onClose }: AIAsphaltDetectionModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchAnalysis[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchAnalysis | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'history'>('single');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [showOverlayViewer, setShowOverlayViewer] = useState(false);
  const [showOverlayEditor, setShowOverlayEditor] = useState(false);
  const [editedAreas, setEditedAreas] = useState<AsphaltArea[]>([]);
  const { map } = useMap();
  const [analysisBackend, setAnalysisBackend] = useState<"mlapi" | "supabase" | null>(null);
  const [pixelsPerFoot, setPixelsPerFoot] = useState<number | undefined>(undefined);
  const [staticCtx, setStaticCtx] = useState<StaticMapContext | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);

  const analyzeImage = async (imageDataUrl: string) => {
    try {
      setIsAnalyzing(true);
      setProgress(10);
      setError("");
      setResults(null);

      logger.debug("Calling AI analysis function...", { source: "AIAsphaltDetectionModal" });

      // Prefer ML API if configured
      const mlUrl = getMlApiUrl();
      let usedBackend: "mlapi" | "supabase" = "supabase";
      let finalData: any = null;

      if (mlUrl) {
        try {
          setProgress(30);
          const resp = await fetch(`${mlUrl.replace(/\/$/, "")}/infer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: imageDataUrl, pixelsPerFoot })
          });
          if (resp.ok) {
            const json = await resp.json();
            if (json?.success) {
              finalData = json;
              usedBackend = "mlapi";
            }
          }
        } catch (err) {
          logger.warn?.("ML API call failed, falling back", { err });
        }
      }

      if (!finalData) {
        const { data, error: functionError } = await supabase.functions.invoke("analyze-asphalt", {
          body: { imageData: imageDataUrl },
        });
        if (functionError) {
          throw functionError;
        }
        if (!data?.success) {
          throw new Error(data?.error || "Analysis failed");
        }
        finalData = data;
        usedBackend = "supabase";
      }

      setProgress(100);
      setResults(finalData.analysis);
      setAnalysisBackend(usedBackend);

      // Broadcast overlay event for map visualization (area circle)
      try {
        const areaSqFt = Number(finalData?.analysis?.area_sqft || 0);
        if (areaSqFt > 0) {
          const evt = new CustomEvent("ai-detection-overlay", { detail: { areaSqFt } });
          window.dispatchEvent(evt);
        }
      } catch {}

      toast({
        title: "Analysis Complete",
        description: `Surface condition: ${finalData.analysis.condition}. Confidence: ${finalData.analysis.confidence_score}% (${usedBackend})`,
      });
    } catch (err: unknown) {
      logger.error("Analysis error", { error: err });
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze image";
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
    if (!file.type.startsWith("image/")) {
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

      const apiKey = getGoogleMapsApiKey();
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

      const scale = 2; // we request scale=2 in Static Maps
      const staticUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=800x600&maptype=satellite&scale=${scale}&key=${apiKey}`;
      // Note: Static Maps requires billing; if watermark appears, notify user

      const resp = await fetch(staticUrl);
      if (!resp.ok) throw new Error("Failed to fetch static map image");
      const blob = await resp.blob();
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Load to get intrinsic dimensions
      try {
        const img = new Image();
        const dims: { width: number; height: number } = await new Promise((resolve, reject) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = reject;
          img.src = dataUrl;
        });
        setImageDims(dims);
        // Save static map context for pixel->latlng conversion
        setStaticCtx({ center: { lat, lng }, zoom, width: dims.width, height: dims.height, scale });
      } catch {}

      // Estimate pixels-per-foot using Web Mercator resolution
      try {
        const earthCircumferenceM = 40075016.686; // meters
        const mPerPx = Math.cos((lat * Math.PI) / 180) * earthCircumferenceM / (256 * Math.pow(2, zoom) * scale);
        const ftPerPx = mPerPx * 3.28084;
        const ppf = 1 / ftPerPx;
        setPixelsPerFoot(ppf);
      } catch {}

      setSelectedImage(dataUrl);
      await analyzeImage(dataUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to analyze current map view");
      toast({
        title: "Capture Failed",
        description: e instanceof Error ? e.message : "Could not capture map view.",
        variant: "destructive",
      });
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
                    <div className="text-xl font-bold text-primary">{results.condition}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                    <div className="text-xl font-bold text-primary">
                      {results.confidence_score}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Priority</div>
                    <div className="text-xl font-bold text-primary">{results.priority}</div>
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
                      {results.detected_issues.map((issue: any, idx: number) => {
                        const issueText = typeof issue === 'string' 
                          ? issue 
                          : issue.type || 'Unknown issue';
                        const severity = typeof issue === 'object' ? issue.severity : undefined;
                        const location = typeof issue === 'object' ? issue.location : undefined;
                        
                        return (
                          <div key={idx} className="border rounded p-2 bg-background text-sm">
                            <span className="font-semibold capitalize">
                              {issueText.replace(/_/g, " ")}
                            </span>
                            {severity && (
                              <Badge variant="outline" className="ml-2">
                                {severity}
                              </Badge>
                            )}
                            {location && (
                              <span className="text-muted-foreground ml-2">
                                @ {location.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                        );
                      })}
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
                      if (results) {
                        try {
                          const evt = new CustomEvent('ai-detection-estimate', { detail: { analysis: results } });
                          window.dispatchEvent(evt);
                          toast({
                            title: "Estimate Prefilled",
                            description: "Estimate calculator opened with AI results.",
                          });
                        } catch (err) {
                          logger.error("Failed to dispatch estimate event", { error: err });
                          toast({ title: "Estimate Error", description: "Could not open estimate from AI results.", variant: "destructive" });
                        }
                      }
                    }}
                  >
                    Generate Estimate
                  </Button>
                  {results && (
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={async () => {
                        try {
                          if (!results) return;
                          const center = map?.getCenter?.();
                          const zoom = map?.getZoom?.();
                          const ctx = staticCtx || (center && zoom && imageDims
                            ? { center: { lat: center.lat(), lng: center.lng() }, zoom, width: imageDims.width, height: imageDims.height, scale: 2 }
                            : null);
                          const saved = await saveDetection({
                            source: selectedImage ? "map_view" : "upload",
                            imageWidth: imageDims?.width,
                            imageHeight: imageDims?.height,
                            mapLat: center?.lat?.(),
                            mapLng: center?.lng?.(),
                            mapZoom: zoom,
                            analysis: { ...results, asphalt_areas: editedAreas.length ? editedAreas : results.asphalt_areas },
                            staticMapCtx: ctx || undefined,
                          });
                          toast({ title: "Detection Saved", description: "AI overlay saved and synced across devices." });
                          try { window.dispatchEvent(new CustomEvent('ai-detection-saved', { detail: { id: (saved as any)?.id } })); } catch {}
                        } catch (e: any) {
                          toast({ title: "Save Failed", description: e?.message || "Could not save detection.", variant: "destructive" });
                        }
                      }}
                    >
                      Save Overlay
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (results) {
                        exportAIReportToPDF({
                          condition: results.condition || 'Unknown',
                          confidence_score: results.confidence_score,
                          area_sqft: results.area_sqft || 0,
                          area_sqm: results.area_sqm || 0,
                          detected_issues: results.detected_issues.map(issue => 
                            typeof issue === 'string' 
                              ? { type: issue, severity: 'medium', location: 'N/A' }
                              : issue
                          ),
                          recommendations: results.recommendations,
                          priority: results.priority.toString(),
                          estimated_repair_cost: results.estimated_repair_cost,
                          ai_notes: results.ai_notes
                        }, selectedImage);
                        toast({
                          title: "PDF Exported",
                          description: "AI analysis report has been exported to PDF",
                        });
                      }
                    }}
                  >
                    Export Report
                  </Button>
                  {results.asphalt_areas && results.asphalt_areas.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setShowOverlayViewer(true)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Overlay
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditedAreas(results.asphalt_areas || []);
                          setShowOverlayEditor(true);
                        }}
                        className="flex-1"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Manual Adjust
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p>
              <strong>AI-Powered Analysis:</strong>
            </p>
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

      {/* Overlay Viewer Modal */}
      {showOverlayViewer && results && results.asphalt_areas && selectedImage && (
        <Dialog open={showOverlayViewer} onOpenChange={setShowOverlayViewer}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-cyan-500" />
                AI Asphalt Detection Overlay
              </DialogTitle>
            </DialogHeader>
            <AsphaltOverlayViewer
              originalImage={selectedImage}
              asphaltAreas={results.asphalt_areas}
              totalArea={results.area_sqft || 0}
              onClose={() => setShowOverlayViewer(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Overlay Editor Modal */}
      {showOverlayEditor && results && selectedImage && (
        <Dialog open={showOverlayEditor} onOpenChange={setShowOverlayEditor}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-500" />
                Manual Asphalt Area Adjustment
              </DialogTitle>
            </DialogHeader>
            <AsphaltOverlayEditor
              originalImage={selectedImage}
              asphaltAreas={editedAreas}
              totalArea={results.area_sqft || 0}
              onClose={() => setShowOverlayEditor(false)}
              onSave={(areas, totalArea) => {
                // Update the results with edited areas
                setResults({
                  ...results,
                  asphalt_areas: areas,
                  area_sqft: totalArea,
                  area_sqm: totalArea * 0.092903
                });
                setShowOverlayEditor(false);
                toast({
                  title: "Areas Updated",
                  description: `Manual adjustments saved. Total area: ${totalArea.toLocaleString()} ft²`
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};
