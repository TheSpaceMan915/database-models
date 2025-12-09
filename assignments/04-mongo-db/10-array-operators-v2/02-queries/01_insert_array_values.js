// Array inserts: $push, $addToSet, $each, $position, and pushing tags on events.
// Usage:
//   mongosh --file assignments/04-mongo-db/10-array-operators-v2/02-queries/01_insert_array_values.js

db = db.getSiblingDB('user_pref_db_array_v2');

function hdr(t) { print(`\n--- ${t} ---`); }
function pickUser(email) { return db.user.findOne({ email }, { email: 1, favorite_cuisines: 1, notification_channels: 1 }); }

/* Use Alice for demonstrations */
const u = db.user.findOne({ email: 'alice@example.com' }, { _id: 1, email: 1 });
hdr('Before (user snapshot)');
printjson(pickUser('alice@example.com'));

/* 1) $push one cuisine into user.favorite_cuisines */
hdr('1) $push: add "japanese" to favorite_cuisines');
let res = db.user.updateOne({ _id: u._id }, { $push: { favorite_cuisines: 'japanese' } });
printjson({ matched: res.matchedCount, modified: res.modifiedCount });
printjson(pickUser('alice@example.com'));

/* 2) $addToSet to avoid duplicates (includes $each variant) */
hdr('2) $addToSet with $each: add ["mexican","italian"] (dedup)');
res = db.user.updateOne(
  { _id: u._id },
  { $addToSet: { favorite_cuisines: { $each: ['mexican', 'italian'] } } }
);
printjson({ matched: res.matchedCount, modified: res.modifiedCount });
printjson(pickUser('alice@example.com'));

/* 3) $push with $each + $position to insert channels at index 1 */
hdr('3) $push with $each + $position: insert ["push","telegram"] at index 1 of notification_channels');
res = db.user.updateOne(
  { _id: u._id },
  { $push: { notification_channels: { $each: ['push', 'telegram'], $position: 1 } } }
);
printjson({ matched: res.matchedCount, modified: res.modifiedCount });
printjson(pickUser('alice@example.com'));

/* 4) $push a tag into user_preference_events.tags and confirm */
hdr('4) $push: add "audit" tag to the latest Alice theme event');
const ev = db.user_preference_events.findOne(
  { user_id: u._id, pref_key: 'theme' },
  { _id: 1, tags: 1, performed_at: 1 }
);
printjson({ before_event: ev });
const res2 = db.user_preference_events.updateOne({ _id: ev._id }, { $push: { tags: 'audit' } });
const evAfter = db.user_preference_events.findOne({ _id: ev._id }, { _id: 0, tags: 1, performed_at: 1 });
printjson({ event_update: { matched: res2.matchedCount, modified: res2.modifiedCount }, after_event: evAfter });

hdr('Done inserts.');
