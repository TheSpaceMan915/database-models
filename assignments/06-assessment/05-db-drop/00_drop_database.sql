-- assignments/06-assessment/05-db-drop/00_drop_database.sql
-- Purpose: Safely drop the entire assessment_db database.
-- Must be run while connected to another DB (typically "postgres") by a superuser.
-- Note: DROP DATABASE cannot run inside a transaction block.

REVOKE CONNECT ON DATABASE assessment_db FROM PUBLIC;

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'assessment_db'
  AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS assessment_db;
