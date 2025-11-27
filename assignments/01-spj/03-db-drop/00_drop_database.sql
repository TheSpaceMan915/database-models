-- 03-db-drop/00_drop_database.sql
-- Purpose: Safely disconnect users and drop the database itself.
-- Must be executed while connected to another DB (typically "postgres") by a superuser.
-- Notes: DROP DATABASE cannot run inside a transaction block.

-- 1) Prevent future connections from any users.
REVOKE CONNECT ON DATABASE spj_db FROM PUBLIC;

-- 2) Terminate remaining sessions connected to spj_db.
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'spj_db'
  AND pid <> pg_backend_pid();

-- 3) Drop the database (idempotent if it does not exist).
DROP DATABASE IF EXISTS spj_db;
