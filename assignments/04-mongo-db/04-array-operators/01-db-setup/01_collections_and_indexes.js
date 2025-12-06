// assignments/04-mongo-db/04-array-operators/01-db-setup/01_collections_and_indexes.js

// How to run:
//   mongosh assignments/04-mongo-db/04-array-operators/01-db-setup/01_collections_and_indexes.js
// Creates collections with $jsonSchema validators and indexes (idempotent via existence checks).

use('rsl_lp_db_array_ops');

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

// module: name (<=50), description optional, tags: array of strings <=30 chars
// Index: unique name for content dedupe.
ensureCollection('module', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name'],
    properties: {
      name: { bsonType: 'string', maxLength: 50, description: 'Module name (<=50 chars).' },
      description: { bsonType: 'string', description: 'Optional description.' },
      tags: {
        bsonType: 'array',
        description: 'Array of tag strings (<=30 chars).',
        items: { bsonType: 'string', maxLength: 30 }
      }
    },
    additionalProperties: true
  }
});
db.module.createIndex({ name: 1 }, { unique: true, name: 'uniq_module_name' });

// lesson: module_id, name (<=50), resources: array of {kind,url,title<=120}
// Index: module_id for frequent filtering joins.
ensureCollection('lesson', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['module_id', 'name'],
    properties: {
      module_id: { bsonType: 'objectId', description: 'Ref to module._id' },
      name: { bsonType: 'string', maxLength: 50, description: 'Lesson name (<=50 chars).' },
      description: { bsonType: 'string', description: 'Optional description.' },
      resources: {
        bsonType: 'array',
        description: 'Array of resource objects (video, note, quiz).',
        items: {
          bsonType: 'object',
          required: ['kind', 'url'],
          properties: {
            kind: { bsonType: 'string', enum: ['video', 'note', 'quiz'] },
            url: { bsonType: 'string' },
            title: { bsonType: 'string', maxLength: 120 }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: true
  }
});
db.lesson.createIndex({ module_id: 1 }, { name: 'idx_lesson_module_id' });

// step: lesson_id, name (<=50), url optional, notes optional, tags: array of strings <=30
// Index: lesson_id for filtering; tags are constrained by length to keep arrays small/clean.
ensureCollection('step', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['lesson_id', 'name'],
    properties: {
      lesson_id: { bsonType: 'objectId', description: 'Ref to lesson._id' },
      name: { bsonType: 'string', maxLength: 50, description: 'Step name (<=50 chars).' },
      url: { bsonType: 'string', description: 'Optional URL.' },
      notes: { bsonType: 'string', description: 'Optional notes.' },
      tags: {
        bsonType: 'array',
        description: 'Array of tag strings (<=30 chars).',
        items: { bsonType: 'string', maxLength: 30 }
      }
    },
    additionalProperties: true
  }
});
db.step.createIndex({ lesson_id: 1 }, { name: 'idx_step_lesson_id' });

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