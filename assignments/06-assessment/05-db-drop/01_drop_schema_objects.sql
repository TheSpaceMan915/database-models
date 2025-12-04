-- assignments/06-assessment/05-db-drop/01_drop_schema_objects.sql
-- Purpose: In-place reset — drop all objects in schema asm (without dropping the DB),
--          then recreate an empty schema owned by asm_user.

BEGIN;
  DROP SCHEMA IF EXISTS asm CASCADE;
COMMIT;

-- Recreate a clean schema for subsequent setup.
CREATE SCHEMA IF NOT EXISTS asm AUTHORIZATION asm_user;
