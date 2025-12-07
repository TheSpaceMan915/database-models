// assignments/04-mongo-db/06-aggregation-pipeline/01-db-setup/00_create_database.js

// How to run (from repository root):
//   mongosh assignments/04-mongo-db/06-aggregation-pipeline/01-db-setup/00_create_database.js
// Selects/creates the target DB and prints a small banner.

use('rsl_lp_db_pipeline');

const now = new Date();
print(`[INFO] Using DB: rsl_lp_db_pipeline | Started: ${now.toISOString()}`);