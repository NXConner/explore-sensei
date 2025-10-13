// Type definitions for Fleet Management to match database schema

export interface DbVehicle {
  id: string;
  name: string;
  type: string;
  license_plate: string;
  status: string;
  location: string;
  assigned_to: string;
  last_maintenance: string;
  created_at: string;
  updated_at: string;
}

export interface DbMaintenanceRecord {
  id: string;
  asset_id: string; // DB uses asset_id not vehicle_id
  oil_type: string;
  oil_weight: string;
  oil_quantity: number;
  oil_filter_number: string;
  plug_size: string;
  oil_change_date: string;
  oil_filter_change_date: string;
  maintenance_notes: string;
  filter_notes: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  color: string;
  status: 'active' | 'maintenance' | 'out_of_service' | 'retired';
  current_location?: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  assigned_employee?: string;
  fuel_level?: number;
  mileage: number;
  last_maintenance?: string;
  next_maintenance?: string;
  insurance_expiry?: string;
  registration_expiry?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  date: string;
  mileage: number;
  performed_by?: string;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  created_at: string;
}

// Helper to convert DB vehicle to app vehicle
export function mapDbVehicleToVehicle(dbVehicle: any): Vehicle {
  return {
    id: dbVehicle.id,
    make: dbVehicle.name?.split(' ')[0] || 'Unknown',
    model: dbVehicle.name?.split(' ').slice(1).join(' ') || 'Unknown',
    year: 2020,
    license_plate: dbVehicle.license_plate || '',
    vin: '',
    color: '',
    status: dbVehicle.status as any || 'active',
    assigned_employee: dbVehicle.assigned_to,
    mileage: 0,
    last_maintenance: dbVehicle.last_maintenance
  };
}

export function mapDbMaintenanceToMaintenance(dbMaintenance: any): MaintenanceRecord {
  return {
    id: dbMaintenance.id,
    vehicle_id: dbMaintenance.asset_id || dbMaintenance.vehicle_id,
    type: 'routine',
    description: dbMaintenance.maintenance_notes || '',
    cost: 0,
    date: dbMaintenance.oil_change_date || dbMaintenance.date,
    mileage: 0,
    notes: dbMaintenance.filter_notes,
    status: 'completed',
    created_at: dbMaintenance.created_at
  };
}
