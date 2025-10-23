import { describe, it, expect } from 'vitest';
import { mapWeatherAlertRow } from '@/hooks/useWeatherAlerts';

describe('mapWeatherAlertRow', () => {
  it('maps a full row with title and message', () => {
    const row = {
      id: '1',
      type: 'storm',
      severity: 'critical',
      title: 'Severe Storm',
      message: 'High winds expected',
      location: { lat: 36.64, lng: -80.27 },
      radius: 25,
      end_time: new Date(Date.now() + 3600_000).toISOString(),
    };
    const mapped = mapWeatherAlertRow(row);
    expect(mapped.id).toBe('1');
    expect(mapped.type).toBe('storm');
    expect(mapped.severity).toBe('critical');
    expect(mapped.location.lat).toBeCloseTo(36.64);
    expect(mapped.location.lng).toBeCloseTo(-80.27);
    expect(mapped.radius).toBe(25);
    expect(mapped.expires instanceof Date).toBe(true);
    expect(mapped.message).toContain('Severe Storm: High winds expected');
  });

  it('maps a minimal row without title and defaults applied', () => {
    const row = {
      id: '2',
      message: 'Generic alert',
      location: {},
    };
    const mapped = mapWeatherAlertRow(row);
    expect(mapped.id).toBe('2');
    expect(mapped.type).toBe('storm');
    expect(mapped.severity).toBe('medium');
    expect(mapped.location.lat).toBe(0);
    expect(mapped.location.lng).toBe(0);
    expect(mapped.radius).toBe(10);
    expect(mapped.message).toBe('Generic alert');
  });
});
