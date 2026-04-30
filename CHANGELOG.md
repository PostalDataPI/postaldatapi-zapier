# Changelog

## 1.0.1

* Fix create/validateBulkPostalCodes — converted from Search to Create. Searches in Zapier semantically mean "find one record" and were auto-truncating the bulk result set to the first record only. Bulk Validate now returns a single wrapper object with all per-record results nested in `results[]`, plus aggregate counts (`totalRecords`, `validCount`, `invalidCount`) and cost/balance fields.

## 1.0.0

Initial release. Five operations against the PostalDataPI API for postal code lookup, validation, and enrichment across 240+ countries and territories.

* `search/lookupPostalCode` — Look up city, state, and coordinates for a postal code in any of 240+ countries.
* `search/validatePostalCode` — Boolean check whether a single postal code exists in a country.
* `create/validateBulkPostalCodes` — Validate up to 1,000 postal codes in one request. Mixed countries supported. Same flat per-record price as the single Validate.
* `search/searchByCity` — Find all postal codes for a given city. State required for US searches.
* `search/getPostalCodeMetadata` — Full per-postal-code metadata: county, timezone, coordinates, country-specific fields.
