// assignments/04-mongo-db/02-documents-and-indexes/02-queries/01_replace_document.js
use('rsl_lp_db_docs_idx');
const email = 'alice@example.com';
let before = db.person.findOne({ email }, { projection: { password_hash: 0 } });
print('Before replace (person):'); printjson(before);
const replacement = { email, password_hash: 'demo_hash', created_at: before?.created_at || new Date(), profile: { display_name: 'Alice A.', locale: 'en' } };
const res = db.person.replaceOne({ email }, replacement, { upsert: false });
print(`replaceOne result: matched=${res.matchedCount}, modified=${res.modifiedCount}`);
let after = db.person.findOne({ email }, { projection: { password_hash: 0 } });
print('After replace (person):'); printjson(after);
