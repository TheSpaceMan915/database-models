# RSL Learning Platform — MongoDB 8.0 Queries & Expressions (assignments/04-mongo-db/03-queries-and-expressions)

## 1) Overview
This module evolves the base RSL learning platform data model and demonstrates:
- Find queries (equality, projections, `$and`/`$or`, field existence, regex)
- Sorting, limiting, skipping (pagination), and counting
- Comparison and logical operators: `$lt`, `$lte`, `$gt`, `$gte`, `$ne`, `$in`, `$nin`, `$not`

It uses a dedicated database name to avoid collisions: `rsl_lp_db_queries_expr`.

## 2) Quickstart
Run everything from the repository root with `mongosh`:

Setup (00 → 01 → 02):
```bash
mongosh assignments/04-mongo-db/03-queries-and-expressions/01-db-setup/00_create_database.js
mongosh assignments/04-mongo-db/03-queries-and-expressions/01-db-setup/01_collections_and_indexes.js
mongosh assignments/04-mongo-db/03-queries-and-expressions/01-db-setup/02_seed.js
```

Queries (01, 02, 03):
```bash
mongosh assignments/04-mongo-db/03-queries-and-expressions/02-queries/01_find_basics.js
mongosh assignments/04-mongo-db/03-queries-and-expressions/02-queries/02_sort_limit_skip_count.js
mongosh assignments/04-mongo-db/03-queries-and-expressions/02-queries/03_operators_comparison_and_logical.js
```

Drop (cleanup):
```bash
mongosh assignments/04-mongo-db/03-queries-and-expressions/03-db-drop/00_drop_database.js
```

## 3) Data model (brief)
- `person`: user profile (email, password hash, created_at, optional display name).
- `module`: top-level learning unit (name, description).
- `lesson`: child of a module (module_id, name, description).
- `step`: child of a lesson (lesson_id, name, url, notes, order_index).
- `status`: canonical values (`available`, `in_progress`, `completed`).
- `person_module_progress`: progress per person-module (status, updated_at).
- `person_lesson_progress`: progress per person-lesson.
- `person_step_progress`: progress per person-step.

References vs. embed rationale:
- We reference `module`, `lesson`, `step` by ids in progress documents to avoid duplication and allow
  independent updates. This fits read/query patterns across users and content hierarchies.

## 4) Validation & Indexes
Validators protect shape and core constraints:
- `person`: email regex, password_hash string, created_at date.
- `module`, `lesson`, `step`: name length (≤50), required foreign keys, notes required on steps.
- `status`: enum of the three canonical names.

Indexes:
- Unique: `person.email`, `module.name`, `status.name`.
- Foreign-key filters: `lesson.module_id`, `step.lesson_id`.
- Progress uniqueness: compound unique (`person_id`, `module_id`), (`person_id`, `lesson_id`),
  (`person_id`, `step_id`).
- Supporting indexes on `person_id`, `module_id`/`lesson_id`/`step_id`, and `status_id` for fast lookups.

## 5) Query scripts
- `02-queries/01_find_basics.js`: shows equality with projection, `$and`/`$or` combinations, field
  existence (`$exists`/`$ne`), and a case-insensitive regex (with caution).
- `02-queries/02_sort_limit_skip_count.js`: demonstrates `sort`, `limit`, `skip` (pagination), and
  counts via `countDocuments` vs. `estimatedDocumentCount`. Includes a combined lesson pagination.
- `02-queries/03_operators_comparison_and_logical.js`: exercises `$lt`, `$lte`, `$gt`, `$gte` on
  `order_index`, `$ne` for inequality, `$in`/`$nin` membership checks, and `$not` with regex.

Console output is intentionally compact via explicit projections.

## 6) Performance tips
- Create and use indexes for frequent filters (`*_id`, unique keys).
- Prefer `countDocuments(filter)` for accurate counts; `estimatedDocumentCount()` for quick totals.
- Use projections to minimize payload and improve readability.
- Avoid broad regex queries on large collections unless the field is indexed or the scan is acceptable.

## 7) Security notes
- Never store plain passwords; use strong password hashing (the demo uses placeholder hashes).
- Treat emails and progress data as PII; restrict access accordingly.
- Validate inputs at the application layer even with `$jsonSchema` validators.

## 8) Folder structure
```
assignments/04-mongo-db/03-queries-and-expressions/
  README.md
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
```

## 9) License/Authors
- License: MIT (placeholder — update to match your repository).
- Authors: RSL Learning Platform contributors (placeholder).