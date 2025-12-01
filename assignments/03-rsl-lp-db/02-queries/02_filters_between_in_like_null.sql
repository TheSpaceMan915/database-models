-- assignments/03-rsl-lp-db/02-queries/02_filters_between_in_like_null.sql
-- Раздел 2. BETWEEN, IN/NOT IN, LIKE/ILIKE, IS NULL
SET search_path = rsl, public;

-- 2.1 Модули, имя которых начинается на 'A' (без учёта регистра).
SELECT m.id, m.name
FROM module AS m
WHERE m.name ILIKE 'a%'
ORDER BY m.name;

-- 2.2 Шаги с доменом URL из заданного списка.
-- Извлекаем домен: split_part(split_part(url,'//',2), '/', 1)
SELECT s.id, s.name, s.url
FROM step AS s
WHERE s.url IS NOT NULL
  AND split_part(split_part(s.url, '//', 2), '/', 1) IN ('example.com','cdn.example.org')
ORDER BY s.id;

-- 2.3 Уроки без описания (description IS NULL).
SELECT l.id, l.module_id, l.name
FROM lesson AS l
WHERE l.description IS NULL
ORDER BY l.module_id, l.id;

-- 2.4 Пользователи, созданные между двумя датами (пример: 30 дней назад и сегодня).
SELECT p.id, p.email, p.created_at
FROM person AS p
WHERE p.created_at BETWEEN (now() - INTERVAL '30 days') AND now()
ORDER BY p.created_at DESC;

-- 2.5 Статусы, кроме 'available'.
SELECT s.id, s.name
FROM status AS s
WHERE s.name NOT IN ('available')
ORDER BY s.name;
