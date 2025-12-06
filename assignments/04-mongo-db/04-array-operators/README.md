# RSL Learning Platform — MongoDB 8.0 Array Operators (assignments/04-mongo-db/04-array-operators)

## 1) Overview
This module updates the base RSL learning platform model to showcase array operations end-to-end:
- Insert values into arrays (`$push`, `$addToSet`, `$each`, `$position`)
- Update array elements by position and by value (`$set` with direct index and `arrayFilters`)
- Remove array elements by value (`$pull`, `$pullAll`) and by position (`$pop`, `$unset` + `$pull null`)

A dedicated database name avoids collisions: `rsl_lp_db_array_ops`.

## 2) Quickstart
Run from repository root with `mongosh`.

Setup (00 → 01 → 02):
```bash
mongosh assignments/04-mongo-db/04-array-operators/01-db-setup/00_create_database.js
mongosh assignments/04-mongo-db/04-array-operators/01-db-setup/01_collections_and_indexes.js
mongosh assignments/04-mongo-db/04-array-operators/01-db-setup/02_seed.js
```

Queries (01, 02, 03):
```bash
mongosh assignments/04-mongo-db/04-array-operators/02-queries/01_insert_array_values.js
mongosh assignments/04-mongo-db/04-array-operators/02-queries/02_update_array_by_index_and_value.js
mongosh assignments/04-mongo-db/04-array-operators/02-queries/03_remove_array_elements.js
```

Drop (cleanup):
```bash
mongosh assignments/04-mongo-db/04-array-operators/03-db-drop/00_drop_database.js
```

## 3) Data model
- `person`: user profile (email, password hash, created_at, optional name).
- `module`: learning unit (name, description, tags[]). `tags` demonstrates string arrays with de-dupe via `$addToSet`.
- `lesson`: child of module (module_id, name, resources[]). `resources` is an object array: `{kind,url,title}` to show `$pull` by value and `arrayFilters` updates.
- `step`: child of lesson (lesson_id, name, tags[]). Per-step `tags` demonstrate scalar array updates/removals.
- `status`: canonical values `available`, `in_progress`, `completed`.
- `person_module_progress` / `person_lesson_progress` / `person_step_progress`: track per-entity progress.

Arrays rationale:
- `module.tags`: common labeling; string arrays suit `$push`, `$addToSet`, `$pull`.
- `lesson.resources`: multi-kind references; object arrays enable targeted updates via `arrayFilters` and removal via `$pull` on subdocument predicates.
- `step.tags`: per-step labels for exercises and filtering.

## 4) Validation & Indexes
Validators ensure shape and types:
- `person`: email regex, password_hash string, created_at date.
- `module`: name ≤50, `tags` is an array of strings each ≤30 chars.
- `lesson`: module_id (ObjectId), name ≤50; `resources` array of `{kind in ['video','note','quiz'], url, optional title ≤120}`.
- `step`: lesson_id (ObjectId), name ≤50; `tags` array of strings ≤30.
- `status`: enum of the three canonical names.

Indexes:
- Unique: `person.email`, `module.name`, `status.name` — prevent duplicates, speed lookups.
- Foreign-key filters: `lesson.module_id`, `step.lesson_id` — accelerate parent-child queries.
- Progress uniqueness: compound unique (`person_id`, `module_id`), (`person_id`, `lesson_id`), (`person_id`, `step_id`).
- Supporting indexes on `person_id`, target ids, and `status_id` for efficient progress queries.

## 5) Query scripts
- `01_insert_array_values.js`:
  - `$push` a tag into `module.tags`
  - `$addToSet` and `$addToSet: { tags: { $each: [...] } }` to avoid duplicates
  - `$push` with `$each` and `$position` to insert tags at an index
  - `$push` a resource object into `lesson.resources`
- `02_update_array_by_index_and_value.js`:
  - By index: `$set: { "module.tags.1": "updated_tag" }`
  - By index: `$set: { "lesson.resources.0.title": "Updated Title" }`
  - By value (scalar): `$set: { "step.tags.$[t]": "renamed" }` with `arrayFilters: [{ t: "old_tag" }]`
  - By value (object): `$set: { "lesson.resources.$[r].title": "New Title" }` with `arrayFilters: [{ "r.url": "…" }]`
- `03_remove_array_elements.js`:
  - By value: `$pull` single tag; `$pull` resource by `{ url: "…" }`
  - Multiple values: `$pullAll` tags
  - By position: `$pop` last and first
  - Arbitrary index: `$unset: { "resources.2": 1 }` then `$pull: { resources: null }`

Each script prints matched/modified counts and before/after snapshots with projections for readability.

## 6) Tips & gotchas
- `arrayFilters`:
  - For scalar arrays, match by the scalar value (e.g., `{ t: "odd" }`).
  - For object arrays, match by fields (e.g., `{ "r.url": "…" }`).
- Regex caution: avoid broad regex on large fields unless indexed or acceptable to scan.
- Mid-array deletion: use `$unset` to null out an index, then `$pull null` to compact the array.
- Prefer concise projections to keep console output tidy.

## 7) Security notes
- Never store plain passwords; use robust password hashing (demo uses placeholder `password_hash`).
- Emails and progress data are PII; protect access and logs accordingly.
- Validate inputs at the application layer in addition to `$jsonSchema`.

## 8) Folder structure
```
assignments/04-mongo-db/04-array-operators/
  README.md
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
```

## 9) License/Authors
- License: MIT (placeholder — update to match your repository).
- Authors: RSL Learning Platform contributors (placeholder).