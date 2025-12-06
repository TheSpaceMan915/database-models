// assignments/04-mongo-db/03-queries-and-expressions/01-db-setup/02_seed.js

// How to run:
//   mongosh assignments/04-mongo-db/03-queries-and-expressions/01-db-setup/02_seed.js
// Inserts deterministic mock data: persons, modules, lessons, steps (with order_index), and progress.
// Uses now = new Date() for timestamps; static names/emails for reproducibility.

use('rsl_lp_db_queries_expr');

const now = new Date();

// Ensure statuses: available, in_progress, completed
const statusNames = ['available', 'in_progress', 'completed'];
const existingStatuses = db.status.find({ name: { $in: statusNames } }).toArray();
const existingSet = new Set(existingStatuses.map(s => s.name));
const toInsertStatus = statusNames
  .filter(n => !existingSet.has(n))
  .map(n => ({ name: n }));
if (toInsertStatus.length) {
  db.status.insertMany(toInsertStatus);
  print(`[SEED] Inserted statuses: ${toInsertStatus.map(s => s.name).join(', ')}`);
}
const statuses = db.status.find({}).toArray();
const statusByName = Object.fromEntries(statuses.map(s => [s.name, s]));

// Persons
const personsData = [
  { email: 'alice@example.com', password_hash: 'demo_hash_alice', created_at: now, name: 'Alice' },
  { email: 'bob@example.com', password_hash: 'demo_hash_bob', created_at: now, name: 'Bob' },
  { email: 'carol@example.com', password_hash: 'demo_hash_carol', created_at: now, name: 'Carol' }
];
for (const p of personsData) {
  db.person.updateOne({ email: p.email }, { $setOnInsert: p }, { upsert: true });
}
const persons = db.person.find({}).toArray();
const personByEmail = Object.fromEntries(persons.map(p => [p.email, p]));

// Modules
const modulesData = [
  { name: 'Alphabet', description: 'Letters and pronunciation.' },
  { name: 'Basic Phrases', description: 'Greetings and simple phrases.' },
  { name: 'Dialogues', description: 'Common conversational dialogues.' },
  { name: 'Numbers', description: 'Counting and numeric forms.' }
];
for (const m of modulesData) {
  db.module.updateOne({ name: m.name }, { $setOnInsert: m }, { upsert: true });
}
const modules = db.module.find({}).toArray();
const moduleByName = Object.fromEntries(modules.map(m => [m.name, m]));

// Lessons per module (2–3 each)
const lessonsPlan = [
  { module: 'Alphabet', lessons: ['Vowels', 'Consonants'] },
  { module: 'Basic Phrases', lessons: ['Greetings', 'Introductions', 'Thanks'] },
  { module: 'Dialogues', lessons: ['At the Cafe', 'Asking for Directions'] },
  { module: 'Numbers', lessons: ['Counting to Ten', 'Dozens and Hundreds'] }
];
for (const plan of lessonsPlan) {
  const mod = moduleByName[plan.module];
  for (const name of plan.lessons) {
    db.lesson.updateOne(
      { module_id: mod._id, name },
      { $setOnInsert: { module_id: mod._id, name, description: `${name} lesson.` } },
      { upsert: true }
    );
  }
}
const lessons = db.lesson.find({}).toArray();

// Steps per lesson (2–4 each) with url, notes, order_index
function makeStepsForLesson(lessonName, count) {
  const steps = [];
  for (let i = 1; i <= count; i++) {
    steps.push({
      name: `${lessonName} Step ${i}`,
      url: `https://example.com/${lessonName.toLowerCase().replace(/\\s+/g, '-')}/step-${i}`,
      notes: `Practice item ${i} for ${lessonName}.`,
      order_index: i
    });
  }
  return steps;
}
for (const lesson of lessons) {
  const base = lesson.name;
  const count = base.length % 3 + 2; // deterministic 2–4 based on name length
  const steps = makeStepsForLesson(base, count);
  for (const s of steps) {
    db.step.updateOne(
      { lesson_id: lesson._id, name: s.name },
      {
        $setOnInsert: {
          lesson_id: lesson._id,
          name: s.name,
          url: s.url,
          notes: s.notes,
          order_index: s.order_index
        }
      },
      { upsert: true }
    );
  }
}
const steps = db.step.find({}).toArray();

// Progress: cover all statuses, multiple persons, across modules/lessons/steps
function upsertModuleProgress(personEmail, moduleName, statusName) {
  const person = personByEmail[personEmail];
  const mod = moduleByName[moduleName];
  const status = statusByName[statusName];
  db.person_module_progress.updateOne(
    { person_id: person._id, module_id: mod._id },
    {
      $set: { status_id: status._id, updated_at: new Date() }
    },
    { upsert: true }
  );
}

function upsertLessonProgress(personEmail, lessonName, statusName) {
  const person = personByEmail[personEmail];
  const lesson = lessons.find(l => l.name === lessonName);
  const status = statusByName[statusName];
  db.person_lesson_progress.updateOne(
    { person_id: person._id, lesson_id: lesson._id },
    {
      $set: { status_id: status._id, updated_at: new Date() }
    },
    { upsert: true }
  );
}

function upsertStepProgress(personEmail, lessonName, stepName, statusName) {
  const person = personByEmail[personEmail];
  const lesson = lessons.find(l => l.name === lessonName);
  const step = db.step.findOne({ lesson_id: lesson._id, name: stepName });
  const status = statusByName[statusName];
  db.person_step_progress.updateOne(
    { person_id: person._id, step_id: step._id },
    {
      $set: { status_id: status._id, updated_at: new Date() }
    },
    { upsert: true }
  );
}

// Module progress samples
upsertModuleProgress('alice@example.com', 'Alphabet', 'completed');
upsertModuleProgress('alice@example.com', 'Basic Phrases', 'in_progress');
upsertModuleProgress('bob@example.com', 'Basic Phrases', 'completed');
upsertModuleProgress('bob@example.com', 'Dialogues', 'available');
upsertModuleProgress('carol@example.com', 'Numbers', 'in_progress');

// Lesson progress samples
upsertLessonProgress('alice@example.com', 'Vowels', 'completed');
upsertLessonProgress('alice@example.com', 'Consonants', 'in_progress');
upsertLessonProgress('bob@example.com', 'Greetings', 'completed');
upsertLessonProgress('carol@example.com', 'Counting to Ten', 'available');

// Step progress samples (use first step of some lessons)
function firstStepName(lessonName) {
  return `${lessonName} Step 1`;
}
upsertStepProgress('alice@example.com', 'Vowels', firstStepName('Vowels'), 'completed');
upsertStepProgress('alice@example.com', 'Consonants', firstStepName('Consonants'), 'in_progress');
upsertStepProgress('bob@example.com', 'Greetings', firstStepName('Greetings'), 'completed');
upsertStepProgress('carol@example.com', 'Counting to Ten', firstStepName('Counting to Ten'), 'in_progress');

// Print counts
function countColl(name) {
  return db[name].countDocuments({});
}

print('[COUNTS]');
print(`person: ${countColl('person')}`);
print(`module: ${countColl('module')}`);
print(`lesson: ${countColl('lesson')}`);
print(`step: ${countColl('step')}`);
print(`status: ${countColl('status')}`);
print(`person_module_progress: ${countColl('person_module_progress')}`);
print(`person_lesson_progress: ${countColl('person_lesson_progress')}`);
print(`person_step_progress: ${countColl('person_step_progress')}`);

print('[OK] Seeding complete.');