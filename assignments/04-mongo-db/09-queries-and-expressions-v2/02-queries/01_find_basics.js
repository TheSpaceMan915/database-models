// Find method essentials with compact projections.
// Usage:
//   mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/02-queries/01_find_basics.js

db = db.getSiblingDB('user_pref_db_qe_v2');

function header(t) { print(`\n--- ${t} ---`); }

/* 1) user: exact match by email */
header("1) user by email (exact match)");
db.user
  .find({ email: 'alice@example.com' }, { _id: 1, email: 1, created_at: 1 })
  .forEach(printjson);

/* 2) preference_dimension: by dimension_key */
header("2) preference_dimension by dimension_key");
db.preference_dimension
  .find({ dimension_key: 'theme' }, { _id: 0, dimension_key: 1, name: 1, description: 1 })
  .forEach(printjson);

/* 3) preference_option: by dimension_id (lookup dimension by key, then find options) */
header("3) preference_option by dimension_id (from dimension_key='spice_level')");
const dim = db.preference_dimension.findOne({ dimension_key: 'spice_level' }, { _id: 1 });
db.preference_option
  .find({ dimension_id: dim._id }, { _id: 0, option_key: 1, label: 1 })
  .sort({ option_key: 1 })
  .forEach(printjson);

/* 4) user_preferences: by { user_id, pref_key } */
header("4) user_preferences by (user_id, pref_key)");
const u = db.user.findOne({ email: 'alice@example.com' }, { _id: 1, email: 1 });
db.user_preferences
  .find({ user_id: u._id, pref_key: 'theme' }, { _id: 0, pref_key: 1, value: 1, source: 1, confidence: 1 })
  .forEach(printjson);

/* 5) user_preference_events: last N events for a user & key */
header("5) user_preference_events: last 3 events for (user, pref_key='theme')");
db.user_preference_events
  .find({ user_id: u._id, pref_key: 'theme' }, { _id: 0, old_value: 1, new_value: 1, performed_at: 1, event_type: 1 })
  .sort({ performed_at: -1 })
  .limit(3)
  .forEach(printjson);
