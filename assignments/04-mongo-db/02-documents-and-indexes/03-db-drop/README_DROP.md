# Drop Scripts — RSL Learning Platform (MongoDB)

This script removes the **entire** `rsl_lp_db_docs_idx` database.

## What it does
- Selects the target DB: `rsl_lp_db_docs_idx`.
- Executes `db.dropDatabase()` to delete **all** collections and data.
- Prints a result summary to the console.

## How to run
From the repository root:

```bash
mongosh --quiet --eval "load('assignments/04-mongo-db/02-documents-and-indexes/03-db-drop/00_drop_database.js')"
```

## Warnings
- **Irreversible operation** — there is no undo.
- Double-check your environment before running (dev vs prod).
- Back up any data you need **before** dropping the database.
