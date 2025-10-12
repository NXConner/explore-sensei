import { describe, it, expect } from 'vitest';
import { computeEffectiveRole, type AppRole } from '@/hooks/useUserRole';

describe('computeEffectiveRole', () => {
  it('returns null for empty roles', () => {
    expect(computeEffectiveRole([])).toBeNull();
  });

  it('respects precedence: Super Administrator highest', () => {
    const roles: AppRole[] = ['Viewer', 'Operator', 'Manager', 'Administrator', 'Super Administrator'];
    expect(computeEffectiveRole(roles)).toBe('Super Administrator');
  });

  it('prefers Administrator over Manager', () => {
    const roles: AppRole[] = ['Manager', 'Administrator'];
    expect(computeEffectiveRole(roles)).toBe('Administrator');
  });

  it('prefers Manager over Operator', () => {
    const roles: AppRole[] = ['Operator', 'Manager'];
    expect(computeEffectiveRole(roles)).toBe('Manager');
  });

  it('returns the only role when single entry', () => {
    const roles: AppRole[] = ['Viewer'];
    expect(computeEffectiveRole(roles)).toBe('Viewer');
  });
});
