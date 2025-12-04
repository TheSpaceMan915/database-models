# Drop Scripts (Assessment DB)

**Purpose:** provide safe ways to tear down the Assessment database, either fully or in-place.

## Files and order
1. `00_drop_database.sql` — run from DB `postgres` as a superuser. Revokes new connects, terminates
   existing sessions to `assessment_db`, then drops the database (cannot run in a transaction).
2. `01_drop_schema_objects.sql` — run inside `assessment_db`. Drops schema `asm` with `CASCADE` and
   recreates an empty `asm` owned by `asm_user`. Useful for quick environment reset.
3. `02_drop_role.sql` — as a superuser, reassigns and drops all objects owned by `asm_user`, then
   drops the role.

## Privileges
- Database/role drops require superuser privileges.
- Schema reset can be performed by the owner.

## Irreversibility
These actions are **destructive and irreversible**. Double-check the target instance before running.
