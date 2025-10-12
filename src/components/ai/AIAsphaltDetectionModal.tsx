import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scan, Upload, MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportAIReportToPDF } from "@/lib/pdfExport";
import { getGoogleMapsApiKey } from "@/config/env";
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
  const [lastImageMeta, setLastImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [lastSource, setLastSource] = useState<'upload' | 'map_view'>('upload');
  const { map } = useMap();
  const [mapReady, setMapReady] = useState(false);
  const [showBoxes, setShowBoxes] = useState(true);
  const [roi, setRoi] = useState<[number, number, number, number] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [roiRectPx, setRoiRectPx] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Map readiness check with retry mechanism
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (!map) {
      setMapReady(false);
      return;
    }
    interval = setInterval(() => {
      try {
        const center = map.getCenter?.();
        if (center && typeof center.lat === "function" && typeof center.lng === "function") {
          setMapReady(true);
          if (interval) clearInterval(interval);
        }
      } catch {
        // ignore transient errors while map initializes
      }
    }, 100);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [map]);

  const analyzeImage = async (
    imageDataUrl: string,
    options?: {
      source?: 'upload' | 'map_view';
      roiNormalized?: [number, number, number, number];
      imageMeta?: { width: number; height: number };
      mapCenter?: { lat: number; lng: number };
      mapZoom?: number;
      mapBounds?: { north: number; south: number; east: number; west: number };
    }
  ) => {
    try {
      setIsAnalyzing(true);
      setProgress(10);
      setError("");
      setResults(null);

      console.log('Calling AI analysis function...');

      const { data, error: functionError } = await supabase.functions.invoke('analyze-asphalt', {
        body: {
          imageData: imageDataUrl,
          source: options?.source ?? 'upload',
          roiNormalized: options?.roiNormalized,
          imageMeta: options?.imageMeta,
          mapCenter: options?.mapCenter,
          mapZoom: options?.mapZoom,
        }
      });

      setProgress(90);

      if (functionError) {
        throw functionError;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Analysis failed');
      }

      setProgress(100);
      setResults({ ...data.analysis, _detection_id: data.detection_id, imageMeta: options?.imageMeta });

      // Broadcast overlay event for map rendering when sourced from live map view
      try {
        if (
          options?.source === 'map_view' &&
          typeof data.analysis?.area_sqft === 'number' &&
          data.analysis.area_sqft > 0 &&
          options?.mapCenter &&
          typeof options?.mapZoom === 'number'
        ) {
          const overlayEvt = new CustomEvent('ai-detection-overlay', {
            detail: {
              areaSqFt: data.analysis.area_sqft,
              roiNormalized: options?.roiNormalized,
              mapCenter: options.mapCenter,
              mapZoom: options.mapZoom,
              mapBounds: options?.mapBounds,
            },
          });
          window.dispatchEvent(overlayEvt);
        }
      } catch {}

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

    // Read and compress to max 1600px on the longest side
    const originalDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = originalDataUrl;
    });
    const maxDim = 1600;
    let targetW = img.width;
    let targetH = img.height;
    if (Math.max(img.width, img.height) > maxDim) {
      if (img.width >= img.height) {
        targetW = maxDim;
        targetH = Math.round((img.height / img.width) * maxDim);
      } else {
        targetH = maxDim;
        targetW = Math.round((img.width / img.height) * maxDim);
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, targetW, targetH);
    }
    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const meta = { width: targetW, height: targetH };

    setSelectedImage(compressedDataUrl);
    setLastImageMeta(meta);
    setLastSource('upload');
    await analyzeImage(compressedDataUrl, { source: 'upload', imageMeta: meta });
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
      setLastImageMeta({ width: 1600, height: 1200 });
      setLastSource('map_view');

      // Capture current map bounds to enable ROI rectangle overlay alignment
      let mapBounds: { north: number; south: number; east: number; west: number } | undefined = undefined;
      try {
        const bounds = map.getBounds?.();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          mapBounds = {
            north: ne.lat(),
            south: sw.lat(),
            east: ne.lng(),
            west: sw.lng(),
          };
        }
      } catch {}

      await analyzeImage(dataUrl, {
        source: 'map_view',
        imageMeta: { width: 1600, height: 1200 },
        mapCenter: { lat, lng },
        mapZoom: zoom,
        mapBounds,
      });
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
              disabled={isAnalyzing || !mapReady}
              className="h-24 flex flex-col gap-2"
              variant="outline"
            >
              <MapPin className="w-6 h-6" />
              <span>Analyze Current View</span>
              {!mapReady && (
                <span className="text-[10px] text-muted-foreground">Initializing map view…</span>
              )}
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
            <div className="border rounded-lg p-2" ref={containerRef}
              onMouseDown={(e) => {
                if (!containerRef.current) return;
                setIsSelecting(true);
                const rect = containerRef.current.getBoundingClientRect();
                const startX = e.clientX - rect.left;
                const startY = e.clientY - rect.top;
                setRoiRectPx({ x: startX, y: startY, w: 0, h: 0 });
              }}
              onMouseMove={(e) => {
                if (!isSelecting || !containerRef.current || !roiRectPx) return;
                const rect = containerRef.current.getBoundingClientRect();
                const curX = e.clientX - rect.left;
                const curY = e.clientY - rect.top;
                setRoiRectPx({ x: roiRectPx.x, y: roiRectPx.y, w: Math.max(0, curX - roiRectPx.x), h: Math.max(0, curY - roiRectPx.y) });
              }}
              onMouseUp={() => {
                setIsSelecting(false);
                if (!containerRef.current || !roiRectPx) return;
                const rect = containerRef.current.getBoundingClientRect();
                const nx = Math.max(0, Math.min(1, roiRectPx.x / rect.width));
                const ny = Math.max(0, Math.min(1, roiRectPx.y / rect.height));
                const nw = Math.max(0, Math.min(1, roiRectPx.w / rect.width));
                const nh = Math.max(0, Math.min(1, roiRectPx.h / rect.height));
                setRoi([nx, ny, nw, nh]);
                setRoiRectPx(null);
              }}
            >
              <div className="relative w-full h-48 overflow-hidden rounded select-none">
                <img 
                  src={selectedImage} 
                  alt="Selected for analysis" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {showBoxes && results?.detections?.length > 0 && results?.imageMeta && (
                  results.detections.map((d: any, i: number) => {
                    const [x, y, w, h] = d.bbox_normalized || [];
                    if ([x,y,w,h].some((v) => typeof v !== 'number')) return null;
                    return (
                      <div
                        key={i}
                        className="absolute border-2 border-cyan-400/90 bg-cyan-400/10"
                        style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
                        title={`${d.label || 'issue'} ${Math.round((d.confidence || 0)*100)}%`}
                      />
                    );
                  })
                )}
                {roiRectPx && (
                  <div className="absolute border-2 border-amber-400 bg-amber-300/10"
                    style={{ left: roiRectPx.x, top: roiRectPx.y, width: roiRectPx.w, height: roiRectPx.h }}
                  />
                )}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={showBoxes} onChange={(e) => setShowBoxes(e.target.checked)} />
                  Show detections
                </label>
                <Button size="sm" variant="outline" disabled={!selectedImage || isAnalyzing}
                  onClick={() => {
                    if (!selectedImage) return;
                    const imageMeta = results?.imageMeta || lastImageMeta || undefined;
                    analyzeImage(selectedImage, {
                      source: lastSource,
                      imageMeta,
                      roiNormalized: roi || undefined,
                    });
                  }}
                >Re-run on ROI</Button>
              </div>
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

          {!isAnalyzing && !results && !error && !mapReady && (
            <div className="text-xs text-muted-foreground">
              Initializing map view… please wait
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
                      const evt = new CustomEvent('ai-detection-estimate', { detail: { analysis: results } });
                      window.dispatchEvent(evt);
                      toast({ title: 'Opening Estimate', description: 'Prefilling items from AI analysis' });
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
