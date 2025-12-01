-- assignments/03-rsl-lp-db/02-queries/03_joins_and_combinations.sql
-- Раздел 3. Соединения и комбинации
SET search_path = rsl, public;

-- 3.1 Триплеты (module, lesson, step) для выбранного модуля (пример: module_id = 1).
SELECT m.name AS module_name, l.name AS lesson_name, st.name AS step_name
FROM module AS m
JOIN lesson AS l ON l.module_id = m.id
JOIN step   AS st ON st.lesson_id = l.id
WHERE m.id = 1
ORDER BY l.id, st.id;

-- 3.2 Для каждого пользователя — список шагов с текущим статусом.
SELECT p.id AS person_id, p.email,
       stp.id AS step_id, stp.name AS step_name,
       s.name AS status_name
FROM person AS p
JOIN person_step_progress AS psp ON psp.person_id = p.id
JOIN step AS stp ON stp.id = psp.step_id
JOIN status AS s ON s.id = psp.status_id
ORDER BY p.id, stp.id;

-- 3.3 Для каждого пользователя — уроки, где есть хотя бы один завершённый шаг.
SELECT DISTINCT p.id AS person_id, p.email, l.id AS lesson_id, l.name AS lesson_name
FROM person AS p
JOIN person_step_progress AS psp ON psp.person_id = p.id
JOIN status AS s ON s.id = psp.status_id AND s.name = 'completed'
JOIN step AS st ON st.id = psp.step_id
JOIN lesson AS l ON l.id = st.lesson_id
ORDER BY p.id, l.id;

-- 3.4 Активные модули пользователя (любой прогресс на уровне модуля/урока/шага).
-- Пример: для каждого пользователя.
WITH modules_from_steps AS (
  SELECT DISTINCT psp.person_id, le.module_id
  FROM person_step_progress AS psp
  JOIN step   AS st ON st.id = psp.step_id
  JOIN lesson AS le ON le.id = st.lesson_id
),
modules_from_lessons AS (
  SELECT DISTINCT plp.person_id, le.module_id
  FROM person_lesson_progress AS plp
  JOIN lesson AS le ON le.id = plp.lesson_id
),
modules_from_modules AS (
  SELECT DISTINCT person_id, module_id
  FROM person_module_progress
)
SELECT DISTINCT p.id AS person_id, p.email, m.id AS module_id, m.name AS module_name
FROM person AS p
JOIN module AS m ON TRUE
LEFT JOIN modules_from_steps   ms ON ms.person_id = p.id AND ms.module_id = m.id
LEFT JOIN modules_from_lessons ml ON ml.person_id = p.id AND ml.module_id = m.id
LEFT JOIN modules_from_modules mm ON mm.person_id = p.id AND mm.module_id = m.id
WHERE ms.module_id IS NOT NULL OR ml.module_id IS NOT NULL OR mm.module_id IS NOT NULL
ORDER BY p.id, m.id;

-- 3.5 Модули без уроков (анти-join через LEFT JOIN ... IS NULL).
SELECT m.id, m.name
FROM module AS m
LEFT JOIN lesson AS l ON l.module_id = m.id
WHERE l.id IS NULL
ORDER BY m.id;
