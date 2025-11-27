-- Section 1. Ограниченная выборка (Restricted selects)
SET search_path = spj, public;

-- 1.1. Выдать номера поставщиков из Парижа, имеющих состояние больше 20.
SELECT s.supplier_no
FROM suppliers AS s
WHERE s.city = 'Париж' AND s.status > 20
ORDER BY s.supplier_no;

-- 1.2. Выдать номера и состояние поставщиков, находящихся в Париже, в порядке убывания их состояния.
SELECT s.supplier_no, s.status
FROM suppliers AS s
WHERE s.city = 'Париж'
ORDER BY s.status DESC, s.supplier_no;

-- 1.3. Выдать полный список изделий (projects).
SELECT j.project_no, j.name AS project_name, j.city
FROM projects AS j
ORDER BY j.project_no;

-- 1.4. Выдать упорядоченный список номеров поставщиков, поставляющих детали для изделия J1.
SELECT DISTINCT spj.supplier_no
FROM supplies AS spj
WHERE spj.project_no = 'J1'
ORDER BY spj.supplier_no;

-- 1.5. Выдать список всех поставок, в которых количество деталей находится в диапазоне от 300 до 750 включительно.
SELECT spj.supplier_no, spj.part_no, spj.project_no, spj.qty
FROM supplies AS spj
WHERE spj.qty BETWEEN 300 AND 750
ORDER BY spj.supplier_no, spj.part_no, spj.project_no;

-- 1.6. Выдать список всех комбинаций (цвет детали, город), исключая повторения.
SELECT DISTINCT p.color, p.city
FROM parts AS p
ORDER BY p.color, p.city;

-- 1.7. [Повтор задания 1.1 из источника; оставлено осознанно]
-- Выдать номера поставщиков из Парижа, имеющих состояние больше 20.
SELECT s.supplier_no
FROM suppliers AS s
WHERE s.city = 'Париж' AND s.status > 20
ORDER BY s.supplier_no;

-- 1.8. Выдать номера деталей, вес которых находится в диапазоне от 16 до 19.
SELECT p.part_no
FROM parts AS p
WHERE p.weight BETWEEN 16 AND 19
ORDER BY p.part_no;

-- 1.9. Выдать сведения о деталях, вес которых равен 12, 16 и 18.  -- (18 отсутствует в семпле; оставлено как проверка множества)
SELECT p.part_no, p.name, p.color, p.weight, p.city
FROM parts AS p
WHERE p.weight IN (12, 16, 18)
ORDER BY p.part_no;

-- 1.10. Выдать список всех поставок, в которых количество не является неопределённым значением (NOT NULL).
SELECT spj.supplier_no, spj.part_no, spj.project_no, spj.qty
FROM supplies AS spj
WHERE spj.qty IS NOT NULL
ORDER BY spj.supplier_no, spj.part_no, spj.project_no;

-- 1.11. (Assumption) Выдать список поставок с NULL количеством (проверка корректности IS NULL).
SELECT spj.supplier_no, spj.part_no, spj.project_no, spj.qty
FROM supplies AS spj
WHERE spj.qty IS NULL
ORDER BY spj.supplier_no, spj.part_no, spj.project_no;
