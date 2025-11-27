-- Section 7. Объединения (UNION / UNION ALL)
SET search_path = spj, public;

-- Note: prefer UNION ALL (no dedup) unless the task demands distinct.
-- We add comments where UNION (dedup) is chosen intentionally.

-- 7.1. Выдать номера деталей: (а) детали, поставляемые поставщиком S1; (б) детали, произведённые в Лондоне.
-- Требуется уникальный список → UNION (dedup).
SELECT spj.part_no FROM supplies AS spj WHERE spj.supplier_no = 'S1'
UNION
SELECT p.part_no FROM parts AS p WHERE p.city = 'Лондон'
ORDER BY 1;

-- 7.2. Выдать номера деталей, имеющих вес более 16, либо поставляемых поставщиком S2 (или и то, и другое).
-- Дедупликация не требуется → UNION ALL (показывает происхождение строк при анализе).
SELECT p.part_no FROM parts AS p WHERE p.weight > 16
UNION ALL
SELECT spj.part_no FROM supplies AS spj WHERE spj.supplier_no = 'S2'
ORDER BY 1;

-- 7.3. Выдать номера деталей, которые имеют вес больше 16, либо поставляются поставщиками S2, либо то и другое,
-- но показать уникальные номера (итоговый набор без дублей) → UNION.
SELECT p.part_no FROM parts AS p WHERE p.weight > 16
UNION
SELECT spj.part_no FROM supplies AS spj WHERE spj.supplier_no = 'S2'
ORDER BY 1;
