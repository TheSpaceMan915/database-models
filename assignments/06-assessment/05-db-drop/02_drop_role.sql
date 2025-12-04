-- assignments/06-assessment/05-db-drop/02_drop_role.sql
-- Purpose: Remove application role and any owned objects.
-- Run as a superuser.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'asm_user') THEN
    EXECUTE 'REASSIGN OWNED BY asm_user TO postgres';
    EXECUTE 'DROP OWNED BY asm_user';
  END IF;
END$$;

DROP ROLE IF EXISTS asm_user;
