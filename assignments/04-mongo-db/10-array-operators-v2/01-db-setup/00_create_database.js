// Usage (from repo root):
//   mongosh --file assignments/04-mongo-db/10-array-operators-v2/01-db-setup/00_create_database.js
// Then continue with 01_collections_and_indexes.js and 02_seed.js.

use('user_pref_db_array_v2');
print(`[init] db: ${db.getName()} @ ${new Date().toISOString()}`);
