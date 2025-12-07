// assignments/04-mongo-db/06-aggregation-pipeline/03-db-drop/00_drop_database.js

// How to run:
//   mongosh assignments/04-mongo-db/06-aggregation-pipeline/03-db-drop/00_drop_database.js
// WARNING: This operation is irreversible. Drops the 'rsl_lp_db_pipeline' database.

use('rsl_lp_db_pipeline');
const res = db.dropDatabase();
print(`[DROP] rsl_lp_db_pipeline drop result: ${tojson(res)}`);
print('Database dropped. This action is irreversible for this DB.');