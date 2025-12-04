// assignments/04-mongo-db/01-rsl-lp-db/01-db-setup/02_seed.js
// Purpose: Seed realistic mock data across all collections.
// Safe to re-run: uses find-or-insert pattern and upserts where helpful.
// How to run:
//   mongosh --quiet --eval "load('assignments/04-mongo-db/01-rsl-lp-db/01-db-setup/02_seed.js')"

const DB_NAME = 'rsl_lp_db';
use(DB_NAME);

// Helpers
function getOrCreateStatus(name) {
  const existing = db.status.findOne({ name });
  if (existing) return existing._id;
  return db.status.insertOne({ name }).insertedId;
}

function getOrCreateOne(coll, filter, doc) {
  const existing = db.getCollection(coll).findOne(filter);
  if (existing) return existing._id;
  return db.getCollection(coll).insertOne(doc).insertedId;
}

function ensurePerson(email, password_hash = 'demo_hash') {
  const now = new Date();
  return getOrCreateOne('person', { email }, { email, password_hash, created_at: now });
}

// 1) Canonical statuses
const STATUS_AVAILABLE = getOrCreateStatus('available');
const STATUS_IN_PROGRESS = getOrCreateStatus('in_progress');
const STATUS_COMPLETED = getOrCreateStatus('completed');

// 2) Persons (minimal PII; password hash is a placeholder)
const personAlice = ensurePerson('alice@example.com');
const personBob   = ensurePerson('bob@example.com');
const personEve   = ensurePerson('eve@example.com');

// 3) Modules
const modules = [
  { name: 'Alphabet', description: 'Russian Sign Language alphabet basics' },
  { name: 'Basic Phrases', description: 'Common greetings and everyday phrases' },
  { name: 'Everyday Dialogues', description: 'Short conversations in daily contexts' },
  { name: 'Numbers', description: 'Counting and numeric expressions' },
];

const moduleIds = {};
for (const m of modules) {
  moduleIds[m.name] = getOrCreateOne('module', { name: m.name }, m);
}

// 4) Lessons (2–3 per module)
const lessonsByModule = {
  Alphabet: [
    { name: 'Vowels', description: 'А—Я vowels in RSL' },
    { name: 'Consonants I', description: 'Б—К, articulation and practice' },
    { name: 'Consonants II', description: 'Л—Я, speed drills' },
  ],
  'Basic Phrases': [
    { name: 'Greetings', description: 'Hello, good morning, good evening' },
    { name: 'Polite Expressions', description: 'Please, thank you, sorry' },
  ],
  'Everyday Dialogues': [
    { name: 'At the Store', description: 'Buying items, asking for prices' },
    { name: 'Asking Directions', description: 'How to get to…' },
  ],
  Numbers: [
    { name: 'Counting 1–10', description: 'Basics of counting' },
    { name: 'Counting 11–100', description: 'Dozens and teens' },
  ],
};

const lessonIds = {};
for (const [modName, lessonList] of Object.entries(lessonsByModule)) {
  const module_id = moduleIds[modName];
  lessonIds[modName] = [];
  for (const l of lessonList) {
    const doc = { module_id, name: l.name, description: l.description ?? null };
    const _id = getOrCreateOne('lesson', { module_id, name: l.name }, doc);
    lessonIds[modName].push({ _id, name: l.name });
  }
}

// 5) Steps (2–4 per lesson) with plausible URLs and short notes
function stepUrl(slug) { return `https://example.com/video/${slug}`; }

const stepsPerLesson = {};
for (const [modName, lArr] of Object.entries(lessonIds)) {
  stepsPerLesson[modName] = [];
  for (const l of lArr) {
    const baseSlug = `${modName.toLowerCase().replace(/\s+/g, '-')}-${l.name.toLowerCase().replace(/\s+/g, '-')}`;
    const steps = [
      { name: `${l.name} — Part 1`, url: stepUrl(`${baseSlug}-p1`), notes: 'Intro and warm-up' },
      { name: `${l.name} — Part 2`, url: stepUrl(`${baseSlug}-p2`), notes: 'Core practice' },
    ];
    // Optional third step for some lessons
    if (Math.random() < 0.5) {
      steps.push({ name: `${l.name} — Part 3`, url: stepUrl(`${baseSlug}-p3`), notes: 'Drills & review' });
    }
    const created = [];
    for (const s of steps) {
      const doc = { lesson_id: l._id, name: s.name, url: s.url, notes: s.notes };
      const _id = getOrCreateOne('step', { lesson_id: l._id, name: s.name }, doc);
      created.push({ _id, name: s.name });
    }
    stepsPerLesson[modName].push({ lesson_id: l._id, lesson_name: l.name, steps: created });
  }
}

// 6) Progress — cover all statuses across persons and content
function upsertProgress(collName, filter, doc) {
  db.getCollection(collName).updateOne(filter, { $setOnInsert: doc }, { upsert: true });
}

const now = new Date();

// Person → Module progress
upsertProgress('person_module_progress',
  { person_id: personAlice, module_id: moduleIds['Alphabet'] },
  { person_id: personAlice, module_id: moduleIds['Alphabet'], status_id: STATUS_COMPLETED, updated_at: now }
);
upsertProgress('person_module_progress',
  { person_id: personAlice, module_id: moduleIds['Basic Phrases'] },
  { person_id: personAlice, module_id: moduleIds['Basic Phrases'], status_id: STATUS_IN_PROGRESS, updated_at: now }
);
upsertProgress('person_module_progress',
  { person_id: personBob, module_id: moduleIds['Alphabet'] },
  { person_id: personBob, module_id: moduleIds['Alphabet'], status_id: STATUS_AVAILABLE, updated_at: now }
);
upsertProgress('person_module_progress',
  { person_id: personEve, module_id: moduleIds['Numbers'] },
  { person_id: personEve, module_id: moduleIds['Numbers'], status_id: STATUS_IN_PROGRESS, updated_at: now }
);

// Person → Lesson progress (a few examples)
const alphabetLessons = lessonIds['Alphabet'];
if (alphabetLessons && alphabetLessons.length) {
  upsertProgress('person_lesson_progress',
    { person_id: personAlice, lesson_id: alphabetLessons[0]._id },
    { person_id: personAlice, lesson_id: alphabetLessons[0]._id, status_id: STATUS_COMPLETED, updated_at: now }
  );
  upsertProgress('person_lesson_progress',
    { person_id: personBob, lesson_id: alphabetLessons[1]._id },
    { person_id: personBob, lesson_id: alphabetLessons[1]._id, status_id: STATUS_IN_PROGRESS, updated_at: now }
  );
}

// Person → Step progress (select the first step of some lessons)
const aLessonSteps = stepsPerLesson['Alphabet']?.[0]?.steps ?? [];
const bpLessonSteps = stepsPerLesson['Basic Phrases']?.[0]?.steps ?? [];
if (aLessonSteps[0]) {
  upsertProgress('person_step_progress',
    { person_id: personAlice, step_id: aLessonSteps[0]._id },
    { person_id: personAlice, step_id: aLessonSteps[0]._id, status_id: STATUS_COMPLETED, updated_at: now }
  );
}
if (bpLessonSteps[0]) {
  upsertProgress('person_step_progress',
    { person_id: personBob, step_id: bpLessonSteps[0]._id },
    { person_id: personBob, step_id: bpLessonSteps[0]._id, status_id: STATUS_IN_PROGRESS, updated_at: now }
  );
}
if (bpLessonSteps[1]) {
  upsertProgress('person_step_progress',
    { person_id: personEve, step_id: bpLessonSteps[1]._id },
    { person_id: personEve, step_id: bpLessonSteps[1]._id, status_id: STATUS_AVAILABLE, updated_at: now }
  );
}

// Summary counts
function count(coll) {
  return db.getCollection(coll).countDocuments();
}

print(`
Seed summary (collection → count):
  person:                  ${count('person')}
  module:                  ${count('module')}
  lesson:                  ${count('lesson')}
  step:                    ${count('step')}
  status:                  ${count('status')}
  person_module_progress:  ${count('person_module_progress')}
  person_lesson_progress:  ${count('person_lesson_progress')}
  person_step_progress:    ${count('person_step_progress')}
✔ Seeding completed.
`);
