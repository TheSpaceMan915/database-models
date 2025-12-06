# Drop Script — rsl_lp_db_queries_expr

This script safely drops the MongoDB database used by this module (`rsl_lp_db_queries_expr`).
Run it only after you’ve finished exploring the examples or when you need a clean reset.

How to run (from repository root):
```bash
mongosh assignments/04-mongo-db/03-queries-and-expressions/03-db-drop/00_drop_database.js
```

What it does:
- Selects the `rsl_lp_db_queries_expr` database.
- Calls `db.dropDatabase()` to remove all collections and data.
- Prints a confirmation message in the console.

Notes:
- This script is intentionally short and explicit.
- There is no undo for `dropDatabase()`.

**WARNING: Dropping the database is irreversible. Make sure you really want to delete everything.**