// assignments/04-mongo-db/03-queries-and-expressions/03-db-drop/00_drop_database.js

// How to run:
//   mongosh assignments/04-mongo-db/03-queries-and-expressions/03-db-drop/00_drop_database.js
// WARNING: This is irreversible. It drops the 'rsl_lp_db_queries_expr' database.

use('rsl_lp_db_queries_expr');
const res = db.dropDatabase();
print(`[DROP] rsl_lp_db_queries_expr drop result: ${tojson(res)}`);
print('Database dropped. This operation is irreversible for this DB.');