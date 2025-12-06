// assignments/04-mongo-db/05-regular-expressions/03-db-drop/00_drop_database.js

// How to run:
//   mongosh assignments/04-mongo-db/05-regular-expressions/03-db-drop/00_drop_database.js
// WARNING: This operation is irreversible. Drops the 'rsl_lp_db_regex' database.

use('rsl_lp_db_regex');
const res = db.dropDatabase();
print(`[DROP] rsl_lp_db_regex drop result: ${tojson(res)}`);
print('Database dropped. This action is irreversible for this DB.');