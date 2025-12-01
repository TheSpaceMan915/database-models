-- assignments/03-rsl-lp-db/02-queries/07_unions.sql
-- Раздел 7. UNION / UNION ALL
SET search_path = rsl, public;

-- 7.1 UNION: Нормализованный список сущностей (entity_type, id, name) без дублей.
SELECT 'module' AS entity_type, m.id AS entity_id, m.name AS entity_name
FROM module AS m
UNION
SELECT 'lesson', l.id, l.name
FROM lesson AS l
UNION
SELECT 'step', s.id, s.name
FROM step AS s
ORDER BY entity_type, entity_id;

-- 7.2 UNION ALL: Нормализованные строки прогресса (level, person_id, entity_id, status_id).
SELECT 'module' AS level, pmp.person_id, pmp.module_id AS entity_id, pmp.status_id
FROM person_module_progress AS pmp
UNION ALL
SELECT 'lesson', plp.person_id, plp.lesson_id, plp.status_id
FROM person_lesson_progress AS plp
UNION ALL
SELECT 'step', psp.person_id, psp.step_id, psp.status_id
FROM person_step_progress AS psp
ORDER BY level, person_id, entity_id;
