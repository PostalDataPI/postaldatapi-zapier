import type { ZObject, Bundle, Search } from 'zapier-platform-core';

const PROD_BASE = 'https://postaldatapi.com';

interface BulkRecord {
  postalCode: string;
  countryCode: string;
}

/**
 * Parse the user's bulk input. Zapier line-item inputs come through as
 * arrays. We also accept a JSON string fallback for users who paste a JSON
 * blob directly into a single field — this matters because Zapier's
 * line-items UI is workable but fiddly, and pasting JSON is the simplest
 * "I have a CSV-like list" pattern.
 */
const parseRecords = (bundle: Bundle): BulkRecord[] => {
  const postals = bundle.inputData.postalCodes as string[] | string | undefined;
  const countries = bundle.inputData.countryCodes as string[] | string | undefined;

  // Path A: line-item arrays (Zapier-native shape)
  if (Array.isArray(postals) && Array.isArray(countries)) {
    if (postals.length !== countries.length) {
      throw new Error(
        `Got ${postals.length} postal codes and ${countries.length} country codes — counts must match.`,
      );
    }
    return postals.map((pc, i) => ({
      postalCode: String(pc).trim(),
      countryCode: String(countries[i]).trim().toUpperCase(),
    }));
  }

  // Path B: single string with newline-separated CSV-style "code,country" rows
  const csv = bundle.inputData.recordsCsv as string | undefined;
  if (csv && csv.trim()) {
    return csv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, i) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length < 2 || !parts[0] || !parts[1]) {
          throw new Error(
            `Line ${i + 1} is malformed — expected "postalCode,countryCode" got "${line}"`,
          );
        }
        return {
          postalCode: parts[0],
          countryCode: parts[1].toUpperCase(),
        };
      });
  }

  throw new Error(
    'Provide either parallel Postal Codes / Country Codes line-items, or a CSV block in the "Records (CSV)" field.',
  );
};

const perform = async (z: ZObject, bundle: Bundle) => {
  const records = parseRecords(bundle);
  if (records.length === 0) {
    throw new Error('No records to validate.');
  }
  if (records.length > 1000) {
    throw new Error(
      `Bulk validate accepts up to 1,000 records per request; got ${records.length}. Split into multiple actions.`,
    );
  }

  const response = await z.request({
    url: `${PROD_BASE}/api/validate-bulk`,
    method: 'POST',
    body: { records },
  });
  const data = response.data as Record<string, unknown>;
  // Zapier searches expect an array of result rows. We flatten one row per
  // input record (each with its own id) so users can fan out downstream.
  const results = (data.results as Array<Record<string, unknown>>) ?? [];
  return results.map((r, i) => ({
    ...r,
    id: `${r.postalCode}|${r.countryCode}|${i}`,
    totalCost: data.totalCost,
    balance: data.balance,
  }));
};

export default {
  key: 'validateBulkPostalCodes',
  noun: 'Postal Code',
  display: {
    label: 'Bulk Validate Postal Codes',
    description:
      'Validate up to 1,000 postal codes in one request. Mixed countries supported. Same flat per-record price as the single Validate action — no bulk discount or premium. Ideal for list cleanup and CRM data hygiene.',
  },
  operation: {
    inputFields: [
      {
        key: 'postalCodes',
        label: 'Postal Codes (line items)',
        type: 'string',
        list: true,
        required: false,
        helpText: 'List of postal codes (one per line item). Pair 1:1 with the Country Codes field.',
      },
      {
        key: 'countryCodes',
        label: 'Country Codes (line items)',
        type: 'string',
        list: true,
        required: false,
        helpText:
          'List of ISO 3166-1 alpha-2 codes (US, GB, DE, …) — same length as Postal Codes.',
      },
      {
        key: 'recordsCsv',
        label: 'Records (CSV) — alternative input',
        type: 'text',
        required: false,
        helpText:
          'Alternative to line-item inputs. One record per line, format "postalCode,countryCode". Example:\n90210,US\nSW1A 1AA,GB\n10115,DE',
      },
    ],
    perform,
    sample: {
      id: '90210|US|0',
      postalCode: '90210',
      countryCode: 'US',
      valid: true,
      normalized: '90210',
      reason: null,
      totalCost: 0.000028,
      balance: 4.99972,
    },
    outputFields: [
      { key: 'postalCode', label: 'Postal Code' },
      { key: 'countryCode', label: 'Country Code' },
      { key: 'valid', label: 'Valid', type: 'boolean' },
      { key: 'normalized', label: 'Normalized Form (canonical key when valid; e.g. SW1A for GB)' },
      { key: 'reason', label: 'Reason (null | not_found | invalid_format | unknown_country)' },
      { key: 'totalCost', label: 'Request Total Cost (USD)', type: 'number' },
      { key: 'balance', label: 'Account Balance (USD)', type: 'number' },
    ],
  },
} satisfies Search;
