-- Section 4. Подзапросы
SET search_path = spj, public;

-- 4.1. Выдать фамилии поставщиков, которые поставляют деталь P2.
SELECT s.last_name
FROM suppliers AS s
WHERE EXISTS (
  SELECT 1
  FROM supplies AS spj
  WHERE spj.supplier_no = s.supplier_no
    AND spj.part_no = 'P2'
)
ORDER BY s.last_name;

-- 4.2. Выдать фамилии поставщиков, которые поставляют по крайней мере одну красную деталь.
SELECT DISTINCT s.last_name
FROM suppliers AS s
WHERE EXISTS (
  SELECT 1
  FROM supplies AS spj
  JOIN parts AS p ON p.part_no = spj.part_no
  WHERE spj.supplier_no = s.supplier_no
    AND p.color = 'Красный'
)
ORDER BY s.last_name;

-- 4.3. Выдать номера поставщиков, которые поставляют все детали (деление отношений).
SELECT s.supplier_no
FROM suppliers AS s
WHERE NOT EXISTS (
  SELECT 1
  FROM parts AS p
  WHERE NOT EXISTS (
    SELECT 1
    FROM supplies AS spj
    WHERE spj.supplier_no = s.supplier_no
      AND spj.part_no = p.part_no
  )
)
ORDER BY s.supplier_no;

-- 4.4. Выдать номера поставщиков, поставляющих детали для всех изделий, выпускаемых в Лондоне.  -- Assumption
SELECT s.supplier_no
FROM suppliers AS s
WHERE NOT EXISTS (
  SELECT 1
  FROM projects AS j
  WHERE j.city = 'Лондон'
    AND NOT EXISTS (
      SELECT 1
      FROM supplies AS spj
      WHERE spj.supplier_no = s.supplier_no
        AND spj.project_no = j.project_no
    )
)
ORDER BY s.supplier_no;
