-- assignments/03-rsl-lp-db/01-db-setup/00_create_database.sql
-- Purpose: Create role and database for the RSL Learning Platform.
-- How to run:
--   Connect to the "postgres" database as a superuser:
--     psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f assignments/03-rsl-lp-db/01-db-setup/00_create_database.sql
-- Notes:
--   - Do NOT run inside a transaction block.
--   - The search_path is set per-session in README examples (not here).

-- 1) Application role (login). Change password after creation.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rsl_user') THEN
    CREATE ROLE rsl_user LOGIN PASSWORD 'change_me_please'; -- demo placeholder
  END IF;
END$$;

-- 2) Database owned by the application role.
--    Use template0 + C locale to avoid locale surprises.
--    If the DB exists already, we keep it (idempotent behavior).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'rsl_lp_db') THEN
    EXECUTE $sql$
      CREATE DATABASE rsl_lp_db
        OWNER rsl_user
        TEMPLATE template0
        ENCODING 'UTF8'
        LC_COLLATE 'C'
        LC_CTYPE   'C'
    $sql$;
  END IF;
END$$;
