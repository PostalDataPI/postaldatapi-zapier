# Changelog

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
