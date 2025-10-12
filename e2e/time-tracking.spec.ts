import { test, expect } from '@playwright/test';

test.describe('Time Tracking & Payroll', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should start time tracking', async ({ page }) => {
    await page.click('text=Time Tracking');
    
    // Select a job
    await page.selectOption('select[data-testid="job-select"]', 'job-1');
    
    // Start tracking
    await page.click('button[data-testid="start-tracking"]');
    
    // Should show tracking started
    await expect(page.locator('text=Time tracking started')).toBeVisible();
    await expect(page.locator('[data-testid="tracking-status"]')).toContainText('Active');
    
    // Should show start time
    await expect(page.locator('[data-testid="start-time"]')).toBeVisible();
  });

  test('should pause and resume time tracking', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.selectOption('select[data-testid="job-select"]', 'job-1');
    await page.click('button[data-testid="start-tracking"]');
    
    // Pause tracking
    await page.click('button[data-testid="pause-tracking"]');
    await expect(page.locator('text=Time tracking paused')).toBeVisible();
    await expect(page.locator('[data-testid="tracking-status"]')).toContainText('Paused');
    
    // Resume tracking
    await page.click('button[data-testid="resume-tracking"]');
    await expect(page.locator('text=Time tracking resumed')).toBeVisible();
    await expect(page.locator('[data-testid="tracking-status"]')).toContainText('Active');
  });

  test('should stop time tracking', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.selectOption('select[data-testid="job-select"]', 'job-1');
    await page.click('button[data-testid="start-tracking"]');
    
    // Wait a moment
    await page.waitForTimeout(1000);
    
    // Stop tracking
    await page.click('button[data-testid="stop-tracking"]');
    
    // Should show time entry form
    await expect(page.locator('[data-testid="time-entry-form"]')).toBeVisible();
    await expect(page.locator('input[name="hours_worked"]')).toBeVisible();
  });

  test('should submit time entry for approval', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.selectOption('select[data-testid="job-select"]', 'job-1');
    await page.click('button[data-testid="start-tracking"]');
    await page.waitForTimeout(1000);
    await page.click('button[data-testid="stop-tracking"]');
    
    // Fill time entry form
    await page.fill('textarea[name="notes"]', 'Completed sealcoating work');
    await page.click('button[data-testid="submit-time-entry"]');
    
    await expect(page.locator('text=Time entry submitted for approval')).toBeVisible();
  });

  test('should show GPS location verification', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.selectOption('select[data-testid="job-select"]', 'job-1');
    await page.click('button[data-testid="start-tracking"]');
    
    // Should show GPS location
    await expect(page.locator('[data-testid="gps-location"]')).toBeVisible();
    await expect(page.locator('[data-testid="location-verified"]')).toBeVisible();
  });

  test('should display time entries list', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.click('text=Time Entries');
    
    await expect(page.locator('[data-testid="time-entries-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-entry-card"]')).toBeVisible();
  });

  test('should filter time entries by status', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.click('text=Time Entries');
    
    // Filter by pending approval
    await page.selectOption('select[data-testid="status-filter"]', 'pending_approval');
    
    const timeEntryCards = page.locator('[data-testid="time-entry-card"]');
    const count = await timeEntryCards.count();
    
    for (let i = 0; i < count; i++) {
      await expect(timeEntryCards.nth(i).locator('[data-testid="status-badge"]')).toContainText('Pending Approval');
    }
  });

  test('should approve time entry as manager', async ({ page }) => {
    // Login as manager
    await page.goto('/');
    await page.fill('input[type="email"]', 'manager@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.click('text=Time Tracking');
    await page.click('text=Approvals');
    
    // Approve first time entry
    await page.click('[data-testid="time-entry-card"]:first-child button[data-testid="approve-button"]');
    
    await expect(page.locator('text=Time entry approved')).toBeVisible();
  });

  test('should reject time entry with reason', async ({ page }) => {
    // Login as manager
    await page.goto('/');
    await page.fill('input[type="email"]', 'manager@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.click('text=Time Tracking');
    await page.click('text=Approvals');
    
    // Reject time entry
    await page.click('[data-testid="time-entry-card"]:first-child button[data-testid="reject-button"]');
    await page.fill('textarea[name="rejection_reason"]', 'Insufficient GPS verification');
    await page.click('button[data-testid="confirm-reject"]');
    
    await expect(page.locator('text=Time entry rejected')).toBeVisible();
  });

  test('should calculate payroll correctly', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.click('text=Payroll');
    
    // Should show payroll calculations
    await expect(page.locator('[data-testid="payroll-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-hours"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-pay"]')).toBeVisible();
  });

  test('should export payroll report', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.click('text=Payroll');
    
    // Export payroll
    await page.click('button[data-testid="export-payroll"]');
    
    // Should download file
    const downloadPromise = page.waitForEvent('download');
    await page.click('button[data-testid="download-report"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('payroll');
  });

  test('should show break management', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.selectOption('select[data-testid="job-select"]', 'job-1');
    await page.click('button[data-testid="start-tracking"]');
    
    // Start break
    await page.click('button[data-testid="start-break"]');
    await expect(page.locator('text=Break started')).toBeVisible();
    
    // End break
    await page.click('button[data-testid="end-break"]');
    await expect(page.locator('text=Break ended')).toBeVisible();
  });

  test('should track overtime hours', async ({ page }) => {
    await page.click('text=Time Tracking');
    await page.selectOption('select[data-testid="job-select"]', 'job-1');
    await page.click('button[data-testid="start-tracking"]');
    
    // Simulate overtime (8+ hours)
    await page.waitForTimeout(100); // Simulate time passing
    
    // Should show overtime indicator
    await expect(page.locator('[data-testid="overtime-indicator"]')).toBeVisible();
  });
});
