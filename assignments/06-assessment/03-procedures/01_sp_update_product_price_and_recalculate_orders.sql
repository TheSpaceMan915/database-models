-- assignments/06-assessment/03-procedures/01_sp_update_product_price_and_recalculate_orders.sql
-- Purpose: Update a product's price, conditionally raise line prices, and recalc order totals.
-- Usage:
--   CALL asm.sp_update_product_price_and_recalculate_orders(7, 7.25, NULL, NULL);

CREATE OR REPLACE PROCEDURE asm.sp_update_product_price_and_recalculate_orders(
  IN  p_product_id INT,
  IN  p_new_price  NUMERIC,
  OUT updated_product_orders INT,
  OUT updated_orders         INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure sensible defaults for OUT parameters.
  updated_product_orders := 0;
  updated_orders         := 0;

  -- Start an explicit transaction (procedures support transaction control).
  START TRANSACTION;

  -- Lock the target product to avoid race conditions with concurrent price/stock changes.
  PERFORM 1
  FROM asm.products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Update the product price itself.
  UPDATE asm.products
  SET price = p_new_price
  WHERE id = p_product_id;

  -- Update price_at_order ONLY if it is below the new price.
  -- Then recompute affected orders' totals using the generated line_total.
  WITH updated_lines AS (
    UPDATE asm.product_orders po
       SET price_at_order = p_new_price
     WHERE po.product_id = p_product_id
       AND po.price_at_order < p_new_price
     RETURNING po.order_id
  ),
  recalc AS (
    UPDATE asm.orders o
       SET total_amount = agg.sum_total
      FROM (
        SELECT po.order_id, SUM(po.line_total) AS sum_total
        FROM asm.product_orders po
        WHERE po.order_id IN (SELECT order_id FROM updated_lines)
        GROUP BY po.order_id
      ) AS agg
     WHERE o.id = agg.order_id
     RETURNING o.id
  )
  SELECT
    (SELECT COUNT(*) FROM updated_lines),
    (SELECT COUNT(*) FROM recalc)
  INTO updated_product_orders, updated_orders;

  COMMIT;
END;
$$;
