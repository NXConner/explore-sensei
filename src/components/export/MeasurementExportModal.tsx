import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileCode, FileImage } from "lucide-react";
import { useMapMeasurements } from "@/hooks/useMapMeasurements";
import { useToast } from "@/hooks/use-toast";

interface MeasurementExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeasurementExportModal = ({ isOpen, onClose }: MeasurementExportModalProps) => {
  const { measurements } = useMapMeasurements();
  const { toast } = useToast();

  const exportAsGeoJSON = () => {
    if (!measurements || measurements.length === 0) {
      toast({
        title: "No Data",
        description: "No measurements to export.",
        variant: "destructive",
      });
      return;
    }

    const geoJSON = {
      type: "FeatureCollection",
      features: measurements.map((m) => ({
        type: "Feature",
        properties: {
          type: m.type,
          value: m.value,
          unit: m.unit,
          created_at: m.created_at,
        },
        geometry: m.geojson,
      })),
    };

    const blob = new Blob([JSON.stringify(geoJSON, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "GeoJSON Exported",
      description: "Measurements exported as GeoJSON file.",
    });
  };

  const exportAsKML = () => {
    if (!measurements || measurements.length === 0) {
      toast({
        title: "No Data",
        description: "No measurements to export.",
        variant: "destructive",
      });
      return;
    }

    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Asphalt OS Measurements</name>
`;

    measurements.forEach((m, idx) => {
      if (m.geojson && m.geojson.coordinates) {
        const coords = m.geojson.coordinates;
        if (m.type === "distance" && Array.isArray(coords)) {
          const coordString = coords.map((c: number[]) => `${c[0]},${c[1]},0`).join(" ");
          kml += `    <Placemark>
      <name>Distance Measurement ${idx + 1}</name>
      <description>Distance: ${m.value.toFixed(2)}${m.unit}</description>
      <LineString>
        <coordinates>${coordString}</coordinates>
      </LineString>
    </Placemark>
`;
        } else if (m.type === "area") {
          kml += `    <Placemark>
      <name>Area Measurement ${idx + 1}</name>
      <description>Area: ${m.value.toFixed(2)}${m.unit}</description>
      <Point>
        <coordinates>${coords[0]},${coords[1]},0</coordinates>
      </Point>
    </Placemark>
`;
        }
      }
    });

    kml += `  </Document>
</kml>`;

    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements-${Date.now()}.kml`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "KML Exported",
      description: "Measurements exported as KML file for Google Earth.",
    });
  };

  const exportAsCSV = () => {
    if (!measurements || measurements.length === 0) {
      toast({
        title: "No Data",
        description: "No measurements to export.",
        variant: "destructive",
      });
      return;
    }

    let csv = "Type,Value,Unit,Created At\n";
    measurements.forEach((m) => {
      csv += `${m.type},${m.value},${m.unit},${m.created_at}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: "Measurements exported as CSV file.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Measurements
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Export your map measurements in various formats for use in other applications.
          </p>

          <div className="space-y-2">
            <Button onClick={exportAsGeoJSON} variant="outline" className="w-full justify-start">
              <FileJson className="w-4 h-4 mr-2" />
              Export as GeoJSON
              <span className="ml-auto text-xs text-muted-foreground">
                {measurements?.length || 0} items
              </span>
            </Button>

            <Button onClick={exportAsKML} variant="outline" className="w-full justify-start">
              <FileCode className="w-4 h-4 mr-2" />
              Export as KML (Google Earth)
              <span className="ml-auto text-xs text-muted-foreground">
                {measurements?.length || 0} items
              </span>
            </Button>

            <Button onClick={exportAsCSV} variant="outline" className="w-full justify-start">
              <FileImage className="w-4 h-4 mr-2" />
              Export as CSV
              <span className="ml-auto text-xs text-muted-foreground">
                {measurements?.length || 0} items
              </span>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
            <p>
              <strong>Format Details:</strong>
            </p>
            <p>
              • <strong>GeoJSON:</strong> Standard format for GIS applications
            </p>
            <p>
              • <strong>KML:</strong> Compatible with Google Earth and Maps
            </p>
            <p>
              • <strong>CSV:</strong> Simple spreadsheet format
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
