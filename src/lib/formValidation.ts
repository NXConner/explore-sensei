import { z } from 'zod';
import { sanitizeInput } from '@/lib/security';

/**
 * Form validation schemas with built-in sanitization
 * Prevents XSS, data corruption, and ensures data integrity
 */

// Transform that sanitizes string inputs
const sanitizedString = z.string().transform(sanitizeInput);

// Common validation schemas
export const jobFormSchema = z.object({
  title: sanitizedString.pipe(
    z.string()
      .min(1, { message: "Title is required" })
      .max(200, { message: "Title must be less than 200 characters" })
  ),
  description: sanitizedString.pipe(
    z.string()
      .max(5000, { message: "Description must be less than 5000 characters" })
  ),
  location: sanitizedString.pipe(
    z.string()
      .max(500, { message: "Location must be less than 500 characters" })
  ),
  status: z.enum(['pending', 'in progress', 'completed', 'cancelled']),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().optional(),
  budget: z.string().optional().transform(val => val ? parseFloat(val) : null),
  clientId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const fieldReportSchema = z.object({
  reportDate: z.string().min(1, { message: "Report date is required" }),
  jobId: z.string().optional(),
  employeeId: z.string().optional(),
  weatherConditions: sanitizedString.pipe(
    z.string()
      .max(100, { message: "Weather conditions must be less than 100 characters" })
  ),
  temperature: z.string().optional().transform(val => val ? parseFloat(val) : null),
  workPerformed: sanitizedString.pipe(
    z.string()
      .min(1, { message: "Work performed is required" })
      .max(5000, { message: "Work performed must be less than 5000 characters" })
  ),
  hoursWorked: z.string().optional().transform(val => val ? parseFloat(val) : null),
  progressPercentage: z.string().optional().transform(val => {
    if (!val) return null;
    const num = parseInt(val);
    if (num < 0 || num > 100) throw new Error("Progress must be between 0 and 100");
    return num;
  }),
  issuesEncountered: sanitizedString.pipe(
    z.string()
      .max(2000, { message: "Issues must be less than 2000 characters" })
  ),
  safetyNotes: sanitizedString.pipe(
    z.string()
      .max(2000, { message: "Safety notes must be less than 2000 characters" })
  ),
});

export const safetyIncidentSchema = z.object({
  incidentDate: z.string().min(1, { message: "Incident date is required" }),
  employeeId: z.string().optional(),
  jobId: z.string().optional(),
  incidentType: sanitizedString.pipe(
    z.string()
      .min(1, { message: "Incident type is required" })
      .max(100, { message: "Incident type must be less than 100 characters" })
  ),
  description: sanitizedString.pipe(
    z.string()
      .min(1, { message: "Description is required" })
      .max(5000, { message: "Description must be less than 5000 characters" })
  ),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: sanitizedString.pipe(
    z.string()
      .max(500, { message: "Location must be less than 500 characters" })
  ).optional(),
  immediateAction: sanitizedString.pipe(
    z.string()
      .max(2000, { message: "Actions taken must be less than 2000 characters" })
  ).optional(),
});

export const timeEntrySchema = z.object({
  employeeId: z.string().min(1, { message: "Employee is required" }),
  jobId: z.string().optional(),
  notes: sanitizedString.pipe(
    z.string()
      .max(2000, { message: "Notes must be less than 2000 characters" })
  ).optional(),
});

export const equipmentAssignmentSchema = z.object({
  assetType: sanitizedString.pipe(
    z.string()
      .min(1, { message: "Equipment type is required" })
      .max(100, { message: "Equipment type must be less than 100 characters" })
  ),
  assignedTo: z.string().min(1, { message: "Employee assignment is required" }),
  jobId: z.string().optional(),
  conditionOut: z.string().optional(),
  notes: sanitizedString.pipe(
    z.string()
      .max(2000, { message: "Notes must be less than 2000 characters" })
  ).optional(),
});

export const clientSchema = z.object({
  name: sanitizedString.pipe(
    z.string()
      .min(1, { message: "Name is required" })
      .max(200, { message: "Name must be less than 200 characters" })
  ),
  email: sanitizedString.pipe(
    z.string()
      .email({ message: "Invalid email address" })
      .max(254, { message: "Email must be less than 254 characters" })
  ),
  phone: sanitizedString.pipe(
    z.string()
      .max(20, { message: "Phone must be less than 20 characters" })
      .regex(/^\+?[\d\s\-\(\)]{10,}$/, { message: "Invalid phone number format" })
  ).optional(),
  address: sanitizedString.pipe(
    z.string()
      .max(500, { message: "Address must be less than 500 characters" })
  ).optional(),
  notes: sanitizedString.pipe(
    z.string()
      .max(2000, { message: "Notes must be less than 2000 characters" })
  ).optional(),
});

export const employeeSchema = z.object({
  firstName: sanitizedString.pipe(
    z.string()
      .min(1, { message: "First name is required" })
      .max(100, { message: "First name must be less than 100 characters" })
  ),
  lastName: sanitizedString.pipe(
    z.string()
      .min(1, { message: "Last name is required" })
      .max(100, { message: "Last name must be less than 100 characters" })
  ),
  email: sanitizedString.pipe(
    z.string()
      .email({ message: "Invalid email address" })
      .max(254, { message: "Email must be less than 254 characters" })
  ),
  phone: sanitizedString.pipe(
    z.string()
      .max(20, { message: "Phone must be less than 20 characters" })
      .regex(/^\+?[\d\s\-\(\)]{10,}$/, { message: "Invalid phone number format" })
  ).optional(),
  position: sanitizedString.pipe(
    z.string()
      .max(100, { message: "Position must be less than 100 characters" })
  ).optional(),
  hireDate: z.string().optional(),
  hourlyRate: z.string().optional().transform(val => val ? parseFloat(val) : null),
});

// Helper function to validate and return errors in a user-friendly format
export const validateFormData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      return { success: false, errors };
    }
    return { 
      success: false, 
      errors: { _general: 'Validation failed. Please check your input.' } 
    };
  }
};

// Type exports for TypeScript consumers
export type JobFormData = z.infer<typeof jobFormSchema>;
export type FieldReportData = z.infer<typeof fieldReportSchema>;
export type SafetyIncidentData = z.infer<typeof safetyIncidentSchema>;
export type ClientData = z.infer<typeof clientSchema>;
export type EmployeeData = z.infer<typeof employeeSchema>;
export type TimeEntryData = z.infer<typeof timeEntrySchema>;
export type EquipmentAssignmentData = z.infer<typeof equipmentAssignmentSchema>;
