/**
 * Comprehensive Monitoring and Observability System for Explore Sensei
 * Supports both Virginia and North Carolina operations
 */

// Browser-compatible performance API
const performanceAPI = typeof window !== 'undefined' ? window.performance : performance;

// Types for monitoring
export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
  unit?: string;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'log';
  dataSource: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, MetricData[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'milliseconds');
    };
  }

  recordMetric(name: string, value: number, unit: string = 'count', tags?: Record<string, string>): void {
    const metric: MetricData = {
      name,
      value,
      timestamp: new Date(),
      unit,
      tags
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);

    // Keep only last 1000 entries per metric
    const entries = this.metrics.get(name)!;
    if (entries.length > 1000) {
      entries.splice(0, entries.length - 1000);
    }
  }

  getMetrics(name?: string): MetricData[] {
    if (name) {
      return this.metrics.get(name) || [];
    }
    
    const allMetrics: MetricData[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    return allMetrics;
  }

  getAverageMetric(name: string, timeWindowMs: number = 300000): number {
    const entries = this.metrics.get(name) || [];
    const cutoff = new Date(Date.now() - timeWindowMs);
    const recentEntries = entries.filter(entry => entry.timestamp > cutoff);
    
    if (recentEntries.length === 0) return 0;
    
    const sum = recentEntries.reduce((acc, entry) => acc + entry.value, 0);
    return sum / recentEntries.length;
  }

  getMetricPercentile(name: string, percentile: number, timeWindowMs: number = 300000): number {
    const entries = this.metrics.get(name) || [];
    const cutoff = new Date(Date.now() - timeWindowMs);
    const recentEntries = entries.filter(entry => entry.timestamp > cutoff);
    
    if (recentEntries.length === 0) return 0;
    
    const sorted = recentEntries.map(entry => entry.value).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
}

// Structured logging
export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;
  private externalSinkUrl: string | null = null;
  private externalAuthKey: string | null = null;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogEntry['level'], message: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId()
    };

    this.logs.push(logEntry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(0, this.logs.length - this.maxLogs);
    }

    // Console output only in development; in production, optionally send to external sink
    if (import.meta.env?.DEV) {
      const prefix = `[${logEntry.timestamp.toISOString()}] [${level.toUpperCase()}]`;
      try {
        // eslint-disable-next-line no-console
        console.log(`${prefix} ${message}`, this.sanitizeContext(context) || '');
      } catch {}
    }

    // In production, forward to external sink if configured
    if (import.meta.env?.PROD) {
      try {
        // Read once lazily
        if (this.externalSinkUrl == null) {
          const raw = (import.meta as any)?.env?.VITE_LOG_SINK_URL as string | undefined;
          this.externalSinkUrl = raw && String(raw).trim() ? String(raw).trim() : null;
        }
        if (this.externalAuthKey == null) {
          const raw = (import.meta as any)?.env?.VITE_LOG_SINK_KEY as string | undefined;
          this.externalAuthKey = raw && String(raw).trim() ? String(raw).trim() : null;
        }
        if (this.externalSinkUrl) {
          // Fire-and-forget; avoid blocking UI
          fetch(this.externalSinkUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(this.externalAuthKey ? { Authorization: `Bearer ${this.externalAuthKey}` } : {}),
            },
            body: JSON.stringify({
              level: logEntry.level,
              message: logEntry.message,
              timestamp: logEntry.timestamp.toISOString(),
              context: this.sanitizeContext(logEntry.context),
              traceId: logEntry.traceId,
              spanId: logEntry.spanId,
            }),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {}
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;
    try {
      const clone = JSON.parse(JSON.stringify(context));
      const redactKeys = ['password', 'token', 'authorization', 'auth', 'key', 'secret'];
      const redact = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const k of Object.keys(obj)) {
          if (redactKeys.includes(k.toLowerCase())) {
            obj[k] = '[REDACTED]';
          } else if (typeof obj[k] === 'object') {
            redact(obj[k]);
          }
        }
      };
      redact(clone);
      return clone;
    } catch {
      return undefined;
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  fatal(message: string, context?: Record<string, any>): void {
    this.log('fatal', message, context);
  }

  getLogs(level?: LogEntry['level'], timeWindowMs?: number): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    if (timeWindowMs) {
      const cutoff = new Date(Date.now() - timeWindowMs);
      filtered = filtered.filter(log => log.timestamp > cutoff);
    }

    return filtered;
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateSpanId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Error tracking
export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Array<{
    error: Error;
    timestamp: Date;
    context?: Record<string, any>;
    userId?: string;
    sessionId?: string;
  }> = [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  trackError(error: Error, context?: Record<string, any>, userId?: string, sessionId?: string): void {
    this.errors.push({
      error,
      timestamp: new Date(),
      context,
      userId,
      sessionId
    });

    // Log to console in development
    if (import.meta.env?.DEV) {
      try {
        // eslint-disable-next-line no-console
        console.error('Error tracked:', error, context ?? {});
      } catch {}
    }
  }

  getErrors(timeWindowMs?: number): Array<{
    error: Error;
    timestamp: Date;
    context?: Record<string, any>;
    userId?: string;
    sessionId?: string;
  }> {
    if (!timeWindowMs) return this.errors;

    const cutoff = new Date(Date.now() - timeWindowMs);
    return this.errors.filter(entry => entry.timestamp > cutoff);
  }

  getErrorRate(timeWindowMs: number = 300000): number {
    const cutoff = new Date(Date.now() - timeWindowMs);
    const recentErrors = this.errors.filter(entry => entry.timestamp > cutoff);
    return recentErrors.length / (timeWindowMs / 1000 / 60); // errors per minute
  }
}

// Health checks
export class HealthChecker {
  private static instance: HealthChecker;
  private checks: Map<string, () => Promise<boolean>> = new Map();

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  addCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.checks.set(name, checkFn);
  }

  async runAllChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [name, checkFn] of this.checks) {
      try {
        results[name] = await checkFn();
      } catch (error) {
        results[name] = false;
        Logger.getInstance().error(`Health check failed: ${name}`, { error });
      }
    }
    
    return results;
  }

  async getOverallHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: Date;
  }> {
    const checks = await this.runAllChecks();
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (passedChecks === totalChecks) {
      status = 'healthy';
    } else if (passedChecks >= totalChecks * 0.5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return {
      status,
      checks,
      timestamp: new Date()
    };
  }
}

// Alerting system
export class AlertManager {
  private static instance: AlertManager;
  private rules: Map<string, AlertRule> = new Map();
  private notifications: Array<{
    id: string;
    ruleId: string;
    message: string;
    severity: string;
    timestamp: Date;
    resolved: boolean;
  }> = [];

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  checkAlerts(metrics: MetricData[]): void {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const relevantMetrics = metrics.filter(m => m.name === rule.condition);
      if (relevantMetrics.length === 0) continue;

      const latestMetric = relevantMetrics[relevantMetrics.length - 1];
      if (latestMetric.value > rule.threshold) {
        this.triggerAlert(rule, latestMetric);
      }
    }
  }

  private triggerAlert(rule: AlertRule, metric: MetricData): void {
    const notification = {
      id: Math.random().toString(36).substring(2, 15),
      ruleId: rule.id,
      message: `Alert: ${rule.name} - ${metric.name} is ${metric.value} (threshold: ${rule.threshold})`,
      severity: rule.severity,
      timestamp: new Date(),
      resolved: false
    };

    this.notifications.push(notification);

    // Send notifications to configured channels
    for (const channel of rule.notificationChannels) {
      this.sendNotification(channel, notification);
    }
  }

  private sendNotification(channel: string, notification: any): void {
    // In a real implementation, this would integrate with notification services
    if (import.meta.env?.DEV) {
      try {
        // eslint-disable-next-line no-console
        console.log(`Sending notification to ${channel}:`, notification.message);
      } catch {}
    }
  }

  getActiveAlerts(): Array<{
    id: string;
    ruleId: string;
    message: string;
    severity: string;
    timestamp: Date;
    resolved: boolean;
  }> {
    return this.notifications.filter(n => !n.resolved);
  }

  resolveAlert(alertId: string): void {
    const alert = this.notifications.find(n => n.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }
}

// Dashboard management
export class DashboardManager {
  private static instance: DashboardManager;
  private dashboards: Map<string, {
    id: string;
    name: string;
    widgets: DashboardWidget[];
    createdAt: Date;
    updatedAt: Date;
  }> = new Map();

  static getInstance(): DashboardManager {
    if (!DashboardManager.instance) {
      DashboardManager.instance = new DashboardManager();
    }
    return DashboardManager.instance;
  }

  createDashboard(id: string, name: string, widgets: DashboardWidget[] = []): void {
    this.dashboards.set(id, {
      id,
      name,
      widgets,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  addWidget(dashboardId: string, widget: DashboardWidget): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      dashboard.widgets.push(widget);
      dashboard.updatedAt = new Date();
    }
  }

  getDashboard(dashboardId: string): any {
    return this.dashboards.get(dashboardId);
  }

  getAllDashboards(): any[] {
    return Array.from(this.dashboards.values());
  }
}

// Business metrics for Virginia and North Carolina
export class BusinessMetrics {
  private static instance: BusinessMetrics;
  private performanceMonitor = PerformanceMonitor.getInstance();
  private logger = Logger.getInstance();

  static getInstance(): BusinessMetrics {
    if (!BusinessMetrics.instance) {
      BusinessMetrics.instance = new BusinessMetrics();
    }
    return BusinessMetrics.instance;
  }

  // Track job completion rates by state
  trackJobCompletion(jobId: string, state: 'VA' | 'NC', duration: number, cost: number): void {
    this.performanceMonitor.recordMetric('job_completion_rate', 1, 'count', { state });
    this.performanceMonitor.recordMetric('job_duration', duration, 'hours', { state, jobId });
    this.performanceMonitor.recordMetric('job_cost', cost, 'dollars', { state, jobId });
    
    this.logger.info('Job completed', { jobId, state, duration, cost });
  }

  // Track church jobs specifically
  trackChurchJob(jobId: string, churchType: string, satisfaction: number): void {
    this.performanceMonitor.recordMetric('church_job_satisfaction', satisfaction, 'rating', { churchType, jobId });
    this.performanceMonitor.recordMetric('church_jobs_completed', 1, 'count', { churchType });
    
    this.logger.info('Church job completed', { jobId, churchType, satisfaction });
  }

  // Track veteran-owned business metrics
  trackVeteranBusinessMetrics(metric: string, value: number, context?: Record<string, any>): void {
    this.performanceMonitor.recordMetric(`veteran_business_${metric}`, value, 'count', context);
    this.logger.info('Veteran business metric tracked', { metric, value, context });
  }

  // Track compliance metrics for both states
  trackCompliance(state: 'VA' | 'NC', requirement: string, status: 'compliant' | 'non_compliant'): void {
    this.performanceMonitor.recordMetric('compliance_status', status === 'compliant' ? 1 : 0, 'boolean', { state, requirement });
    this.logger.info('Compliance status tracked', { state, requirement, status });
  }

  // Get business performance summary
  getBusinessSummary(timeWindowMs: number = 2592000000): { // 30 days
    va: {
      jobsCompleted: number;
      averageDuration: number;
      totalRevenue: number;
      complianceRate: number;
    };
    nc: {
      jobsCompleted: number;
      averageDuration: number;
      totalRevenue: number;
      complianceRate: number;
    };
    churchJobs: {
      completed: number;
      averageSatisfaction: number;
    };
    veteranBusiness: {
      certifications: number;
      complianceRate: number;
    };
  } {
    const vaJobs = this.performanceMonitor.getMetrics('job_completion_rate')
      .filter(m => m.tags?.state === 'VA' && m.timestamp > new Date(Date.now() - timeWindowMs));
    
    const ncJobs = this.performanceMonitor.getMetrics('job_completion_rate')
      .filter(m => m.tags?.state === 'NC' && m.timestamp > new Date(Date.now() - timeWindowMs));
    
    const vaDuration = this.performanceMonitor.getAverageMetric('job_duration', timeWindowMs);
    const ncDuration = this.performanceMonitor.getAverageMetric('job_duration', timeWindowMs);
    
    const vaRevenue = this.performanceMonitor.getMetrics('job_cost')
      .filter(m => m.tags?.state === 'VA' && m.timestamp > new Date(Date.now() - timeWindowMs))
      .reduce((sum, m) => sum + m.value, 0);
    
    const ncRevenue = this.performanceMonitor.getMetrics('job_cost')
      .filter(m => m.tags?.state === 'NC' && m.timestamp > new Date(Date.now() - timeWindowMs))
      .reduce((sum, m) => sum + m.value, 0);
    
    const churchJobs = this.performanceMonitor.getMetrics('church_jobs_completed')
      .filter(m => m.timestamp > new Date(Date.now() - timeWindowMs));
    
    const churchSatisfaction = this.performanceMonitor.getAverageMetric('church_job_satisfaction', timeWindowMs);
    
    return {
      va: {
        jobsCompleted: vaJobs.length,
        averageDuration: vaDuration,
        totalRevenue: vaRevenue,
        complianceRate: 0.95 // This would be calculated from compliance metrics
      },
      nc: {
        jobsCompleted: ncJobs.length,
        averageDuration: ncDuration,
        totalRevenue: ncRevenue,
        complianceRate: 0.92 // This would be calculated from compliance metrics
      },
      churchJobs: {
        completed: churchJobs.length,
        averageSatisfaction: churchSatisfaction
      },
      veteranBusiness: {
        certifications: 4, // VA Class C, NC Limited, NC Intermediate, etc.
        complianceRate: 0.98
      }
    };
  }
}

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance();
export const logger = Logger.getInstance();
export const errorTracker = ErrorTracker.getInstance();
export const healthChecker = HealthChecker.getInstance();
export const alertManager = AlertManager.getInstance();
export const dashboardManager = DashboardManager.getInstance();
export const businessMetrics = BusinessMetrics.getInstance();

// Initialize default health checks
healthChecker.addCheck('database', async () => {
  // Check database connectivity
  try {
    // This would be a real database health check
    return true;
  } catch {
    return false;
  }
});

healthChecker.addCheck('api', async () => {
  // Check API responsiveness
  try {
    // This would be a real API health check
    return true;
  } catch {
    return false;
  }
});

// Initialize default alert rules
alertManager.addRule({
  id: 'high_error_rate',
  name: 'High Error Rate',
  condition: 'error_rate',
  threshold: 0.05, // 5%
  severity: 'high',
  enabled: true,
  notificationChannels: ['email', 'slack']
});

alertManager.addRule({
  id: 'slow_response',
  name: 'Slow Response Time',
  condition: 'response_time',
  threshold: 2000, // 2 seconds
  severity: 'medium',
  enabled: true,
  notificationChannels: ['email']
});

// Initialize default dashboard
dashboardManager.createDashboard('main', 'Main Dashboard', [
  {
    id: 'system_health',
    title: 'System Health',
    type: 'metric',
    dataSource: 'health_checks',
    config: { metric: 'overall_health' },
    position: { x: 0, y: 0, w: 6, h: 4 }
  },
  {
    id: 'error_rate',
    title: 'Error Rate',
    type: 'chart',
    dataSource: 'error_metrics',
    config: { type: 'line', metric: 'error_rate' },
    position: { x: 6, y: 0, w: 6, h: 4 }
  },
  {
    id: 'business_metrics',
    title: 'Business Metrics',
    type: 'table',
    dataSource: 'business_metrics',
    config: { metrics: ['va_jobs', 'nc_jobs', 'church_jobs'] },
    position: { x: 0, y: 4, w: 12, h: 6 }
  }
]);

export default {
  performanceMonitor,
  logger,
  errorTracker,
  healthChecker,
  alertManager,
  dashboardManager,
  businessMetrics
};
