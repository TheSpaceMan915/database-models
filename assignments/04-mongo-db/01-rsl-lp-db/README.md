# RSL Learning Platform — MongoDB 8.0 Database (assignments/04-mongo-db/01-rsl-lp-db)

Production-ready MongoDB 8.0 setup for the RSL (Russian Sign Language) Learning Platform.
It stores people, content (modules → lessons → steps), canonical status values, and progress
documents per person at **module**, **lesson**, and **step** levels.

---

## 1) Overview

- **Why progress at three levels?** Learners consume content step-by-step, but reporting is needed
  at lesson/module granularity. Progress documents capture status independently at each level.
- **Reference strategy:** we **reference** (not embed) in progress collections because these rows
  can grow unbounded and have a write cadence independent from content or persons.

Collections:
- `person` — minimal user profile (unique email, password hash).
- `module`, `lesson`, `step` — content hierarchy (1:N from module to lessons, lesson to steps).
- `status` — canonical status values: `available`, `in_progress`, `completed`.
- `person_*_progress` — many-to-one references to `person` and the target content entity plus `status`.

---

## 2) Quickstart (mongosh)

From the repository root:

```bash
# 1. Select DB
mongosh --quiet --eval "load('assignments/04-mongo-db/01-rsl-lp-db/01-db-setup/00_create_database.js')"

# 2. Create collections, validators, and indexes
mongosh --quiet --eval "load('assignments/04-mongo-db/01-rsl-lp-db/01-db-setup/01_collections_and_indexes.js')"

# 3. Seed realistic mock data
mongosh --quiet --eval "load('assignments/04-mongo-db/01-rsl-lp-db/01-db-setup/02_seed.js')"
```

Drop everything (⚠ irreversible):

```bash
mongosh --quiet --eval "load('assignments/04-mongo-db/01-rsl-lp-db/02-db-drop/00_drop_database.js')"
```

---

## 3) Data Model

- **person**: email (unique), password hash (never store plain passwords), created_at timestamp.
- **module**: top-level learning units (e.g., Alphabet, Basic Phrases).
- **lesson**: belongs to a module.
- **step**: belongs to a lesson; contains a video URL and optional notes.
- **status**: restricted enum (`available`, `in_progress`, `completed`).
- **person_module_progress / person_lesson_progress / person_step_progress**:
  track a person’s current status and updated_at timestamp per entity.

**Why references?** Progress grows with learning interactions and needs fast, independent lookups
by person and by entity. Referencing avoids document bloat and supports targeted indexing.

---

## 4) Validation & Indexes

- JSON Schema validators enforce **required fields**, value constraints (email regex, string lengths),
  and types (`objectId` references).
- Unique and supporting indexes:
  - `person.email` (unique),
  - `module.name` (unique),
  - `lesson.module_id`, `step.lesson_id`,
  - `status.name` (unique),
  - Unique compound keys on progress:
    - `(person_id, module_id)`, `(person_id, lesson_id)`, `(person_id, step_id)`,
  - Supporting indexes on `status_id` for progress queries.

---

## 5) Example Queries (mongosh)

```javascript
use('rsl_lp_db');

// 1) List lessons for a given module by name
const mdl = db.module.findOne({ name: 'Alphabet' }, { projection: { _id: 1 } });
db.lesson.find({ module_id: mdl._id }, { projection: { _id: 1, name: 1 } }).sort({ name: 1 });

// 2) Steps with URLs for a given lesson
const lsn = db.lesson.findOne({ name: 'Greetings' }, { projection: { _id: 1 } });
db.step.find({ lesson_id: lsn._id }, { projection: { _id: 1, name: 1, url: 1 } }).sort({ name: 1 });

// 3) A person’s completed steps (by email)
const user = db.person.findOne({ email: 'alice@example.com' }, { projection: { _id: 1 } });
const stCompleted = db.status.findOne({ name: 'completed' })._id;
db.person_step_progress.aggregate([
  { $match: { person_id: user._id, status_id: stCompleted } },
  { $lookup: { from: 'step', localField: 'step_id', foreignField: '_id', as: 's' } },
  { $unwind: '$s' },
  { $project: { _id: 0, step_id: '$s._id', step_name: '$s.name' } },
]);

// 4) Module completion summary per person (counts by status)
db.person_module_progress.aggregate([
  { $lookup: { from: 'status', localField: 'status_id', foreignField: '_id', as: 'st' } },
  { $unwind: '$st' },
  { $lookup: { from: 'person', localField: 'person_id', foreignField: '_id', as: 'p' } },
  { $unwind: '$p' },
  { $group: { _id: { email: '$p.email', status: '$st.name' }, modules: { $sum: 1 } } },
  { $sort: { '_id.email': 1, '_id.status': 1 } },
]);

// 5) Find users “stuck” in progress (no completed records)
db.person.aggregate([
  { $lookup: {
      from: 'person_module_progress',
      let: { person_id: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$person_id', '$$person_id'] } } },
        { $lookup: { from: 'status', localField: 'status_id', foreignField: '_id', as: 'st' } },
        { $unwind: '$st' },
      ],
      as: 'pmp'
  }},
  { $match: { 'pmp.st.name': { $ne: 'completed' } } },
  { $project: { _id: 0, email: 1 } },
]);

// 6) Lessons with step counts
db.step.aggregate([
  { $group: { _id: '$lesson_id', steps: { $sum: 1 } } },
  { $lookup: { from: 'lesson', localField: '_id', foreignField: '_id', as: 'l' } },
  { $unwind: '$l' },
  { $project: { _id: 0, lesson: '$l.name', steps: 1 } },
  { $sort: { steps: -1, lesson: 1 } },
]);
```

---

## 6) Performance & Scaling

- Index all “foreign key–like” fields (`module_id`, `lesson_id`, `step_id`, `person_id`, `status_id`).
- Keep progress writes small and frequent; query with explicit projections.
- Paginate using `_id` or `created_at` style cursors; avoid deep `skip` for large datasets.

---

## 7) Security Notes

- Store only **password hashes**, never plain text.
- Treat emails as PII; restrict access and enable auditing as needed.

---

## 8) Folder Structure

```
01-db-setup/
  00_create_database.js         # select DB
  01_collections_and_indexes.js # validators + indexes
  02_seed.js                    # realistic mock data
02-db-drop/
  00_drop_database.js           # irreversible drop
  README_DROP.md                # instructions & warnings
```

---

## 9) License / Authors

- License: MIT (placeholder)
- Authors: Your Team (maintainers)
