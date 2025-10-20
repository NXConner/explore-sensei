import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { MapEffects } from '@/components/map/MapEffects';
import { SuitabilityOverlay } from '@/components/map/SuitabilityOverlay';

// Note: We don't instantiate Google Maps; these tests are shallow DOM checks

describe('MapEffects props', () => {
  it('renders radar/glitch/scanline toggles without crashing', () => {
    const { container, rerender } = render(
      <MapEffects showRadar showGlitch showScanline radarSpeed={3} radarAudioEnabled={false} radarAudioVolume={0} />
    );
    expect(container).toBeTruthy();
    rerender(<MapEffects showRadar={false} showGlitch={false} showScanline={false} radarSpeed={1} radarAudioEnabled={false} radarAudioVolume={0} />);
    expect(container).toBeTruthy();
  });
});

describe('SuitabilityOverlay thresholds', () => {
  it('accepts thresholds props', () => {
    const map = null as unknown as google.maps.Map;
    const { container } = render(
      <SuitabilityOverlay map={map} enabled={false} tempF={60} humidity={40} precipChance={5} thresholds={{ minTempF: 55, maxTempF: 95, maxHumidity: 70, maxPrecipChance: 20 }} />
    );
    expect(container).toBeTruthy();
  });
});
