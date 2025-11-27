-- Section 2. BETWEEN, IN (NOT IN), LIKE, IS NULL (IS NOT NULL)
SET search_path = spj, public;

-- 2.1. Выдать сведения о деталях, вес которых находится в интервале 16 по 19 (BETWEEN).
SELECT p.part_no, p.name, p.color, p.weight, p.city
FROM parts AS p
WHERE p.weight BETWEEN 16 AND 19
ORDER BY p.weight, p.part_no;

-- 2.2. Выдать детали, вес которых 12, 16 или 17 (IN).
SELECT p.part_no, p.name, p.color, p.weight, p.city
FROM parts AS p
WHERE p.weight IN (12, 16, 17)
ORDER BY p.weight, p.part_no;

-- 2.3. Выдать список всех поставок, у которых количество не является неопределенным значением (IS NOT NULL).
SELECT spj.supplier_no, spj.part_no, spj.project_no, spj.qty
FROM supplies AS spj
WHERE spj.qty IS NOT NULL
ORDER BY spj.supplier_no, spj.part_no, spj.project_no;

-- 2.4. Выдать номера изделий и города, где 2-й буквой названия города является «о».  -- пример: «Лондон»
-- Using ILIKE for case-insensitive matching in Russian; '_' matches a single char.
SELECT j.project_no, j.city
FROM projects AS j
WHERE j.city ILIKE '_о%'  -- Russian second letter 'о'
ORDER BY j.project_no;

-- 2.5. Выдать все детали, названия которых начинаются с «Б» (LIKE/ILIKE).
SELECT p.part_no, p.name, p.color, p.weight, p.city
FROM parts AS p
WHERE p.name ILIKE 'б%'  -- 'Болт', 'Блюм'
ORDER BY p.part_no;
