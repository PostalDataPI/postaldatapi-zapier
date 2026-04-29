import { describe, expect, it } from 'vitest';
import zapier from 'zapier-platform-core';

import App from '../index.js';

const appTester = zapier.createAppTester(App);
const DEMO_KEY = process.env.DEMO_API_KEY || 'demo_hn_postaldatapi';

describe('custom auth', () => {
  it('accepts a valid API key (live API)', async () => {
    const response = await appTester(App.authentication.test, {
      authData: { apiKey: DEMO_KEY },
    });
    // /api/balance returns { balance: <number>, ... }
    expect(response.data).toHaveProperty('balance');
    expect(typeof response.data.balance).toBe('number');
  });

  it('rejects a bogus API key with AuthenticationError', async () => {
    try {
      await appTester(App.authentication.test, {
        authData: { apiKey: 'definitely-not-a-real-key' },
      });
    } catch (err: unknown) {
      const e = err as Error;
      expect(e.message).toMatch(/api key is invalid/i);
      return;
    }
    throw new Error('appTester should have thrown on bad key');
  });
});
