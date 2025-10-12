// Comprehensive type definitions for Explore Sensei
// This file contains all TypeScript interfaces and types used throughout the application

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile?: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'division' | 'animus' | 'high-contrast' | 'church-classic';
  wallpaper?: string;
  notifications: NotificationSettings;
  map_settings: MapSettings;
  dashboard_layout: DashboardLayout;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  job_updates: boolean;
  safety_alerts: boolean;
  weather_alerts: boolean;
}

export interface MapSettings {
  default_zoom: number;
  default_center: [number, number];
  show_traffic: boolean;
  show_weather: boolean;
  show_employees: boolean;
}

export interface DashboardLayout {
  widgets: string[];
  columns: number;
  compact_mode: boolean;
}

export type UserRole = 'Super Administrator' | 'Administrator' | 'Manager' | 'Operator' | 'Viewer';

export interface Client {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  location?: string;
  client_id?: string;
  latitude?: number;
  longitude?: number;
  progress: number;
  assigned_employees: string[];
  created_at: string;
  updated_at: string;
  client?: Client;
}

export type JobStatus = 'pending' | 'in progress' | 'completed' | 'cancelled';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  hire_date?: string;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export type EmployeeStatus = 'active' | 'inactive' | 'terminated';

export interface TimeEntry {
  id: string;
  employee_id: string;
  job_id?: string;
  clock_in: string;
  clock_out?: string;
  break_duration: number;
  notes?: string;
  date: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
  job?: Job;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  supplier?: string;
  reorder_level?: number;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  status: VehicleStatus;
  current_location?: [number, number];
  last_maintenance?: string;
  next_maintenance?: string;
  mileage?: number;
  created_at: string;
  updated_at: string;
}

export type VehicleStatus = 'active' | 'maintenance' | 'retired';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  serial_number?: string;
  status: EquipmentStatus;
  assigned_to?: string;
  location?: string;
  last_inspection?: string;
  next_inspection?: string;
  created_at: string;
  updated_at: string;
}

export type EquipmentStatus = 'available' | 'assigned' | 'maintenance' | 'retired';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  job_id?: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  job?: Job;
  items: InvoiceItem[];
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface SafetyIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reported_by: string;
  reported_at: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  affected_employees: string[];
  actions_taken?: string;
  follow_up_required: boolean;
  created_at: string;
  updated_at: string;
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'closed';

export interface WeatherAlert {
  id: string;
  type: WeatherAlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  affected_area: GeoJSON.Polygon;
  created_at: string;
}

export type WeatherAlertType = 'rain' | 'snow' | 'wind' | 'temperature' | 'severe';
export type AlertSeverity = 'advisory' | 'watch' | 'warning' | 'emergency';

export interface RouteOptimization {
  id: string;
  name: string;
  job_ids: string[];
  optimized_route: RoutePoint[];
  total_distance: number;
  estimated_duration: number;
  fuel_cost: number;
  created_at: string;
  updated_at: string;
}

export interface RoutePoint {
  id: string;
  latitude: number;
  longitude: number;
  order: number;
  address?: string;
  job_id?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_conditions: Record<string, unknown>;
  actions: WorkflowAction[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TriggerType = 'time' | 'event' | 'threshold' | 'manual';

export interface WorkflowAction {
  id: string;
  type: ActionType;
  parameters: Record<string, unknown>;
  order: number;
}

export type ActionType = 'notification' | 'email' | 'sms' | 'create_record' | 'update_record' | 'webhook';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'job_update' | 'safety_alert' | 'weather_alert';

export interface PhotoDocumentation {
  id: string;
  job_id: string;
  employee_id: string;
  photo_url: string;
  caption?: string;
  location?: [number, number];
  taken_at: string;
  created_at: string;
}

export interface FieldReport {
  id: string;
  job_id: string;
  employee_id: string;
  report_type: ReportType;
  title: string;
  content: string;
  weather_conditions?: string;
  equipment_used: string[];
  issues_encountered?: string;
  recommendations?: string;
  created_at: string;
  updated_at: string;
}

export type ReportType = 'daily' | 'progress' | 'incident' | 'completion' | 'inspection';

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  achieved_at?: string;
  created_at: string;
}

export interface AIJob {
  id: string;
  type: AIJobType;
  status: AIJobStatus;
  parameters: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type AIJobType = 'asphalt_analysis' | 'route_optimization' | 'estimate_generation' | 'safety_prediction';
export type AIJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AsphaltArea {
  id: string;
  coordinates: Array<{ x: number; y: number }>;
  area_sqft: number;
  condition: string;
}

export interface AISiteAnalysis {
  id: string;
  job_id?: string;
  user_id: string;
  analysis_type: string;
  image_url?: string;
  area_sqft?: number;
  area_sqm?: number;
  condition_score?: number;
  confidence_score?: number;
  detected_issues?: Record<string, unknown>;
  detected_boundaries?: Record<string, unknown>;
  ai_notes?: string;
  asphalt_areas?: AsphaltArea[];
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Form Types
export interface JobFormData {
  title: string;
  description?: string;
  client_id?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  assigned_employees: string[];
}

export interface TimeEntryFormData {
  employee_id: string;
  job_id?: string;
  clock_in: string;
  clock_out?: string;
  break_duration: number;
  notes?: string;
}

export interface InvoiceFormData {
  client_id: string;
  job_id?: string;
  due_date: string;
  notes?: string;
  items: InvoiceItemFormData[];
}

export interface InvoiceItemFormData {
  description: string;
  quantity: number;
  unit_price: number;
}

// Map Types
export interface MapMarker {
  id: string;
  position: [number, number];
  type: MarkerType;
  data: Record<string, unknown>;
}

export type MarkerType = 'job' | 'employee' | 'vehicle' | 'equipment' | 'safety' | 'weather';

export interface MapDrawing {
  id: string;
  type: DrawingType;
  coordinates: [number, number][];
  properties: Record<string, unknown>;
  created_at: string;
}

export type DrawingType = 'polygon' | 'line' | 'circle' | 'rectangle';

// Chart/Analytics Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface KPIData {
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  total_revenue: number;
  active_employees: number;
  safety_incidents: number;
  equipment_utilization: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Database Types (from Supabase)
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at'>>;
      };
      jobs: {
        Row: Job;
        Insert: Omit<Job, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Job, 'id' | 'created_at'>>;
      };
      employees: {
        Row: Employee;
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>;
      };
      time_entries: {
        Row: TimeEntry;
        Insert: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TimeEntry, 'id' | 'created_at'>>;
      };
      inventory_items: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at'>>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Vehicle, 'id' | 'created_at'>>;
      };
      equipment: {
        Row: Equipment;
        Insert: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Equipment, 'id' | 'created_at'>>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Invoice, 'id' | 'created_at'>>;
      };
      safety_incidents: {
        Row: SafetyIncident;
        Insert: Omit<SafetyIncident, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SafetyIncident, 'id' | 'created_at'>>;
      };
      weather_alerts: {
        Row: WeatherAlert;
        Insert: Omit<WeatherAlert, 'id' | 'created_at'>;
        Update: Partial<Omit<WeatherAlert, 'id' | 'created_at'>>;
      };
      route_optimizations: {
        Row: RouteOptimization;
        Insert: Omit<RouteOptimization, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RouteOptimization, 'id' | 'created_at'>>;
      };
      automation_workflows: {
        Row: AutomationWorkflow;
        Insert: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AutomationWorkflow, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
      photo_documentation: {
        Row: PhotoDocumentation;
        Insert: Omit<PhotoDocumentation, 'id' | 'created_at'>;
        Update: Partial<Omit<PhotoDocumentation, 'id' | 'created_at'>>;
      };
      field_reports: {
        Row: FieldReport;
        Insert: Omit<FieldReport, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FieldReport, 'id' | 'created_at'>>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id' | 'created_at'>;
        Update: Partial<Omit<Achievement, 'id' | 'created_at'>>;
      };
      ai_jobs: {
        Row: AIJob;
        Insert: Omit<AIJob, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIJob, 'id' | 'created_at'>>;
      };
      ai_site_analysis: {
        Row: AISiteAnalysis;
        Insert: Omit<AISiteAnalysis, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AISiteAnalysis, 'id' | 'created_at'>>;
      };
      alerts: {
        Row: Alert;
        Insert: Omit<Alert, 'id' | 'created_at'>;
        Update: Partial<Omit<Alert, 'id' | 'created_at'>>;
      };
    };
  };
}
