import React from 'react';
import { Route, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface QuickRouteConverterProps {
  polylineCoordinates: google.maps.LatLng[];
  onConvert: (waypoints: { lat: number; lng: number }[]) => void;
}

export const QuickRouteConverter: React.FC<QuickRouteConverterProps> = ({
  polylineCoordinates,
  onConvert
}) => {
  if (polylineCoordinates.length < 2) return null;

  const handleConvert = () => {
    const waypoints = polylineCoordinates.map(coord => ({
      lat: coord.lat(),
      lng: coord.lng()
    }));
    
    toast.success(`Converting ${waypoints.length} points to route`);
    onConvert(waypoints);
  };

  return (
    <Card className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] tactical-panel animate-bounce-in">
      <CardContent className="p-4 flex items-center gap-3">
        <Route className="icon-lg text-primary" />
        <div>
          <p className="text-sm font-semibold">Polyline Detected</p>
          <p className="text-xs text-muted-foreground">{polylineCoordinates.length} waypoints</p>
        </div>
        <ArrowRight className="icon-md text-muted-foreground" />
        <Button onClick={handleConvert} size="sm">
          Convert to Route
        </Button>
      </CardContent>
    </Card>
  );
};
