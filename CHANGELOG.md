# Changelog

## 1.0.3

Consolidates the operation surface around Creates only — Search variants removed.

* All five operations (`lookupPostalCode`, `validatePostalCode`, `validateBulkPostalCodes`, `searchByCity`, `getPostalCodeMetadata`) are now classified as Creates ("Actions" in Zapier UI terminology). The Search variants for the four non-bulk operations have been removed.
* **Why:** Creates satisfy Zapier's "every Zap needs at least one Action" rule on Free-plan 2-step Zaps, which Searches alone do not. Creates can also still feed downstream steps in chained multi-step workflows, so the Search classification added no new capability we couldn't deliver via Creates. Removing the parallel surface halves the app-picker entries users see and eliminates the naming-disambiguation problem ("which Lookup do I pick — Search or Create?").
* **Search→Create return-shape change** — `lookupPostalCode`, `validatePostalCode`, and `getPostalCodeMetadata` now return a single result object instead of a single-element array. Existing Zaps on v1.0.2 or earlier that referenced these as Searches would have been mapping `output[0].field`; on v1.0.3 they map `output.field` directly. (No v1.0.2 Search users known at release; migration impact expected to be zero.)
* **`searchByCity` return-shape change** — same Search→Create motivation. Previously returned an array of N records (one per matched postal code). Now wraps in a single object with `results[]`, `totalResults`, `matchedCity`, `matchedState`, and aggregate balance. Same downstream-Zap iteration pattern as `validateBulkPostalCodes` (Looping by Zapier on `results[]`).
* **File reorg** — `validate-bulk.ts` moved from `src/searches/` to `src/creates/` to match its classification (was a Create classified-via-`index.ts` but the file lived in `searches/` for historical reasons). `src/searches/` directory removed entirely.

No REST API changes; no auth changes (no C007 migration concern). v1.0.1 users may need to delete-and-re-add action steps to bind to v1.0.3 once it's promoted, but the underlying HTTP calls and response shapes from PostalDataPI are unchanged.

## 1.0.2

Addresses Zapier publishing-review feedback (review by Abraham D., 2026-05-06):

* **Auth field type** — `apiKey` field changed from `string` to `password` so Zapier's UI masks the input.
* **Connection label** — removed (was previously surfacing the integration name and balance, both flagged as inappropriate). Zapier now auto-numbers connections.
* **Action descriptions** — removed marketing language (e.g. "240+ countries and territories", "Same flat per-record price ... no bulk discount or premium") to match Zapier's "describe what the action does, no pricing or marketing" requirement. Action descriptions now state only the operation.
* **Field help text** — added `helpText` on input fields that were missing it: `validatePostalCode.postalCode`, `getPostalCodeMetadata.postalCode`, `getPostalCodeMetadata.countryCode`, `searchByCity.city`, `searchByCity.countryCode`.
* No behavioral changes; all changes are documentation / UI metadata.

Items 1 + 2 from the review (integration name and integration description) live in the Zapier developer dashboard, not in this codebase. Updated separately.

## 1.0.1

* Fix create/validateBulkPostalCodes — converted from Search to Create. Searches in Zapier semantically mean "find one record" and were auto-truncating the bulk result set to the first record only. Bulk Validate now returns a single wrapper object with all per-record results nested in `results[]`, plus aggregate counts (`totalRecords`, `validCount`, `invalidCount`) and cost/balance fields.

## 1.0.0

Initial release. Five operations against the PostalDataPI API for postal code lookup, validation, and enrichment across 240+ countries and territories.

* `search/lookupPostalCode` — Look up city, state, and coordinates for a postal code in any of 240+ countries.
* `search/validatePostalCode` — Boolean check whether a single postal code exists in a country.
* `create/validateBulkPostalCodes` — Validate up to 1,000 postal codes in one request. Mixed countries supported. Same flat per-record price as the single Validate.
* `search/searchByCity` — Find all postal codes for a given city. State required for US searches.
* `search/getPostalCodeMetadata` — Full per-postal-code metadata: county, timezone, coordinates, country-specific fields.
