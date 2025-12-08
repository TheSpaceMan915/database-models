# User Preference System — MongoDB 8.0 Documents & Indexes v2 (assignments/04-mongo-db/08-documents-and-indexes-v2)

An updated module that builds on v1 by adding **document replacement**, **targeted updates**, and
**index-usage checks** using `explain('executionStats')`. It keeps the same domain: users, preference
taxonomy, current preferences, and an append-only event log.

## 1) Overview

What’s new vs v1:

- **Full-document replacement** via `replaceOne` (with a caution about overwriting fields).
- **Targeted updates & field additions** via `$set`, `$addToSet`, and an **upsert** example.
- **Explain plans** to contrast collection scans (COLLSCAN) with indexed scans (IXSCAN).

Database name is **`user_pref_db_v2`** to avoid collisions with earlier modules.

## 2) Quickstart

Run from the repository root:

```bash
# 0) Select/create DB and print banner
mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/01-db-setup/00_create_database.js

# 1) Collections + validators + indexes
mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/01-db-setup/01_collections_and_indexes.js

# 2) Seed deterministic mock data (users, taxonomy, current prefs, events)
mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/01-db-setup/02_seed.js

# 3) Queries
mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/02-queries/01_replace_document.js
mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/02-queries/02_update_and_add_fields.js
mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/02-queries/03_scan_vs_index.js

# 4) Teardown
mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/03-db-drop/00_drop_database.js
```

## 3) Data model

- **user**
  - `email` (unique), `display_name?`, `created_at`.
  - Treat `email` as PII.

- **preference_dimension**
  - Defines a domain via `dimension_key` (snake_case), `name`, `description?`.
  - Example: `theme`, `cuisine_favorite`, `spice_level`, `notifications`.

- **preference_option**
  - Options per dimension; uniqueness on `(dimension_id, option_key)`.

- **user_preferences**
  - Current value per `(user_id, pref_key)` (unique).
  - `value` may be scalar or `array<string>`.

- **user_preference_events**
  - Append-only history with `performed_at`, `source`, `confidence`, optional `old_value`, and freeform `metadata`.

**References vs embed**
- Options reference their dimension (`dimension_id`) for a shared taxonomy.
- `user_preferences` stores the primitive `value` directly for fast reads; the set of allowed options
  is enforced at the application/business layer.

## 4) Validation & Indexes

- Validators enforce:
  - `user.email` matches `^[^@\s]+@[^@\s]+\.[^@\s]+$`.
  - Keys are `snake_case` `^[a-z0-9_]+$`.
  - Preference values are scalar or `array<string>`.
  - `source ∈ {manual, import, inferred, default}`; `confidence ∈ [0, 1]`.

- Uniqueness:
  - `user.email`
  - `preference_dimension.dimension_key`
  - `preference_option (dimension_id, option_key)`
  - `user_preferences (user_id, pref_key)`

- History & lookups:
  - `user_preference_events { user_id, pref_key, performed_at: -1 }` for “latest” timelines.
  - Single-field helpers on `{ user_id }` and `{ dimension_id }`.

## 5) Query scripts

- **01_replace_document.js** — Replaces the `preference_dimension` for `theme` using `replaceOne` and
  prints before/after snapshots. Notes risks vs `$set`.

- **02_update_and_add_fields.js** — Updates Alice’s theme confidence via `$set`, adds `tags` to a
  dimension via `$addToSet`, and upserts a `user_preference_events` maintenance marker with `metadata`.

- **03_scan_vs_index.js** — Shows `COLLSCAN` for an unfiltered query, `IXSCAN` for a selective indexed
  lookup, and a `hint({ email: 1 })` example. Prints compact summaries:
  `stage`, `nReturned`, `totalDocsExamined`, `totalKeysExamined`.

## 6) Performance & Tips

- Prefer selective predicates on indexed fields (`user_id`, `pref_key`) for current-state reads.
- Use projections to keep network payloads small.
- Choose **`$set`** when you need to preserve other fields; use **`replaceOne`** only when you intend
  to overwrite the document wholesale.
- Event volume grows quickly: consider time-based archiving or TTL on derived rollups (not the audit log).

## 7) Security & Privacy

- Never store plain passwords; this module stores identity attributes like `email` only.
- Handle `email` as PII (access control, masking, retention).
- Event logs may encode behavioral data; define retention and access boundaries.

## 8) Folder structure

```
assignments/04-mongo-db/08-documents-and-indexes-v2/
  01-db-setup/
    00_create_database.js
    01_collections_and_indexes.js
    02_seed.js
  02-queries/
    01_replace_document.js
    02_update_and_add_fields.js
    03_scan_vs_index.js
  03-db-drop/
    00_drop_database.js
    README_DROP.md
  README.md
```

## 9) License / Authors

- License: MIT (replace as needed).
- Authors: Your Team (update with real names).
