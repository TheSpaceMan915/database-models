-- assignments/06-assessment/01-db-setup/02_seed.sql
-- Purpose: Seed demo data for categories, products, orders and order lines.
-- Safe to re-run: uses deterministic inserts and recomputes totals.

SET search_path TO asm, public;

-- ---------
-- Categories
-- ---------
-- Parent: Vegetables; Child: Leafy Greens
INSERT INTO product_categories (id, parent_id, name) VALUES
  (1, NULL, 'Vegetables'),
  (2, 1,    'Leafy Greens'),
  (3, NULL, 'Dairy'),
  (4, NULL, 'Grains'),
  (5, NULL, 'Meats'),
  (6, NULL, 'Sauces')
ON CONFLICT (id) DO NOTHING;

-- -------
-- Products
-- -------
INSERT INTO products (id, category_id, name, price, stock_quantity) VALUES
  (1,  2, 'Spinach (bunch)',           2.50, 200),
  (2,  1, 'Tomato (roma)',             1.20, 500),
  (3,  3, 'Milk 1L',                   1.10, 300),
  (4,  3, 'Cheddar Cheese 200g',       3.80, 150),
  (5,  4, 'Rice 1kg',                  2.20, 400),
  (6,  4, 'Pasta 500g',                1.70, 350),
  (7,  5, 'Chicken Breast 1kg',        6.90, 120),
  (8,  6, 'Soy Sauce 250ml',           2.90, 180),
  (9,  6, 'Olive Oil 500ml',           5.50, 140),
  (10, 5, 'Ground Beef 1kg',           7.50, 100)
ON CONFLICT (id) DO NOTHING;

-- -----
-- Orders
-- -----
INSERT INTO orders (id, customer_name, customer_email, order_date, total_amount, order_status) VALUES
  (1, 'Alice Johnson',  'alice@example.com', now() - INTERVAL '10 days', 0.00, 'Pending'),
  (2, 'Bob Smith',      'bob@example.com',   now() - INTERVAL '9 days',  0.00, 'Processing'),
  (3, 'Charlie Green',  'charlie@example.com', now() - INTERVAL '8 days', 0.00, 'Shipped'),
  (4, 'Alice Johnson',  'alice@example.com', now() - INTERVAL '6 days',  0.00, 'Delivered'),
  (5, 'Diana Prince',   'diana@example.com', now() - INTERVAL '4 days',  0.00, 'Pending'),
  (6, 'Evan Wright',    'evan@example.com',  now() - INTERVAL '2 days',  0.00, 'Cancelled'),
  (7, 'Alice Johnson',  'alice@example.com', now() - INTERVAL '1 day',   0.00, 'Processing'),
  (8, 'Fiona Miles',    'fiona@example.com', now() - INTERVAL '12 hours',0.00, 'Delivered')
ON CONFLICT (id) DO NOTHING;

-- -------------
-- Product lines
-- -------------
-- Use current product price as price_at_order for simplicity.
INSERT INTO product_orders (id, order_id, product_id, quantity, price_at_order) VALUES
  (1,  1, 2,  5, 1.20),   -- tomatoes
  (2,  1, 5,  1, 2.20),   -- rice
  (3,  2, 7,  2, 6.90),   -- chicken
  (4,  2, 6,  3, 1.70),   -- pasta
  (5,  3, 3,  4, 1.10),   -- milk
  (6,  3, 4,  1, 3.80),   -- cheddar
  (7,  4, 5,  2, 2.20),   -- rice
  (8,  4, 8,  1, 2.90),   -- soy sauce
  (9,  5, 10, 1, 7.50),   -- beef
  (10, 5, 6,  2, 1.70),   -- pasta
  (11, 6, 1,  6, 2.50),   -- spinach
  (12, 6, 9,  1, 5.50),   -- olive oil
  (13, 7, 7,  1, 6.90),   -- chicken
  (14, 7, 3,  2, 1.10),   -- milk
  (15, 7, 8,  2, 2.90),   -- soy sauce
  (16, 8, 4,  2, 3.80),   -- cheddar
  (17, 8, 2,  3, 1.20)    -- tomatoes
ON CONFLICT (id) DO NOTHING;

-- Recompute order totals from order lines.
WITH sums AS (
  SELECT po.order_id, SUM(po.line_total) AS total
  FROM product_orders po
  GROUP BY po.order_id
)
UPDATE orders o
SET total_amount = COALESCE(s.total, 0)
FROM sums s
WHERE s.order_id = o.id;

-- Optional: ensure non-listed orders (if any) have zero totals.
UPDATE orders o
SET total_amount = 0
WHERE NOT EXISTS (SELECT 1 FROM product_orders po WHERE po.order_id = o.id);
