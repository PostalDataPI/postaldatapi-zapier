import zapier, { defineApp } from 'zapier-platform-core';

import packageJson from '../package.json' with { type: 'json' };

import authentication from './authentication.js';
import { befores, afters } from './middleware.js';

import lookupPostalCode from './creates/lookup.js';
import validatePostalCode from './creates/validate.js';
import validateBulkPostalCodes from './creates/validate-bulk.js';
import searchByCity from './creates/city.js';
import getPostalCodeMetadata from './creates/metazip.js';

export default defineApp({
  version: packageJson.version,
  platformVersion: zapier.version,

  // Disable automatic input-data cleaning. Predictability matters more than
  // Zapier's auto-trimming heuristics — we own postal-code normalization
  // server-side and want the user's exact input echoed back on errors. (D028)
  flags: { cleanInputData: false },

  authentication,
  beforeRequest: [...befores],
  afterResponse: [...afters],

  triggers: {},

  // All operations are Creates (Actions in Zapier UI terminology). v1.0.3
  // dropped the parallel Search variants — Creates satisfy Zapier's "every
  // Zap needs at least one Action" rule for Free-plan 2-step Zaps, and their
  // output can still feed subsequent steps in chained workflows, so the
  // Search classification added no new capability. Smaller picker surface,
  // cleaner UX, no naming gymnastics.
  searches: {},

  creates: {
    [lookupPostalCode.key]: lookupPostalCode,
    [validatePostalCode.key]: validatePostalCode,
    [validateBulkPostalCodes.key]: validateBulkPostalCodes,
    [searchByCity.key]: searchByCity,
    [getPostalCodeMetadata.key]: getPostalCodeMetadata,
  },
});
