import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, SkipBack, SkipForward, Calendar, Maximize2, Gauge, MapPin, Clock, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployeeTracking, EmployeeLocation } from "@/hooks/useEmployeeTracking";
import { format } from "date-fns";

interface EODPlaybackModalProps {
  onClose: () => void;
}

export const EODPlaybackModal = ({ onClose }: EODPlaybackModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const pathLineRef = useRef<google.maps.Polyline | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { locations, summaries, isLoading } = useEmployeeTracking(selectedDate);
  
  // Filter locations by selected employee
  const filteredLocations = selectedEmployee === "all" 
    ? locations 
    : locations.filter(loc => loc.employee_id === selectedEmployee);
  
  // Sort locations chronologically
  const sortedLocations = [...filteredLocations].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Get unique employees
  const employees = Array.from(
    new Map(locations.map(loc => [
      loc.employee_id,
      { 
        id: loc.employee_id, 
        name: `${loc.employees?.first_name || ''} ${loc.employees?.last_name || ''}`.trim() 
      }
    ])).values()
  );

  // Initialize map
  useEffect(() => {
    if (!mapDivRef.current || !window.google) return;

    const map = new google.maps.Map(mapDivRef.current, {
      center: { lat: 36.5, lng: -80.5 },
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      ],
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      if (pathLineRef.current) pathLineRef.current.setMap(null);
    };
  }, []);

  // Update map with current playback position
  useEffect(() => {
    if (!mapRef.current || sortedLocations.length === 0) return;

    // Clear existing markers and paths
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (pathLineRef.current) {
      pathLineRef.current.setMap(null);
    }

    // Get locations up to current playback time
    const currentLocations = sortedLocations.slice(0, playbackTime + 1);
    if (currentLocations.length === 0) return;

    // Create path
    const pathCoords = currentLocations.map(loc => ({
      lat: Number(loc.latitude),
      lng: Number(loc.longitude),
    }));

    pathLineRef.current = new google.maps.Polyline({
      path: pathCoords,
      geodesic: true,
      strokeColor: "#00ffff",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: mapRef.current,
    });

    // Group locations by employee
    const employeeGroups = new Map<string, EmployeeLocation[]>();
    currentLocations.forEach(loc => {
      if (!employeeGroups.has(loc.employee_id)) {
        employeeGroups.set(loc.employee_id, []);
      }
      employeeGroups.get(loc.employee_id)!.push(loc);
    });

    // Create marker for each employee's current position
    employeeGroups.forEach((locs, empId) => {
      const latestLoc = locs[locs.length - 1];
      const empName = `${latestLoc.employees?.first_name || ''} ${latestLoc.employees?.last_name || ''}`.trim();

      const marker = new google.maps.Marker({
        position: { lat: Number(latestLoc.latitude), lng: Number(latestLoc.longitude) },
        map: mapRef.current!,
        title: empName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#00ffff",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        label: {
          text: empName.split(' ').map(n => n[0]).join(''),
          color: "#000000",
          fontSize: "10px",
          fontWeight: "bold",
        },
      });

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #000; padding: 8px;">
            <strong>${empName}</strong><br/>
            <small>${format(new Date(latestLoc.timestamp), 'HH:mm:ss')}</small><br/>
            ${latestLoc.speed ? `Speed: ${latestLoc.speed.toFixed(1)} km/h<br/>` : ''}
            ${latestLoc.activity_type ? `Activity: ${latestLoc.activity_type}<br/>` : ''}
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapRef.current!, marker);
      });

      markersRef.current.push(marker);
    });

    // Center map on current location
    const currentLoc = currentLocations[currentLocations.length - 1];
    mapRef.current.setCenter({
      lat: Number(currentLoc.latitude),
      lng: Number(currentLoc.longitude),
    });

  }, [playbackTime, sortedLocations]);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) * playbackSpeed;
      lastTime = now;

      if (playbackTime < sortedLocations.length - 1) {
        // Advance playback based on speed and time delta
        const framesPerSecond = 60;
        const advanceAmount = (delta / 1000) * framesPerSecond;
        setPlaybackTime(prev => Math.min(prev + advanceAmount, sortedLocations.length - 1));
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, sortedLocations.length, playbackTime]);

  const handleSkipBack = () => {
    setPlaybackTime(Math.max(0, playbackTime - 10));
  };

  const handleSkipForward = () => {
    setPlaybackTime(Math.min(sortedLocations.length - 1, playbackTime + 10));
  };

  const currentLocation = sortedLocations[Math.floor(playbackTime)];
  const currentSummary = summaries.find(s => s.employee_id === selectedEmployee);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="tactical-panel w-full max-w-[95vw] h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">END-OF-DAY PLAYBACK</h2>
            <Badge variant="outline">
              {format(selectedDate, "MMMM dd, yyyy")}
            </Badge>
            {!isLoading && sortedLocations.length > 0 && (
              <Badge className="bg-green-500/20 text-green-400">
                {sortedLocations.length} locations
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Map Area */}
          <div className="flex-1 relative">
            <div ref={mapDivRef} className="absolute inset-0" />
            
            {/* Stats Overlay */}
            <div className="absolute top-4 left-4 space-y-2">
              <Card className="hud-element border-primary/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Employee Filter</span>
                </div>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>

              {currentSummary && (
                <Card className="hud-element border-primary/30 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Distance: {currentSummary.total_distance_km?.toFixed(2)} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Time: {Math.floor((currentSummary.total_time_minutes || 0) / 60)}h {(currentSummary.total_time_minutes || 0) % 60}m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Points: {currentSummary.locations_count}</span>
                  </div>
                </Card>
              )}
            </div>

            {/* Current Time Overlay */}
            {currentLocation && (
              <div className="absolute top-4 right-4">
                <Card className="hud-element border-primary/30 p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {format(new Date(currentLocation.timestamp), 'HH:mm:ss')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {currentLocation.employees?.first_name} {currentLocation.employees?.last_name}
                    </div>
                    {currentLocation.speed && (
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                        <Gauge className="w-3 h-3" />
                        {currentLocation.speed.toFixed(1)} km/h
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Activity Timeline Sidebar */}
          <div className="w-80 border-l border-primary/30 flex flex-col">
            <div className="p-4 border-b border-primary/30">
              <h3 className="font-bold text-sm">LOCATION TIMELINE</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {sortedLocations.map((location, idx) => (
                  <div
                    key={location.id}
                    className={`tactical-panel p-3 transition-all cursor-pointer ${
                      Math.floor(playbackTime) === idx ? "border-primary" : "opacity-50"
                    }`}
                    onClick={() => setPlaybackTime(idx)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-primary">
                            {format(new Date(location.timestamp), 'HH:mm:ss')}
                          </span>
                          {location.activity_type && (
                            <Badge variant="outline" className="text-xs">
                              {location.activity_type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {location.employees?.first_name} {location.employees?.last_name}
                        </p>
                        <p className="text-xs font-mono mt-1">
                          {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {sortedLocations.length === 0 && !isLoading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No location data for this date</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="p-4 space-y-4 border-t border-primary/30">
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSkipBack}
                disabled={playbackTime === 0}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className="h-12 w-12"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={sortedLocations.length === 0}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSkipForward}
                disabled={playbackTime >= sortedLocations.length - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <Select 
                value={playbackSpeed.toString()} 
                onValueChange={(v) => setPlaybackSpeed(parseFloat(v))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="4">4x</SelectItem>
                  <SelectItem value="8">8x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {sortedLocations.length > 0 
                  ? format(new Date(sortedLocations[0].timestamp), 'HH:mm')
                  : '00:00'}
              </span>
              <span className="text-primary font-medium">
                {currentLocation 
                  ? format(new Date(currentLocation.timestamp), 'HH:mm:ss')
                  : '--:--:--'}
              </span>
              <span>
                {sortedLocations.length > 0 
                  ? format(new Date(sortedLocations[sortedLocations.length - 1].timestamp), 'HH:mm')
                  : '00:00'}
              </span>
            </div>
            <Slider
              value={[playbackTime]}
              onValueChange={([val]) => setPlaybackTime(val)}
              min={0}
              max={Math.max(0, sortedLocations.length - 1)}
              step={1}
              disabled={sortedLocations.length === 0}
            />
            <div className="text-xs text-center text-muted-foreground">
              Position {Math.floor(playbackTime) + 1} of {sortedLocations.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
