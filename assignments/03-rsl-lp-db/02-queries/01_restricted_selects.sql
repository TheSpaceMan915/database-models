-- assignments/03-rsl-lp-db/02-queries/01_restricted_selects.sql
-- Раздел 1. Ограниченная выборка (Restricted selects)
SET search_path = rsl, public;

-- 1.1 Список всех модулей по имени.
SELECT m.id, m.name, m.description
FROM module AS m
ORDER BY m.name;

-- 1.2 Уроки выбранного модуля (пример: module_id = 1).
SELECT l.id, l.name, l.description
FROM lesson AS l
WHERE l.module_id = 1
ORDER BY l.id;

-- 1.3 Шаги выбранного урока (только name и url; пример: lesson_id = 1).
SELECT s.name, s.url
FROM step AS s
WHERE s.lesson_id = 1
ORDER BY s.id;

-- 1.4 Все пользователи с датой создания (новые сверху).
SELECT p.id, p.email, p.created_at
FROM person AS p
ORDER BY p.created_at DESC, p.id;

-- 1.5 Шаги с непустыми заметками (notes IS NOT NULL/NOT EMPTY).
SELECT s.id, s.lesson_id, s.name
FROM step AS s
WHERE s.notes IS NOT NULL AND btrim(s.notes) <> ''
ORDER BY s.lesson_id, s.id;
