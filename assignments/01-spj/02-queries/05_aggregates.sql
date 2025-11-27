-- Section 5. Агрегатные функции (COUNT, SUM, AVG, MIN, MAX)
SET search_path = spj, public;

-- 5.1. Выдать число поставщиков всего.
SELECT COUNT(*) AS supplier_count
FROM suppliers;

-- 5.2. Выдать минимальный, максимальный и средний статус поставщиков.
SELECT
  MIN(status) AS min_status,
  MAX(status) AS max_status,
  ROUND(AVG(status)::numeric, 2) AS avg_status
FROM suppliers;

-- 5.3. Выдать число поставщиков, которые поставляют деталь P2.
SELECT COUNT(DISTINCT spj.supplier_no) AS suppliers_for_p2
FROM supplies AS spj
WHERE spj.part_no = 'P2';

-- 5.4. Выдать минимальный и максимальный вес деталей.
SELECT MIN(weight) AS min_weight, MAX(weight) AS max_weight
FROM parts;

-- 5.5. Выдать количество поставщиков в каждом городе.
SELECT s.city, COUNT(*) AS suppliers_in_city
FROM suppliers AS s
GROUP BY s.city
ORDER BY s.city;

-- 5.6. Выдать суммарный объём поставок (qty) по каждому поставщику.
SELECT spj.supplier_no, COALESCE(SUM(spj.qty),0) AS total_qty
FROM supplies AS spj
GROUP BY spj.supplier_no
ORDER BY spj.supplier_no;
