# Assessment — PostgreSQL Database (recipes & ingredients)

Production-grade PostgreSQL 18 schema for a recipe & ingredient management system.
Includes DDL, seed data, analytics, one stored procedure, a safety trigger, and tear-down scripts.

## Quickstart (psql)
```bash
# Create role & DB (run as superuser on postgres DB)
psql -U postgres -d postgres -v ON_ERROR_STOP=1     -f assignments/assessment/01-db-setup/00_create_database.sql

# Load schema & seed (connect as asm_user)
psql -U asm_user -d assessment_db -v ON_ERROR_STOP=1 <<'SQL'
SET search_path TO asm, public;
\i assignments/06-assessment/01-db-setup/01_schema.sql
\i assignments/06-assessment/01-db-setup/02_seed.sql
\i assignments/06-assessment/03-procedures/01_sp_update_product_price_and_recalculate_orders.sql
\i assignments/06-assessment/04-triggers/01_trg_check_stock_before_insert_product_order.sql
SQL

# Run analytics
psql -U asm_user -d assessment_db -v ON_ERROR_STOP=1     -f assignments/assessment/02-queries/01_core_analytics.sql
```

## Entities
- `asm.product_categories` — hierarchical categories (parent_id self-reference).
- `asm.products` — product catalog; price, stock, category.
- `asm.orders` — customer orders; status, total.
- `asm.product_orders` — order lines; generated `line_total` and `(order_id, product_id)` uniqueness.
- `asm.v_order_items` — convenience view for reporting.

## Teardown
See `assignments/assessment/05-db-drop/` (destructive operations). Read `README_DROP.md` first.
