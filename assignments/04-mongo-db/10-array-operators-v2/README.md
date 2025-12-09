# User Preference System — MongoDB 8.0 Array Operators v2 (assignments/04-mongo-db/10-array-operators-v2)

End-to-end **array operator** demonstrations on a realistic User Preference model (MongoDB 8.0).
You’ll insert values into arrays, update elements by **index** and by **value** (with `arrayFilters`),
and remove elements by **index** and **value**—with concise, reproducible `mongosh` scripts.

## 1) Overview

What you’ll practice:

- Array **inserts**: `$push`, `$addToSet`, `$each`, `$position` (for indexed insertion).
- Array **updates**:
  - By **index** (`$set: {"arr.1": ...}`).
  - By **value** using **`arrayFilters`** to target matching elements.
- Array **removals**:
  - By **value** (`$pull`, `$pullAll`).
  - By **position** (`$pop`), and mid-array deletion via `$unset` + `$pull: null`.

Arrays live on the `user` document for profile-level quick access and also appear in preferences/events
to show `array<string>` patterns across entities.

## 2) Quickstart

Run from the repository root:

```bash
# 0) Select/create DB and print banner
mongosh --file assignments/04-mongo-db/10-array-operators-v2/01-db-setup/00_create_database.js

# 1) Collections + validators + indexes (idempotent)
mongosh --file assignments/04-mongo-db/10-array-operators-v2/01-db-setup/01_collections_and_indexes.js

# 2) Seed deterministic mock data (users with arrays, taxonomy, current prefs, events with tags)
mongosh --file assignments/04-mongo-db/10-array-operators-v2/01-db-setup/02_seed.js

# 3) Array-focused queries
mongosh --file assignments/04-mongo-db/10-array-operators-v2/02-queries/01_insert_array_values.js
mongosh --file assignments/04-mongo-db/10-array-operators-v2/02-queries/02_update_array_by_index_and_value.js
mongosh --file assignments/04-mongo-db/10-array-operators-v2/02-queries/03_remove_array_elements.js

# 4) Teardown
mongosh --file assignments/04-mongo-db/10-array-operators-v2/03-db-drop/00_drop_database.js
```

## 3) Data model

- **user**
  - `email` (unique), `display_name?`, `created_at`.
  - **Arrays:** `favorite_cuisines: string[]` of option_keys; `notification_channels: string[]`
    in `{email,sms,push,telegram,whatsapp}`.
- **preference_dimension**
  - Domain taxonomy with `dimension_key` (snake_case), `name`, `description?`.
- **preference_option**
  - Allowed options per dimension; unique on `(dimension_id, option_key)`.
- **user_preferences**
  - Current value per `(user_id, pref_key)`; `value` can be scalar or `array<string>`.
- **user_preference_events**
  - History with `performed_at`, `event_type`, and optional **`tags: string[]`** for labeling.

**Why arrays in both profile and history?**  
Quick profile reads (e.g., finds by cuisine membership) benefit from arrays on `user`.
Preferences/events exercise array operators and `arrayFilters` across current and historical data.

## 4) Validation & Indexes

- Validators enforce:
  - `user.email` matches a simple email regex.
  - Keys are lowercase snake_case (`^[a-z0-9_]+$`).
  - Arrays contain **strings** with allowed patterns/enums.
  - `source ∈ {manual, import, inferred, default}`, `confidence ∈ [0,1]`.
- Uniqueness:
  - `user.email`
  - `preference_dimension.dimension_key`
  - `preference_option (dimension_id, option_key)`
  - `user_preferences (user_id, pref_key)`
- Multikey indexes for array queries:
  - `user.favorite_cuisines`, `user.notification_channels`.
- History lookups:
  - `user_preference_events { user_id, pref_key, performed_at: -1 }` plus a helper on `{ pref_key, performed_at }`.

## 5) Query scripts

- **01_insert_array_values.js** — `$push` (single), `$addToSet` (dedup + `$each`), and `$push` with
  `$each+$position` for indexed insertion; push `tags` into an event and verify with a compact projection.

- **02_update_array_by_index_and_value.js** — Direct index updates on arrays (`arr.1`, `arr.0`) and
  **by-value replacement** using `arrayFilters` (both on `user.favorite_cuisines` and on event `tags`).

- **03_remove_array_elements.js** — Value removals (`$pull`, `$pullAll`), position removals (`$pop`),
  and the two-step mid-array deletion (`$unset arr.i` then `$pull: null`) to compact arrays.

## 6) Tips & gotchas

- Use **`$addToSet`** (optionally with `$each`) to avoid duplicates during inserts.
- Mid-array deletion needs two steps: **`$unset`** creates a `null` hole; follow with **`$pull: null`**.
- `arrayFilters` target **matching elements** (works for scalars and subdocuments).
- Keep shell output readable with **explicit projections**; avoid dumping entire documents.

## 7) Security & Privacy

- Never store plain passwords. Treat `email` as PII (masking, RBAC, retention).
- Event logs can reveal behavior; define retention and access policies.

## 8) Folder structure

```
assignments/04-mongo-db/10-array-operators-v2/
  01-db-setup/
    00_create_database.js
    01_collections_and_indexes.js
    02_seed.js
  02-queries/
    01_insert_array_values.js
    02_update_array_by_index_and_value.js
    03_remove_array_elements.js
  03-db-drop/
    00_drop_database.js
    README_DROP.md
  README.md
```

## 9) License / Authors

- License: MIT (replace as needed).
- Authors: Your Team (update with real names).
