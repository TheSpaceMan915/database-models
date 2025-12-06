# RSL Learning Platform — MongoDB 8.0 Regular Expressions (assignments/04-mongo-db/05-regular-expressions)

## 1) Overview
This module evolves the base RSL learning platform to showcase regular expression queries end-to-end:
- Prefix matches (left-anchored) for index-friendly searches
- Substring matches (contains) for flexible scanning
- Complex templates using groups, classes, alternation, and logical NOT

A dedicated database name avoids collisions: `rsl_lp_db_regex`.

## 2) Quickstart
Run from repository root with `mongosh`.

Setup (00 → 01 → 02):
```bash
mongosh assignments/04-mongo-db/05-regular-expressions/01-db-setup/00_create_database.js
mongosh assignments/04-mongo-db/05-regular-expressions/01-db-setup/01_collections_and_indexes.js
mongosh assignments/04-mongo-db/05-regular-expressions/01-db-setup/02_seed.js
```

Queries (01, 02, 03):
```bash
mongosh assignments/04-mongo-db/05-regular-expressions/02-queries/01_regex_prefix_search.js
mongosh assignments/04-mongo-db/05-regular-expressions/02-queries/02_regex_contains_search.js
mongosh assignments/04-mongo-db/05-regular-expressions/02-queries/03_regex_complex_pattern_search.js
```

Drop (cleanup):
```bash
mongosh assignments/04-mongo-db/05-regular-expressions/03-db-drop/00_drop_database.js
```

## 3) Data model (brief)
- `person`: user profile (email, password hash, created_at, optional name).
- `module`: learning unit (name, description). Name is string-validated and indexed for regex lookups.
- `lesson`: child of module (module_id, name, description). Name is string-validated and indexed.
- `step`: child of lesson (lesson_id, name, url, notes). Name is string-validated and indexed.
- `status`: canonical values `available`, `in_progress`, `completed`.
- `person_module_progress` / `person_lesson_progress` / `person_step_progress`: track per-entity progress.

Why names are strings and indexed:
- Regex works only on string fields; btree indexes on `name` support efficient left-anchored queries.

## 4) Validation & Indexes
Validators ensure shape and types:
- `person`: email regex, password_hash string, created_at date.
- `module`: name ≤50; description optional.
- `lesson`: module_id (ObjectId), name ≤60; description optional.
- `step`: lesson_id (ObjectId), name ≤60; url/notes optional.
- `status`: enum of the three canonical names.

Indexes:
- Unique: `person.email`, `module.name`, `status.name` — prevent duplicates, speed lookups.
- Foreign-key filters: `lesson.module_id`, `step.lesson_id`.
- Name btree indexes: `module.name`, `lesson.name`, `step.name` — enable index use for left-anchored
  regex (e.g., `/^Basic/i`). Non-anchored substrings (e.g., `/log/i`) typically perform COLLSCAN.
- Progress uniqueness: compound unique (`person_id`, `module_id`), (`person_id`, `lesson_id`),
  (`person_id`, `step_id`), plus supporting indexes.

## 5) Regex query scripts
- `01_regex_prefix_search.js`: prefix searches with `/^Basic/i`, `/^Lesson 0/i`, `/^Lesson 1/i`.
  Shows compact projections and `explain('executionStats')` summaries (IXSCAN potential).
- `02_regex_contains_search.js`: substring searches with `/log/i` and `/Step\s*2/i`.
  Prints results and execution stats, cautioning about COLLSCAN and alternatives (anchors, Atlas Search).
- `03_regex_complex_pattern_search.js`: complex templates:
  - Lessons: `/^Lesson\s+(?:\d{1,2}|[0-9][A-Z]):\s*/`
  - Modules: `/^(Advanced|Alphabet)\b/i` (alternation + word boundary)
  - Steps: `{ name: { $not: /Intro/i } }` (negated regex)
  Includes rationale and a small collation example.

Outputs use explicit projections for readability. Execution stats show `nReturned` and `totalDocsExamined`.

## 6) Performance & Tips
- Prefer left-anchored regex (`/^prefix/`) to allow index use; avoid leading `.*`.
- Use `/i` for case-insensitive if needed; remember collation affects string comparisons (not regex flags).
- Escape special characters and be mindful of input sanitization.
- For broad substring search at scale, consider Atlas Search or n-gram indexing strategies.
- Paginate thoughtfully; regex scans can be expensive on large collections.

## 7) Security notes
- Never store plain passwords; use robust password hashing (demo uses placeholder `password_hash`).
- Emails and progress data are PII; protect access and logs accordingly.
- Validate inputs at the application layer in addition to `$jsonSchema`.

## 8) Folder structure
```
assignments/04-mongo-db/05-regular-expressions/
  README.md
  01-db-setup/
    00_create_database.js
    01_collections_and_indexes.js
    02_seed.js
  02-queries/
    01_regex_prefix_search.js
    02_regex_contains_search.js
    03_regex_complex_pattern_search.js
  03-db-drop/
    00_drop_database.js
    README_DROP.md
```

## 9) License/Authors
- License: MIT (placeholder — update to match your repository).
- Authors: RSL Learning Platform contributors (placeholder).