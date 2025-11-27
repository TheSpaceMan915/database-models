-- Section 6. GROUP BY / HAVING
SET search_path = spj, public;

-- 6.1. Требуется вычислить общий объём поставок для каждой детали и выдать номер детали и общий объём.
SELECT spj.part_no, COALESCE(SUM(spj.qty),0) AS total_qty
FROM supplies AS spj
GROUP BY spj.part_no
ORDER BY spj.part_no;

-- 6.2. Выдать номер детали и общий объём поставок за исключением поставок поставщика S1.
SELECT spj.part_no, COALESCE(SUM(spj.qty),0) AS total_qty_excluding_s1
FROM supplies AS spj
WHERE spj.supplier_no <> 'S1'
GROUP BY spj.part_no
HAVING SUM(spj.qty) IS NOT NULL   -- guards against empty groups
ORDER BY spj.part_no;
