// Sorting, limiting, skipping, and counting examples.
// Usage:
//   mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/02-queries/02_sort_limit_skip_count.js

db = db.getSiblingDB('user_pref_db_qe_v2');

function header(t) { print(`\n--- ${t} ---`); }

/* sort by email ascending */
header("A) user: sort by email ascending");
db.user.find({}, { _id: 0, email: 1 }).sort({ email: 1 }).forEach(printjson);

/* sort by email descending + limit top N */
header("B) user: sort by email descending, limit top 3");
db.user.find({}, { _id: 0, email: 1 }).sort({ email: -1 }).limit(3).forEach(printjson);

/* pagination demo: page 2 with size 3 (skip = (page-1)*size) */
header("C) user: pagination (page=2, size=3) using sort+skip+limit");
const page = 2, size = 3;
db.user
  .find({}, { _id: 0, email: 1 })
  .sort({ email: 1 })
  .skip((page - 1) * size)
  .limit(size)
  .forEach(printjson);

/* counts */
header("D) Counts: countDocuments vs estimatedDocumentCount");
// Accurate with filter
print(`[countDocuments all users] ${db.user.countDocuments({})}`);
// Fast approximation (metadata)
print(`[estimatedDocumentCount users] ${db.user.estimatedDocumentCount()}`);
// Note: legacy db.collection.count() is deprecated.

/* Combined example: events timeline with pagination and total pages */
header("E) Events for a user+pref_key with pagination summary");
const userA = db.user.findOne({ email: 'alice@example.com' }, { _id: 1 });
const filter = { user_id: userA._id, pref_key: 'theme' };
const total = db.user_preference_events.countDocuments(filter);
const psize = 2, pnum = 1; // page 1 (0-based readers: change pnum)
const pages = Math.max(1, Math.ceil(total / psize));

print(`Total events: ${total}, page ${pnum} of ${pages}`);
db.user_preference_events
  .find(filter, { _id: 0, new_value: 1, old_value: 1, performed_at: 1, event_type: 1 })
  .sort({ performed_at: -1 })
  .skip((pnum - 1) * psize)
  .limit(psize)
  .forEach(printjson);
