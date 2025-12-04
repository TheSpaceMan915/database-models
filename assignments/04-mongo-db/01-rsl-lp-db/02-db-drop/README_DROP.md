// assignments/04-mongo-db/01-rsl-lp-db/02-db-drop/README_DROP.md
# Drop Scripts — RSL Learning Platform (MongoDB)

This script **permanently** removes the MongoDB database used by the RSL Learning Platform.

## What it does
- Selects the target DB: `rsl_lp_db`.
- Executes `db.dropDatabase()` to delete **all** collections and data.
- Prints a confirmation result to the console.

## How to run
From the repository root:
```bash
mongosh --quiet --eval "load('assignments/04-mongo-db/01-rsl-lp-db/02-db-drop/00_drop_database.js')"
```

## Warnings
- **Irreversible operation:** there is no undo.
- Ensure you are connected to the **correct environment** before running.
- Back up any data you need **before** dropping the database.
