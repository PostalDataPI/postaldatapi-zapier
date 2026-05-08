import type { ZObject, Bundle, Search } from 'zapier-platform-core';

const PROD_BASE = 'https://postaldatapi.com';

const perform = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    url: `${PROD_BASE}/api/metazip`,
    method: 'POST',
    body: {
      zipcode: bundle.inputData.postalCode,
      country: (bundle.inputData.countryCode as string).toUpperCase(),
    },
  });
  const data = response.data as Record<string, unknown>;
  const meta = (data.meta as Record<string, unknown>) ?? {};
  return [
    {
      ...meta,
      // Promote frequently-needed fields to the top level so they're easy to
      // map in Zaps without having to dive into a nested object.
      id: `${bundle.inputData.postalCode}|${bundle.inputData.countryCode}`,
      postalCode: bundle.inputData.postalCode,
      countryCode: (bundle.inputData.countryCode as string).toUpperCase(),
      meta,
      balance: data.balance,
    },
  ];
};

export default {
  key: 'getPostalCodeMetadata',
  noun: 'Postal Code',
  display: {
    label: 'Get Postal Code Metadata',
    description:
      'Get full metadata for a postal code, including coordinates, administrative regions, and country-specific fields.',
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
      postalCode: '90210',
      countryCode: 'US',
      city: 'Beverly Hills',
      state: 'California',
      stateAbbrev: 'CA',
      county: 'Los Angeles County',
      latitude: 34.0901,
      longitude: -118.4065,
      timezone: 'America/Los_Angeles',
      balance: 4.99972,
    },
    outputFields: [
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State / Region' },
      { key: 'stateAbbrev', label: 'State Abbreviation' },
      { key: 'county', label: 'County / Municipality' },
      { key: 'latitude', label: 'Latitude', type: 'number' },
      { key: 'longitude', label: 'Longitude', type: 'number' },
      { key: 'timezone', label: 'Timezone (US only)' },
      { key: 'balance', label: 'Account Balance (USD)', type: 'number' },
    ],
  },
} satisfies Search;
