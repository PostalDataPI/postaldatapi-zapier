import type { ZObject, Bundle, Create } from 'zapier-platform-core';

const PROD_BASE = 'https://postaldatapi.com';

const perform = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    url: `${PROD_BASE}/api/validate`,
    method: 'POST',
    body: {
      zipcode: bundle.inputData.postalCode,
      country: (bundle.inputData.countryCode as string).toUpperCase(),
    },
  });
  const data = response.data as Record<string, unknown>;
  return {
    ...data,
    id: `${bundle.inputData.postalCode}|${bundle.inputData.countryCode}`,
  };
};

export default {
  key: 'validatePostalCode',
  noun: 'Postal Code',
  display: {
    label: 'Validate Postal Code',
    description:
      'Check whether a single postal code exists in a country. Returns a boolean — for full city/region details use Lookup Postal Code instead. For batch checks use Bulk Validate.',
  },
  operation: {
    inputFields: [
      {
        key: 'postalCode',
        label: 'Postal Code',
        type: 'string',
        required: true,
        helpText: 'The postal code to validate. Examples: "90210", "SW1A 1AA", "10115", "100-0001".',
      },
      {
        key: 'countryCode',
        label: 'Country Code',
        type: 'string',
        required: true,
        default: 'US',
        helpText: 'ISO 3166-1 alpha-2. Full list at [postaldatapi.com/countries](https://postaldatapi.com/countries).',
      },
    ],
    perform,
    sample: {
      id: '90210|US',
      valid: true,
      zipcode: '90210',
      balance: 4.99972,
    },
    outputFields: [
      { key: 'valid', label: 'Valid', type: 'boolean' },
      { key: 'zipcode', label: 'Postal Code' },
      { key: 'balance', label: 'Account Balance (USD)', type: 'number' },
    ],
  },
} satisfies Create;
