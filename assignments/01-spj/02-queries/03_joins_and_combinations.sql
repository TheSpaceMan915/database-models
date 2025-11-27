-- Section 3. Соединения и комбинации
SET search_path = spj, public;

-- 3.1. Выдать все триплеты (номер поставщика, номер детали, номер изделия),
-- такие, что поставщик, деталь и изделие находятся в одном и том же городе.
SELECT DISTINCT spj.supplier_no, spj.part_no, spj.project_no
FROM supplies AS spj
JOIN suppliers AS s ON s.supplier_no = spj.supplier_no
JOIN parts     AS p ON p.part_no     = spj.part_no
JOIN projects  AS j ON j.project_no  = spj.project_no
WHERE s.city = p.city AND p.city = j.city
ORDER BY spj.supplier_no, spj.part_no, spj.project_no;

-- 3.2. (Assumption) Выдать все триплеты поставок, где поставщик, деталь и изделие НЕ соразмещены попарно.
-- Интерпретация: не все три города равны одновременно.
SELECT DISTINCT spj.supplier_no, spj.part_no, spj.project_no
FROM supplies AS spj
JOIN suppliers AS s ON s.supplier_no = spj.supplier_no
JOIN parts     AS p ON p.part_no     = spj.part_no
JOIN projects  AS j ON j.project_no  = spj.project_no
WHERE NOT (s.city = p.city AND p.city = j.city)
ORDER BY spj.supplier_no, spj.part_no, spj.project_no;

-- 3.3. Выбрать все комбинации (поставщик, деталь), соразмещённые в одном городе.
SELECT DISTINCT s.supplier_no, p.part_no, s.city
FROM suppliers AS s
JOIN parts     AS p ON p.city = s.city
ORDER BY s.supplier_no, p.part_no;

-- 3.4. Выбрать все комбинации (поставщик, деталь), расположенные в разных городах.
SELECT DISTINCT s.supplier_no, p.part_no, s.city AS supplier_city, p.city AS part_city
FROM suppliers AS s
JOIN parts     AS p ON p.city <> s.city
ORDER BY s.supplier_no, p.part_no;

-- 3.5. Выбрать комбинации (поставщик, деталь), где город поставщика алфавитно > города детали.
SELECT DISTINCT s.supplier_no, p.part_no, s.city AS supplier_city, p.city AS part_city
FROM suppliers AS s
JOIN parts     AS p ON TRUE
WHERE s.city > p.city
ORDER BY s.supplier_no, p.part_no;

-- 3.6. Выбрать соразмещённые (поставщик, деталь), исключив поставщиков со статусом = 20.
SELECT DISTINCT s.supplier_no, p.part_no, s.city
FROM suppliers AS s
JOIN parts     AS p ON p.city = s.city
WHERE s.status <> 20
ORDER BY s.supplier_no, p.part_no;

-- 3.7. Выдать пары городов (город поставщика, город детали), где есть поставка этой детали данным поставщиком.
SELECT DISTINCT s.city AS supplier_city, p.city AS part_city
FROM supplies AS spj
JOIN suppliers AS s ON s.supplier_no = spj.supplier_no
JOIN parts     AS p ON p.part_no     = spj.part_no
ORDER BY supplier_city, part_city;

-- 3.8. Выдать номера поставщиков, которые поставляют хотя бы одну красную деталь в Лондон для изделия, изготовляемого в Лондоне.
SELECT DISTINCT s.supplier_no
FROM supplies AS spj
JOIN suppliers AS s ON s.supplier_no = spj.supplier_no
JOIN parts     AS p ON p.part_no     = spj.part_no
JOIN projects  AS j ON j.project_no  = spj.project_no
WHERE p.color = 'Красный' AND p.city = 'Лондон' AND j.city = 'Лондон'
ORDER BY s.supplier_no;

-- 3.9. Выдать номера деталей, поставляемых какими-либо поставщиками из Лондона.
SELECT DISTINCT spj.part_no
FROM supplies AS spj
JOIN suppliers AS s ON s.supplier_no = spj.supplier_no
WHERE s.city = 'Лондон'
ORDER BY spj.part_no;

-- 3.10. Выдать пары городов (город поставщика, город изделия),
-- таких, что поставщик из 1-го города поставляет детали для изделия из 2-го города.
SELECT DISTINCT s.city AS supplier_city, j.city AS project_city
FROM supplies AS spj
JOIN suppliers AS s ON s.supplier_no = spj.supplier_no
JOIN projects  AS j ON j.project_no  = spj.project_no
ORDER BY supplier_city, project_city;

-- 3.11. Выдать номера изделий, для которых существует поставщик из того же города (соразмещение поставщик=изделие).
SELECT DISTINCT j.project_no
FROM supplies AS spj
JOIN suppliers AS s ON s.supplier_no = spj.supplier_no
JOIN projects  AS j ON j.project_no  = spj.project_no
WHERE s.city = j.city
ORDER BY j.project_no;
