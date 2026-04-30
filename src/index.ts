import zapier, { defineApp } from 'zapier-platform-core';

import packageJson from '../package.json' with { type: 'json' };

import authentication from './authentication.js';
import { befores, afters } from './middleware.js';

import lookupPostalCode from './searches/lookup.js';
import validatePostalCode from './searches/validate.js';
import validateBulkPostalCodes from './searches/validate-bulk.js';
import searchByCity from './searches/city.js';
import getPostalCodeMetadata from './searches/metazip.js';

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

  searches: {
    [lookupPostalCode.key]: lookupPostalCode,
    [validatePostalCode.key]: validatePostalCode,
    [searchByCity.key]: searchByCity,
    [getPostalCodeMetadata.key]: getPostalCodeMetadata,
  },

  // Bulk Validate is a Create, NOT a Search — Zapier searches semantically
  // mean "find ONE record" and auto-truncate the result set to the first
  // entry. Bulk validation is a batch *action* and returns a wrapper object
  // with all results nested.
  creates: {
    [validateBulkPostalCodes.key]: validateBulkPostalCodes,
  },
});
