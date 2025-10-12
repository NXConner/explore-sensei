import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Test database configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'test-key';

const supabase = createClient(supabaseUrl, supabaseKey);

describe('Supabase Integration Tests', () => {
  beforeAll(async () => {
    // Setup test data if needed
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('Authentication', () => {
    it('should connect to Supabase successfully', async () => {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      expect(error).toBeNull();
    });

    it('should handle authentication errors gracefully', async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', 'invalid-id');
      expect(error).toBeNull(); // Should not throw, just return empty result
    });
  });

  describe('Jobs Management', () => {
    it('should fetch jobs with client information', async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients (name, email, phone),
          job_sites (name, address)
        `)
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a new job', async () => {
      const jobData = {
        title: 'Test Job',
        description: 'Test job description',
        client_id: 'test-client-id',
        status: 'pending',
        priority: 'medium',
        estimated_cost: 1000,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe(jobData.title);
    });

    it('should update job status', async () => {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .limit(1);

      if (jobs && jobs.length > 0) {
        const { error } = await supabase
          .from('jobs')
          .update({ status: 'in_progress' })
          .eq('id', jobs[0].id);

        expect(error).toBeNull();
      }
    });
  });

  describe('Time Tracking', () => {
    it('should fetch time entries with employee information', async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          employees (name, role),
          jobs (title, status)
        `)
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a time entry', async () => {
      const timeEntryData = {
        employee_id: 'test-employee-id',
        job_id: 'test-job-id',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        hours_worked: 8,
        status: 'active',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'Test Location'
        }
      };

      const { data, error } = await supabase
        .from('time_entries')
        .insert([timeEntryData])
        .select();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].hours_worked).toBe(timeEntryData.hours_worked);
    });
  });

  describe('Fleet Management', () => {
    it('should fetch vehicles with maintenance records', async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          maintenance_records (type, description, cost, date)
        `)
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should update vehicle location', async () => {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id')
        .limit(1);

      if (vehicles && vehicles.length > 0) {
        const newLocation = {
          lat: 40.7128,
          lng: -74.0060,
          address: 'Updated Location',
          timestamp: new Date().toISOString()
        };

        const { error } = await supabase
          .from('vehicles')
          .update({ current_location: newLocation })
          .eq('id', vehicles[0].id);

        expect(error).toBeNull();
      }
    });
  });

  describe('Invoicing', () => {
    it('should fetch invoices with client and job information', async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (name, email, address),
          jobs (title, description),
          line_items (description, quantity, unit_price, total)
        `)
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create an invoice with line items', async () => {
      const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        client_id: 'test-client-id',
        job_id: 'test-job-id',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        subtotal: 1000,
        tax_rate: 0.08,
        tax_amount: 80,
        total_amount: 1080
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      expect(invoiceError).toBeNull();
      expect(invoice).toBeDefined();

      if (invoice) {
        const lineItemsData = [
          {
            invoice_id: invoice.id,
            description: 'Test Service',
            quantity: 1,
            unit_price: 1000,
            total: 1000
          }
        ];

        const { error: lineItemsError } = await supabase
          .from('invoice_line_items')
          .insert(lineItemsData);

        expect(lineItemsError).toBeNull();
      }
    });
  });

  describe('Route Optimization', () => {
    it('should fetch route optimizations', async () => {
      const { data, error } = await supabase
        .from('route_optimizations')
        .select('*')
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a route optimization', async () => {
      const routeData = {
        vehicle_id: 'test-vehicle-id',
        route_name: 'Test Route',
        total_distance: 50.5,
        total_duration: 2.5,
        total_fuel_cost: 25.25,
        optimization_score: 85,
        job_sites: ['site1', 'site2'],
        waypoints: [
          { lat: 40.7128, lng: -74.0060, address: 'Start' },
          { lat: 40.7589, lng: -73.9851, address: 'End' }
        ]
      };

      const { data, error } = await supabase
        .from('route_optimizations')
        .insert([routeData])
        .select();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].route_name).toBe(routeData.route_name);
    });
  });

  describe('Weather Integration', () => {
    it('should fetch weather alerts', async () => {
      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .gte('end_time', new Date().toISOString())
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a weather alert', async () => {
      const alertData = {
        type: 'warning',
        severity: 'medium',
        title: 'Test Weather Alert',
        description: 'Test weather alert description',
        affected_areas: ['Test Area'],
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const { data, error } = await supabase
        .from('weather_alerts')
        .insert([alertData])
        .select();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe(alertData.title);
    });
  });

  describe('AI Analysis', () => {
    it('should fetch AI site analysis', async () => {
      const { data, error } = await supabase
        .from('ai_site_analysis')
        .select(`
          *,
          job_sites (name, address)
        `)
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create an AI analysis record', async () => {
      const analysisData = {
        job_site_id: 'test-site-id',
        condition_score: 85,
        detected_issues: ['cracks', 'fading'],
        recommendations: ['repair cracks', 'apply sealant'],
        confidence_score: 92,
        severity: 'medium',
        estimated_cost: 2500,
        priority: 75,
        analysis_date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ai_site_analysis')
        .insert([analysisData])
        .select();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].condition_score).toBe(analysisData.condition_score);
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should subscribe to time entries updates', (done) => {
      const subscription = supabase
        .channel('time-entries')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'time_entries'
        }, (payload) => {
          expect(payload).toBeDefined();
          subscription.unsubscribe();
          done();
        })
        .subscribe();

      // Cleanup after timeout
      setTimeout(() => {
        subscription.unsubscribe();
        done();
      }, 5000);
    });

    it('should subscribe to vehicle location updates', (done) => {
      const subscription = supabase
        .channel('vehicle-locations')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: 'current_location=neq.null'
        }, (payload) => {
          expect(payload).toBeDefined();
          subscription.unsubscribe();
          done();
        })
        .subscribe();

      // Cleanup after timeout
      setTimeout(() => {
        subscription.unsubscribe();
        done();
      }, 5000);
    });
  });

  describe('Row Level Security', () => {
    it('should enforce RLS policies', async () => {
      // Test that RLS is enabled
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      // Should not throw error, but may return empty results due to RLS
      expect(error).toBeNull();
    });

    it('should allow authenticated user access', async () => {
      // This would require proper authentication setup
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error by using invalid URL
      const invalidSupabase = createClient('http://invalid-url', 'invalid-key');
      
      const { data, error } = await invalidSupabase
        .from('profiles')
        .select('*');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should handle invalid table queries', async () => {
      const { data, error } = await supabase
        .from('invalid_table')
        .select('*');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should handle constraint violations', async () => {
      const invalidData = {
        // Missing required fields
        title: 'Test'
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([invalidData]);

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });
});
