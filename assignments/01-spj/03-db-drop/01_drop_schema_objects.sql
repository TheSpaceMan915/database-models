-- 03-db-drop/01_drop_schema_objects.sql
-- Purpose: Drop all objects inside schema "spj" for an in-place reset (without dropping DB).
-- Usage: connect to spj_db; run as owner or superuser.
-- This removes the schema and everything in it, then recreates an empty schema owned by spj_user.
-- Choose this when you want to keep the database spj_db but reset its contents.

-- 1) Atomically drop the schema and all contained objects.
BEGIN;
  DROP SCHEMA IF EXISTS spj CASCADE;
COMMIT;

-- 2) Re-create a clean, empty schema owned by the application role.
--    Requires role spj_user to exist.
CREATE SCHEMA IF NOT EXISTS spj AUTHORIZATION spj_user;

-- (Optional) If spj_user does not exist yet, uncomment the two lines below instead:
-- CREATE SCHEMA IF NOT EXISTS spj;
-- ALTER SCHEMA spj OWNER TO spj_user;
