/**
 * Smoke tests for all 5 creates against the live PostalDataPI production API.
 * Uses the demo HN API key (capped balance; safe for CI).
 */
import { describe, expect, it } from 'vitest';
import zapier from 'zapier-platform-core';

import App from '../index.js';

const appTester = zapier.createAppTester(App);
const DEMO_KEY = process.env.DEMO_API_KEY || 'demo_hn_postaldatapi';
const auth = { authData: { apiKey: DEMO_KEY } };

describe('lookupPostalCode (Create)', () => {
  it('looks up 90210 / US', async () => {
    const result = await appTester(App.creates!.lookupPostalCode.operation.perform, {
      ...auth,
      inputData: { postalCode: '90210', countryCode: 'US' },
    });
    expect(result.city).toBe('Beverly Hills');
    expect(result.id).toBe('90210|US');
  });

  it('looks up SW1A 1AA / GB and falls back to outcode', async () => {
    const result = await appTester(App.creates!.lookupPostalCode.operation.perform, {
      ...auth,
      inputData: { postalCode: 'SW1A 1AA', countryCode: 'GB' },
    });
    expect(result).toBeDefined();
    expect(result.id).toBe('SW1A 1AA|GB');
  });
});

describe('validatePostalCode (Create)', () => {
  it('validates a real US ZIP', async () => {
    const result = await appTester(App.creates!.validatePostalCode.operation.perform, {
      ...auth,
      inputData: { postalCode: '10001', countryCode: 'US' },
    });
    expect(result.valid).toBe(true);
  });
});

describe('validateBulkPostalCodes (Create — wrapper return shape)', () => {
  it('handles line-item input shape', async () => {
    const result = await appTester(App.creates!.validateBulkPostalCodes.operation.perform, {
      ...auth,
      inputData: {
        postalCodes: ['90210', 'FOO99', '12345'],
        countryCodes: ['US', 'US', 'ZZ'],
      },
    });
    expect(result.totalRecords).toBe(3);
    expect(result.validCount).toBe(1);
    expect(result.invalidCount).toBe(2);
    expect(result.results).toHaveLength(3);
    expect(result.results[0].valid).toBe(true);
    expect(result.results[1].valid).toBe(false);
    expect(result.results[1].reason).toBe('not_found');
    expect(result.results[2].valid).toBe(false);
    expect(result.results[2].reason).toBe('unknown_country');
    expect(result.totalCost).toBeGreaterThan(0);
    expect(typeof result.balance).toBe('number');
  });

  it('handles CSV input shape', async () => {
    const result = await appTester(App.creates!.validateBulkPostalCodes.operation.perform, {
      ...auth,
      inputData: {
        recordsCsv: '90210,US\nSW1A 1AA,GB\n10115,DE',
      },
    });
    expect(result.totalRecords).toBe(3);
    expect(result.validCount).toBe(3);
    expect(result.results.every((r: { valid: boolean }) => r.valid)).toBe(true);
    const gb = result.results.find((r: { countryCode: string }) => r.countryCode === 'GB');
    expect(gb?.normalized).toBe('SW1A');
  });

  it('rejects mismatched line-item lengths', async () => {
    try {
      await appTester(App.creates!.validateBulkPostalCodes.operation.perform, {
        ...auth,
        inputData: {
          postalCodes: ['90210', '10001'],
          countryCodes: ['US'],
        },
      });
    } catch (err: unknown) {
      expect((err as Error).message).toMatch(/counts must match/);
      return;
    }
    throw new Error('Expected length-mismatch to throw');
  });
});

describe('searchByCity (Create — wrapper return shape)', () => {
  it('finds Beverly Hills postal codes (US, ST = CA)', async () => {
    const result = await appTester(App.creates!.searchByCity.operation.perform, {
      ...auth,
      inputData: { city: 'Beverly Hills', state: 'CA', countryCode: 'US' },
    });
    expect(result.totalResults).toBeGreaterThan(0);
    expect(result.results.length).toBe(result.totalResults);
    expect(result.results.some((r: { postalCode: string }) => r.postalCode === '90210')).toBe(true);
    expect(result.countryCode).toBe('US');
  });
});

describe('getPostalCodeMetadata (Create)', () => {
  it('returns rich metadata for 90210', async () => {
    const result = await appTester(App.creates!.getPostalCodeMetadata.operation.perform, {
      ...auth,
      inputData: { postalCode: '90210', countryCode: 'US' },
    });
    expect(result.state).toBe('California');
    expect(result.latitude).toBeTypeOf('number');
    expect(result.timezone).toContain('America/');
  });
});
