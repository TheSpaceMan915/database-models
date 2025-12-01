-- assignments/03-rsl-lp-db/01-db-setup/02_seed.sql
-- Purpose: Seed canonical statuses, demo users, content, and progress.
-- Safe to re-run: uses INSERT ... ON CONFLICT where appropriate.

SET search_path = rsl, public;

-- 1) Statuses ----------------------------------------------------------------
INSERT INTO status (name) VALUES
  ('available'), ('in_progress'), ('completed')
ON CONFLICT (name) DO NOTHING;

-- Helper to fetch status ids
WITH s AS (
  SELECT name, id FROM status WHERE name IN ('available','in_progress','completed')
)
SELECT 1; -- noop marker for readability

-- 2) Demo users (hash placeholders; replace in real systems) -----------------
INSERT INTO person (email, password_hash, created_at) VALUES
  ('alice@example.com', 'demo_hash_bcrypt_alice', now() - INTERVAL '20 days'),
  ('bob@example.com',   'demo_hash_bcrypt_bob',   now() - INTERVAL '10 days'),
  ('carol@example.com', 'demo_hash_bcrypt_carol', now() - INTERVAL '5 days')
ON CONFLICT (email) DO NOTHING;

-- 3) Modules -----------------------------------------------------------------
INSERT INTO module (name, description) VALUES
  ('Alphabet',       'Letters and handshapes'),
  ('Basic Phrases',  'Greetings and common expressions'),
  ('Numbers',        'Counting and numerals'),
  ('Grammar Basics', 'Word order and markers')
ON CONFLICT DO NOTHING;

-- 4) Lessons -----------------------------------------------------------------
-- Alphabet
INSERT INTO lesson (module_id, name, description)
SELECT m.id, 'Vowels', 'Vowel handshapes'
FROM module m WHERE m.name = 'Alphabet'
ON CONFLICT DO NOTHING;

INSERT INTO lesson (module_id, name, description)
SELECT m.id, 'Consonants', 'Core consonant signs'
FROM module m WHERE m.name = 'Alphabet'
ON CONFLICT DO NOTHING;

-- Basic Phrases
INSERT INTO lesson (module_id, name, description)
SELECT m.id, 'Greetings', 'Hello, good-bye, polite forms'
FROM module m WHERE m.name = 'Basic Phrases'
ON CONFLICT DO NOTHING;

INSERT INTO lesson (module_id, name, description)
SELECT m.id, 'Common Questions', 'What? Where? How?'
FROM module m WHERE m.name = 'Basic Phrases'
ON CONFLICT DO NOTHING;

-- Numbers
INSERT INTO lesson (module_id, name)
SELECT m.id, '1–10'
FROM module m WHERE m.name = 'Numbers'
ON CONFLICT DO NOTHING;

INSERT INTO lesson (module_id, name)
SELECT m.id, '11–20'
FROM module m WHERE m.name = 'Numbers'
ON CONFLICT DO NOTHING;

-- Grammar Basics
INSERT INTO lesson (module_id, name, description)
SELECT m.id, 'Word Order', 'SVO/SOV patterns'
FROM module m WHERE m.name = 'Grammar Basics'
ON CONFLICT DO NOTHING;

-- 5) Steps (2–3 per lesson) --------------------------------------------------
-- Helper CTEs to fetch IDs
WITH
  l AS (
    SELECT (SELECT id FROM lesson WHERE name='Vowels'            LIMIT 1) AS vowels_id,
           (SELECT id FROM lesson WHERE name='Consonants'        LIMIT 1) AS consonants_id,
           (SELECT id FROM lesson WHERE name='Greetings'         LIMIT 1) AS greetings_id,
           (SELECT id FROM lesson WHERE name='Common Questions'  LIMIT 1) AS questions_id,
           (SELECT id FROM lesson WHERE name='1–10'              LIMIT 1) AS one_ten_id,
           (SELECT id FROM lesson WHERE name='11–20'             LIMIT 1) AS eleven_twenty_id,
           (SELECT id FROM lesson WHERE name='Word Order'        LIMIT 1) AS word_order_id
  )
INSERT INTO step (lesson_id, name, url, notes)
SELECT x.lesson_id, x.name, x.url, x.notes
FROM (
  VALUES
    ((SELECT vowels_id        FROM l), 'Intro video',   'https://example.com/rsl/alphabet/vowels/intro',  'Обзор гласных'),
    ((SELECT vowels_id        FROM l), 'Practice 1',    'https://example.com/rsl/alphabet/vowels/pr1',   'Практика жестов'),
    ((SELECT consonants_id    FROM l), 'Intro video',   'https://example.com/rsl/alphabet/consonants/intro',  'Обзор согласных'),
    ((SELECT consonants_id    FROM l), 'Practice 1',    'https://example.com/rsl/alphabet/consonants/pr1',   'Практика жестов'),
    ((SELECT greetings_id     FROM l), 'Hello/Bye',     'https://example.com/rsl/phrases/greetings/hello',   'Приветствие'),
    ((SELECT greetings_id     FROM l), 'Polite forms',  'https://example.com/rsl/phrases/greetings/polite',  'Вежливые формы'),
    ((SELECT questions_id     FROM l), 'What/Where',    'https://example.com/rsl/phrases/questions/ww',      'Вопросительные слова'),
    ((SELECT one_ten_id       FROM l), '1-5',           'https://example.com/rsl/numbers/1-5',               'Числа 1–5'),
    ((SELECT one_ten_id       FROM l), '6-10',          'https://example.com/rsl/numbers/6-10',              'Числа 6–10'),
    ((SELECT eleven_twenty_id FROM l), '11-15',         'https://example.com/rsl/numbers/11-15',             'Числа 11–15'),
    ((SELECT word_order_id    FROM l), 'SVO Patterns',  'https://example.com/rsl/grammar/word-order/svo',    'Порядок слов SVO')
) AS x(lesson_id, name, url, notes)
ON CONFLICT DO NOTHING;

-- 6) Progress examples -------------------------------------------------------
-- Resolve status ids
WITH s AS (
  SELECT name, id FROM status
)
, p AS (
  SELECT (SELECT id FROM person WHERE email='alice@example.com') AS alice,
         (SELECT id FROM person WHERE email='bob@example.com')   AS bob,
         (SELECT id FROM person WHERE email='carol@example.com') AS carol
)
, m AS (
  SELECT name, id FROM module
)
, le AS (
  SELECT name, id, module_id FROM lesson
)
, st AS (
  SELECT name, id, lesson_id FROM step
)
-- a) Module-level progress
INSERT INTO person_module_progress (person_id, module_id, status_id)
SELECT p.alice, (SELECT id FROM m WHERE name='Alphabet'),    (SELECT id FROM status WHERE name='completed') UNION ALL
SELECT p.alice, (SELECT id FROM m WHERE name='Basic Phrases'),(SELECT id FROM status WHERE name='in_progress') UNION ALL
SELECT p.bob,   (SELECT id FROM m WHERE name='Alphabet'),    (SELECT id FROM status WHERE name='in_progress') UNION ALL
SELECT p.carol, (SELECT id FROM m WHERE name='Numbers'),     (SELECT id FROM status WHERE name='available')
FROM p
ON CONFLICT (person_id, module_id) DO UPDATE SET status_id = EXCLUDED.status_id;

-- b) Lesson-level progress
INSERT INTO person_lesson_progress (person_id, lesson_id, status_id)
SELECT p.alice, (SELECT id FROM le WHERE name='Vowels'),           (SELECT id FROM status WHERE name='completed') UNION ALL
SELECT p.alice, (SELECT id FROM le WHERE name='Consonants'),       (SELECT id FROM status WHERE name='in_progress') UNION ALL
SELECT p.bob,   (SELECT id FROM le WHERE name='Greetings'),        (SELECT id FROM status WHERE name='in_progress') UNION ALL
SELECT p.carol, (SELECT id FROM le WHERE name='1–10'),             (SELECT id FROM status WHERE name='available')
FROM p
ON CONFLICT (person_id, lesson_id) DO UPDATE SET status_id = EXCLUDED.status_id;

-- c) Step-level progress (mix all three statuses)
INSERT INTO person_step_progress (person_id, step_id, status_id)
SELECT p.alice, (SELECT id FROM st WHERE name='Intro video' AND lesson_id = (SELECT id FROM le WHERE name='Vowels')),
                (SELECT id FROM status WHERE name='completed') FROM p
ON CONFLICT (person_id, step_id) DO NOTHING;

INSERT INTO person_step_progress (person_id, step_id, status_id)
SELECT p.alice, (SELECT id FROM st WHERE name='Practice 1' AND lesson_id = (SELECT id FROM le WHERE name='Vowels')),
                (SELECT id FROM status WHERE name='completed') FROM p
ON CONFLICT (person_id, step_id) DO NOTHING;

INSERT INTO person_step_progress (person_id, step_id, status_id)
SELECT p.alice, (SELECT id FROM st WHERE name='Intro video' AND lesson_id = (SELECT id FROM le WHERE name='Consonants')),
                (SELECT id FROM status WHERE name='in_progress') FROM p
ON CONFLICT (person_id, step_id) DO NOTHING;

INSERT INTO person_step_progress (person_id, step_id, status_id)
SELECT p.bob, (SELECT id FROM st WHERE name='Hello/Bye'),
              (SELECT id FROM status WHERE name='completed') FROM p
ON CONFLICT (person_id, step_id) DO NOTHING;

INSERT INTO person_step_progress (person_id, step_id, status_id)
SELECT p.carol, (SELECT id FROM st WHERE name='1-5'),
                (SELECT id FROM status WHERE name='available') FROM p
ON CONFLICT (person_id, step_id) DO NOTHING;
