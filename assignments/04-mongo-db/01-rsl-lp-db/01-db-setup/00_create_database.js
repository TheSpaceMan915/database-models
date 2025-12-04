// assignments/04-mongo-db/01-rsl-lp-db/01-db-setup/00_create_database.js
// Purpose: Select (or create) the target database 'rsl_lp_db' and print a banner.
// How to run with mongosh (from repo root):
//   mongosh --quiet --eval "load('assignments/04-mongo-db/01-rsl-lp-db/01-db-setup/00_create_database.js')"

const DB_NAME = 'rsl_lp_db';

use(DB_NAME);

print(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 RSL Learning Platform • MongoDB 8.0
 Database selected: ${db.getName()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
