// assignments/04-mongo-db/01-rsl-lp-db/02-db-drop/00_drop_database.js
// Purpose: Safely drop the entire 'rsl_lp_db' database.
// ⚠ IRREVERSIBLE: This permanently deletes all data in the database.
// How to run:
//   mongosh --quiet --eval "load('assignments/04-mongo-db/01-rsl-lp-db/02-db-drop/00_drop_database.js')"

const DB_NAME = 'rsl_lp_db';

use(DB_NAME);
const res = db.dropDatabase();

print(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Drop Database
 Database: ${DB_NAME}
 Result:   ${tojson(res)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
