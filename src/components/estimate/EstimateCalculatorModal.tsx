import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BackToMapButton } from "@/components/common/BackToMapButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Download, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEstimates } from "@/hooks/useEstimates";
import { useToast } from "@/hooks/use-toast";
import { exportEstimateToPDF } from "@/lib/pdfExport";
import { autoPopulateEstimate } from "@/lib/estimateLogic";
import { useMapMeasurements } from "@/hooks/useMapMeasurements";
import { logger } from "@/lib/monitoring";

interface EstimateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EstimateLineItem {
  item_id?: string;
  name: string;
  code?: string;
  unit: string;
  unit_cost: number;
  quantity: number;
  total: number;
  description?: string;
}

export const EstimateCalculatorModal = ({ isOpen, onClose }: EstimateCalculatorModalProps) => {
  const { toast } = useToast();
  const { createEstimateAsync } = useEstimates();
  const [selectedCatalog, setSelectedCatalog] = useState<string>("");
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [quantity, setQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [jobSiteAddress, setJobSiteAddress] = useState("");
  const [savedEstimateId, setSavedEstimateId] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(8.0);
  const [overheadPct, setOverheadPct] = useState<number>(12);
  const [profitPct, setProfitPct] = useState<number>(20);
  const [aiPrefillApplied, setAiPrefillApplied] = useState(false);

  // Auto-populate controls
  const [svcSeal, setSvcSeal] = useState(true);
  const [svcCrack, setSvcCrack] = useState(false);
  const [svcPatch, setSvcPatch] = useState(false);
  const [svcStripe, setSvcStripe] = useState(false);
  const [areaSqFt, setAreaSqFt] = useState<string>("");
  const [linearFeet, setLinearFeet] = useState<string>("");
  const [numStalls, setNumStalls] = useState<string>("");
  const [distanceMiles, setDistanceMiles] = useState<string>("");
  const [procureMiles, setProcureMiles] = useState<string>("");
  const [crewSize, setCrewSize] = useState<string>("2");
  const [hourlyRate, setHourlyRate] = useState<string>("20");
  // Mix & add-ons
  const [coveragePerGal, setCoveragePerGal] = useState<string>("75");
  const [coats, setCoats] = useState<string>("1");
  const [waterPct, setWaterPct] = useState<string>("20");
  const [sandBagsPer100, setSandBagsPer100] = useState<string>("6");
  const [concCost, setConcCost] = useState<string>("3.65");
  const [sandCost, setSandCost] = useState<string>("10");
  const [waterCost, setWaterCost] = useState<string>("0");
  const [fastDryGal, setFastDryGal] = useState<string>("0");
  const [fastDryCost, setFastDryCost] = useState<string>("10");
  const [primerBuckets, setPrimerBuckets] = useState<string>("0");
  const [primerCost, setPrimerCost] = useState<string>("50");
  const [patchArea, setPatchArea] = useState<string>("");

  const { measurements } = useMapMeasurements();
  // Listen for AI analysis prefill event and populate controls
  React.useEffect(() => {
    const handler = (e: any) => {
      const analysis = e?.detail?.analysis;
      if (!analysis || aiPrefillApplied) return;
      try {
        if (typeof analysis.area_sqft === 'number' && analysis.area_sqft > 0) {
          setAreaSqFt(String(Math.round(analysis.area_sqft)));
          setSvcSeal(true);
        }
        // Leave cracks, potholes, patching blank for manual entry per request
        setSvcCrack(false);
        setSvcPatch(false);
        setLinearFeet("");
        setPatchArea("");
        setProfitPct(20);
        setOverheadPct(12);
        setTaxRate(8);
        setAiPrefillApplied(true);
        // Auto-generate items for sealcoat only
        setTimeout(() => handleAutoPopulate(), 0);
        logger.info('Estimate prefill applied from AI analysis', { area_sqft: analysis.area_sqft });
      } catch {}
    };
    window.addEventListener('ai-detection-estimate', handler as any);
    return () => window.removeEventListener('ai-detection-estimate', handler as any);
  }, [aiPrefillApplied]);

  const { data: catalogs } = useQuery({
    queryKey: ["cost-catalogs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cost_catalog").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: items } = useQuery({
    queryKey: ["cost-items", selectedCatalog],
    queryFn: async () => {
      if (!selectedCatalog) return [];
      const { data, error } = await supabase
        .from("cost_items")
        .select("*")
        .eq("catalog_id", selectedCatalog);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCatalog,
  });

  const addLineItem = (item: any) => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;

    const newLine: EstimateLineItem = {
      item_id: item.id,
      name: item.name,
      code: item.code ?? item.item_code,
      unit: item.unit,
      unit_cost: item.unit_cost,
      quantity: qty,
      total: qty * item.unit_cost,
    };

    setLineItems([...lineItems, newLine]);
    setQuantity("");
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = useMemo(() => lineItems.reduce((sum, item) => sum + item.total, 0), [lineItems]);
  const tax = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate]);
  const grandTotal = useMemo(() => subtotal + tax, [subtotal, tax]);

  const updateLineItem = (index: number, updates: Partial<EstimateLineItem>) => {
    setLineItems((prev) => {
      const copy = [...prev];
      const current = { ...copy[index], ...updates } as EstimateLineItem;
      current.total = Number(current.quantity) * Number(current.unit_cost);
      copy[index] = current;
      return copy;
    });
  };

  const handleAutoPopulate = () => {
    const result = autoPopulateEstimate({
      services: { sealcoat: svcSeal, crackfill: svcCrack, patching: svcPatch, striping: svcStripe },
      areaSqFt: parseFloat(areaSqFt) || undefined,
      linearFeetCracks: parseFloat(linearFeet) || undefined,
      numStalls: parseInt(numStalls) || undefined,
      distanceMiles: parseFloat(distanceMiles) || undefined,
      procurementMiles: parseFloat(procureMiles) || undefined,
      crewSize: parseInt(crewSize) || undefined,
      hourlyRate: parseFloat(hourlyRate) || undefined,
      overheadPercent: overheadPct,
      profitPercent: profitPct,
      taxRatePercent: taxRate,
      coverageSqFtPerMixedGallon: parseFloat(coveragePerGal) || undefined,
      coats: parseInt(coats) || undefined,
      waterPercent: parseFloat(waterPct) || undefined,
      sandBagsPer100Gal: parseFloat(sandBagsPer100) || undefined,
      concentrateCostPerGallon: parseFloat(concCost) || undefined,
      sandBagCost: parseFloat(sandCost) || undefined,
      waterCostPerGallon: parseFloat(waterCost) || undefined,
      fastDryGal: parseFloat(fastDryGal) || undefined,
      fastDryCostPerGallon: parseFloat(fastDryCost) || undefined,
      primerBuckets: parseFloat(primerBuckets) || undefined,
      primerBucketCost: parseFloat(primerCost) || undefined,
      patchAreaSqFt: parseFloat(patchArea) || undefined,
    });

    const newLines: EstimateLineItem[] = result.lineItems.map((li) => ({
      name: li.item_name,
      code: li.item_code,
      unit: li.unit,
      unit_cost: li.unit_cost,
      quantity: li.quantity,
      total: li.line_total,
      description: li.description,
    }));
    setLineItems(newLines);
  };

  const useLatestMeasurement = (type: "area" | "distance") => {
    if (!measurements || measurements.length === 0) return;
    const m = measurements.find((mm) => mm.type === type);
    if (!m) return;
    if (type === "area") setAreaSqFt(String(Math.round(m.value)));
    if (type === "distance") setLinearFeet(String(Math.round(m.value * 3.28084))); // meters to feet
  };

  const handleSaveEstimate = async () => {
    if (!customerName || lineItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add customer name and at least one line item.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createEstimateAsync({
        customer_name: customerName,
        customer_email: customerEmail || undefined,
        job_site_address: jobSiteAddress || undefined,
        catalog_id: selectedCatalog || undefined,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: tax,
        total: grandTotal,
        status: "draft",
        line_items: lineItems.map((item) => ({
          cost_item_id: item.item_id,
          item_name: item.name,
          item_code: item.code,
          description: item.description || undefined,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost,
          line_total: item.total,
        })),
      });

      if (result?.id) {
        setSavedEstimateId(result.id);
      }
    } catch (error) {
      console.error("Error saving estimate:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Estimate Calculator
            </div>
            <BackToMapButton variant="ghost" />
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
          <div className="border rounded-lg p-4 flex flex-col">
            <h3 className="font-semibold mb-3">Customer & Items</h3>

            <div className="space-y-3 mb-4">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label>Customer Email</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label>Job Site Address</Label>
                <Input
                  value={jobSiteAddress}
                  onChange={(e) => setJobSiteAddress(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <Label>Catalog</Label>
                <Select value={selectedCatalog} onValueChange={setSelectedCatalog}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select catalog" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogs?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {items?.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 mb-2 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => addLineItem(item)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.code} • ${item.unit_cost}/{item.unit}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="border rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Estimate Summary</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEstimate}
                  disabled={!customerName || lineItems.length === 0}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (savedEstimateId && customerName && lineItems.length > 0) {
                      exportEstimateToPDF({
                        id: savedEstimateId,
                        customer_name: customerName,
                        total_cost: grandTotal,
                        items: lineItems.map((item) => ({
                          name: item.name,
                          quantity: item.quantity,
                          unit: item.unit,
                          unit_cost: item.unit_cost,
                          total_cost: item.total,
                        })),
                        created_at: new Date().toISOString(),
                      });
                      toast({
                        title: "PDF Exported",
                        description: "Estimate has been exported to PDF",
                      });
                    } else {
                      toast({
                        title: "Save First",
                        description: "Please save the estimate before exporting",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export PDF
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 mb-4">
              {lineItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No items added yet</div>
              ) : (
                <div className="space-y-2">
                  {lineItems.map((line, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="grid grid-cols-6 gap-2 flex-1 items-center text-sm">
                          <Input
                            value={line.name}
                            onChange={(e) => updateLineItem(index, { name: e.target.value })}
                            placeholder="Item name"
                            className="col-span-2"
                          />
                          <Input
                            value={line.code || ""}
                            onChange={(e) => updateLineItem(index, { code: e.target.value })}
                            placeholder="Code"
                          />
                          <Input
                            value={line.unit}
                            onChange={(e) => updateLineItem(index, { unit: e.target.value })}
                            placeholder="Unit"
                          />
                          <Input
                            type="number"
                            value={String(line.quantity)}
                            onChange={(e) =>
                              updateLineItem(index, { quantity: parseFloat(e.target.value) || 0 })
                            }
                            placeholder="Qty"
                          />
                          <Input
                            type="number"
                            value={String(line.unit_cost)}
                            onChange={(e) =>
                              updateLineItem(index, { unit_cost: parseFloat(e.target.value) || 0 })
                            }
                            placeholder="Rate"
                          />
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeLineItem(index)}>
                          ×
                        </Button>
                      </div>
                      <div>
                        <Input
                          value={line.description || ""}
                          onChange={(e) => updateLineItem(index, { description: e.target.value })}
                          placeholder="Description (optional)"
                        />
                      </div>
                      <div className="flex justify-end text-sm">
                        <div className="text-right font-semibold">${line.total.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm gap-2">
                <div className="flex items-center gap-2">
                  <span>Tax (%):</span>
                  <Input
                    className="w-20 h-8"
                    type="number"
                    value={String(taxRate)}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Populate Panel */}
        <div className="mt-4 border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Auto-Populate</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label>Services</Label>
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={svcSeal}
                    onChange={(e) => setSvcSeal(e.target.checked)}
                  />{" "}
                  Sealcoat
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={svcCrack}
                    onChange={(e) => setSvcCrack(e.target.checked)}
                  />{" "}
                  Crackfill
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={svcPatch}
                    onChange={(e) => setSvcPatch(e.target.checked)}
                  />{" "}
                  Patching
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={svcStripe}
                    onChange={(e) => setSvcStripe(e.target.checked)}
                  />{" "}
                  Striping
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Area (sqft)</Label>
              <div className="flex gap-2">
                <Input
                  value={areaSqFt}
                  onChange={(e) => setAreaSqFt(e.target.value)}
                  placeholder="e.g., 12000"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => useLatestMeasurement("area")}
                >
                  Use Map
                </Button>
              </div>
              <Label>Cracks (LF)</Label>
              <div className="flex gap-2">
                <Input
                  value={linearFeet}
                  onChange={(e) => setLinearFeet(e.target.value)}
                  placeholder="e.g., 500"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => useLatestMeasurement("distance")}
                >
                  Use Map
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Stalls</Label>
              <Input
                value={numStalls}
                onChange={(e) => setNumStalls(e.target.value)}
                placeholder="e.g., 40"
              />
              <Label>Distance (mi)</Label>
              <Input
                value={distanceMiles}
                onChange={(e) => setDistanceMiles(e.target.value)}
                placeholder="job travel"
              />
              <Label>Supplier Miles (mi)</Label>
              <Input
                value={procureMiles}
                onChange={(e) => setProcureMiles(e.target.value)}
                placeholder="materials"
              />
            </div>
            <div className="space-y-2">
              <Label>Crew Size</Label>
              <Input
                value={crewSize}
                onChange={(e) => setCrewSize(e.target.value)}
                placeholder="2"
              />
              <Label>Hourly Rate (per person)</Label>
              <Input
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="20"
              />
              <Label>Overhead % / Profit %</Label>
              <div className="flex gap-2">
                <Input
                  className="w-20"
                  type="number"
                  value={String(overheadPct)}
                  onChange={(e) => setOverheadPct(parseFloat(e.target.value) || 0)}
                />
                <Input
                  className="w-20"
                  type="number"
                  value={String(profitPct)}
                  onChange={(e) => setProfitPct(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Button type="button" onClick={handleAutoPopulate}>
              Generate Items
            </Button>
          </div>
        </div>

      {/* Sealcoat Mix & Add-ons */}
      <div className="mt-4 border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Sealcoat Mix & Add‑ons</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div>
            <Label>Coverage (sqft/gal mixed)</Label>
            <Input value={coveragePerGal} onChange={(e) => setCoveragePerGal(e.target.value)} />
            <Label className="mt-2">Coats</Label>
            <Input value={coats} onChange={(e) => setCoats(e.target.value)} />
          </div>
          <div>
            <Label>Water %</Label>
            <Input value={waterPct} onChange={(e) => setWaterPct(e.target.value)} />
            <Label className="mt-2">Sand bags / 100 gal</Label>
            <Input value={sandBagsPer100} onChange={(e) => setSandBagsPer100(e.target.value)} />
          </div>
          <div>
            <Label>PMM $/gal</Label>
            <Input value={concCost} onChange={(e) => setConcCost(e.target.value)} />
            <Label className="mt-2">Sand $/bag</Label>
            <Input value={sandCost} onChange={(e) => setSandCost(e.target.value)} />
          </div>
          <div>
            <Label>Water $/gal</Label>
            <Input value={waterCost} onChange={(e) => setWaterCost(e.target.value)} />
            <Label className="mt-2">Fast‑Dry gal</Label>
            <Input value={fastDryGal} onChange={(e) => setFastDryGal(e.target.value)} />
          </div>
          <div>
            <Label>Fast‑Dry $/gal</Label>
            <Input value={fastDryCost} onChange={(e) => setFastDryCost(e.target.value)} />
            <Label className="mt-2">Primer buckets (5 gal)</Label>
            <Input value={primerBuckets} onChange={(e) => setPrimerBuckets(e.target.value)} />
          </div>
          <div>
            <Label>Primer $/bucket</Label>
            <Input value={primerCost} onChange={(e) => setPrimerCost(e.target.value)} />
            <Label className="mt-2">Patching Area (sqft)</Label>
            <Input value={patchArea} onChange={(e) => setPatchArea(e.target.value)} />
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
};
