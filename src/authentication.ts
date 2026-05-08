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
      // 'password' (not 'string') so Zapier masks the input field — protects
      // the user's credential during entry. (Zapier publishing requirement.)
      type: 'password',
      helpText:
        'Get your API key at https://postaldatapi.com/account → API Keys.',
    },
  ],

  test,

  // No connectionLabel. Per Zapier publishing guidance, connection labels
  // must not contain the integration name or sensitive data (balance was
  // previously surfaced here — flagged in review). Leaving this unset lets
  // Zapier auto-number connections, which is fine for the typical
  // single-key user.
} satisfies Authentication;
