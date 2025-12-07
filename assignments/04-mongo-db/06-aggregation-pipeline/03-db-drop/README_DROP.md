# Drop Script — rsl_lp_db_pipeline

This script safely drops the MongoDB database used by this module (`rsl_lp_db_pipeline`).
Run it after finishing the pipeline exercises or when you need a clean reset.

How to run (from repository root):
```bash
mongosh assignments/04-mongo-db/06-aggregation-pipeline/03-db-drop/00_drop_database.js
```

What it does:
- Selects the `rsl_lp_db_pipeline` database.
- Calls `db.dropDatabase()` to remove all collections and data.
- Prints a confirmation result in the console.

Notes:
- The script is minimal and explicit.
- There is no undo for `dropDatabase()`.

**WARNING: Dropping the database is irreversible. Confirm you want to delete all data before running.**