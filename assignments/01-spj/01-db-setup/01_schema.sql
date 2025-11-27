-- Schema DDL (PostgreSQL 18)
-- Conventions: snake_case identifiers, NOT NULL where appropriate,
-- CHECK constraints, explicit PK/FK, indexes for FKs.

SET search_path = spj, public;

-- S → suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_no TEXT PRIMARY KEY
    CHECK (supplier_no ~ '^S[0-9]+$'),
  last_name   TEXT        NOT NULL,
  status      SMALLINT    NOT NULL CHECK (status BETWEEN 0 AND 100),
  city        TEXT        NOT NULL
);

-- P → parts
CREATE TABLE IF NOT EXISTS parts (
  part_no   TEXT PRIMARY KEY
    CHECK (part_no ~ '^P[0-9]+$'),
  name      TEXT        NOT NULL,
  color     TEXT        NOT NULL,
  weight    SMALLINT    NOT NULL CHECK (weight > 0),
  city      TEXT        NOT NULL
);

-- J → projects
CREATE TABLE IF NOT EXISTS projects (
  project_no TEXT PRIMARY KEY
    CHECK (project_no ~ '^J[0-9]+$'),
  name       TEXT        NOT NULL,
  city       TEXT        NOT NULL
);

-- SPJ → supplies
CREATE TABLE IF NOT EXISTS supplies (
  supplier_no TEXT     NOT NULL,
  part_no     TEXT     NOT NULL,
  project_no  TEXT     NOT NULL,
  qty         INTEGER  NULL CHECK (qty >= 0),
  CONSTRAINT pk_supplies PRIMARY KEY (supplier_no, part_no, project_no),
  CONSTRAINT fk_supplies_supplier
    FOREIGN KEY (supplier_no) REFERENCES suppliers(supplier_no) ON DELETE RESTRICT,
  CONSTRAINT fk_supplies_part
    FOREIGN KEY (part_no)     REFERENCES parts(part_no)         ON DELETE RESTRICT,
  CONSTRAINT fk_supplies_project
    FOREIGN KEY (project_no)  REFERENCES projects(project_no)    ON DELETE RESTRICT
);

-- Helpful indexes for joins & filters (PostgreSQL builds them for PK, add for FKs)
CREATE INDEX IF NOT EXISTS idx_supplies_supplier_no ON supplies (supplier_no);
CREATE INDEX IF NOT EXISTS idx_supplies_part_no     ON supplies (part_no);
CREATE INDEX IF NOT EXISTS idx_supplies_project_no  ON supplies (project_no);
