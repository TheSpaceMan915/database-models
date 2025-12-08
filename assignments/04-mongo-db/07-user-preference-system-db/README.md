# User Preference System — MongoDB 8.0 Database (assignments/04-mongo-db/07-user-preference-system-db)

A clean MongoDB 8.0 implementation for collecting and managing user preferences. The model uses two
layers:

- **`user_preferences`** — the current single source of truth per `user_id` + `pref_key`.
- **`user_preference_events`** — append-only audit log for all changes with time, source, and confidence.

## 1) Overview

The database stores:
- **Users** (`user`) with unique email.
- **Preference taxonomy**: `preference_dimension` and `preference_option` (e.g., `theme` with options
  `dark|light|system`).
- **Current preferences** (`user_preferences`) with mixed `value` types: string, number, boolean, or
  `array<string>`. Each entry records `source` (`manual|import|inferred|default`), `confidence` `[0..1]`,
  and `updated_at`.
- **Events** (`user_preference_events`) provide a full history of changes for analytics and audit.

Why two layers?
- `user_preferences` makes reads fast and simple for the latest state.
- `user_preference_events` enables analytics, time-travel, and provenance.

## 2) Quickstart

From the repo root:

```bash
# 0) Select/create DB and print banner
mongosh --file assignments/04-mongo-db/07-user-preference-system-db/01-db-setup/00_create_database.js

# 1) Collections + validators + indexes
mongosh --file assignments/04-mongo-db/07-user-preference-system-db/01-db-setup/01_collections_and_indexes.js

# 2) Seed deterministic mock data (users, taxonomy, current prefs, events)
mongosh --file assignments/04-mongo-db/07-user-preference-system-db/01-db-setup/02_seed.js
```

To drop everything:

```bash
mongosh --file assignments/04-mongo-db/07-user-preference-system-db/02-db-drop/00_drop_database.js
```

## 3) Data model

- **user**
  - Fields: `email` (unique), `display_name?`, `created_at`.
  - Rationale: keep only identity info here; treat `email` as PII.

- **preference_dimension**
  - Defines a domain: `dimension_key` (snake_case), `name`, `description?`.
  - Example: `theme`, `cuisine_favorite`, `spice_level`, `notifications`.

- **preference_option**
  - Allowed options per dimension: `(dimension_id, option_key)` is unique.
  - Example: for `theme` → `dark|light|system`.

- **user_preferences**
  - Current value per `(user_id, pref_key)` (unique).
  - `value` is scalar or `array<string>` to support multi-select (e.g., multiple cuisines).

- **user_preference_events**
  - History of changes with `performed_at`, `source`, `confidence`, and optional `old_value`.

**Reference vs. embed**
- Options reference their dimension (`dimension_id`) to avoid duplicating labels and to keep a shared
  taxonomy. `user_preferences` stores `pref_key` (like `theme`) and the `value` directly because the
  value is a small, stable primitive.

## 4) Validation & Indexes

- **Validators** enforce:
  - `user.email` matches `^[^@\s]+@[^@\s]+\.[^@\s]+$`.
  - Keys are `snake_case` (`^[a-z0-9_]+$`).
  - `value` in `user_preferences` is scalar or `array<string>`.
  - `source` in `{manual, import, inferred, default}`; `confidence` in `[0, 1]`.

- **Uniqueness**
  - `user.email`
  - `preference_dimension.dimension_key`
  - `preference_option (dimension_id, option_key)`
  - `user_preferences (user_id, pref_key)`

- **Support lookups**
  - Events: compound `{ user_id, pref_key, performed_at: -1 }` for fast "latest" lookups and timelines.
  - Helpful single-field indexes on FK-like fields: `{ user_id: 1 }` where appropriate and
    `{ dimension_id: 1 }` on options.

## 5) Example lookups

```javascript
// A) Get a user's current preferences (project key + value)
const u = db.user.findOne({ email: 'alice@example.com' });
db.user_preferences
  .find({ user_id: u._id }, { _id: 0, pref_key: 1, value: 1, source: 1, confidence: 1 })
  .forEach(printjson);
```

```javascript
// B) Last change for a user's 'theme'
const u = db.user.findOne({ email: 'alice@example.com' });
db.user_preference_events
  .find({ user_id: u._id, pref_key: 'theme' }, { _id: 0, old_value: 1, new_value: 1, performed_at: 1, source: 1 })
  .sort({ performed_at: -1 })
  .limit(1)
  .forEach(printjson);
```

```javascript
// C) Users with theme=dark (returns emails)
db.user_preferences
  .find({ pref_key: 'theme', value: 'dark' }, { user_id: 1, _id: 0 })
  .map(doc => db.user.findOne({ _id: doc.user_id }, { _id: 0, email: 1 }));
```

```javascript
// D) Event history for 'cuisine_favorite' changes in last 7 days
const since = new Date(Date.now() - 7 * 86400000);
db.user_preference_events
  .find({ pref_key: 'cuisine_favorite', performed_at: { $gte: since } },
        { _id: 0, user_id: 1, old_value: 1, new_value: 1, performed_at: 1 })
  .sort({ performed_at: -1 })
  .forEach(printjson);
```

```javascript
// E) Top preference keys by recent activity (last 14 days)
const since = new Date(Date.now() - 14 * 86400000);
db.user_preference_events.aggregate([
  { $match: { performed_at: { $gte: since } } },
  { $group: { _id: '$pref_key', events: { $sum: 1 } } },
  { $sort: { events: -1 } },
]);
```

```javascript
// F) Allowed options for a dimension (e.g., 'spice_level')
const dim = db.preference_dimension.findOne({ dimension_key: 'spice_level' });
db.preference_option.find({ dimension_id: dim._id }, { _id: 0, option_key: 1, label: 1 }).forEach(printjson);
```

## 6) Performance & Scaling

- Reads of current state hit `user_preferences` with selective indexes (`user_id`, `pref_key`).
- Write-heavy timelines scale in `user_preference_events`; compound time-sorted index keeps "latest"
  queries fast. Consider partitioning/archiving old events by time window (e.g., monthly) if volume grows.
- Hot keys (`pref_key` like `theme`) benefit from the `{ pref_key, performed_at }` index in analytics.

## 7) Security & Privacy

- Never store plain passwords; `user` collection includes only identity attributes like `email`.
- Treat `email` as PII: apply access controls, masking, and retention policies as required.
- Event logs may contain sensitive behavioral signals; define retention/archival and access boundaries.

## 8) Folder structure

```
assignments/04-mongo-db/07-user-preference-system-db/
  01-db-setup/
    00_create_database.js
    01_collections_and_indexes.js
    02_seed.js
  02-db-drop/
    00_drop_database.js
    README_DROP.md
  README.md
```

## 9) License / Authors

- License: MIT (replace as needed).
- Authors: Your Team (update with real names).
