// Usage (from repo root):
//   mongosh --file assignments/04-mongo-db/07-user-preference-system-db/02-db-drop/00_drop_database.js
//
// WARNING: Irreversible operation — drops the entire 'user_pref_db' database.

use('user_pref_db');
const res = db.dropDatabase();
print('[drop] dropDatabase user_pref_db =>');
printjson(res);
