# User Preference System — MongoDB 8.0 Queries & Expressions v2 (assignments/04-mongo-db/09-queries-and-expressions-v2)

A focused module that demonstrates **Find**, **sort/limit/skip/count**, and **comparison/logical
operators** on a realistic user-preference model. It builds a clean MongoDB 8.0 dataset with schema
validation and indexes, then runs readable `mongosh` examples with explicit projections.

## 1) Overview

What this module shows:

- **Find basics** with compact projections and common lookups.
- **Sorting, limiting, skipping, counting** for pagination and totals.
- **Comparison & logical operators**: `$lt`, `$lte`, `$gt`, `$gte`, `$ne`, `$in`, `$nin`, `$not`.

The database is named **`user_pref_db_qe_v2`** to avoid collisions with other modules.

## 2) Quickstart

Run from the repository root:

```bash
# 0) Select/create DB and print banner
mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/01-db-setup/00_create_database.js

# 1) Collections + validators + indexes
mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/01-db-setup/01_collections_and_indexes.js

# 2) Seed deterministic mock data (users, taxonomy, current prefs, events)
mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/01-db-setup/02_seed.js

# 3) Queries
mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/02-queries/01_find_basics.js
mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/02-queries/02_sort_limit_skip_count.js
mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/02-queries/03_operators_comparison_and_logical.js

# 4) Teardown
mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/03-db-drop/00_drop_database.js
```

## 3) Data model

- **user**
  - `email` (unique), `display_name?`, `created_at`.
  - Treat `email` as PII.

- **preference_dimension**
  - Domain definition via `dimension_key` (snake_case), `name`, `description?`.
  - Examples: `theme`, `cuisine_favorite`, `spice_level`, `notifications`.

- **preference_option**
  - Allowed options per dimension; uniqueness on `(dimension_id, option_key)`.

- **user_preferences**
  - Current value per `(user_id, pref_key)` (unique).
  - `value`: scalar or `array<string>`; records `source`, `confidence [0..1]`, and `updated_at`.

- **user_preference_events**
  - Append-only history with `performed_at`, `source`, `confidence`, optional `old_value`, and `event_type`.

**Why references?**
- `preference_option` references `preference_dimension` for a shared taxonomy and easier changes.
- `user_preferences` stores primitive values for fast reads; allowed options are enforced in business logic.

## 4) Validation & Indexes

- Validators ensure:
  - `user.email` matches `^[^@\s]+@[^@\s]+\.[^@\s]+$`.
  - Keys are snake_case `^[a-z0-9_]+$`.
  - Preference `value` is scalar or `array<string>`.
  - `source ∈ {manual, import, inferred, default}`; `confidence ∈ [0, 1]`.
  - Timestamps (`created_at`, `updated_at`) are JS `Date`.

- Uniqueness:
  - `user.email`
  - `preference_dimension.dimension_key`
  - `preference_option (dimension_id, option_key)`
  - `user_preferences (user_id, pref_key)`

- Lookups & history:
  - `user_preference_events { user_id, pref_key, performed_at: -1 }` for time-sorted timelines.
  - Helpers on `{ user_id }` and `{ dimension_id }` support joins-like traversals.

## 5) Query scripts

- **01_find_basics.js** — Equality and compound filters with minimal projections:
  user by email; dimension by key; options by dimension; preference by `(user_id, pref_key)`;
  last N events with `sort` + `limit`.

- **02_sort_limit_skip_count.js** — Sort ascending/descending; `limit` top N; `skip` for pagination;
  counting with `countDocuments` and `estimatedDocumentCount`; a combined example paginating an events timeline.

- **03_operators_comparison_and_logical.js** — Clear demonstrations of:
  `$lt`, `$lte`, `$gt`, `$gte` on `confidence`; `$ne` on `source`; `$in/$nin` on `email`/`pref_key`;
  `$not` with a regex on `event_type`. Each prints sample docs and counts.

## 6) Performance & Tips

- Prefer equality/range filters on indexed fields (`user_id`, `pref_key`, selective numerics).
- Use projections to keep payloads small and outputs readable in the shell.
- For pagination, combine `sort + skip + limit` and a separate `countDocuments` to compute total pages.
- Regex queries are less index-friendly unless the pattern has an anchored, indexed prefix.

## 7) Security & Privacy

- Never store plain passwords; `user` holds identity attributes like `email` only.
- Handle `email` as PII (access control, masking, retention policies).
- Event logs may encode behavioral signals; define retention and access boundaries.

## 8) Folder structure

```
assignments/04-mongo-db/09-queries-and-expressions-v2/
  01-db-setup/
    00_create_database.js
    01_collections_and_indexes.js
    02_seed.js
  02-queries/
    01_find_basics.js
    02_sort_limit_skip_count.js
    03_operators_comparison_and_logical.js
  03-db-drop/
    00_drop_database.js
    README_DROP.md
  README.md
```

## 9) License / Authors

- License: MIT (replace as needed).
- Authors: Your Team (update with real names).
