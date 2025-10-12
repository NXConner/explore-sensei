interface AutoPopulateParams {
  services: {
    sealcoat: boolean;
    crackfill: boolean;
    patching: boolean;
    striping: boolean;
  };
  areaSqFt?: number;
  linearFeetCracks?: number;
  numStalls?: number;
  distanceMiles?: number;
  procurementMiles?: number;
  crewSize?: number;
  hourlyRate?: number;
  overheadPercent: number;
  profitPercent: number;
  taxRatePercent: number;
  // Sealcoat mix parameters
  coverageSqFtPerMixedGallon?: number; // default 75 sqft/gal
  coats?: number; // default 1
  waterPercent?: number; // default 20 (%)
  sandBagsPer100Gal?: number; // default 6 bags per 100 gal concentrate
  // Material costs
  concentrateCostPerGallon?: number; // default 3.65
  sandBagCost?: number; // default 10 per 50 lb bag
  waterCostPerGallon?: number; // default 0
  fastDryGal?: number; // default 0 (user editable)
  fastDryCostPerGallon?: number; // default 10 (5 gal bucket $50)
  primerBuckets?: number; // default 0 (5 gal bucket)
  primerBucketCost?: number; // default 50
  // Patching explicit area (leave blank if none)
  patchAreaSqFt?: number;
}

interface LineItem {
  item_name: string;
  item_code: string;
  unit: string;
  unit_cost: number;
  quantity: number;
  line_total: number;
  description?: string;
}

interface AutoPopulateResult {
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export function autoPopulateEstimate(params: AutoPopulateParams): AutoPopulateResult {
  const lineItems: LineItem[] = [];
  let subtotal = 0;

  // Sealcoat calculation (concentrate + sand + water)
  if (params.services.sealcoat && params.areaSqFt) {
    const coverageSqFtPerMixedGallon = params.coverageSqFtPerMixedGallon ?? 75; // mixed sealer coverage
    const coats = params.coats ?? 1;
    const waterPercent = params.waterPercent ?? 20; // percent
    const sandBagsPer100Gal = params.sandBagsPer100Gal ?? 6; // 50 lb bags per 100 gal concentrate

    const concentrateCostPerGallon = params.concentrateCostPerGallon ?? 3.65;
    const sandBagCost = params.sandBagCost ?? 10;
    const waterCostPerGallon = params.waterCostPerGallon ?? 0;
    const fastDryCostPerGallon = params.fastDryCostPerGallon ?? 10; // $50 per 5 gal bucket
    const primerBucketCost = params.primerBucketCost ?? 50; // 5 gal bucket

    // Total mixed sealer gallons required for desired coats
    const mixedGallons = (params.areaSqFt * coats) / coverageSqFtPerMixedGallon;
    // Back-calc concentrate and water volumes from mix ratio (sand not counted in gallons)
    const concentrateGallons = mixedGallons / (1 + waterPercent / 100);
    const waterGallons = concentrateGallons * (waterPercent / 100);
    const sandBags = (concentrateGallons / 100) * sandBagsPer100Gal;

    // Materials line items
    const concQty = Math.round(concentrateGallons * 100) / 100;
    const sandQtyBags = Math.ceil(sandBags);
    const waterQty = Math.round(waterGallons * 100) / 100;
    const fastDryQty = Math.max(0, Math.round((params.fastDryGal ?? 0) * 100) / 100);
    const primerQtyBuckets = Math.max(0, Math.ceil(params.primerBuckets ?? 0));

    if (concQty > 0) {
      lineItems.push({
        item_name: "PMM Concentrate",
        item_code: "SEAL-PMM",
        unit: "gallon",
        unit_cost: concentrateCostPerGallon,
        quantity: concQty,
        line_total: concQty * concentrateCostPerGallon,
        description: `${coats} coat(s), coverage ~${coverageSqFtPerMixedGallon} sqft/gal mixed`
      });
    }

    // Sand bags (50 lb)
    lineItems.push({
      item_name: "Silica Sand (50 lb)",
      item_code: "SAND-50LB",
      unit: "bag",
      unit_cost: sandBagCost,
      quantity: sandQtyBags,
      line_total: sandQtyBags * sandBagCost,
      description: `${sandBagsPer100Gal} bags / 100 gal concentrate`
    });

    // Water (no cost, but quantity shown)
    lineItems.push({
      item_name: "Water",
      item_code: "WATER",
      unit: "gallon",
      unit_cost: waterCostPerGallon,
      quantity: waterQty,
      line_total: waterQty * waterCostPerGallon,
      description: `${waterPercent}% of concentrate volume`
    });

    // Fast-dry additive (user-editable, default 0)
    lineItems.push({
      item_name: "Fast-Dry Additive",
      item_code: "FASTDRY",
      unit: "gallon",
      unit_cost: fastDryCostPerGallon,
      quantity: fastDryQty,
      line_total: fastDryQty * fastDryCostPerGallon,
      description: "~2 gal per 125 gal concentrate (optional)"
    });

    // Primer for oil spots (user-editable, default 0)
    lineItems.push({
      item_name: "Primer (Oil Spots)",
      item_code: "PRIMER-5G",
      unit: "bucket",
      unit_cost: primerBucketCost,
      quantity: primerQtyBuckets,
      line_total: primerQtyBuckets * primerBucketCost,
      description: "5 gal buckets (as needed)"
    });

    // Labor for sealcoat (optional but included for completeness)
    const baseHourlyRate = params.hourlyRate ?? 20;
    const crewSize = params.crewSize ?? 2;
    const manHours = (params.areaSqFt / 1000) * coats; // heuristic
    const totalLaborHours = Math.round(manHours * crewSize * 100) / 100;
    const laborLineTotal = totalLaborHours * baseHourlyRate;
    lineItems.push({
      item_name: "Sealcoat Labor",
      item_code: "SEAL-LAB",
      unit: "hour",
      unit_cost: baseHourlyRate,
      quantity: totalLaborHours,
      line_total: laborLineTotal,
      description: `Crew ${crewSize} • ${coats} coat(s)`
    });
  }

  // Crackfill calculation
  if (params.services.crackfill && params.linearFeetCracks && params.linearFeetCracks > 0) {
    const lbsPerFoot = 0.5;
    const pounds = params.linearFeetCracks * lbsPerFoot;
    const costPerLb = 1.2;
    const materialCost = pounds * costPerLb;
    
    lineItems.push({
      item_name: "Crack Filler Material",
      item_code: "CRACK-MAT",
      unit: "lb",
      unit_cost: costPerLb,
      quantity: Math.round(pounds * 100) / 100,
      line_total: materialCost,
      description: `${params.linearFeetCracks} linear feet`
    });
    
    const hoursEstimate = (params.linearFeetCracks / 200) * (params.crewSize || 2);
    const laborCost = hoursEstimate * (params.hourlyRate || 20) * (params.crewSize || 2);
    
    lineItems.push({
      item_name: "Crack Filling Labor",
      item_code: "CRACK-LAB",
      unit: "hour",
      unit_cost: (params.hourlyRate || 20) * (params.crewSize || 2),
      quantity: Math.round(hoursEstimate * 100) / 100,
      line_total: laborCost
    });
  }

  // Patching calculation
  if (params.services.patching && params.patchAreaSqFt && params.patchAreaSqFt > 0) {
    const patchArea = params.patchAreaSqFt;
    const tonsPerSqFt = 0.015;
    const tons = patchArea * tonsPerSqFt;
    const costPerTon = 120;
    const materialCost = tons * costPerTon;
    
    lineItems.push({
      item_name: "Asphalt Patching Material",
      item_code: "PATCH-MAT",
      unit: "ton",
      unit_cost: costPerTon,
      quantity: Math.round(tons * 100) / 100,
      line_total: materialCost,
      description: `Patching ~${Math.round(patchArea)} sqft`
    });
    
    const hoursEstimate = patchArea / 100; // heuristic
    const laborCost = hoursEstimate * (params.hourlyRate || 20) * (params.crewSize || 2);
    
    lineItems.push({
      item_name: "Patching Labor",
      item_code: "PATCH-LAB",
      unit: "hour",
      unit_cost: (params.hourlyRate || 20) * (params.crewSize || 2),
      quantity: Math.round(hoursEstimate * 100) / 100,
      line_total: laborCost
    });
  }

  // Striping calculation
  if (params.services.striping && params.numStalls) {
    const costPerStall = 15;
    const stripingCost = params.numStalls * costPerStall;
    
    lineItems.push({
      item_name: "Parking Stall Striping",
      item_code: "STRIPE-STALL",
      unit: "stall",
      unit_cost: costPerStall,
      quantity: params.numStalls,
      line_total: stripingCost,
      description: `${params.numStalls} parking stalls`
    });
  }

  // Travel/mobilization
  if (params.distanceMiles && params.distanceMiles > 0) {
    const costPerMile = 2.5;
    const travelCost = params.distanceMiles * costPerMile * 2; // Round trip
    
    lineItems.push({
      item_name: "Travel/Mobilization",
      item_code: "TRAVEL",
      unit: "mile",
      unit_cost: costPerMile,
      quantity: params.distanceMiles * 2,
      line_total: travelCost,
      description: "Round trip to job site"
    });
  }

  // Material procurement travel
  if (params.procurementMiles && params.procurementMiles > 0) {
    const costPerMile = 2.5;
    const procureCost = params.procurementMiles * costPerMile * 2;
    
    lineItems.push({
      item_name: "Material Procurement",
      item_code: "PROCURE",
      unit: "mile",
      unit_cost: costPerMile,
      quantity: params.procurementMiles * 2,
      line_total: procureCost,
      description: "Material pickup/delivery"
    });
  }

  // Calculate subtotal
  subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);

  // Apply overhead
  const overhead = subtotal * (params.overheadPercent / 100);
  lineItems.push({
    item_name: "Overhead",
    item_code: "OVERHEAD",
    unit: "%",
    unit_cost: params.overheadPercent,
    quantity: 1,
    line_total: overhead,
    description: `${params.overheadPercent}% overhead`
  });

  subtotal += overhead;

  // Apply profit
  const profit = subtotal * (params.profitPercent / 100);
  lineItems.push({
    item_name: "Profit Margin",
    item_code: "PROFIT",
    unit: "%",
    unit_cost: params.profitPercent,
    quantity: 1,
    line_total: profit,
    description: `${params.profitPercent}% profit`
  });

  subtotal += profit;

  const tax = subtotal * (params.taxRatePercent / 100);
  const total = subtotal + tax;

  return {
    lineItems,
    subtotal,
    tax,
    total
  };
}
