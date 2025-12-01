# DB Drop Helpers (03-db-drop)

**What these files do**
1. `00_drop_database.sql` — revokes new connections, terminates sessions to `rsl_lp_db`,
   then drops the database. Run from DB `postgres` as a superuser. Not in a transaction.
2. `01_drop_schema_objects.sql` — drops schema `rsl` with all objects (`CASCADE`),
   then recreates empty `rsl` owned by `rsl_user`. Use for in-place reset without
   dropping the whole DB.
3. `02_drop_role.sql` — reassigns/drops owned objects for `rsl_user` and removes the role.

**Order of use**
- Full removal: `00_drop_database.sql` → (optional) `02_drop_role.sql`.
- In-place reset: `01_drop_schema_objects.sql` only.

**Permissions**
- Use a superuser (e.g., `postgres`) for destructive operations.
- Ensure `rsl_user` exists if recreating the schema with that owner.
