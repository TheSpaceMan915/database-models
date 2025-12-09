// Run after 00_create_database.js:
//   mongosh --file assignments/04-mongo-db/10-array-operators-v2/01-db-setup/01_collections_and_indexes.js
//
// Purpose: Create collections with $jsonSchema validators and define indexes (MongoDB 8.0).
// Idempotent: updates validator via collMod if collection exists; (re)creating indexes is safe.

db = db.getSiblingDB('user_pref_db_array_v2');

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
  const res = db.getCollection(coll).createIndex(keys, opts || {});
  const name = (opts && opts.name) ? opts.name : res;
  print(`[ok] Index on '${coll}': ${JSON.stringify(keys)} (name=${name})`);
}

const emailPattern = '^[^@\s]+@[^@\s]+\.[^@\s]+$';
const snakeCasePattern = '^[a-z0-9_]+$';

/* ----------------------------- user ----------------------------- */
/* Profile-level arrays for quick access; multikey indexes aid membership queries. */
ensureCollection('user', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['email', 'created_at'],
    properties: {
      email: { bsonType: 'string', pattern: emailPattern },
      created_at: { bsonType: 'date' },
      display_name: { bsonType: 'string' },
      favorite_cuisines: {
        bsonType: 'array',
        items: { bsonType: 'string', pattern: snakeCasePattern },
        description: 'array of option_keys (e.g., italian, japanese)',
      },
      notification_channels: {
        bsonType: 'array',
        items: { bsonType: 'string', enum: ['email', 'sms', 'push', 'telegram', 'whatsapp'] },
      },
    },
  },
});
ix('user', { email: 1 }, { unique: true, name: 'ux_user_email' });
ix('user', { favorite_cuisines: 1 }, { name: 'ix_user_favorite_cuisines' });      // multikey
ix('user', { notification_channels: 1 }, { name: 'ix_user_notification_channels' }); // multikey

/* ---------------------- preference_dimension --------------------- */
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
/* Unique per (dimension_id, option_key); dimension_id is FK-like. */
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
/* Current value per (user_id, pref_key); value can be scalar or array<string>. */
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
/* Audit trail; arrays (tags) demonstrate array updates in history. */
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
      tags: { bsonType: 'array', items: { bsonType: 'string' } },
    },
  },
});
ix('user_preference_events', { user_id: 1, pref_key: 1, performed_at: -1 }, { name: 'ix_events_user_key_time' });
ix('user_preference_events', { pref_key: 1, performed_at: -1 }, { name: 'ix_events_key_time' });
ix('user_preference_events', { user_id: 1 }, { name: 'ix_events_user' });

print('[ok] Collections and indexes are in place.');
