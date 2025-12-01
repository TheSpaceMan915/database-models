-- assignments/03-rsl-lp-db/02-queries/05_aggregates.sql
-- Раздел 5. Агрегатные функции
SET search_path = rsl, public;

-- 5.1 Количество уроков в каждом модуле.
SELECT m.id AS module_id, m.name AS module_name, COUNT(l.id) AS lesson_count
FROM module AS m
LEFT JOIN lesson AS l ON l.module_id = m.id
GROUP BY m.id, m.name
ORDER BY m.id;

-- 5.2 Количество шагов в каждом уроке.
SELECT le.id AS lesson_id, le.name AS lesson_name, COUNT(st.id) AS step_count
FROM lesson AS le
LEFT JOIN step AS st ON st.lesson_id = le.id
GROUP BY le.id, le.name
ORDER BY le.id;

-- 5.3 Процент завершённых шагов по каждому уроку для заданного пользователя (пример person_id = 1).
SELECT
  le.id   AS lesson_id,
  le.name AS lesson_name,
  COUNT(st.id) AS total_steps,
  COUNT(psp.step_id) FILTER (WHERE s.name = 'completed') AS completed_steps,
  ROUND(
    100.0 * COUNT(psp.step_id) FILTER (WHERE s.name = 'completed')
    / NULLIF(COUNT(st.id), 0), 2
  ) AS percent_completed
FROM lesson AS le
JOIN step AS st ON st.lesson_id = le.id
LEFT JOIN person_step_progress AS psp
  ON psp.step_id = st.id AND psp.person_id = 1
LEFT JOIN status AS s ON s.id = psp.status_id
GROUP BY le.id, le.name
ORDER BY le.id;

-- 5.4 Топ-3 модулей по количеству завершённых шагов в разрезе пользователя.
WITH steps_in_module AS (
  SELECT st.id AS step_id, le.module_id
  FROM step AS st
  JOIN lesson AS le ON le.id = st.lesson_id
),
done AS (
  SELECT psp.person_id, sim.module_id, COUNT(*) AS completed_steps
  FROM person_step_progress AS psp
  JOIN steps_in_module AS sim ON sim.step_id = psp.step_id
  JOIN status AS s ON s.id = psp.status_id AND s.name = 'completed'
  GROUP BY psp.person_id, sim.module_id
),
ranked AS (
  SELECT d.*,
         ROW_NUMBER() OVER (PARTITION BY d.person_id ORDER BY d.completed_steps DESC, d.module_id) AS rn
  FROM done AS d
)
SELECT r.person_id, r.module_id, m.name AS module_name, r.completed_steps
FROM ranked AS r
JOIN module AS m ON m.id = r.module_id
WHERE r.rn <= 3
ORDER BY r.person_id, r.rn;
