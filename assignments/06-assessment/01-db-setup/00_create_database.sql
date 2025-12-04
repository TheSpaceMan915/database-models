-- assignments/06-assessment/01-db-setup/00_create_database.sql
-- Purpose: Create role and database for the Assessment project (recipes & ingredients).
-- How to run: connect to the "postgres" DB as a superuser, e.g.:
--   psql -U postgres -d postgres -v ON_ERROR_STOP=1 --     -f assignments/06-assessment/01-db-setup/00_create_database.sql
-- Notes:
--   - Do NOT run inside a transaction block.

-- 1) Application role (login). Change password right after creation.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'asm_user') THEN
    CREATE ROLE asm_user LOGIN PASSWORD 'change_me_please'; -- placeholder
  END IF;
END$$;

-- 2) Database owned by the application role.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'assessment_db') THEN
    EXECUTE $sql$
      CREATE DATABASE assessment_db
        OWNER asm_user
        TEMPLATE template0
        ENCODING 'UTF8'
        LC_COLLATE 'C'
        LC_CTYPE   'C'
    $sql$;
  END IF;
END$$;
