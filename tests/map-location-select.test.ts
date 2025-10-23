import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('map-location-selected event', () => {
  const listeners: Array<(e: any) => void> = [];
  const addEventListenerOrig = window.addEventListener;
  const removeEventListenerOrig = window.removeEventListener;

  beforeEach(() => {
    // shim event handling
    (window as any).addEventListener = (type: string, cb: any) => {
      if (type === 'map-location-selected') listeners.push(cb);
      return addEventListenerOrig.call(window, type, cb);
    };
    (window as any).removeEventListener = (type: string, cb: any) => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
      return removeEventListenerOrig.call(window, type, cb);
    };
  });

  afterEach(() => {
    (window as any).addEventListener = addEventListenerOrig as any;
    (window as any).removeEventListener = removeEventListenerOrig as any;
    listeners.length = 0;
  });

  it('broadcast payload shape is consistent', async () => {
    const payloads: any[] = [];
    const handler = (e: any) => payloads.push(e.detail);
    window.addEventListener('map-location-selected', handler as any);
    const detail = { lat: 36.1, lng: -80.3, address: '123 Main St, Testville', provider: 'google', placeId: 'abc' };
    window.dispatchEvent(new CustomEvent('map-location-selected', { detail }));

    expect(payloads.length).toBe(1);
    expect(typeof payloads[0].lat).toBe('number');
    expect(typeof payloads[0].lng).toBe('number');
    expect(typeof payloads[0].address).toBe('string');
  });
});
