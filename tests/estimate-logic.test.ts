import { describe, it, expect } from 'vitest';
import { autoPopulateEstimate } from '@/lib/estimateLogic';

describe('autoPopulateEstimate', () => {
  it('computes sealcoat mix quantities with defaults', () => {
    const res = autoPopulateEstimate({
      services: { sealcoat: true, crackfill: false, patching: false, striping: false },
      areaSqFt: 7500,
      overheadPercent: 10,
      profitPercent: 20,
      taxRatePercent: 8,
    });

    const pmm = res.lineItems.find(li => li.item_code === 'SEAL-PMM');
    const sand = res.lineItems.find(li => li.item_code === 'SAND-50LB');
    const water = res.lineItems.find(li => li.item_code === 'WATER');
    expect(pmm?.quantity).toBeGreaterThan(0);
    expect(sand?.quantity).toBeGreaterThan(0);
    expect(water?.quantity).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
  });

  it('adds crackfill items when LF provided', () => {
    const res = autoPopulateEstimate({
      services: { sealcoat: false, crackfill: true, patching: false, striping: false },
      linearFeetCracks: 400,
      overheadPercent: 0,
      profitPercent: 0,
      taxRatePercent: 0,
    });
    const crackMat = res.lineItems.find(li => li.item_code === 'CRACK-MAT');
    expect(crackMat?.quantity).toBeGreaterThan(0);
  });

  it('uses explicit patch area when provided', () => {
    const res = autoPopulateEstimate({
      services: { sealcoat: false, crackfill: false, patching: true, striping: false },
      patchAreaSqFt: 200,
      overheadPercent: 0,
      profitPercent: 0,
      taxRatePercent: 0,
    });
    const patchMat = res.lineItems.find(li => li.item_code === 'PATCH-MAT');
    expect(patchMat?.quantity).toBeGreaterThan(0);
  });
});
