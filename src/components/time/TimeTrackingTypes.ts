// Type definitions for Time Tracking to match database schema

export interface DbTimeEntry {
  id: string;
  employee_id: string;
  job_id: string;
  date: string;
  clock_in: string;
  clock_out: string;
  break_duration: number;
  total_hours: number;
  location_in: any;
  location_out: any;
  notes: string;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  employee_id: string;
  job_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  total_hours: number;
  hourly_rate: number;
  location: { lat: number; lng: number };
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export interface DbJob {
  id: string;
  title: string;
  description: string;
  address: string;
  status: string;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  client_id: string;
  status: string;
  created_at: string;
}

export interface DbEmployee {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  hourly_rate: number;
  user_id?: string;
}

// Helper to convert DB time entry to app time entry
export function mapDbTimeEntryToTimeEntry(dbEntry: any): TimeEntry {
  const locationIn = typeof dbEntry.location_in === 'string'
    ? JSON.parse(dbEntry.location_in)
    : dbEntry.location_in || {};

  return {
    id: dbEntry.id,
    employee_id: dbEntry.employee_id,
    job_id: dbEntry.job_id,
    date: dbEntry.date,
    start_time: dbEntry.clock_in,
    end_time: dbEntry.clock_out || '',
    break_duration: dbEntry.break_duration || 0,
    total_hours: dbEntry.total_hours || 0,
    hourly_rate: 20,
    location: {
      lat: locationIn.lat || 0,
      lng: locationIn.lng || 0
    },
    notes: dbEntry.notes || '',
    status: dbEntry.clock_out ? 'approved' : 'pending',
    created_at: dbEntry.created_at,
    updated_at: dbEntry.created_at
  };
}

export function mapDbJobToJob(dbJob: any): Job {
  return {
    id: dbJob.id,
    title: dbJob.title || 'Unnamed Job',
    description: dbJob.description || '',
    location: dbJob.address || '',
    client_id: '',
    status: dbJob.status || 'active',
    created_at: dbJob.created_at
  };
}

export function mapDbEmployeeToEmployee(dbEmployee: any): Employee {
  return {
    id: dbEmployee.id,
    name: `${dbEmployee.first_name || ''} ${dbEmployee.last_name || ''}`.trim() || 'Unknown',
    role: dbEmployee.role || 'worker',
    hourly_rate: 20,
    user_id: dbEmployee.user_id
  };
}
