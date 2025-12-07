# RSL Learning Platform — MongoDB 8.0 Aggregation Pipeline (assignments/04-mongo-db/06-aggregation-pipeline)

## 1) Overview
This module evolves the base RSL learning platform to demonstrate non-trivial aggregation:
- Per-module engagement metrics via multi-collection joins and faceting
- Per-person time-series with window functions (cumulative sum and 3-day moving average)

A dedicated database name avoids collisions: `rsl_lp_db_pipeline`.

## 2) Quickstart
Run from repository root with `mongosh`.

Setup (00 → 01 → 02):
```bash
mongosh assignments/04-mongo-db/06-aggregation-pipeline/01-db-setup/00_create_database.js
mongosh assignments/04-mongo-db/06-aggregation-pipeline/01-db-setup/01_collections_and_indexes.js
mongosh assignments/04-mongo-db/06-aggregation-pipeline/01-db-setup/02_seed.js
```

Pipelines:
```bash
mongosh assignments/04-mongo-db/06-aggregation-pipeline/02-pipeline/01_module_engagement_pipeline.js
mongosh assignments/04-mongo-db/06-aggregation-pipeline/02-pipeline/02_person_learning_timeline.js
```

Drop (cleanup):
```bash
mongosh assignments/04-mongo-db/06-aggregation-pipeline/03-db-drop/00_drop_database.js
```

## 3) Data model (brief)
- `person`: user profile (email, password hash, created_at).
- `module`: learning unit (name, description).
- `lesson`: child of a module (module_id, name, description).
- `step`: child of a lesson (lesson_id, name, url, notes).
- `status`: canonical state (`available`, `in_progress`, `completed`).
- `person_module_progress`: track progress per person-module.
- `person_lesson_progress`: track progress per person-lesson.
- `person_step_progress`: track progress per person-step (the activity source for pipelines).

Reference strategy:
- `lesson.module_id → module._id`
- `step.lesson_id → lesson._id`
- Progress collections reference `person_id`, target `_id`, and `status_id`.

Time fields:
- `updated_at` in progress collections is seeded across multiple days to support time-series and window functions.

## 4) Validation & Indexes
Validators protect shape and constraints:
- `person`: email regex, password_hash string, created_at date.
- `module`, `lesson`, `step`: required foreign keys and name length limits.
- `status`: enum-enforced names.

Indexes:
- Unique: `person.email`, `module.name`, `status.name`.
- FK-like filters: `lesson.module_id`, `step.lesson_id`.
- Progress uniqueness: compound unique (`person_id`, `module_id`), (`person_id`, `lesson_id`), (`person_id`, `step_id`).
- Supporting indexes: `person_id`, target `_id`s, and `status_id` for joins and filters.
- Time-series support: compound index `person_step_progress(person_id, updated_at)` accelerates windowed scans.

## 5) Pipelines
- `02-pipeline/01_module_engagement_pipeline.js`
  - Computes per-module metrics:
    - Lessons and steps per module
    - Unique learners interacting with module (via step progress)
    - Completed events and a normalized completion rate
  - Stages: `$match` (status filter), `$lookup` (step → lesson → module), `$unwind`, `$group`,
    `$project/$set` for derived fields, and `$facet` for `module_summary` (sorted by completion_rate)
    and `totals` (overall counts).
  - Output reading tip: `completion_rate` is rounded and comparable across modules.

- `02-pipeline/02_person_learning_timeline.js`
  - Time-series per person:
    - Daily completed counts using `$dateTrunc(unit:'day')`
    - Cumulative completed steps via `$setWindowFields` (`documents: ['unbounded','current']`)
    - 3-day moving average via a trailing documents window (`documents: [-2,0]`).
      - If your environment supports range-by-day windows, prefer `range: [-2,0], unit: 'day'`.
  - Stages: `$match`, `$set` (date extraction), `$group` (daily), `$project`, `$sort`, `$setWindowFields`.

## 6) Performance notes
- Match early to reduce working set; project only needed fields.
- Ensure join keys are indexed (`lesson.module_id`, `step.lesson_id`, progress foreign-like fields).
- Use compound indexes to support sort-by-time patterns (`person_id, updated_at`).
- Avoid unnecessary `$unwind` on large arrays; join only what you need.
- Beware of high cardinality group keys; use `$facet` to separate summaries.

## 7) Security notes
- No plain passwords; use strong password hashing (demo uses placeholder `password_hash`).
- Treat emails and progress records as PII; restrict access and logging.
- Validate app-level input even with `$jsonSchema` on collections.

## 8) Folder structure
```
assignments/04-mongo-db/06-aggregation-pipeline/
  README.md
  01-db-setup/
    00_create_database.js
    01_collections_and_indexes.js
    02_seed.js
  02-pipeline/
    01_module_engagement_pipeline.js
    02_person_learning_timeline.js
  03-db-drop/
    00_drop_database.js
    README_DROP.md
```

## 9) License/Authors
- License: MIT (placeholder — update to match your repository).
- Authors: RSL Learning Platform contributors (placeholder).