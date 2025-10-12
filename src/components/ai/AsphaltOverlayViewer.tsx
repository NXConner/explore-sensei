import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface AsphaltArea {
  id: string;
  coordinates: Array<{ x: number; y: number }>;
  area_sqft: number;
  condition: string;
}

interface AsphaltOverlayViewerProps {
  originalImage: string;
  asphaltAreas: AsphaltArea[];
  totalArea: number;
  onClose: () => void;
}

export const AsphaltOverlayViewer = ({ 
  originalImage, 
  asphaltAreas, 
  totalArea, 
  onClose 
}: AsphaltOverlayViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Color mapping for different conditions
  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return '#10b981'; // green
      case 'good': return '#3b82f6'; // blue
      case 'fair': return '#f59e0b'; // yellow
      case 'poor': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getConditionBadgeVariant = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'secondary';
    }
  };

  const drawOverlay = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showOverlay) return;

    // Draw asphalt areas
    asphaltAreas.forEach((area, index) => {
      const color = getConditionColor(area.condition);
      
      // Draw filled polygon with transparency
      ctx.fillStyle = `${color}20`; // 20% opacity
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      area.coordinates.forEach((point, pointIndex) => {
        if (pointIndex === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw area label
      const centerX = area.coordinates.reduce((sum, point) => sum + point.x, 0) / area.coordinates.length;
      const centerY = area.coordinates.reduce((sum, point) => sum + point.y, 0) / area.coordinates.length;
      
      // Background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(centerX - 60, centerY - 20, 120, 40);
      
      // Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${area.area_sqft.toLocaleString()} ft²`, centerX, centerY - 5);
      ctx.font = '12px Arial';
      ctx.fillText(area.condition, centerX, centerY + 10);
    });
  };

  useEffect(() => {
    if (imageLoaded) {
      drawOverlay();
    }
  }, [imageLoaded, showOverlay, asphaltAreas]);

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (image) {
      setImageDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setImageLoaded(true);
    }
  };

  const downloadOverlayImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `asphalt-analysis-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetView = () => {
    setShowOverlay(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">AI Asphalt Detection Results</h3>
          <Badge variant="outline" className="text-xs">
            {asphaltAreas.length} areas detected
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOverlay(!showOverlay)}
          >
            {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showOverlay ? 'Hide' : 'Show'} Overlay
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadOverlayImage}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="relative border rounded-lg overflow-hidden bg-background">
        <div className="relative">
          <img
            ref={imageRef}
            src={originalImage}
            alt="Asphalt analysis"
            className="max-w-full h-auto"
            onLoad={handleImageLoad}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
          <canvas
            ref={canvasRef}
            width={imageDimensions.width}
            height={imageDimensions.height}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ 
              width: '100%', 
              height: 'auto',
              display: imageLoaded ? 'block' : 'none'
            }}
          />
          {!imageLoaded && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading image...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Asphalt Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalArea.toLocaleString()} ft²
            </div>
            <div className="text-sm text-muted-foreground">
              {(totalArea * 0.092903).toLocaleString()} m²
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detected Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {asphaltAreas.map((area, index) => (
                <div key={area.id} className="flex items-center justify-between p-2 bg-accent/20 rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getConditionColor(area.condition) }}
                    />
                    <span className="text-sm font-medium">Area {index + 1}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{area.area_sqft.toLocaleString()} ft²</div>
                    <Badge variant={getConditionBadgeVariant(area.condition)} className="text-xs">
                      {area.condition}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
        <p><strong>Visual Overlay Features:</strong></p>
        <p>• Green: Excellent condition areas</p>
        <p>• Blue: Good condition areas</p>
        <p>• Yellow: Fair condition areas</p>
        <p>• Red: Poor condition areas</p>
        <p>• Area measurements displayed on each detected region</p>
      </div>
    </div>
  );
};
