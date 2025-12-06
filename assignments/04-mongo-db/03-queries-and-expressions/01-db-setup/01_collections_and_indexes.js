// assignments/04-mongo-db/03-queries-and-expressions/01-db-setup/01_collections_and_indexes.js

// How to run:
//   mongosh assignments/04-mongo-db/03-queries-and-expressions/01-db-setup/01_collections_and_indexes.js
// Creates collections with $jsonSchema validators and indexes. Idempotent with try/catch guards.

use('rsl_lp_db_queries_expr');

// Helper to create collection with validator if missing, otherwise collMod to enforce
function ensureCollection(name, validator) {
  const exists = db.getCollectionNames().includes(name);
  if (!exists) {
    db.createCollection(name, { validator });
    print(`[CREATE] Collection '${name}' created with validator.`);
  } else {
    try {
      db.runCommand({ collMod: name, validator });
      print(`[UPDATE] Collection '${name}' validator updated.`);
    } catch (e) {
      print(`[WARN] collMod failed for '${name}': ${e.message}`);
    }
  }
}

// person: email (string regex), password_hash (string), created_at (date)
// Unique index on email -> fast lookup, prevents duplicates.
ensureCollection('person', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['email', 'password_hash', 'created_at'],
    properties: {
      email: {
        bsonType: 'string',
        description: 'Required email string.',
        pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
      },
      password_hash: { bsonType: 'string', description: 'Required password hash string.' },
      created_at: { bsonType: 'date', description: 'Creation timestamp.' },
      name: { bsonType: 'string', description: 'Optional display name.' }
    },
    additionalProperties: true
  }
});
db.person.createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });

// module: name (<=50), optional description. Unique index on name.
ensureCollection('module', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name'],
    properties: {
      name: { bsonType: 'string', maxLength: 50, description: 'Module name (<=50 chars).' },
      description: { bsonType: 'string', description: 'Optional description.' }
    },
    additionalProperties: true
  }
});
db.module.createIndex({ name: 1 }, { unique: true, name: 'uniq_module_name' });

// lesson: module_id (ObjectId), name (<=50), optional description. Index on module_id for join/filter.
ensureCollection('lesson', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['module_id', 'name'],
    properties: {
      module_id: { bsonType: 'objectId', description: 'Ref to module._id' },
      name: { bsonType: 'string', maxLength: 50, description: 'Lesson name (<=50 chars).' },
      description: { bsonType: 'string', description: 'Optional description.' }
    },
    additionalProperties: true
  }
});
db.lesson.createIndex({ module_id: 1 }, { name: 'idx_lesson_module_id' });

// step: lesson_id (ObjectId), name (<=50), optional url, notes (string). Index on lesson_id.
ensureCollection('step', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['lesson_id', 'name', 'notes'],
    properties: {
      lesson_id: { bsonType: 'objectId', description: 'Ref to lesson._id' },
      name: { bsonType: 'string', maxLength: 50, description: 'Step name (<=50 chars).' },
      url: { bsonType: 'string', description: 'Optional URL.' },
      notes: { bsonType: 'string', description: 'Short notes; required.' },
      order_index: { bsonType: 'int', description: 'Optional numeric order for demo.' }
    },
    additionalProperties: true
  }
});
db.step.createIndex({ lesson_id: 1 }, { name: 'idx_step_lesson_id' });

// status: name enum: available|in_progress|completed. Unique index on name.
ensureCollection('status', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name'],
    properties: {
      name: {
        bsonType: 'string',
        enum: ['available', 'in_progress', 'completed'],
        description: 'Canonical status string.'
      }
    },
    additionalProperties: false
  }
});
db.status.createIndex({ name: 1 }, { unique: true, name: 'uniq_status_name' });

// person_module_progress: person_id, module_id, status_id, updated_at
// Unique compound (person_id, module_id) prevents duplicate progress rows per person-module.
// Supporting indexes help filtering by person_id, module_id, status_id quickly.
ensureCollection('person_module_progress', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['person_id', 'module_id', 'status_id', 'updated_at'],
    properties: {
      person_id: { bsonType: 'objectId', description: 'Ref to person._id' },
      module_id: { bsonType: 'objectId', description: 'Ref to module._id' },
      status_id: { bsonType: 'objectId', description: 'Ref to status._id' },
      updated_at: { bsonType: 'date', description: 'Last update time.' }
    },
    additionalProperties: true
  }
});
db.person_module_progress.createIndex(
  { person_id: 1, module_id: 1 },
  { unique: true, name: 'uniq_person_module' }
);
db.person_module_progress.createIndex({ person_id: 1 }, { name: 'idx_pmp_person' });
db.person_module_progress.createIndex({ module_id: 1 }, { name: 'idx_pmp_module' });
db.person_module_progress.createIndex({ status_id: 1 }, { name: 'idx_pmp_status' });

// person_lesson_progress: unique (person_id, lesson_id) + supporting indexes.
ensureCollection('person_lesson_progress', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['person_id', 'lesson_id', 'status_id', 'updated_at'],
    properties: {
      person_id: { bsonType: 'objectId' },
      lesson_id: { bsonType: 'objectId' },
      status_id: { bsonType: 'objectId' },
      updated_at: { bsonType: 'date' }
    },
    additionalProperties: true
  }
});
db.person_lesson_progress.createIndex(
  { person_id: 1, lesson_id: 1 },
  { unique: true, name: 'uniq_person_lesson' }
);
db.person_lesson_progress.createIndex({ person_id: 1 }, { name: 'idx_plp_person' });
db.person_lesson_progress.createIndex({ lesson_id: 1 }, { name: 'idx_plp_lesson' });
db.person_lesson_progress.createIndex({ status_id: 1 }, { name: 'idx_plp_status' });

// person_step_progress: unique (person_id, step_id) + supporting indexes.
ensureCollection('person_step_progress', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['person_id', 'step_id', 'status_id', 'updated_at'],
    properties: {
      person_id: { bsonType: 'objectId' },
      step_id: { bsonType: 'objectId' },
      status_id: { bsonType: 'objectId' },
      updated_at: { bsonType: 'date' }
    },
    additionalProperties: true
  }
});
db.person_step_progress.createIndex(
  { person_id: 1, step_id: 1 },
  { unique: true, name: 'uniq_person_step' }
);
db.person_step_progress.createIndex({ person_id: 1 }, { name: 'idx_psp_person' });
db.person_step_progress.createIndex({ step_id: 1 }, { name: 'idx_psp_step' });
db.person_step_progress.createIndex({ status_id: 1 }, { name: 'idx_psp_status' });

print('[OK] Collections and indexes ensured.');