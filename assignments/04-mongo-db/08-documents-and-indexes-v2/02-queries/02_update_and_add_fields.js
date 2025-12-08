// Demonstrate targeted updates, adding new fields, and an upsert example.
// Usage:
//   mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/02-queries/02_update_and_add_fields.js

db = db.getSiblingDB('user_pref_db_v2');

// 1) Update an existing field in user_preferences: adjust confidence on Alice's theme.
const uAlice = db.user.findOne({ email: 'alice@example.com' }, { email: 1 });
const beforePref = db.user_preferences.findOne(
  { user_id: uAlice._id, pref_key: 'theme' },
  { _id: 0, pref_key: 1, value: 1, confidence: 1, source: 1 }
);
print('[before] Alice theme preference');
printjson(beforePref);

const updRes = db.user_preferences.updateOne(
  { user_id: uAlice._id, pref_key: 'theme' },
  { $set: { confidence: 0.98, source: 'manual', updated_at: new Date() } }
);
print('[updateOne] user_preferences updated');
printjson({ matchedCount: updRes.matchedCount, modifiedCount: updRes.modifiedCount });

const afterPref = db.user_preferences.findOne(
  { user_id: uAlice._id, pref_key: 'theme' },
  { _id: 0, pref_key: 1, value: 1, confidence: 1, source: 1 }
);
print('[after] Alice theme preference');
printjson(afterPref);

// 2) Add a new field to a dimension (tags array). Use $addToSet to avoid duplicates.
const tagRes = db.preference_dimension.updateOne(
  { dimension_key: 'cuisine_favorite' },
  { $addToSet: { tags: { $each: ['profile', 'food'] } } }
);
print('[updateOne] preference_dimension add tags');
printjson({ matchedCount: tagRes.matchedCount, modifiedCount: tagRes.modifiedCount });

// 3) Upsert example on events: add a maintenance marker doc with metadata if absent.
const markerWhen = new Date();
const upsertRes = db.user_preference_events.updateOne(
  { user_id: uAlice._id, pref_key: 'maintenance_marker', performed_at: { $gte: markerWhen } },
  {
    $set: {
      metadata: { channel: 'web', campaign: 'spring' },
      source: 'import',
      confidence: 1.0,
      event_type: 'migrate',
      new_value: 'noop', // required by schema; simple string is acceptable
      performed_at: markerWhen,
    },
    $setOnInsert: {
      old_value: null,
    },
  },
  { upsert: true }
);
print('[upsert] events maintenance marker');
printjson({
  matchedCount: upsertRes.matchedCount,
  modifiedCount: upsertRes.modifiedCount,
  upsertedId: upsertRes.upsertedId,
});

// Show the upserted/updated doc
const markerDoc = db.user_preference_events.findOne(
  { user_id: uAlice._id, pref_key: 'maintenance_marker', performed_at: { $gte: markerWhen } },
  { _id: 0, pref_key: 1, metadata: 1, source: 1, confidence: 1, event_type: 1, new_value: 1, performed_at: 1 }
);
print('[marker] event doc');
printjson(markerDoc);
