import type { ZObject, Bundle, Search } from 'zapier-platform-core';

const PROD_BASE = 'https://postaldatapi.com';

const perform = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    url: `${PROD_BASE}/api/lookup`,
    method: 'POST',
    body: {
      zipcode: bundle.inputData.postalCode,
      country: (bundle.inputData.countryCode as string).toUpperCase(),
    },
  });
  // Zapier expects searches to return an array of zero or more matches.
  // The lookup endpoint either succeeds (one match) or 404s (caught by middleware).
  const data = response.data as Record<string, unknown>;
  return [
    {
      ...data,
      id: `${bundle.inputData.postalCode}|${bundle.inputData.countryCode}`,
    },
  ];
};

export default {
  key: 'lookupPostalCode',
  noun: 'Postal Code',
  display: {
    label: 'Lookup Postal Code',
    description:
      'Look up city, state, and coordinates for a postal code. Works for ZIP codes (US), postcodes (UK), PLZ (Germany), CEPs (Brazil), and 240+ countries and territories.',
  },
  operation: {
    inputFields: [
      {
        key: 'postalCode',
        label: 'Postal Code',
        type: 'string',
        required: true,
        helpText: 'The postal code to look up. Examples: "90210", "SW1A 1AA", "10115", "100-0001".',
      },
      {
        key: 'countryCode',
        label: 'Country Code',
        type: 'string',
        required: true,
        default: 'US',
        helpText: 'ISO 3166-1 alpha-2 country code. Examples: US, GB, DE, JP, BR, CA. Full list at [postaldatapi.com/countries](https://postaldatapi.com/countries).',
      },
    ],
    perform,
    sample: {
      id: '90210|US',
      city: 'Beverly Hills',
      state: 'California',
      ST: 'CA',
      latitude: 34.0901,
      longitude: -118.4065,
      balance: 4.99972,
    },
    outputFields: [
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State / Region' },
      { key: 'ST', label: 'State Abbreviation' },
      { key: 'latitude', label: 'Latitude', type: 'number' },
      { key: 'longitude', label: 'Longitude', type: 'number' },
      { key: 'balance', label: 'Account Balance (USD)', type: 'number' },
    ],
  },
} satisfies Search;
