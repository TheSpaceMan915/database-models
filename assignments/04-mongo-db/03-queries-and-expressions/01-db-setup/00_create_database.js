// assignments/04-mongo-db/03-queries-and-expressions/01-db-setup/00_create_database.js

// How to run:
//   mongosh assignments/04-mongo-db/03-queries-and-expressions/01-db-setup/00_create_database.js
// Run from repo root as instructed. This selects/creates the target DB and prints a banner.

use('rsl_lp_db_queries_expr');

const now = new Date();
print(`[INFO] Using DB: rsl_lp_db_queries_expr | Started: ${now.toISOString()}`);