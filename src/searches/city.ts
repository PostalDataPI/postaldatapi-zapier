import type { ZObject, Bundle, Search } from 'zapier-platform-core';

const PROD_BASE = 'https://postaldatapi.com';

const perform = async (z: ZObject, bundle: Bundle) => {
  const body: Record<string, unknown> = {
    city: bundle.inputData.city,
    country: (bundle.inputData.countryCode as string).toUpperCase(),
  };
  // For US queries, /api/city requires either `state` (full name) or `ST`
  // (2-letter abbreviation). Pass through whichever the user supplied.
  const stateInput = bundle.inputData.state as string | undefined;
  if (stateInput) {
    if (stateInput.length === 2) {
      body.ST = stateInput.toUpperCase();
    } else {
      body.state = stateInput;
    }
  }

  const response = await z.request({
    url: `${PROD_BASE}/api/city`,
    method: 'POST',
    body,
  });
  const data = response.data as Record<string, unknown>;
  const zipcodes = (data.zipcodes as string[]) ?? [];
  // One row per matching postal code so downstream Zap steps can iterate.
  return zipcodes.map((pc, i) => ({
    id: `${bundle.inputData.city}|${bundle.inputData.countryCode}|${pc}|${i}`,
    postalCode: pc,
    city: bundle.inputData.city,
    state: stateInput || null,
    countryCode: (bundle.inputData.countryCode as string).toUpperCase(),
    matchedCity: data.matchedCity,
    matchedState: data.matchedState,
    balance: data.balance,
  }));
};

export default {
  key: 'searchByCity',
  noun: 'Postal Code',
  display: {
    label: 'Search Postal Codes by City',
    description:
      'Find all postal codes for a given city. For US searches, provide a state (name or 2-letter abbreviation). For other countries, state is optional.',
  },
  operation: {
    inputFields: [
      {
        key: 'city',
        label: 'City',
        type: 'string',
        required: true,
        helpText: 'The city name to search for. Examples: "Beverly Hills", "London", "Berlin", "Tokyo".',
      },
      {
        key: 'state',
        label: 'State / Region',
        type: 'string',
        required: false,
        helpText:
          'Required for US searches. Accepts either the full name ("California") or the 2-letter abbreviation ("CA"). Ignored for non-US.',
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
      id: 'Beverly Hills|US|90210|0',
      postalCode: '90210',
      city: 'Beverly Hills',
      state: 'CA',
      countryCode: 'US',
      matchedCity: 'Beverly Hills',
      matchedState: 'California',
      balance: 4.99972,
    },
    outputFields: [
      { key: 'postalCode', label: 'Postal Code' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State (input)' },
      { key: 'countryCode', label: 'Country Code' },
      { key: 'matchedCity', label: 'Matched City (server-resolved)' },
      { key: 'matchedState', label: 'Matched State (server-resolved)' },
      { key: 'balance', label: 'Account Balance (USD)', type: 'number' },
    ],
  },
} satisfies Search;
