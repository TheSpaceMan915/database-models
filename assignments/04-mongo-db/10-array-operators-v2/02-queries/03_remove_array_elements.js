// Array removals: $pull, $pullAll, $pop, and mid-array deletion via $unset + $pull(null).
// Usage:
//   mongosh --file assignments/04-mongo-db/10-array-operators-v2/02-queries/03_remove_array_elements.js

db = db.getSiblingDB('user_pref_db_array_v2');

function hdr(t) { print(`\n--- ${t} ---`); }
const u = db.user.findOne({ email: 'alice@example.com' }, { _id: 1, email: 1 });

hdr('Start (user snapshot)');
printjson(db.user.findOne({ _id: u._id }, { email: 1, favorite_cuisines: 1, notification_channels: 1 }));

/* Remove by value: pull "italian" from favorite_cuisines */
hdr('1) $pull by value: remove "italian" from favorite_cuisines');
let res = db.user.updateOne({ _id: u._id }, { $pull: { favorite_cuisines: 'italian' } });
printjson({ matched: res.matchedCount, modified: res.modifiedCount });
printjson(db.user.findOne({ _id: u._id }, { email: 1, favorite_cuisines: 1 }));

/* Mid-array deletion by position: unset index 2 then pull null
   Rationale: $unset leaves a hole (null); $pull removes the null to compact the array. */
hdr('2) Mid-array deletion: $unset "notification_channels.2" then $pull null');
const before = db.user.findOne({ _id: u._id }, { notification_channels: 1 });
printjson({ before_channels: before.notification_channels });
res = db.user.updateOne({ _id: u._id }, { $unset: { 'notification_channels.2': 1 } });
const res2 = db.user.updateOne({ _id: u._id }, { $pull: { notification_channels: null } });
const after = db.user.findOne({ _id: u._id }, { notification_channels: 1 });
printjson({ unset_modified: res.modifiedCount, pull_modified: res2.modifiedCount, after_channels: after.notification_channels });

/* Remove by value on event tags: pull "migration" */
hdr('3) $pull on event tags: remove "migration" from one Alice event');
const ev = db.user_preference_events.findOne(
  { user_id: u._id, tags: 'migration' },
  { _id: 1, tags: 1, performed_at: 1 }
);
if (ev) {
  printjson({ before_event: ev });
  const res3 = db.user_preference_events.updateOne({ _id: ev._id }, { $pull: { tags: 'migration' } });
  const evAfter = db.user_preference_events.findOne({ _id: ev._id }, { _id: 0, tags: 1, performed_at: 1 });
  printjson({ event_update: { matched: res3.matchedCount, modified: res3.modifiedCount }, after_event: evAfter });
} else {
  print('No event with tag "migration" found for Alice.');
}

/* Remove multiple values from channels */
hdr('4) $pullAll: remove ["sms","whatsapp"] from notification_channels');
const res4 = db.user.updateOne({ _id: u._id }, { $pullAll: { notification_channels: ['sms', 'whatsapp'] } });
printjson({ matched: res4.matchedCount, modified: res4.modifiedCount });
printjson(db.user.findOne({ _id: u._id }, { email: 1, notification_channels: 1 }));

/* Remove by position: $pop last, then $pop first */
hdr('5) $pop: remove last then first from notification_channels');
const beforePop = db.user.findOne({ _id: u._id }, { notification_channels: 1 });
printjson({ before_channels: beforePop.notification_channels });
const popLast = db.user.updateOne({ _id: u._id }, { $pop: { notification_channels: 1 } });
const mid = db.user.findOne({ _id: u._id }, { notification_channels: 1 });
const popFirst = db.user.updateOne({ _id: u._id }, { $pop: { notification_channels: -1 } });
const afterPop = db.user.findOne({ _id: u._id }, { notification_channels: 1 });
printjson({
  popLast_modified: popLast.modifiedCount,
  popFirst_modified: popFirst.modifiedCount,
  after_channels: afterPop.notification_channels,
});

hdr('Done removals.');
