// assignments/04-mongo-db/01-rsl-lp-db/01-db-setup/01_collections_and_indexes.js
// Purpose: Create collections with JSON Schema validation and build indexes.
// Idempotent: safely re-runnable; existing collections get validators via collMod.
// How to run:
//   mongosh --quiet --eval "load('assignments/04-mongo-db/01-rsl-lp-db/01-db-setup/01_collections_and_indexes.js')"

const DB_NAME = 'rsl_lp_db';
use(DB_NAME);

// Helper: create or update validator on a collection
function ensureCollection(name, validator) {
  const exists = db.getCollectionInfos({ name }).length > 0;
  const opts = {
    validator,
    validationLevel: 'strict',
    validationAction: 'error',
  };

  if (!exists) {
    print(`• Creating collection: ${name}`);
    db.createCollection(name, opts);
  } else {
    print(`• Updating validator on: ${name}`);
    // Update validator for existing collection
    db.runCommand({ collMod: name, ...opts });
  }
}

// -----------------------
// JSON Schema Validators
// -----------------------

const personSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['email', 'password_hash', 'created_at'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      email: {
        bsonType: 'string',
        description: 'unique user email (PII)',
        maxLength: 254,
        pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$',
      },
      password_hash: {
        bsonType: 'string',
        description: 'never store plain passwords',
        minLength: 6,
        maxLength: 255,
      },
      created_at: { bsonType: 'date' },
    },
  },
};

const moduleSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      name: { bsonType: 'string', maxLength: 50 },
      description: { bsonType: ['string', 'null'], maxLength: 255 },
    },
  },
};

const lessonSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['module_id', 'name'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      module_id: { bsonType: 'objectId', description: 'ref → module._id' },
      name: { bsonType: 'string', maxLength: 50 },
      description: { bsonType: ['string', 'null'], maxLength: 255 },
    },
  },
};

const stepSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['lesson_id', 'name'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      lesson_id: { bsonType: 'objectId', description: 'ref → lesson._id' },
      name: { bsonType: 'string', maxLength: 50 },
      url: {
        bsonType: ['string', 'null'],
        maxLength: 512,
        pattern: '^https?://',
      },
      notes: { bsonType: ['string', 'null'], maxLength: 2000 },
    },
  },
};

const statusSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      name: {
        bsonType: 'string',
        enum: ['available', 'in_progress', 'completed'],
      },
    },
  },
};

const personModuleProgressSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['person_id', 'module_id', 'status_id', 'updated_at'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      person_id: { bsonType: 'objectId', description: 'ref → person._id' },
      module_id: { bsonType: 'objectId', description: 'ref → module._id' },
      status_id: { bsonType: 'objectId', description: 'ref → status._id' },
      updated_at: { bsonType: 'date' },
    },
  },
};

const personLessonProgressSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['person_id', 'lesson_id', 'status_id', 'updated_at'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      person_id: { bsonType: 'objectId', description: 'ref → person._id' },
      lesson_id: { bsonType: 'objectId', description: 'ref → lesson._id' },
      status_id: { bsonType: 'objectId', description: 'ref → status._id' },
      updated_at: { bsonType: 'date' },
    },
  },
};

const personStepProgressSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['person_id', 'step_id', 'status_id', 'updated_at'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      person_id: { bsonType: 'objectId', description: 'ref → person._id' },
      step_id: { bsonType: 'objectId', description: 'ref → step._id' },
      status_id: { bsonType: 'objectId', description: 'ref → status._id' },
      updated_at: { bsonType: 'date' },
    },
  },
};

// -----------------
// Create / collMod
// -----------------
ensureCollection('person', personSchema);
ensureCollection('module', moduleSchema);
ensureCollection('lesson', lessonSchema);
ensureCollection('step', stepSchema);
ensureCollection('status', statusSchema);
ensureCollection('person_module_progress', personModuleProgressSchema);
ensureCollection('person_lesson_progress', personLessonProgressSchema);
ensureCollection('person_step_progress', personStepProgressSchema);

// -------
// Indexes
// -------
// Strings 'name' for indexes are provided for stability; createIndex is idempotent.

// person: unique email
db.person.createIndex({ email: 1 }, { name: 'ux_person_email', unique: true });

// module: unique name
db.module.createIndex({ name: 1 }, { name: 'ux_module_name', unique: true });

// lesson: FK-like index
db.lesson.createIndex({ module_id: 1 }, { name: 'ix_lesson_module_id' });

// step: FK-like index
db.step.createIndex({ lesson_id: 1 }, { name: 'ix_step_lesson_id' });

// status: unique name
db.status.createIndex({ name: 1 }, { name: 'ux_status_name', unique: true });

// person_module_progress: unique (person_id, module_id) + support indexes
db.person_module_progress.createIndex(
  { person_id: 1, module_id: 1 },
  { name: 'ux_pmp_person_module', unique: true }
);
db.person_module_progress.createIndex({ person_id: 1 }, { name: 'ix_pmp_person' });
db.person_module_progress.createIndex({ module_id: 1 }, { name: 'ix_pmp_module' });
db.person_module_progress.createIndex({ status_id: 1 }, { name: 'ix_pmp_status' });

// person_lesson_progress: unique (person_id, lesson_id) + support indexes
db.person_lesson_progress.createIndex(
  { person_id: 1, lesson_id: 1 },
  { name: 'ux_plp_person_lesson', unique: true }
);
db.person_lesson_progress.createIndex({ person_id: 1 }, { name: 'ix_plp_person' });
db.person_lesson_progress.createIndex({ lesson_id: 1 }, { name: 'ix_plp_lesson' });
db.person_lesson_progress.createIndex({ status_id: 1 }, { name: 'ix_plp_status' });

// person_step_progress: unique (person_id, step_id) + support indexes
db.person_step_progress.createIndex(
  { person_id: 1, step_id: 1 },
  { name: 'ux_psp_person_step', unique: true }
);
db.person_step_progress.createIndex({ person_id: 1 }, { name: 'ix_psp_person' });
db.person_step_progress.createIndex({ step_id: 1 }, { name: 'ix_psp_step' });
db.person_step_progress.createIndex({ status_id: 1 }, { name: 'ix_psp_status' });

print('✔ Collections ensured and indexes created.');
