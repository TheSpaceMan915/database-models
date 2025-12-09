// Usage (from repo root):
//   mongosh --file assignments/04-mongo-db/09-queries-and-expressions-v2/03-db-drop/00_drop_database.js
//
// WARNING: Irreversible operation — drops the entire 'user_pref_db_qe_v2' database.

use('user_pref_db_qe_v2');
const res = db.dropDatabase();
print('[drop] dropDatabase user_pref_db_qe_v2 =>');
printjson(res);
