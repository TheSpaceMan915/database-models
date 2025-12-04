-- assignments/06-assessment/04-triggers/01_trg_check_stock_before_insert_product_order.sql
-- Purpose: Prevent inserting order lines that exceed available stock.

CREATE OR REPLACE FUNCTION asm.fn_check_stock_before_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock INTEGER;
BEGIN
  -- Lock the product row while checking to avoid a race in highly concurrent flows.
  SELECT stock_quantity
  INTO v_stock
  FROM asm.products
  WHERE id = NEW.product_id
  FOR UPDATE;

  IF v_stock IS NULL THEN
    RAISE EXCEPTION 'Product % does not exist', NEW.product_id;
  END IF;

  IF v_stock < NEW.quantity THEN
    RAISE EXCEPTION
      'Insufficient stock for product %: available %, requested %',
      NEW.product_id, v_stock, NEW.quantity;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_stock_before_insert_product_order ON asm.product_orders;

CREATE TRIGGER trg_check_stock_before_insert_product_order
BEFORE INSERT ON asm.product_orders
FOR EACH ROW
EXECUTE FUNCTION asm.fn_check_stock_before_insert();
