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

  // Sealcoat calculation
  if (params.services.sealcoat && params.areaSqFt) {
    const gallonsPerSqFt = 0.015; // Typical coverage rate
    const gallons = params.areaSqFt * gallonsPerSqFt;
    const costPerGallon = 2.5;
    const materialCost = gallons * costPerGallon;
    
    lineItems.push({
      item_name: "Sealcoat Material",
      item_code: "SEAL-MAT",
      unit: "gallon",
      unit_cost: costPerGallon,
      quantity: Math.round(gallons * 100) / 100,
      line_total: materialCost,
      description: `Coverage for ${params.areaSqFt} sqft`
    });
    
    // Labor for sealcoat
    const hoursEstimate = (params.areaSqFt / 1000) * (params.crewSize || 2);
    const laborCost = hoursEstimate * (params.hourlyRate || 20) * (params.crewSize || 2);
    
    lineItems.push({
      item_name: "Sealcoat Labor",
      item_code: "SEAL-LAB",
      unit: "hour",
      unit_cost: (params.hourlyRate || 20) * (params.crewSize || 2),
      quantity: Math.round(hoursEstimate * 100) / 100,
      line_total: laborCost,
      description: `Crew of ${params.crewSize || 2}`
    });
  }

  // Crackfill calculation
  if (params.services.crackfill && params.linearFeetCracks) {
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
  if (params.services.patching && params.areaSqFt) {
    const patchArea = params.areaSqFt * 0.05; // Assume 5% needs patching
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
    
    const hoursEstimate = (patchArea / 100) * (params.crewSize || 2);
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
