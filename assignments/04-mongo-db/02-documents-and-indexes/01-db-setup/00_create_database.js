// assignments/04-mongo-db/02-documents-and-indexes/01-db-setup/00_create_database.js
// Purpose: Select (or create) the target database 'rsl_lp_db_docs_idx' and print a short banner.
// How to run with mongosh (from repo root):
//   mongosh --quiet --eval "load('assignments/04-mongo-db/02-documents-and-indexes/01-db-setup/00_create_database.js')"

use('rsl_lp_db_docs_idx');

print(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 RSL Learning Platform • MongoDB 8.0
 Database selected: ${db.getName()}
 Module: 02-documents-and-indexes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
