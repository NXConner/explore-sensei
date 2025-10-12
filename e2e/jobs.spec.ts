import { test, expect } from '@playwright/test';

test.describe('Jobs Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display jobs list', async ({ page }) => {
    await page.click('text=Jobs');
    await expect(page.locator('h2')).toContainText('Jobs Management');
    await expect(page.locator('[data-testid="jobs-list"]')).toBeVisible();
  });

  test('should create a new job', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('button[data-testid="create-job-button"]');

    // Fill job form
    await page.fill('input[name="title"]', 'Test Church Parking Lot');
    await page.fill('textarea[name="description"]', 'Sealcoating and line striping for church parking lot');
    await page.selectOption('select[name="client_id"]', 'church-client-1');
    await page.selectOption('select[name="priority"]', 'high');
    await page.fill('input[name="estimated_cost"]', '5000');
    await page.fill('input[name="start_date"]', '2024-02-01');
    await page.fill('input[name="end_date"]', '2024-02-03');

    // Select church-specific template
    await page.click('input[value="church_parking"]');

    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Job created successfully')).toBeVisible();
    
    // Should appear in jobs list
    await expect(page.locator('text=Test Church Parking Lot')).toBeVisible();
  });

  test('should edit an existing job', async ({ page }) => {
    await page.click('text=Jobs');
    
    // Click edit button on first job
    await page.click('[data-testid="job-card"]:first-child button[data-testid="edit-button"]');
    
    // Update job title
    await page.fill('input[name="title"]', 'Updated Church Parking Lot');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Job updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated Church Parking Lot')).toBeVisible();
  });

  test('should filter jobs by status', async ({ page }) => {
    await page.click('text=Jobs');
    
    // Filter by active jobs
    await page.selectOption('select[data-testid="status-filter"]', 'active');
    
    // Should only show active jobs
    const jobCards = page.locator('[data-testid="job-card"]');
    const count = await jobCards.count();
    
    for (let i = 0; i < count; i++) {
      await expect(jobCards.nth(i).locator('[data-testid="status-badge"]')).toContainText('Active');
    }
  });

  test('should search jobs by title', async ({ page }) => {
    await page.click('text=Jobs');
    
    // Search for specific job
    await page.fill('input[data-testid="search-input"]', 'Church');
    
    // Should only show jobs containing "Church"
    const jobCards = page.locator('[data-testid="job-card"]');
    const count = await jobCards.count();
    
    for (let i = 0; i < count; i++) {
      await expect(jobCards.nth(i)).toContainText('Church');
    }
  });

  test('should view job details', async ({ page }) => {
    await page.click('text=Jobs');
    
    // Click on first job card
    await page.click('[data-testid="job-card"]:first-child');
    
    // Should show job details modal
    await expect(page.locator('[data-testid="job-details-modal"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Job Details');
  });

  test('should assign employees to job', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('[data-testid="job-card"]:first-child');
    
    // Click assign employees button
    await page.click('button[data-testid="assign-employees-button"]');
    
    // Select employees
    await page.check('input[value="employee-1"]');
    await page.check('input[value="employee-2"]');
    
    await page.click('button[data-testid="confirm-assignment"]');
    
    await expect(page.locator('text=Employees assigned successfully')).toBeVisible();
  });

  test('should update job status', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('[data-testid="job-card"]:first-child');
    
    // Change status to in progress
    await page.selectOption('select[data-testid="status-select"]', 'in_progress');
    await page.click('button[data-testid="update-status"]');
    
    await expect(page.locator('text=Status updated successfully')).toBeVisible();
  });

  test('should delete a job', async ({ page }) => {
    await page.click('text=Jobs');
    
    // Get initial job count
    const initialCount = await page.locator('[data-testid="job-card"]').count();
    
    // Delete first job
    await page.click('[data-testid="job-card"]:first-child button[data-testid="delete-button"]');
    await page.click('button[data-testid="confirm-delete"]');
    
    // Should have one less job
    await expect(page.locator('[data-testid="job-card"]')).toHaveCount(initialCount - 1);
    await expect(page.locator('text=Job deleted successfully')).toBeVisible();
  });

  test('should use church-specific templates', async ({ page }) => {
    await page.click('text=Jobs');
    await page.click('button[data-testid="create-job-button"]');
    
    // Select church template
    await page.click('input[value="church_parking"]');
    
    // Should show church-specific fields
    await expect(page.locator('input[name="parking_spaces"]')).toBeVisible();
    await expect(page.locator('input[name="line_striping"]')).toBeVisible();
    await expect(page.locator('input[name="sealcoating"]')).toBeVisible();
    
    // Fill church-specific form
    await page.fill('input[name="title"]', 'St. Mary\'s Church Parking Lot');
    await page.fill('input[name="parking_spaces"]', '50');
    await page.check('input[name="line_striping"]');
    await page.check('input[name="sealcoating"]');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Job created successfully')).toBeVisible();
  });
});
