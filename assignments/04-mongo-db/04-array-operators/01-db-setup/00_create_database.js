// assignments/04-mongo-db/04-array-operators/01-db-setup/00_create_database.js

// How to run (from repository root):
//   mongosh assignments/04-mongo-db/04-array-operators/01-db-setup/00_create_database.js
// Selects/creates the target DB and prints a small banner.

use('rsl_lp_db_array_ops');

const now = new Date();
print(`[INFO] Using DB: rsl_lp_db_array_ops | Started: ${now.toISOString()}`);