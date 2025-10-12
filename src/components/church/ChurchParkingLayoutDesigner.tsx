import React, { useState, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Car, 
  Users, 
  Accessibility, 
  ArrowRight, 
  RotateCcw, 
  Save, 
  Download,
  Upload,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParkingSpace {
  id: string;
  x: number;
  z: number;
  width: number;
  length: number;
  angle: number;
  type: 'standard' | 'handicap' | 'visitor' | 'staff' | 'emergency';
  occupied: boolean;
}

interface ParkingLayout {
  id: string;
  name: string;
  description: string;
  width: number;
  length: number;
  spaces: ParkingSpace[];
  aisles: Array<{
    id: string;
    x: number;
    z: number;
    width: number;
    length: number;
    angle: number;
  }>;
  entrances: Array<{
    id: string;
    x: number;
    z: number;
    width: number;
    angle: number;
  }>;
  exits: Array<{
    id: string;
    x: number;
    z: number;
    width: number;
    angle: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface ChurchParkingLayoutDesignerProps {
  onSave?: (layout: ParkingLayout) => void;
  onLoad?: (layout: ParkingLayout) => void;
  initialLayout?: ParkingLayout;
}

const SPACE_TYPES = {
  standard: { color: '#3b82f6', label: 'Standard', icon: Car },
  handicap: { color: '#ef4444', label: 'Handicap', icon: Accessibility },
  visitor: { color: '#10b981', label: 'Visitor', icon: Users },
  staff: { color: '#f59e0b', label: 'Staff', icon: Settings },
  emergency: { color: '#8b5cf6', label: 'Emergency', icon: AlertTriangle }
};

const SPACE_DIMENSIONS = {
  standard: { width: 9, length: 18 },
  handicap: { width: 9, length: 18 },
  visitor: { width: 9, length: 18 },
  staff: { width: 9, length: 18 },
  emergency: { width: 12, length: 20 }
};

export const ChurchParkingLayoutDesigner: React.FC<ChurchParkingLayoutDesignerProps> = ({
  onSave,
  onLoad,
  initialLayout
}) => {
  const [layout, setLayout] = useState<ParkingLayout>(
    initialLayout || {
      id: '',
      name: 'New Church Parking Layout',
      description: '',
      width: 200,
      length: 300,
      spaces: [],
      aisles: [],
      entrances: [],
      exits: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );

  const [selectedTool, setSelectedTool] = useState<'select' | 'add_space' | 'add_aisle' | 'add_entrance' | 'add_exit'>('select');
  const [selectedSpaceType, setSelectedSpaceType] = useState<ParkingSpace['type']>('standard');
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; z: number } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showStatistics, setShowStatistics] = useState(true);

  const { toast } = useToast();

  // Calculate layout statistics
  const statistics = {
    totalSpaces: layout.spaces.length,
    standardSpaces: layout.spaces.filter(s => s.type === 'standard').length,
    handicapSpaces: layout.spaces.filter(s => s.type === 'handicap').length,
    visitorSpaces: layout.spaces.filter(s => s.type === 'visitor').length,
    staffSpaces: layout.spaces.filter(s => s.type === 'staff').length,
    emergencySpaces: layout.spaces.filter(s => s.type === 'emergency').length,
    totalArea: layout.width * layout.length,
    parkingArea: layout.spaces.reduce((sum, space) => sum + (space.width * space.length), 0),
    efficiency: layout.spaces.length > 0 ? (layout.spaces.reduce((sum, space) => sum + (space.width * space.length), 0) / (layout.width * layout.length)) * 100 : 0,
    handicapCompliance: layout.spaces.length > 0 ? (layout.spaces.filter(s => s.type === 'handicap').length / layout.spaces.length) * 100 : 0
  };

  // Add new parking space
  const addParkingSpace = useCallback((x: number, z: number) => {
    const dimensions = SPACE_DIMENSIONS[selectedSpaceType];
    const newSpace: ParkingSpace = {
      id: `space_${Date.now()}`,
      x: snapToGrid ? Math.round(x / gridSize) * gridSize : x,
      z: snapToGrid ? Math.round(z / gridSize) * gridSize : z,
      width: dimensions.width,
      length: dimensions.length,
      angle: 0,
      type: selectedSpaceType,
      occupied: false
    };

    setLayout(prev => ({
      ...prev,
      spaces: [...prev.spaces, newSpace],
      updatedAt: new Date()
    }));

    toast({
      title: 'Parking Space Added',
      description: `Added ${SPACE_TYPES[selectedSpaceType].label} parking space`
    });
  }, [selectedSpaceType, snapToGrid, gridSize, toast]);

  // Update parking space
  const updateParkingSpace = useCallback((id: string, updates: Partial<ParkingSpace>) => {
    setLayout(prev => ({
      ...prev,
      spaces: prev.spaces.map(space => 
        space.id === id ? { ...space, ...updates } : space
      ),
      updatedAt: new Date()
    }));
  }, []);

  // Delete parking space
  const deleteParkingSpace = useCallback((id: string) => {
    setLayout(prev => ({
      ...prev,
      spaces: prev.spaces.filter(space => space.id !== id),
      updatedAt: new Date()
    }));

    if (selectedSpace?.id === id) {
      setSelectedSpace(null);
    }

    toast({
      title: 'Parking Space Removed',
      description: 'Parking space has been deleted'
    });
  }, [selectedSpace, toast]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: any) => {
    if (selectedTool === 'add_space') {
      const rect = event.target.getBoundingClientRect();
      const x = (event.clientX - rect.left) - (layout.width / 2);
      const z = (event.clientY - rect.top) - (layout.length / 2);
      addParkingSpace(x, z);
    }
  }, [selectedTool, addParkingSpace, layout.width, layout.length]);

  // Save layout
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(layout);
    }
    
    toast({
      title: 'Layout Saved',
      description: 'Parking layout has been saved successfully'
    });
  }, [layout, onSave, toast]);

  // Load layout
  const handleLoad = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedLayout = JSON.parse(e.target?.result as string);
        setLayout(loadedLayout);
        if (onLoad) {
          onLoad(loadedLayout);
        }
        toast({
          title: 'Layout Loaded',
          description: 'Parking layout has been loaded successfully'
        });
      } catch (error) {
        toast({
          title: 'Load Failed',
          description: 'Failed to load parking layout',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  }, [onLoad, toast]);

  // Export layout
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(layout, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `church-parking-layout-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: 'Layout Exported',
      description: 'Parking layout has been exported successfully'
    });
  }, [layout, toast]);

  // Reset layout
  const handleReset = useCallback(() => {
    setLayout(prev => ({
      ...prev,
      spaces: [],
      aisles: [],
      entrances: [],
      exits: [],
      updatedAt: new Date()
    }));
    setSelectedSpace(null);
    
    toast({
      title: 'Layout Reset',
      description: 'Parking layout has been reset'
    });
  }, [toast]);

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Church Parking Layout Designer</h1>
          <p className="text-muted-foreground">Design optimal parking layouts for church facilities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Layout
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/50 p-4 space-y-6 overflow-y-auto">
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-4">
              {/* Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedTool === 'select' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('select')}
                    >
                      Select
                    </Button>
                    <Button
                      variant={selectedTool === 'add_space' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('add_space')}
                    >
                      Add Space
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Space Types */}
              {selectedTool === 'add_space' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Space Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(SPACE_TYPES).map(([type, config]) => (
                      <Button
                        key={type}
                        variant={selectedSpaceType === type ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setSelectedSpaceType(type as ParkingSpace['type'])}
                      >
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: config.color }}
                        />
                        {config.label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Layout Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Layout Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Layout Width (ft)</Label>
                    <Input
                      type="number"
                      value={layout.width}
                      onChange={(e) => setLayout(prev => ({ ...prev, width: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Layout Length (ft)</Label>
                    <Input
                      type="number"
                      value={layout.length}
                      onChange={(e) => setLayout(prev => ({ ...prev, length: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grid Size (ft)</Label>
                    <Slider
                      value={[gridSize]}
                      onValueChange={([value]) => setGridSize(value)}
                      min={1}
                      max={20}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">{gridSize} ft</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="snapToGrid"
                      checked={snapToGrid}
                      onChange={(e) => setSnapToGrid(e.target.checked)}
                    />
                    <Label htmlFor="snapToGrid">Snap to Grid</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showGrid"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                    />
                    <Label htmlFor="showGrid">Show Grid</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showMeasurements"
                      checked={showMeasurements}
                      onChange={(e) => setShowMeasurements(e.target.checked)}
                    />
                    <Label htmlFor="showMeasurements">Show Measurements</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Space Properties */}
              {selectedSpace && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Space Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={selectedSpace.type}
                        onValueChange={(value) => updateParkingSpace(selectedSpace.id, { type: value as ParkingSpace['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SPACE_TYPES).map(([type, config]) => (
                            <SelectItem key={type} value={type}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Width (ft)</Label>
                      <Input
                        type="number"
                        value={selectedSpace.width}
                        onChange={(e) => updateParkingSpace(selectedSpace.id, { width: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Length (ft)</Label>
                      <Input
                        type="number"
                        value={selectedSpace.length}
                        onChange={(e) => updateParkingSpace(selectedSpace.id, { length: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Angle (degrees)</Label>
                      <Input
                        type="number"
                        value={selectedSpace.angle}
                        onChange={(e) => updateParkingSpace(selectedSpace.id, { angle: Number(e.target.value) })}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteParkingSpace(selectedSpace.id)}
                    >
                      Delete Space
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Layout Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{statistics.totalSpaces}</div>
                      <div className="text-sm text-muted-foreground">Total Spaces</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{statistics.efficiency.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Efficiency</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Standard</span>
                      <Badge variant="outline">{statistics.standardSpaces}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Handicap</span>
                      <Badge variant="outline">{statistics.handicapSpaces}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Visitor</span>
                      <Badge variant="outline">{statistics.visitorSpaces}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Staff</span>
                      <Badge variant="outline">{statistics.staffSpaces}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Emergency</span>
                      <Badge variant="outline">{statistics.emergencySpaces}</Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Area</span>
                      <span className="text-sm font-medium">{statistics.totalArea.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Parking Area</span>
                      <span className="text-sm font-medium">{statistics.parkingArea.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Handicap Compliance</span>
                      <span className="text-sm font-medium">{statistics.handicapCompliance.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Compliance Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {statistics.handicapCompliance < 2 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Add more handicap spaces (minimum 2% required)</span>
                    </div>
                  )}
                  {statistics.handicapCompliance >= 2 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Handicap compliance met</span>
                    </div>
                  )}
                  {statistics.efficiency < 60 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Consider optimizing space layout for better efficiency</span>
                    </div>
                  )}
                  {statistics.efficiency >= 60 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Good space efficiency</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [0, 100, 0], fov: 60 }}
            onClick={handleCanvasClick}
            className="w-full h-full"
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {/* Grid */}
            {showGrid && (
              <GridLines
                width={layout.width}
                length={layout.length}
                gridSize={gridSize}
              />
            )}
            
            {/* Parking Spaces */}
            {layout.spaces.map((space) => (
              <ParkingSpace3D
                key={space.id}
                space={space}
                isSelected={selectedSpace?.id === space.id}
                onClick={() => setSelectedSpace(space)}
                onUpdate={(updates) => updateParkingSpace(space.id, updates)}
              />
            ))}
            
            {/* Layout Boundary */}
            <Plane
              args={[layout.width, layout.length]}
              position={[0, 0, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshBasicMaterial color="#f0f0f0" transparent opacity={0.3} />
            </Plane>
            
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

// Grid Lines Component
const GridLines: React.FC<{ width: number; length: number; gridSize: number }> = ({ width, length, gridSize }) => {
  const lines = [];
  
  // Vertical lines
  for (let x = -width / 2; x <= width / 2; x += gridSize) {
    lines.push(
      <line key={`v-${x}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([x, 0, -length / 2, x, 0, length / 2])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#cccccc" />
      </line>
    );
  }
  
  // Horizontal lines
  for (let z = -length / 2; z <= length / 2; z += gridSize) {
    lines.push(
      <line key={`h-${z}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-width / 2, 0, z, width / 2, 0, z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#cccccc" />
      </line>
    );
  }
  
  return <group>{lines}</group>;
};

// Parking Space 3D Component
const ParkingSpace3D: React.FC<{
  space: ParkingSpace;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: (updates: Partial<ParkingSpace>) => void;
}> = ({ space, isSelected, onClick, onUpdate }) => {
  const config = SPACE_TYPES[space.type];
  const Icon = config.icon;
  
  return (
    <group
      position={[space.x, 0, space.z]}
      rotation={[0, (space.angle * Math.PI) / 180, 0]}
      onClick={onClick}
    >
      <Box args={[space.width, 0.1, space.length]}>
        <meshBasicMaterial 
          color={isSelected ? '#ffff00' : config.color} 
          transparent 
          opacity={0.7}
        />
      </Box>
      
      {/* Space label */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={2}
        color={isSelected ? '#000000' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
      >
        {config.label}
      </Text>
      
      {/* Space icon */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={isSelected ? '#000000' : '#ffffff'} />
      </mesh>
    </group>
  );
};

export default ChurchParkingLayoutDesigner;
