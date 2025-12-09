// Array updates: by index with $set, and by value with arrayFilters.
// Usage:
//   mongosh --file assignments/04-mongo-db/10-array-operators-v2/02-queries/02_update_array_by_index_and_value.js

db = db.getSiblingDB('user_pref_db_array_v2');

function hdr(t) { print(`\n--- ${t} ---`); }
const u = db.user.findOne({ email: 'alice@example.com' }, { _id: 1, email: 1 });

/* Snapshot before */
hdr('Before (user snapshot)');
printjson(db.user.findOne({ _id: u._id }, { email: 1, favorite_cuisines: 1, notification_channels: 1 }));

/* Update by position (direct index) */
hdr('1) By index: favorite_cuisines[1] = "japanese"');
let res = db.user.updateOne({ _id: u._id }, { $set: { 'favorite_cuisines.1': 'japanese' } });
printjson({ matched: res.matchedCount, modified: res.modifiedCount });
printjson(db.user.findOne({ _id: u._id }, { email: 1, favorite_cuisines: 1 }));

hdr('2) By index: notification_channels[0] = "push"');
res = db.user.updateOne({ _id: u._id }, { $set: { 'notification_channels.0': 'push' } });
printjson({ matched: res.matchedCount, modified: res.modifiedCount });
printjson(db.user.findOne({ _id: u._id }, { email: 1, notification_channels: 1 }));

/* Update by value using arrayFilters */
hdr('3) By value with arrayFilters: replace "mexican" -> "georgian" in favorite_cuisines');
res = db.user.updateOne(
  { _id: u._id, favorite_cuisines: 'mexican' },
  { $set: { 'favorite_cuisines.$[c]': 'georgian' } },
  { arrayFilters: [{ c: 'mexican' }] }
);
printjson({ matched: res.matchedCount, modified: res.modifiedCount });
printjson(db.user.findOne({ _id: u._id }, { email: 1, favorite_cuisines: 1 }));

hdr('4) By value with arrayFilters on event tags: "auto" -> "reviewed" (latest event containing "auto")');
const ev = db.user_preference_events.findOne(
  { user_id: u._id, tags: 'auto' },
  { _id: 1, tags: 1, performed_at: 1 }
);
if (ev) {
  printjson({ before_event: ev });
  const res2 = db.user_preference_events.updateOne(
    { _id: ev._id },
    { $set: { 'tags.$[t]': 'reviewed' } },
    { arrayFilters: [{ t: 'auto' }] }
  );
  const evAfter = db.user_preference_events.findOne({ _id: ev._id }, { _id: 0, tags: 1, performed_at: 1 });
  printjson({ event_update: { matched: res2.matchedCount, modified: res2.modifiedCount }, after_event: evAfter });
} else {
  print('No event with tag "auto" found for Alice.');
}

hdr('Done updates.');
