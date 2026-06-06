import type { ZObject, Bundle, BeforeRequestMiddleware, AfterResponseMiddleware } from 'zapier-platform-core';

import packageJson from '../package.json' with { type: 'json' };

/**
 * Tag every outgoing request with an `X-Source` header so the PostalDataPI
 * server can attribute traffic by integration (vs SDKs, MCP, or direct API
 * users). The server reads this header and surfaces it in [PERF] log lines
 * and Sentry tags — the rest is plumbing on the server side.
 */
const tagSource: BeforeRequestMiddleware = (request) => {
  request.headers = request.headers || {};
  (request.headers as Record<string, string>)['X-Source'] = `zapier-${packageJson.version}`;
  return request;
};

/**
 * Inject the API key into outgoing request bodies. PostalDataPI accepts the
 * API key as a top-level field on JSON request bodies (not as a header or
 * query param). This middleware merges `apiKey` into any POST body that
 * doesn't already include it.
 *
 * Auth-test calls already include apiKey explicitly; merging is idempotent.
 */
const includeApiKey: BeforeRequestMiddleware = (request, _z, bundle) => {
  if (!bundle?.authData?.apiKey) return request;
  if (request.method && request.method.toUpperCase() !== 'POST') return request;

  // request.body may be:
  //   - undefined (no body yet)
  //   - a plain object (most common when our perform sets request.body = {...})
  //   - a JSON string (Zapier pre-serializes before middleware runs)
  // Preserve whichever shape it came in as — re-setting an already-stringified
  // body to an object causes Zapier to send the wrong content-type and the
  // server sees an unparseable body.
  let bodyObj: Record<string, unknown>;
  let wasString = false;
  if (request.body == null) {
    bodyObj = {};
  } else if (typeof request.body === 'string') {
    wasString = true;
    try {
      bodyObj = JSON.parse(request.body) as Record<string, unknown>;
    } catch {
      return request;
    }
  } else if (typeof request.body === 'object') {
    bodyObj = request.body as Record<string, unknown>;
  } else {
    return request;
  }

  if (!('apiKey' in bodyObj)) {
    bodyObj = { ...bodyObj, apiKey: bundle.authData.apiKey };
    request.body = wasString ? JSON.stringify(bodyObj) : bodyObj;
    if (wasString) {
      request.headers = request.headers || {};
      if (!('Content-Type' in request.headers) && !('content-type' in request.headers)) {
        (request.headers as Record<string, string>)['Content-Type'] = 'application/json';
      }
    }
  }
  return request;
};

/**
 * Translate PostalDataPI's HTTP errors into Zapier-shaped errors so they
 * surface cleanly in the Zap editor.
 */
const handleBadResponses: AfterResponseMiddleware = (response, z) => {
  const status = response.status;
  if (status === 200) return response;

  // Best-effort message extraction
  let serverMessage = '';
  try {
    serverMessage = (response.data as Record<string, unknown>)?.error as string ?? '';
  } catch {
    serverMessage = '';
  }

  if (status === 400) {
    throw new z.errors.Error(
      serverMessage || 'Bad request — check your input fields',
      'InvalidRequest',
      status,
    );
  }
  if (status === 401) {
    throw new z.errors.Error(
      'Your API key is invalid. Get a fresh one at https://postaldatapi.com/account',
      'AuthenticationError',
      status,
    );
  }
  if (status === 402) {
    throw new z.errors.Error(
      `Insufficient balance for this request. Top up at https://postaldatapi.com/account.${
        serverMessage ? ' (' + serverMessage + ')' : ''
      }`,
      'InsufficientBalance',
      status,
    );
  }
  if (status === 429) {
    throw new z.errors.Error(
      'Rate limit exceeded. The Zap will retry automatically. Adjust limits at https://postaldatapi.com/account if you hit this often.',
      'RateLimitExceeded',
      status,
    );
  }
  if (status >= 500) {
    throw new z.errors.Error(
      'PostalDataPI server error. Status will recover; the Zap will retry automatically.',
      'ServerError',
      status,
    );
  }

  // Anything else: bubble up as a generic error rather than letting bad data
  // flow downstream silently.
  throw new z.errors.Error(
    serverMessage || `Unexpected response (HTTP ${status})`,
    'UnexpectedResponse',
    status,
  );
};

export const befores: BeforeRequestMiddleware[] = [tagSource, includeApiKey];
export const afters: AfterResponseMiddleware[] = [handleBadResponses];
