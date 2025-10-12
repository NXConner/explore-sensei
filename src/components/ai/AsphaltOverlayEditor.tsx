import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Edit3, 
  Move, 
  Square, 
  Circle, 
  Trash2, 
  Plus,
  Save,
  Undo,
  Redo,
  Ruler,
  Calculator
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  calculatePolygonArea, 
  pixelAreaToSqFt, 
  calculateTotalArea,
  getAreaStatistics,
  type Point 
} from '@/lib/asphaltCalculations';

interface AsphaltArea {
  id: string;
  coordinates: Array<{ x: number; y: number }>;
  area_sqft: number;
  condition: string;
}

interface AsphaltOverlayEditorProps {
  originalImage: string;
  asphaltAreas: AsphaltArea[];
  totalArea: number;
  onClose: () => void;
  onSave?: (areas: AsphaltArea[], totalArea: number) => void;
}

type EditMode = 'view' | 'edit' | 'add' | 'delete';
type ShapeType = 'polygon' | 'rectangle' | 'circle';

export const AsphaltOverlayEditor = ({ 
  originalImage, 
  asphaltAreas, 
  totalArea, 
  onClose,
  onSave 
}: AsphaltOverlayEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();
  
  const [showOverlay, setShowOverlay] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [shapeType, setShapeType] = useState<ShapeType>('polygon');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [editedAreas, setEditedAreas] = useState<AsphaltArea[]>(asphaltAreas);
  const [history, setHistory] = useState<AsphaltArea[][]>([asphaltAreas]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [showMeasurements, setShowMeasurements] = useState(true);

  // Color mapping for different conditions
  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
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

  // Use utility functions for area calculations
  const calculateArea = (coordinates: Point[]): number => {
    return pixelAreaToSqFt(calculatePolygonArea(coordinates));
  };

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showOverlay) return;

    // Draw asphalt areas
    editedAreas.forEach((area, index) => {
      const color = getConditionColor(area.condition);
      const isSelected = selectedArea === area.id;
      
      // Draw filled polygon with transparency
      ctx.fillStyle = isSelected ? `${color}40` : `${color}20`;
      ctx.strokeStyle = isSelected ? color : color;
      ctx.lineWidth = isSelected ? 4 : 3;
      
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

      // Draw corner handles for selected area
      if (isSelected && editMode === 'edit') {
        ctx.fillStyle = color;
        area.coordinates.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      // Draw area label
      if (showMeasurements) {
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
      }
    });

    // Draw current drawing path
    if (isDrawing && currentPath.length > 0) {
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      currentPath.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [imageLoaded, showOverlay, editedAreas, selectedArea, editMode, isDrawing, currentPath, showMeasurements]);

  useEffect(() => {
    if (imageLoaded) {
      drawOverlay();
    }
  }, [imageLoaded, drawOverlay]);

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (image) {
      setImageDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setImageLoaded(true);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode === 'view') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    if (editMode === 'add') {
      if (shapeType === 'polygon') {
        setCurrentPath([...currentPath, { x, y }]);
      } else if (shapeType === 'rectangle' && currentPath.length === 0) {
        setCurrentPath([{ x, y }]);
      }
    } else if (editMode === 'edit' && selectedArea) {
      // Find the closest point to the click
      const area = editedAreas.find(a => a.id === selectedArea);
      if (area) {
        let closestIndex = 0;
        let minDistance = Infinity;
        
        area.coordinates.forEach((point, index) => {
          const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });

        if (minDistance < 20) { // Within 20 pixels
          const newCoordinates = [...area.coordinates];
          newCoordinates[closestIndex] = { x, y };
          
          const newArea = {
            ...area,
            coordinates: newCoordinates,
            area_sqft: calculateArea(newCoordinates)
          };
          
          updateArea(newArea);
        }
      }
    }
  };

  const handleCanvasDoubleClick = () => {
    if (editMode === 'add' && currentPath.length >= 3) {
      finishDrawing();
    }
  };

  const finishDrawing = () => {
    if (currentPath.length < 3) return;

    const newArea: AsphaltArea = {
      id: `area_${Date.now()}`,
      coordinates: [...currentPath],
      area_sqft: calculateArea(currentPath),
      condition: 'Good'
    };

    addToHistory();
    setEditedAreas([...editedAreas, newArea]);
    setCurrentPath([]);
    setIsDrawing(false);
    setEditMode('view');
    
    toast({
      title: "Area Added",
      description: `New area added: ${newArea.area_sqft.toLocaleString()} ft²`
    });
  };

  const updateArea = (updatedArea: AsphaltArea) => {
    addToHistory();
    setEditedAreas(editedAreas.map(area => 
      area.id === updatedArea.id ? updatedArea : area
    ));
  };

  const deleteArea = (areaId: string) => {
    addToHistory();
    setEditedAreas(editedAreas.filter(area => area.id !== areaId));
    if (selectedArea === areaId) {
      setSelectedArea(null);
    }
    
    toast({
      title: "Area Deleted",
      description: "Asphalt area has been removed"
    });
  };

  const addToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...editedAreas]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditedAreas(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditedAreas(history[historyIndex + 1]);
    }
  };

  const saveChanges = () => {
    const newTotalArea = editedAreas.reduce((sum, area) => sum + area.area_sqft, 0);
    if (onSave) {
      onSave(editedAreas, newTotalArea);
    }
    
    toast({
      title: "Changes Saved",
      description: `Updated ${editedAreas.length} areas with total ${newTotalArea.toLocaleString()} ft²`
    });
  };

  const downloadOverlayImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `asphalt-analysis-edited-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetView = () => {
    setShowOverlay(true);
    setEditMode('view');
    setSelectedArea(null);
    setCurrentPath([]);
    setIsDrawing(false);
  };

  const currentTotalArea = calculateTotalArea(editedAreas);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">AI Asphalt Detection Editor</h3>
          <Badge variant="outline" className="text-xs">
            {editedAreas.length} areas detected
          </Badge>
          {editMode !== 'view' && (
            <Badge variant="secondary" className="text-xs">
              {editMode} mode
            </Badge>
          )}
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

      <Tabs value={editMode} onValueChange={(value) => setEditMode(value as EditMode)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="add">Add</TabsTrigger>
          <TabsTrigger value="delete">Delete</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMeasurements(!showMeasurements)}
            >
              <Ruler className="w-4 h-4 mr-2" />
              {showMeasurements ? 'Hide' : 'Show'} Measurements
            </Button>
            <div className="text-sm text-muted-foreground">
              Total Area: <span className="font-bold">{currentTotalArea.toLocaleString()} ft²</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Click on an area to select it, then drag the corner handles to adjust the shape.
          </div>
          {selectedArea && (
            <div className="p-3 bg-accent/20 rounded-lg">
              <div className="text-sm font-medium mb-2">Selected Area</div>
              <div className="text-xs text-muted-foreground">
                ID: {selectedArea} | Area: {editedAreas.find(a => a.id === selectedArea)?.area_sqft.toLocaleString()} ft²
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Shape Type:</div>
            <div className="flex gap-2">
              <Button
                variant={shapeType === 'polygon' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShapeType('polygon')}
              >
                <Square className="w-4 h-4 mr-2" />
                Polygon
              </Button>
              <Button
                variant={shapeType === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShapeType('rectangle')}
              >
                <Square className="w-4 h-4 mr-2" />
                Rectangle
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {shapeType === 'polygon' 
              ? 'Click to add points, double-click to finish'
              : 'Click and drag to create rectangle'
            }
          </div>
        </TabsContent>

        <TabsContent value="delete" className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Click on an area to delete it.
          </div>
        </TabsContent>
      </Tabs>

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
            className="absolute top-0 left-0 cursor-crosshair"
            style={{ 
              width: '100%', 
              height: 'auto',
              display: imageLoaded ? 'block' : 'none'
            }}
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
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
              {currentTotalArea.toLocaleString()} ft²
            </div>
            <div className="text-sm text-muted-foreground">
              {(currentTotalArea * 0.092903).toLocaleString()} m²
            </div>
            {editedAreas.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Avg: {(currentTotalArea / editedAreas.length).toLocaleString()} ft² per area
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detected Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {editedAreas.map((area, index) => (
                <div 
                  key={area.id} 
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedArea === area.id ? 'bg-primary/20' : 'bg-accent/20'
                  }`}
                  onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
                >
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={saveChanges}
            className="bg-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
        <p><strong>Manual Adjustment Features:</strong></p>
        <p>• <strong>View Mode:</strong> Browse detected areas with measurements</p>
        <p>• <strong>Edit Mode:</strong> Click areas to select, drag corner handles to adjust</p>
        <p>• <strong>Add Mode:</strong> Draw new areas with polygon or rectangle tools</p>
        <p>• <strong>Delete Mode:</strong> Click areas to remove them</p>
        <p>• <strong>Undo/Redo:</strong> Full history support for all changes</p>
        <p>• <strong>Real-time Calculations:</strong> Area measurements update automatically</p>
      </div>
    </div>
  );
};
