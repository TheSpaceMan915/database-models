// Demonstrate full-document replacement with replaceOne (preserves _id; overwrites missing fields).
// Usage:
//   mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/02-queries/01_replace_document.js

db = db.getSiblingDB('user_pref_db_v2');

// Target: replace the 'theme' dimension document wholly (keep _id on server).
const before = db.preference_dimension.findOne(
  { dimension_key: 'theme' },
  { _id: 0, dimension_key: 1, name: 1, description: 1, created_at: 1 }
);

print('[before] preference_dimension where dimension_key=theme');
printjson(before);

// Build a new replacement doc (⚠️ omit _id). Overwriting fields not present is risky.
// Prefer $set for partial changes when unsure.
const replacement = {
  dimension_key: 'theme',                 // unique key must remain consistent
  name: 'Theme (UI)',
  description: 'Preferred application theme (dark/light/system). Replaced via replaceOne.',
  created_at: before ? before.created_at : new Date(), // preserve original if known
  tags: ['ui', 'display'],               // new field added by replacement
};

const res = db.preference_dimension.replaceOne({ dimension_key: 'theme' }, replacement);
print('[replaceOne] result');
printjson({ matchedCount: res.matchedCount, modifiedCount: res.modifiedCount });

const after = db.preference_dimension.findOne(
  { dimension_key: 'theme' },
  { _id: 0, dimension_key: 1, name: 1, description: 1, tags: 1, created_at: 1 }
);
print('[after] preference_dimension where dimension_key=theme');
printjson(after);

/*
Notes:
- replaceOne replaces the entire document (except _id). Any fields omitted are removed.
- Use $set for targeted updates when you need to keep existing fields intact.
*/
