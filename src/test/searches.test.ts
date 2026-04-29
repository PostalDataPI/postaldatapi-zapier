/**
 * Smoke tests for all 5 searches against the live PostalDataPI production API.
 * Uses the demo HN API key (capped balance; safe for CI).
 */
import { describe, expect, it } from 'vitest';
import zapier from 'zapier-platform-core';

import App from '../index.js';

const appTester = zapier.createAppTester(App);
const DEMO_KEY = process.env.DEMO_API_KEY || 'demo_hn_postaldatapi';
const auth = { authData: { apiKey: DEMO_KEY } };

describe('lookupPostalCode', () => {
  it('looks up 90210 / US', async () => {
    const results = await appTester(App.searches!.lookupPostalCode.operation.perform, {
      ...auth,
      inputData: { postalCode: '90210', countryCode: 'US' },
    });
    expect(Array.isArray(results)).toBe(true);
    expect(results[0].city).toBe('Beverly Hills');
  });

  it('looks up SW1A 1AA / GB and falls back to outcode', async () => {
    const results = await appTester(App.searches!.lookupPostalCode.operation.perform, {
      ...auth,
      inputData: { postalCode: 'SW1A 1AA', countryCode: 'GB' },
    });
    expect(results[0]).toBeDefined();
    expect(results[0].id).toBe('SW1A 1AA|GB');
  });
});

describe('validatePostalCode', () => {
  it('validates a real US ZIP', async () => {
    const results = await appTester(App.searches!.validatePostalCode.operation.perform, {
      ...auth,
      inputData: { postalCode: '10001', countryCode: 'US' },
    });
    expect(results[0].valid).toBe(true);
  });
});

describe('validateBulkPostalCodes', () => {
  it('handles line-item input shape', async () => {
    const results = await appTester(App.searches!.validateBulkPostalCodes.operation.perform, {
      ...auth,
      inputData: {
        postalCodes: ['90210', 'FOO99', '12345'],
        countryCodes: ['US', 'US', 'ZZ'],
      },
    });
    expect(results).toHaveLength(3);
    expect(results[0].valid).toBe(true);
    expect(results[1].valid).toBe(false);
    expect(results[1].reason).toBe('not_found');
    expect(results[2].valid).toBe(false);
    expect(results[2].reason).toBe('unknown_country');
  });

  it('handles CSV input shape', async () => {
    const results = await appTester(App.searches!.validateBulkPostalCodes.operation.perform, {
      ...auth,
      inputData: {
        recordsCsv: '90210,US\nSW1A 1AA,GB\n10115,DE',
      },
    });
    expect(results).toHaveLength(3);
    expect(results.every((r: { valid: boolean }) => r.valid)).toBe(true);
    // GB outcode normalization
    const gb = results.find((r: { countryCode: string }) => r.countryCode === 'GB');
    expect(gb?.normalized).toBe('SW1A');
  });

  it('rejects mismatched line-item lengths', async () => {
    try {
      await appTester(App.searches!.validateBulkPostalCodes.operation.perform, {
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

describe('searchByCity', () => {
  it('finds Beverly Hills postal codes (US, ST = CA)', async () => {
    const results = await appTester(App.searches!.searchByCity.operation.perform, {
      ...auth,
      inputData: { city: 'Beverly Hills', state: 'CA', countryCode: 'US' },
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r: { postalCode: string }) => r.postalCode === '90210')).toBe(true);
  });
});

describe('getPostalCodeMetadata', () => {
  it('returns rich metadata for 90210', async () => {
    const results = await appTester(App.searches!.getPostalCodeMetadata.operation.perform, {
      ...auth,
      inputData: { postalCode: '90210', countryCode: 'US' },
    });
    expect(results[0].state).toBe('California');
    expect(results[0].latitude).toBeTypeOf('number');
    expect(results[0].timezone).toContain('America/');
  });
});
