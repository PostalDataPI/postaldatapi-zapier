import type { ZObject, Bundle, Authentication } from 'zapier-platform-core';

const PROD_BASE = 'https://postaldatapi.com';

/**
 * Test the API key by hitting /api/balance — a lightweight authenticated
 * endpoint that returns the user's current balance. If the key is bad, the
 * server returns 401 and the middleware (handleBadResponses) raises an
 * AuthenticationError.
 */
const test = (z: ZObject, bundle: Bundle) =>
  z.request({
    url: `${PROD_BASE}/api/balance`,
    method: 'POST',
    body: { apiKey: bundle.authData.apiKey },
  });

export default {
  type: 'custom',

  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'string',
      helpText:
        'Get your API key at https://postaldatapi.com/account → API Keys. New accounts include 1,000 free queries — no credit card required to sign up.',
    },
  ],

  test,

  // Connection label shows the user's account in the Zap editor when they
  // pick which account to use. We surface their balance so they know which
  // key is which when they have several.
  connectionLabel: 'PostalDataPI (balance ${{bundle.inputData.balance}})',
} satisfies Authentication;
