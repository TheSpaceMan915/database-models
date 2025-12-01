-- assignments/03-rsl-lp-db/02-queries/06_group_by_having.sql
-- Раздел 6. GROUP BY / HAVING
SET search_path = rsl, public;

-- 6.1 Модули, у которых не менее 5 уроков.
SELECT m.id, m.name, COUNT(l.id) AS lesson_count
FROM module AS m
LEFT JOIN lesson AS l ON l.module_id = m.id
GROUP BY m.id, m.name
HAVING COUNT(l.id) >= 5
ORDER BY m.id;

-- 6.2 Уроки, в которых все шаги завершены для заданного пользователя (пример person_id = 1).
SELECT le.id, le.name
FROM lesson AS le
JOIN step AS st ON st.lesson_id = le.id
LEFT JOIN person_step_progress AS psp
  ON psp.step_id = st.id AND psp.person_id = 1
LEFT JOIN status AS s ON s.id = psp.status_id
GROUP BY le.id, le.name
HAVING COUNT(*) FILTER (WHERE s.name = 'completed') = COUNT(st.id)
   AND COUNT(st.id) > 0
ORDER BY le.id;

-- 6.3 Пользователи, у которых есть хотя бы один модуль без каких-либо записей прогресса.
WITH all_pairs AS (
  SELECT p.id AS person_id, m.id AS module_id
  FROM person AS p CROSS JOIN module AS m
),
progress_pairs AS (
  SELECT person_id, module_id FROM person_module_progress
  UNION
  SELECT plp.person_id, le.module_id
  FROM person_lesson_progress AS plp
  JOIN lesson AS le ON le.id = plp.lesson_id
  UNION
  SELECT psp.person_id, le.module_id
  FROM person_step_progress AS psp
  JOIN step  AS st ON st.id = psp.step_id
  JOIN lesson AS le ON le.id = st.lesson_id
)
SELECT DISTINCT ap.person_id
FROM all_pairs AS ap
LEFT JOIN progress_pairs AS pp
  ON pp.person_id = ap.person_id AND pp.module_id = ap.module_id
WHERE pp.module_id IS NULL
ORDER BY ap.person_id;
