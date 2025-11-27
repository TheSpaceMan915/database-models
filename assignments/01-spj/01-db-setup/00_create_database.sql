-- PostgreSQL 18 bootstrap for the SPJ dataset
-- Creates: database, role, schema, search_path

-- 1) Create database (choose locale suitable for Russian data if available)
-- Note: run this from a superuser. If your cluster lacks ru_RU locale,
--       omit LC_* clauses or pick en_US.UTF-8.
CREATE DATABASE spj_db
  WITH ENCODING 'UTF8';

\connect spj_db

-- 2) Create application role (password placeholder)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spj_user') THEN
    CREATE ROLE spj_user LOGIN PASSWORD 'change_me';
  END IF;
END$$;

-- 3) Create dedicated schema owned by the app role
CREATE SCHEMA IF NOT EXISTS spj AUTHORIZATION spj_user;

-- 4) Default search_path for this DB
ALTER DATABASE spj_db SET search_path = spj, public;

-- 5) For the current session too
SET search_path = spj, public;
