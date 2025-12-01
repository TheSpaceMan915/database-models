-- assignments/03-rsl-lp-db/03-db-drop/01_drop_schema_objects.sql
-- Purpose: Drop all objects inside schema "rsl" for an in-place reset (without dropping DB).
-- Usage: connect to rsl_lp_db; run as owner or superuser.
-- This removes the schema and everything in it, then recreates an empty schema owned by rsl_user.
-- Choose this when you want to keep the database rsl_lp_db but reset its contents.

BEGIN;
  DROP SCHEMA IF EXISTS rsl CASCADE;
COMMIT;

-- Re-create a clean, empty schema owned by the application role (idempotent).
CREATE SCHEMA IF NOT EXISTS rsl AUTHORIZATION rsl_user;
