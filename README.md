# PostalDataPI Zapier Integration

Official Zapier integration for [PostalDataPI](https://postaldatapi.com) — postal code lookup, validation, and enrichment for 240+ countries and territories.

**Status:** Private beta. Working toward public listing in the Zapier App Directory.

## Searches

| Search | What it does |
|--------|--------------|
| `Lookup Postal Code` | Returns city, state, and coordinates for a postal code in any of 240+ countries. |
| `Validate Postal Code` | Boolean check — does this postal code exist in this country? |
| `Bulk Validate Postal Codes` | Validate up to 1,000 postal codes per request. Mixed countries supported. Same flat per-record price as the single Validate. |
| `Search Postal Codes by City` | Find all postal codes for a city. State required for US queries. |
| `Get Postal Code Metadata` | Full per-postal-code metadata: county, timezone, coordinates, country-specific fields. |

## Auth

API key. Get yours at [postaldatapi.com/account](https://postaldatapi.com/account) — new accounts include 1,000 free queries, no credit card required to sign up.

## Pricing

Flat rate. $0.000028 per query. No tiers, no overages. Same per-record price for bulk validation. *"Validate 1, validate 1,000 — flat rate, every record."*

## Development

This is a Zapier CLI integration written in TypeScript with ESM modules.

```bash
# Install deps
npm install

# Type-check + build
npm run build

# Run all tests against the live production API (uses the demo HN key)
npm test

# Lint the integration definition
npx zapier-platform validate

# Push the current version to your registered Zapier app (private)
npx zapier-platform push
```

### Test against a non-default API key

```bash
DEMO_API_KEY=your_real_key npm test
```

## Project structure

```
src/
  index.ts                  — App definition; wires auth + middleware + searches
  authentication.ts         — Custom-auth (API key) configuration + connection test
  middleware.ts             — Inject apiKey into JSON body; translate 4xx/5xx to Zapier errors
  searches/
    lookup.ts               — POST /api/lookup
    validate.ts             — POST /api/validate
    validate-bulk.ts        — POST /api/validate-bulk (line-items OR CSV input)
    city.ts                 — POST /api/city
    metazip.ts              — POST /api/metazip
  test/
    authentication.test.ts  — Live API auth-flow test
    searches.test.ts        — Live API smoke tests for all 5 searches
```

## Submission to the public directory

When ready (after real-Zap testing in the editor):

```bash
npx zapier-platform promote 1.0.0
# Follow prompts; submission lands in Zapier's review queue (~5-10 business days).
```

## License

MIT — see LICENSE file.
