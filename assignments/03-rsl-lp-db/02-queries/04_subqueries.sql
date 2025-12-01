-- assignments/03-rsl-lp-db/02-queries/04_subqueries.sql
-- Раздел 4. Подзапросы
SET search_path = rsl, public;

-- 4.1 Пользователи, завершившие все шаги в любом уроке (деление отношений).
-- Возвращаем пары (person_id, lesson_id).
SELECT p.id AS person_id, le.id AS lesson_id
FROM person AS p
JOIN lesson AS le ON TRUE
WHERE NOT EXISTS (
  SELECT 1
  FROM step AS st
  WHERE st.lesson_id = le.id
    AND NOT EXISTS (
      SELECT 1
      FROM person_step_progress AS psp
      JOIN status AS s ON s.id = psp.status_id AND s.name = 'completed'
      WHERE psp.person_id = p.id
        AND psp.step_id   = st.id
    )
)
ORDER BY p.id, le.id;

-- 4.2 Модули, у которых нет записей прогресса со статусом 'available'.
SELECT m.id, m.name
FROM module AS m
WHERE NOT EXISTS (
  SELECT 1
  FROM person_module_progress AS pmp
  JOIN status AS s ON s.id = pmp.status_id
  WHERE pmp.module_id = m.id
    AND s.name = 'available'
)
ORDER BY m.id;

-- 4.3 Уроки, где число шагов больше среднего по всем урокам.
SELECT le.id, le.name, COUNT(st.id) AS steps_count
FROM lesson AS le
LEFT JOIN step AS st ON st.lesson_id = le.id
GROUP BY le.id, le.name
HAVING COUNT(st.id) >
       (SELECT AVG(cnt) FROM (
          SELECT COUNT(*) AS cnt
          FROM lesson AS le2
          LEFT JOIN step AS st2 ON st2.lesson_id = le2.id
          GROUP BY le2.id
        ) AS t)
ORDER BY le.id;
