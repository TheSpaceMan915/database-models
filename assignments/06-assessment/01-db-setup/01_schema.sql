-- assignments/06-assessment/01-db-setup/01_schema.sql
-- Purpose: Create schema, enum type, tables, constraints, indexes and helper view.
-- Recommended session setting before running:
--   SET search_path TO asm, public;

CREATE SCHEMA IF NOT EXISTS asm AUTHORIZATION asm_user;

-- Use a dedicated enum for order status to ensure valid values.
CREATE TYPE IF NOT EXISTS asm.order_status_enum AS ENUM
  ('Pending','Processing','Shipped','Delivered','Cancelled');

SET search_path TO asm, public;

-- =========================
-- Tables
-- =========================

-- Categories are hierarchical; deleting a parent should not remove children automatically.
-- We choose ON DELETE SET NULL on parent reference to keep children but detach them.
CREATE TABLE IF NOT EXISTS product_categories (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id   BIGINT REFERENCES asm.product_categories(id) ON DELETE SET NULL,
  name        VARCHAR(80) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products belong to a category; we restrict deletion of categories that still have products.
CREATE TABLE IF NOT EXISTS products (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id     BIGINT NOT NULL REFERENCES asm.product_categories(id) ON DELETE RESTRICT,
  name            VARCHAR(120) NOT NULL UNIQUE,
  price           NUMERIC(12,2) NOT NULL CHECK (price > 0),            -- non-negative monetary value
  stock_quantity  INTEGER NOT NULL CHECK (stock_quantity >= 0),        -- inventory can't be negative
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders hold customer-facing information; total_amount is recomputed from order lines.
CREATE TABLE IF NOT EXISTS orders (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_name  VARCHAR(120)  NOT NULL,
  customer_email VARCHAR(254)  NOT NULL,                                -- RFC 5321/5322 max fits in 254
  order_date     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  total_amount   NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  order_status   asm.order_status_enum NOT NULL
);

-- Each product can appear at most once per order.
-- line_total is generated as quantity * price_at_order for robust historical reporting.
CREATE TABLE IF NOT EXISTS product_orders (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id        BIGINT NOT NULL REFERENCES asm.orders(id)   ON DELETE CASCADE,
  product_id      BIGINT NOT NULL REFERENCES asm.products(id) ON DELETE RESTRICT,
  quantity        INTEGER      NOT NULL CHECK (quantity > 0),
  price_at_order  NUMERIC(12,2) NOT NULL CHECK (price_at_order >= 0),
  line_total      NUMERIC(12,2) GENERATED ALWAYS AS (quantity * price_at_order) STORED,
  UNIQUE (order_id, product_id)
);

-- =========================
-- Indexes (FKs + common filters)
-- =========================
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id         ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status          ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_product_orders_product_id    ON product_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_order_id      ON product_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_prod_order    ON product_orders(product_id, order_id);

-- =========================
-- Helper view
-- =========================
-- Joined order items for easy reporting.
CREATE OR REPLACE VIEW v_order_items AS
SELECT
  po.id                AS order_item_id,
  o.id                 AS order_id,
  o.order_date,
  o.order_status,
  o.customer_name,
  o.customer_email,
  p.id                 AS product_id,
  p.name               AS product_name,
  pc.name              AS category_name,
  po.quantity,
  po.price_at_order,
  po.line_total
FROM product_orders AS po
JOIN orders          AS o  ON o.id = po.order_id
JOIN products        AS p  ON p.id = po.product_id
JOIN product_categories AS pc ON pc.id = p.category_id;
