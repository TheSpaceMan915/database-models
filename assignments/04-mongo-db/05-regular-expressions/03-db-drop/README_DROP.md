# Drop Script — rsl_lp_db_regex

This script safely drops the MongoDB database used by this module (`rsl_lp_db_regex`).
Run it after finishing the regex exercises or when you need a clean reset.

How to run (from repository root):
```bash
mongosh assignments/04-mongo-db/05-regular-expressions/03-db-drop/00_drop_database.js
```

What it does:
- Selects the `rsl_lp_db_regex` database.
- Calls `db.dropDatabase()` to remove all collections and data.
- Prints a confirmation result in the console.

Notes:
- The script is minimal and explicit.
- There is no undo for `dropDatabase()`.

**WARNING: Dropping the database is irreversible. Confirm you want to delete all data before running.**