-- 03-db-drop/02_drop_role.sql
-- Purpose: Drop the application role safely, even if it owns leftover objects.
-- Run as a superuser. Works whether or not the role owns objects.

-- 1) If role spj_user exists, move ownership to postgres and drop its privileges.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spj_user') THEN
    EXECUTE 'REASSIGN OWNED BY spj_user TO postgres';
    EXECUTE 'DROP OWNED BY spj_user';
  END IF;
END$$;

-- 2) Drop the role (idempotent).
DROP ROLE IF EXISTS spj_user;

-- If an earlier repo variant used a quoted role named "user", these commented fallbacks can help:
-- REASSIGN OWNED BY "user" TO postgres;
-- DROP OWNED BY "user";
-- DROP ROLE IF EXISTS "user";
