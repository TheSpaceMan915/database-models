# Teardown (Drop Database)

This script **permanently deletes** the `user_pref_db` database, including all collections, data,
and indexes. Use it when you want to reset the environment or remove the module completely.

## Command

From the repository root:

```bash
mongosh --file assignments/04-mongo-db/07-user-preference-system-db/02-db-drop/00_drop_database.js
```

**What happens:**  
- Selects the `user_pref_db` database.  
- Calls `db.dropDatabase()` and prints the result.

> **Warning:** This action is irreversible. Ensure you have backups or you are working on a
> disposable environment before running the drop script.
