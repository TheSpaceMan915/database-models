// assignments/04-mongo-db/05-regular-expressions/01-db-setup/01_collections_and_indexes.js

// How to run:
//   mongosh assignments/04-mongo-db/05-regular-expressions/01-db-setup/01_collections_and_indexes.js
// Creates collections with $jsonSchema validators and indexes (idempotent via existence checks).
// Regex-focused: name fields are validated as strings and indexed to support left-anchored regex.

use('rsl_lp_db_regex');

// Helper to create collection with validator if missing, otherwise collMod to enforce validator
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

// person: email (regex), password_hash, created_at
// Index: unique on email for identity dedupe and fast lookup.
ensureCollection('person', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['email', 'password_hash', 'created_at'],
    properties: {
      email: {
        bsonType: 'string',
        pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
        description: 'Valid email string.'
      },
      password_hash: { bsonType: 'string', description: 'Required password hash string.' },
      created_at: { bsonType: 'date', description: 'Creation timestamp.' },
      name: { bsonType: 'string', description: 'Optional display name.' }
    },
    additionalProperties: true
  }
});
db.person.createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });

// module: name (<=50), description optional
// Indexes: unique(name) for dedupe; extra btree index on name to support left-anchored regex (/^prefix/).
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
db.module.createIndex({ name: 1 }, { name: 'idx_module_name_for_regex' });

// lesson: module_id, name (<=60), description optional
// Indexes: module_id for filtering; extra btree index on name for regex searches.
ensureCollection('lesson', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['module_id', 'name'],
    properties: {
      module_id: { bsonType: 'objectId', description: 'Ref to module._id' },
      name: { bsonType: 'string', maxLength: 60, description: 'Lesson name (<=60 chars).' },
      description: { bsonType: 'string', description: 'Optional description.' }
    },
    additionalProperties: true
  }
});
db.lesson.createIndex({ module_id: 1 }, { name: 'idx_lesson_module_id' });
db.lesson.createIndex({ name: 1 }, { name: 'idx_lesson_name_for_regex' });

// step: lesson_id, name (<=60), url optional, notes optional
// Indexes: lesson_id for filtering; extra btree index on name for regex searches.
ensureCollection('step', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['lesson_id', 'name'],
    properties: {
      lesson_id: { bsonType: 'objectId', description: 'Ref to lesson._id' },
      name: { bsonType: 'string', maxLength: 60, description: 'Step name (<=60 chars).' },
      url: { bsonType: 'string', description: 'Optional URL.' },
      notes: { bsonType: 'string', description: 'Optional notes.' }
    },
    additionalProperties: true
  }
});
db.step.createIndex({ lesson_id: 1 }, { name: 'idx_step_lesson_id' });
db.step.createIndex({ name: 1 }, { name: 'idx_step_name_for_regex' });

// status: name enum; unique index ensures canonical set.
ensureCollection('status', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name'],
    properties: {
      name: { bsonType: 'string', enum: ['available', 'in_progress', 'completed'] }
    },
    additionalProperties: false
  }
});
db.status.createIndex({ name: 1 }, { unique: true, name: 'uniq_status_name' });

// Progress collections: person_*_progress — track status over modules/lessons/steps.
// Unique compound on (person_id, target_id) to prevent duplicates.
// Supporting indexes speed up lookups by foreign-like fields.
ensureCollection('person_module_progress', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['person_id', 'module_id', 'status_id', 'updated_at'],
    properties: {
      person_id: { bsonType: 'objectId' },
      module_id: { bsonType: 'objectId' },
      status_id: { bsonType: 'objectId' },
      updated_at: { bsonType: 'date' }
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
print('Note: Left-anchored regex (e.g., /^Basic/i) can leverage the name indexes;');
print('      general substrings (e.g., /log/i) typically scan the collection (COLLSCAN).');