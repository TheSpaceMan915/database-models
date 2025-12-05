# RSL Learning Platform — MongoDB 8.0 Documents & Indexes (assignments/04-mongo-db/02-documents-and-indexes)

An updated MongoDB 8.0 module for the RSL Learning Platform that focuses on **document replacement**,  
**field updates**, and **index usage** (COLLSCAN vs IXSCAN). It also includes JSON Schema validators,  
unique/compound indexes, deterministic seed data, and clean drop scripts.

---

## 1) Overview

Compared to the base module, this one demonstrates:
- Safe/unsafe aspects of `replaceOne` vs `$set`.
- Adding fields to existing documents and idempotent upserts.
- Explaining queries to verify index usage and how `hint()` affects plans.

Collections:
- `person`, `module`, `lesson`, `step`, `status`,
- `person_module_progress`, `person_lesson_progress`, `person_step_progress`.

---

## 2) Quickstart (mongosh)

From the repository root:

```bash
# Select DB
mongosh --quiet --eval "load('assignments/04-mongo-db/02-documents-and-indexes/01-db-setup/00_create_database.js')"

# Validators + indexes
mongosh --quiet --eval "load('assignments/04-mongo-db/02-documents-and-indexes/01-db-setup/01_collections_and_indexes.js')"

# Seed deterministic mock data
mongosh --quiet --eval "load('assignments/04-mongo-db/02-documents-and-indexes/01-db-setup/02_seed.js')"
```

Run query demos:

```bash
# Full-document replacement demo
mongosh --quiet --eval "load('assignments/04-mongo-db/02-documents-and-indexes/02-queries/01_replace_document.js')"

# Field updates, adding fields, and upsert
mongosh --quiet --eval "load('assignments/04-mongo-db/02-documents-and-indexes/02-queries/02_update_and_add_fields.js')"

# COLLSCAN vs IXSCAN; hint() usage
mongosh --quiet --eval "load('assignments/04-mongo-db/02-documents-and-indexes/02-queries/03_scan_vs_index.js')"
```

Drop everything (⚠ irreversible):

```bash
mongosh --quiet --eval "load('assignments/04-mongo-db/02-documents-and-indexes/03-db-drop/00_drop_database.js')"
```

---

## 3) Data model

- `person` — minimal user profile with unique `email`, `password_hash`, `created_at`.
- `module` → `lesson` → `step` — content hierarchy (1:N relationships).
- `status` — canonical values: `available`, `in_progress`, `completed`.
- Progress collections reference both `person` and the target entity plus `status_id`.

**Reference over embed**: progress grows independently and may become large; references enable targeted
indexes and avoid bloated documents.

---

## 4) Validation & Indexes

- Validators enforce required fields, basic email regex, string length bounds, and objectId references.
- Key indexes:
  - Unique: `person.email`, `module.name`, `status.name`, compound uniqueness on progress pairs.
  - Supporting btree indexes: foreign-key-like fields (`module_id`, `lesson_id`, `step_id`, `person_id`, `status_id`).
- Named indexes are idempotent and improve clarity in `explain()` and logs.

---

## 5) Example queries provided

- **01_replace_document.js** — `replaceOne` end-to-end with before/after snapshots and caveats.
- **02_update_and_add_fields.js** — `$set` to update and add fields; fill missing values; idempotent upsert.
- **03_scan_vs_index.js** — `explain('executionStats')` to show when COLLSCAN/IXSCAN is used, plus `hint()`.

---

## 6) Performance & Scaling

- Ensure coverage on foreign-key-like fields.
- Use explicit projections; avoid returning large documents by default.
- Paginate by `_id` or time fields for stable cursors; avoid deep `skip`.

---

## 7) Security notes

- Store **only password hashes**, never plain text.
- Treat emails as PII; restrict access and enable auditing as necessary.

---

## 8) Folder structure

```
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
```

---

## 9) License / Authors

- License: MIT (placeholder)  
- Authors: Your Team (maintainers)
