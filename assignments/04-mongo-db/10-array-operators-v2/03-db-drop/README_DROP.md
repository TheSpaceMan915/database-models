# Teardown (Drop Database)

This script **permanently deletes** the `user_pref_db_array_v2` database, including all collections,
data, and indexes. Use it to reset the environment or remove this module entirely.

## Command

From the repository root:

```bash
mongosh --file assignments/04-mongo-db/10-array-operators-v2/03-db-drop/00_drop_database.js
```

**What happens:**
- Selects the `user_pref_db_array_v2` database.
- Calls `db.dropDatabase()` and prints the result for verification.

> **Warning:** This action is irreversible. Ensure you have backups or are working in a disposable
> environment before running the drop script.
