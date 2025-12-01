-- assignments/03-rsl-lp-db/03-db-drop/02_drop_role.sql
-- Purpose: Drop the application role safely, even if it owns leftover objects.
-- Run as a superuser. Works whether or not the role owns objects.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rsl_user') THEN
    EXECUTE 'REASSIGN OWNED BY rsl_user TO postgres';
    EXECUTE 'DROP OWNED BY rsl_user';
  END IF;
END$$;

DROP ROLE IF EXISTS rsl_user;
