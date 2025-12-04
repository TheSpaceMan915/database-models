-- assignments/06-assessment/02-queries/01_core_analytics.sql
-- Core analytics pack for the Assessment database.
SET search_path TO asm, public;

-- 1) Orders where at least one line has quantity < MIN(quantity) sold
--    for any product in the parent category with the shortest name (including its descendants).
WITH parent_shortest AS (
  SELECT pc.id
  FROM product_categories pc
  WHERE EXISTS (SELECT 1 FROM product_categories c WHERE c.parent_id = pc.id)
  ORDER BY length(pc.name), pc.id
  LIMIT 1
),
RECURSIVE descendants AS (
  SELECT id FROM product_categories WHERE id = (SELECT id FROM parent_shortest)
  UNION ALL
  SELECT c.id
  FROM product_categories c
  JOIN descendants d ON c.parent_id = d.id
),
min_qty AS (
  SELECT MIN(po.quantity) AS min_q
  FROM product_orders po
  JOIN products p ON p.id = po.product_id
  WHERE p.category_id IN (SELECT id FROM descendants)
),
target_orders AS (
  SELECT DISTINCT po.order_id
  FROM product_orders po
  JOIN min_qty m ON TRUE
  WHERE po.quantity < m.min_q
)
SELECT o.id, o.customer_name, o.customer_email, o.order_date, o.total_amount, o.order_status
FROM orders o
JOIN target_orders t ON t.order_id = o.id
ORDER BY o.id;

-- 2) Categories that have no products in any order with status = 'Pending'.
SELECT pc.id, pc.name
FROM product_categories pc
WHERE NOT EXISTS (
  SELECT 1
  FROM products p
  JOIN product_orders po ON po.product_id = p.id
  JOIN orders o ON o.id = po.order_id
  WHERE p.category_id = pc.id
    AND o.order_status = 'Pending'
)
ORDER BY pc.name;

-- 3) Category name and average units sold per order in this category,
--    keeping only categories whose average exceeds the overall average across all orders.
WITH order_category_units AS (
  SELECT p.category_id, po.order_id, SUM(po.quantity) AS units_in_order
  FROM product_orders po
  JOIN products p ON p.id = po.product_id
  GROUP BY p.category_id, po.order_id
),
category_avg AS (
  SELECT category_id, AVG(units_in_order::NUMERIC) AS avg_units_per_order
  FROM order_category_units
  GROUP BY category_id
),
overall_avg AS (
  SELECT AVG(total_units::NUMERIC) AS avg_units_per_order_overall
  FROM (
    SELECT po.order_id, SUM(po.quantity) AS total_units
    FROM product_orders po
    GROUP BY po.order_id
  ) t
)
SELECT pc.name AS category_name, ca.avg_units_per_order
FROM category_avg ca
JOIN product_categories pc ON pc.id = ca.category_id
CROSS JOIN overall_avg oa
WHERE ca.avg_units_per_order > oa.avg_units_per_order_overall
ORDER BY ca.avg_units_per_order DESC, pc.name;

-- 4) Moving average of orders.total_amount over the previous two orders
--    (ordered by order_date). Current order not included in the average.
SELECT
  o.id AS order_id,
  o.total_amount,
  AVG(o.total_amount) OVER (
    ORDER BY o.order_date, o.id
    ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING
  ) AS moving_average_prev2
FROM orders o
ORDER BY o.order_date, o.id;

-- 5) Recursive "order tree": edges connect orders that share at least one same product.
--    Number connected components (branches) and show orders from branch = 1.
WITH edges AS (
  SELECT DISTINCT LEAST(po1.order_id, po2.order_id) AS a,
                  GREATEST(po1.order_id, po2.order_id) AS b
  FROM product_orders po1
  JOIN product_orders po2
    ON po1.product_id = po2.product_id
   AND po1.order_id <> po2.order_id
),
nodes AS (
  SELECT id AS order_id FROM orders
),
RECURSIVE connected(component, order_id) AS (
  SELECT n.order_id AS component, n.order_id
  FROM nodes n
  UNION
  SELECT c.component, e.b
  FROM connected c
  JOIN edges e ON e.a = c.order_id
  UNION
  SELECT c.component, e.a
  FROM connected c
  JOIN edges e ON e.b = c.order_id
),
components AS (
  SELECT order_id, MIN(component) AS root
  FROM connected
  GROUP BY order_id
),
numbered AS (
  SELECT order_id, root,
         DENSE_RANK() OVER (ORDER BY root) AS branch
  FROM components
)
SELECT o.id AS order_id, n.branch, o.customer_name, o.order_date, o.total_amount
FROM numbered n
JOIN orders o ON o.id = n.order_id
WHERE n.branch = 1
ORDER BY o.order_date, o.id;

-- 6) Recursive "order history" for the most active customer (max number of orders),
--    starting at their first order and recursing to the next by ascending order_date.
WITH top_customer AS (
  SELECT customer_email
  FROM orders
  GROUP BY customer_email
  ORDER BY COUNT(*) DESC, customer_email
  LIMIT 1
),
ordered AS (
  SELECT o.*, ROW_NUMBER() OVER (PARTITION BY o.customer_email ORDER BY o.order_date, o.id) AS rn
  FROM orders o
  JOIN top_customer t ON t.customer_email = o.customer_email
),
RECURSIVE history AS (
  SELECT id, customer_name, customer_email, order_date, total_amount, rn
  FROM ordered
  WHERE rn = 1
  UNION ALL
  SELECT o2.id, o2.customer_name, o2.customer_email, o2.order_date, o2.total_amount, o2.rn
  FROM history h
  JOIN ordered o2
    ON o2.customer_email = h.customer_email
   AND o2.rn = h.rn + 1
)
SELECT * FROM history ORDER BY rn;
