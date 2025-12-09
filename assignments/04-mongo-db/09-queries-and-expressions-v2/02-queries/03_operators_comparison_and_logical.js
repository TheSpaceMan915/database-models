// Comparison & logical operators: $lt, $lte, $gt, $gte, $ne, $in, $nin, $not
// Usage:
//   mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/02-queries/03_operators_comparison_and_logical.js

db = db.getSiblingDB('user_pref_db_qe_v2');

function header(t) { print(`\n--- ${t} ---`); }
function showCursor(cursor) { cursor.forEach(printjson); }

/* Prepare ids for examples */
const u = db.user.findOne({ email: 'alice@example.com' }, { _id: 1 });

/* Range operators on indexed numeric field 'confidence' */
header("1) $lt: preferences with confidence < 0.7");
let cur = db.user_preferences
  .find({ confidence: { $lt: 0.7 } }, { _id: 0, pref_key: 1, value: 1, confidence: 1, source: 1 })
  .sort({ confidence: 1 });
showCursor(cur);
print(`count = ${db.user_preferences.countDocuments({ confidence: { $lt: 0.7 } })}`);

header("2) $lte: preferences with confidence <= 0.7");
cur = db.user_preferences
  .find({ confidence: { $lte: 0.7 } }, { _id: 0, pref_key: 1, value: 1, confidence: 1 })
  .sort({ confidence: 1 });
showCursor(cur);

header("3) $gt: preferences with confidence > 0.9");
cur = db.user_preferences
  .find({ confidence: { $gt: 0.9 } }, { _id: 0, pref_key: 1, value: 1, confidence: 1 })
  .sort({ confidence: -1 });
showCursor(cur);

header("4) $gte: preferences with confidence >= 0.9");
cur = db.user_preferences
  .find({ confidence: { $gte: 0.9 } }, { _id: 0, pref_key: 1, value: 1, confidence: 1 })
  .sort({ confidence: -1 });
showCursor(cur);

/* $ne: source not equal 'default' */
header("5) $ne: preferences whose source != 'default'");
cur = db.user_preferences
  .find({ source: { $ne: 'default' } }, { _id: 0, pref_key: 1, source: 1, confidence: 1 })
  .limit(10);
showCursor(cur);
print(`count = ${db.user_preferences.countDocuments({ source: { $ne: 'default' } })}`);

/* $in / $nin */
header("6) $in: users whose email is in a set");
cur = db.user
  .find({ email: { $in: ['alice@example.com', 'bob@example.com', 'nobody@example.com'] } }, { _id: 0, email: 1 })
  .sort({ email: 1 });
showCursor(cur);

header("7) $nin: users whose email is NOT in a set");
cur = db.user
  .find({ email: { $nin: ['alice@example.com', 'bob@example.com'] } }, { _id: 0, email: 1 })
  .sort({ email: 1 });
showCursor(cur);

header("8) $in on pref_key: preferences with key in ['theme','notifications']");
cur = db.user_preferences
  .find({ pref_key: { $in: ['theme', 'notifications'] } }, { _id: 0, pref_key: 1, value: 1, user_id: 1 })
  .limit(10);
showCursor(cur);

/* $not with regex: events whose event_type does NOT match /^migrate$/i */
header("9) $not with regex: events where event_type !~ /^migrate$/i");
cur = db.user_preference_events
  .find({ event_type: { $not: /^migrate$/i } }, { _id: 0, pref_key: 1, event_type: 1, performed_at: 1 })
  .sort({ performed_at: -1 })
  .limit(10);
showCursor(cur);
print(`count = ${db.user_preference_events.countDocuments({ event_type: { $not: /^migrate$/i } })}`);

/*
Index-friendliness notes (brief):
- Equality and range predicates on indexed fields (e.g., user_preferences.confidence with an index) are
  index-friendly. Regex on non-indexed fields often requires a COLLSCAN unless a suitable index prefix exists.
*/
