import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Car, 
  Bus, 
  Accessibility as Wheelchair,
  ArrowRight, 
  ArrowDown, 
  RotateCcw, 
  Save, 
  Download,
  Plus,
  Minus,
  Grid,
  Church
} from 'lucide-react';

interface ParkingSpace {
  id: string;
  type: 'standard' | 'handicap' | 'bus' | 'van' | 'compact';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  occupied: boolean;
}

interface ParkingLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  spaces: ParkingSpace[];
  aisles: number;
  aisleWidth: number;
  totalSpaces: number;
  handicapSpaces: number;
  busSpaces: number;
}

const spaceTypes = {
  standard: { label: 'Standard', color: 'bg-blue-500', icon: <Car className="h-4 w-4" />, width: 9, height: 18 },
  handicap: { label: 'Handicap', color: 'bg-green-500', icon: <Wheelchair className="h-4 w-4" />, width: 9, height: 18 },
  bus: { label: 'Bus', color: 'bg-red-500', icon: <Bus className="h-4 w-4" />, width: 12, height: 40 },
  van: { label: 'Van', color: 'bg-purple-500', icon: <Bus className="h-4 w-4" />, width: 10, height: 20 },
  compact: { label: 'Compact', color: 'bg-yellow-500', icon: <Car className="h-4 w-4" />, width: 8, height: 16 }
};

export const ParkingLayoutDesigner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layout, setLayout] = useState<ParkingLayout>({
    id: 'new-layout',
    name: 'Church Parking Layout',
    width: 200,
    height: 300,
    spaces: [],
    aisles: 2,
    aisleWidth: 24,
    totalSpaces: 0,
    handicapSpaces: 0,
    busSpaces: 0
  });
  
  const [selectedTool, setSelectedTool] = useState<'select' | 'add' | 'delete'>('select');
  const [selectedSpaceType, setSelectedSpaceType] = useState<keyof typeof spaceTypes>('standard');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    drawLayout();
  }, [layout, scale]);

  const drawLayout = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw parking lot outline
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, layout.width * scale, layout.height * scale);

    // Draw aisles
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    const aisleSpacing = layout.width / (layout.aisles + 1);
    for (let i = 1; i <= layout.aisles; i++) {
      const x = 50 + aisleSpacing * i * scale;
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x, 50 + layout.height * scale);
      ctx.stroke();
    }

    // Draw parking spaces
    layout.spaces.forEach((space) => {
      const spaceType = spaceTypes[space.type];
      const x = 50 + space.x * scale;
      const y = 50 + space.y * scale;
      const width = space.width * scale;
      const height = space.height * scale;

      // Draw space background
      ctx.fillStyle = space.occupied ? '#EF4444' : spaceType.color.replace('bg-', '').replace('-500', '');
      ctx.fillRect(x, y, width, height);

      // Draw space border
      ctx.strokeStyle = selectedSpace === space.id ? '#3B82F6' : '#374151';
      ctx.lineWidth = selectedSpace === space.id ? 3 : 1;
      ctx.strokeRect(x, y, width, height);

      // Draw space icon
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(spaceType.label.charAt(0), x + width/2, y + height/2 + 4);
    });

    // Draw grid
    if (scale > 0.5) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 0.5;
      const gridSize = 10 * scale;
      
      for (let x = 50; x <= 50 + layout.width * scale; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 50);
        ctx.lineTo(x, 50 + layout.height * scale);
        ctx.stroke();
      }
      
      for (let y = 50; y <= 50 + layout.height * scale; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(50 + layout.width * scale, y);
        ctx.stroke();
      }
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - 50) / scale;
    const y = (event.clientY - rect.top - 50) / scale;

    if (selectedTool === 'add') {
      const newSpace: ParkingSpace = {
        id: `space-${Date.now()}`,
        type: selectedSpaceType,
        x: Math.round(x / 10) * 10,
        y: Math.round(y / 10) * 10,
        width: spaceTypes[selectedSpaceType].width,
        height: spaceTypes[selectedSpaceType].height,
        angle: 0,
        occupied: false
      };

      setLayout(prev => ({
        ...prev,
        spaces: [...prev.spaces, newSpace],
        totalSpaces: prev.totalSpaces + 1,
        handicapSpaces: selectedSpaceType === 'handicap' ? prev.handicapSpaces + 1 : prev.handicapSpaces,
        busSpaces: selectedSpaceType === 'bus' ? prev.busSpaces + 1 : prev.busSpaces
      }));
    } else if (selectedTool === 'select') {
      // Find clicked space
      const clickedSpace = layout.spaces.find(space => 
        x >= space.x && x <= space.x + space.width &&
        y >= space.y && y <= space.y + space.height
      );
      
      setSelectedSpace(clickedSpace?.id || null);
    }
  };

  const handleDeleteSpace = (spaceId: string) => {
    const space = layout.spaces.find(s => s.id === spaceId);
    if (!space) return;

    setLayout(prev => ({
      ...prev,
      spaces: prev.spaces.filter(s => s.id !== spaceId),
      totalSpaces: prev.totalSpaces - 1,
      handicapSpaces: space.type === 'handicap' ? prev.handicapSpaces - 1 : prev.handicapSpaces,
      busSpaces: space.type === 'bus' ? prev.busSpaces - 1 : prev.busSpaces
    }));
    setSelectedSpace(null);
  };

  const handleToggleOccupied = (spaceId: string) => {
    setLayout(prev => ({
      ...prev,
      spaces: prev.spaces.map(space => 
        space.id === spaceId ? { ...space, occupied: !space.occupied } : space
      )
    }));
  };

  const handleSaveLayout = () => {
    const layoutData = {
      ...layout,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to localStorage (in real app, save to database)
    const savedLayouts = JSON.parse(localStorage.getItem('parking_layouts') || '[]');
    savedLayouts.push(layoutData);
    localStorage.setItem('parking_layouts', JSON.stringify(savedLayouts));
    
    alert('Layout saved successfully!');
  };

  const handleExportLayout = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `church-parking-layout-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Church className="h-5 w-5" />
            Church Parking Layout Designer
          </h3>
          <p className="text-sm text-muted-foreground">
            Design and optimize your church parking lot layout
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveLayout} className="gap-2">
            <Save className="h-4 w-4" />
            Save Layout
          </Button>
          <Button variant="outline" onClick={handleExportLayout} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Design Tools */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Design Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tool</Label>
                <Select value={selectedTool} onValueChange={(value: any) => setSelectedTool(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="add">Add Space</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTool === 'add' && (
                <div className="space-y-2">
                  <Label>Space Type</Label>
                  <Select value={selectedSpaceType} onValueChange={(value: any) => setSelectedSpaceType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(spaceTypes).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${type.color} text-white`}>
                              {type.icon}
                            </div>
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Zoom: {Math.round(scale * 100)}%</Label>
                <Slider
                  value={[scale]}
                  onValueChange={(value) => setScale(value[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Layout Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Spaces:</span>
                <Badge variant="secondary">{layout.totalSpaces}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Handicap Spaces:</span>
                <Badge variant="secondary">{layout.handicapSpaces}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Bus Spaces:</span>
                <Badge variant="secondary">{layout.busSpaces}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Occupied:</span>
                <Badge variant="destructive">
                  {layout.spaces.filter(s => s.occupied).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Available:</span>
                <Badge variant="default">
                  {layout.spaces.filter(s => !s.occupied).length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parking Layout Canvas</CardTitle>
              <CardDescription>
                Click to add spaces, select to modify, or use the tools panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto">
                <canvas
                  ref={canvasRef}
                  className="cursor-crosshair"
                  onClick={handleCanvasClick}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Space Details */}
      {selectedSpace && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Space Details</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const space = layout.spaces.find(s => s.id === selectedSpace);
              if (!space) return null;
              
              const spaceType = spaceTypes[space.type];
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${spaceType.color} text-white`}>
                      {spaceType.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{spaceType.label} Space</h4>
                      <p className="text-sm text-muted-foreground">
                        Position: ({space.x}, {space.y}) | Size: {space.width}' × {space.height}'
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="occupied"
                        checked={space.occupied}
                        onCheckedChange={() => handleToggleOccupied(space.id)}
                      />
                      <Label htmlFor="occupied">Occupied</Label>
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSpace(space.id)}
                    >
                      Delete Space
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
