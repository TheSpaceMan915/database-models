// Run after 00_create_database.js:
//   mongosh --file assignments/04-mongo-db/07-user-preference-system-db/01-db-setup/01_collections_and_indexes.js
//
// Purpose: Create collections with $jsonSchema validators and define indexes (MongoDB 8.0).
// Idempotent: updates validator via collMod if collection exists; (re)creating indexes is safe.

db = db.getSiblingDB('user_pref_db');

function ensureCollection(name, schema) {
  const exists = db.getCollectionNames().includes(name);
  if (!exists) {
    db.createCollection(name, {
      validator: schema,
      validationLevel: 'moderate',
      validationAction: 'error',
    });
    print(`[ok] Created collection '${name}' with validator`);
  } else {
    // Update validator if collection already exists
    db.runCommand({
      collMod: name,
      validator: schema,
      validationLevel: 'moderate',
      validationAction: 'error',
    });
    print(`[ok] Updated validator on existing collection '${name}'`);
  }
}

function ix(coll, keys, opts) {
  const name = (opts && opts.name) ? opts.name : undefined;
  const res = db.getCollection(coll).createIndex(keys, opts || {});
  print(`[ok] Index on '${coll}': ${JSON.stringify(keys)} ${name ? `(name=${name})` : ''}`);
}

/* ----------------------------- user ----------------------------- */
/* email unique; simple email regex; created_at required */
const emailPattern = '^[^@\s]+@[^@\s]+\.[^@\s]+$';
ensureCollection('user', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['email', 'created_at'],
    properties: {
      email: { bsonType: 'string', pattern: emailPattern },
      created_at: { bsonType: 'date' },
      display_name: { bsonType: 'string' },
    },
    additionalProperties: true,
  },
});
ix('user', { email: 1 }, { unique: true, name: 'ux_user_email' });

/* ---------------------- preference_dimension --------------------- */
/* dimension_key unique; snake_case; short name */
const snakeCasePattern = '^[a-z0-9_]+$';
ensureCollection('preference_dimension', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'dimension_key'],
    properties: {
      name: { bsonType: 'string', maxLength: 80 },
      dimension_key: { bsonType: 'string', pattern: snakeCasePattern },
      description: { bsonType: 'string' },
      created_at: { bsonType: 'date' },
    },
  },
});
ix('preference_dimension', { dimension_key: 1 }, { unique: true, name: 'ux_dimension_key' });

/* ----------------------- preference_option ----------------------- */
/* unique per (dimension_id, option_key); FK-like dimension_id */
ensureCollection('preference_option', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['dimension_id', 'option_key', 'label'],
    properties: {
      dimension_id: { bsonType: 'objectId' },
      option_key: { bsonType: 'string', pattern: snakeCasePattern },
      label: { bsonType: 'string', maxLength: 80 },
      description: { bsonType: 'string' },
      created_at: { bsonType: 'date' },
    },
  },
});
ix('preference_option', { dimension_id: 1, option_key: 1 }, { unique: true, name: 'ux_option_dim_key' });
ix('preference_option', { dimension_id: 1 }, { name: 'ix_option_dim' });

/* ----------------------- user_preferences ------------------------ */
/* single source of truth per (user_id, pref_key); value can be scalar or array<string> */
ensureCollection('user_preferences', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['user_id', 'pref_key', 'value', 'source', 'confidence', 'updated_at'],
    properties: {
      user_id: { bsonType: 'objectId' },
      pref_key: { bsonType: 'string', pattern: snakeCasePattern },
      value: {
        oneOf: [
          { bsonType: ['string', 'int', 'long', 'double', 'bool'] },
          { bsonType: 'array', items: { bsonType: 'string' } },
        ],
      },
      source: { enum: ['manual', 'import', 'inferred', 'default'] },
      confidence: { bsonType: ['double', 'decimal'], minimum: 0, maximum: 1 },
      updated_at: { bsonType: 'date' },
    },
  },
});
ix('user_preferences', { user_id: 1, pref_key: 1 }, { unique: true, name: 'ux_user_pref_key' });
ix('user_preferences', { user_id: 1 }, { name: 'ix_userpref_user' });
ix('user_preferences', { pref_key: 1 }, { name: 'ix_userpref_key' });

/* -------------------- user_preference_events --------------------- */
/* audit trail; query by (user_id, pref_key, performed_at desc) */
ensureCollection('user_preference_events', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['user_id', 'pref_key', 'new_value', 'source', 'confidence', 'performed_at'],
    properties: {
      user_id: { bsonType: 'objectId' },
      pref_key: { bsonType: 'string', pattern: snakeCasePattern },
      old_value: {
        oneOf: [
          { bsonType: ['string', 'int', 'long', 'double', 'bool'] },
          { bsonType: 'array', items: { bsonType: 'string' } },
          { bsonType: 'null' },
        ],
      },
      new_value: {
        oneOf: [
          { bsonType: ['string', 'int', 'long', 'double', 'bool'] },
          { bsonType: 'array', items: { bsonType: 'string' } },
        ],
      },
      source: { enum: ['manual', 'import', 'inferred', 'default'] },
      confidence: { bsonType: ['double', 'decimal'], minimum: 0, maximum: 1 },
      performed_at: { bsonType: 'date' },
      event_type: { bsonType: 'string', description: 'e.g., set|unset|migrate' },
    },
  },
});
ix('user_preference_events', { user_id: 1, pref_key: 1, performed_at: -1 }, { name: 'ix_events_user_key_time' });
ix('user_preference_events', { pref_key: 1, performed_at: -1 }, { name: 'ix_events_key_time' });
ix('user_preference_events', { user_id: 1 }, { name: 'ix_events_user' });

print('[ok] Collections and indexes are in place.');
