// assignments/04-mongo-db/04-array-operators/03-db-drop/00_drop_database.js

// How to run:
//   mongosh assignments/04-mongo-db/04-array-operators/03-db-drop/00_drop_database.js
// WARNING: This operation is irreversible. Drops the 'rsl_lp_db_array_ops' database.

use('rsl_lp_db_array_ops');
const res = db.dropDatabase();
print(`[DROP] rsl_lp_db_array_ops drop result: ${tojson(res)}`);
print('Database dropped. This action is irreversible for this DB.');