// assignments/04-mongo-db/06-aggregation-pipeline/01-db-setup/02_seed.js

// How to run:
//   mongosh assignments/04-mongo-db/06-aggregation-pipeline/01-db-setup/02_seed.js
// Inserts deterministic mock data including dates spread over >=7 days for time-series demos.

use('rsl_lp_db_pipeline');

const now = new Date();

// Ensure statuses present
const statusNames = ['available', 'in_progress', 'completed'];
const existingStatuses = db.status.find({ name: { $in: statusNames } }).toArray();
const existingSet = new Set(existingStatuses.map(s => s.name));
const toInsertStatus = statusNames.filter(n => !existingSet.has(n)).map(n => ({ name: n }));
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
  { name: 'Dialogues', description: 'Common conversational dialogues.' }
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
  { module: 'Dialogues', lessons: ['At the Cafe', 'Asking for Directions'] }
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
const lessonByName = Object.fromEntries(lessons.map(l => [l.name, l]));

// Steps per lesson (2–4 each) with url/notes
function makeStepsForLesson(lessonName, count) {
  const baseSlug = lessonName.toLowerCase().replace(/\s+/g, '-');
  const steps = [];
  for (let i = 1; i <= count; i++) {
    steps.push({
      name: `${lessonName} Step ${i}`,
      url: `https://example.com/${baseSlug}/step-${i}`,
      notes: `Practice item ${i} for ${lessonName}.`
    });
  }
  return steps;
}
for (const lesson of lessons) {
  const count = (lesson.name.length % 3) + 2; // deterministic 2–4
  for (const s of makeStepsForLesson(lesson.name, count)) {
    db.step.updateOne(
      { lesson_id: lesson._id, name: s.name },
      {
        $setOnInsert: {
          lesson_id: lesson._id,
          name: s.name,
          url: s.url,
          notes: s.notes
        }
      },
      { upsert: true }
    );
  }
}
const steps = db.step.find({}).toArray();

// Helper to pick a stable first step for a lesson
function firstStepName(lessonName) {
  return `${lessonName} Step 1`;
}

// Spread updated_at over 10 days deterministically
function dayOffset(baseDate, offsetDays) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

// Progress seed — mix of in_progress and completed, across persons and dates
function upsertModuleProgress(personEmail, moduleName, statusName, dayOffsetVal) {
  const person = personByEmail[personEmail];
  const mod = moduleByName[moduleName];
  const status = statusByName[statusName];
  db.person_module_progress.updateOne(
    { person_id: person._id, module_id: mod._id },
    { $set: { status_id: status._id, updated_at: dayOffset(now, dayOffsetVal) } },
    { upsert: true }
  );
}
function upsertLessonProgress(personEmail, lessonName, statusName, dayOffsetVal) {
  const person = personByEmail[personEmail];
  const lesson = lessonByName[lessonName];
  const status = statusByName[statusName];
  db.person_lesson_progress.updateOne(
    { person_id: person._id, lesson_id: lesson._id },
    { $set: { status_id: status._id, updated_at: dayOffset(now, dayOffsetVal) } },
    { upsert: true }
  );
}
function upsertStepProgress(personEmail, lessonName, stepName, statusName, dayOffsetVal) {
  const person = personByEmail[personEmail];
  const lesson = lessonByName[lessonName];
  const stepDoc = db.step.findOne({ lesson_id: lesson._id, name: stepName });
  const status = statusByName[statusName];
  db.person_step_progress.updateOne(
    { person_id: person._id, step_id: stepDoc._id },
    { $set: { status_id: status._id, updated_at: dayOffset(now, dayOffsetVal) } },
    { upsert: true }
  );
}

// Module progress
upsertModuleProgress('alice@example.com', 'Alphabet', 'completed', 0);
upsertModuleProgress('alice@example.com', 'Basic Phrases', 'in_progress', 1);
upsertModuleProgress('bob@example.com', 'Dialogues', 'available', 2);
upsertModuleProgress('carol@example.com', 'Alphabet', 'in_progress', 3);

// Lesson progress
upsertLessonProgress('alice@example.com', 'Vowels', 'completed', 0);
upsertLessonProgress('alice@example.com', 'Consonants', 'in_progress', 1);
upsertLessonProgress('bob@example.com', 'Greetings', 'completed', 2);
upsertLessonProgress('carol@example.com', 'Asking for Directions', 'available', 3);

// Step progress over >=7 distinct dates
const stepSeeds = [
  ['alice@example.com', 'Vowels', firstStepName('Vowels'), 'completed', 0],
  ['alice@example.com', 'Consonants', firstStepName('Consonants'), 'in_progress', 1],
  ['bob@example.com', 'Greetings', firstStepName('Greetings'), 'completed', 2],
  ['bob@example.com', 'Greetings', 'Greetings Step 2', 'completed', 4],
  ['carol@example.com', 'At the Cafe', firstStepName('At the Cafe'), 'in_progress', 3],
  ['carol@example.com', 'Asking for Directions', firstStepName('Asking for Directions'), 'completed', 5],
  ['alice@example.com', 'Vowels', 'Vowels Step 2', 'completed', 6],
  ['alice@example.com', 'Vowels', 'Vowels Step 3', 'completed', 7],
  ['bob@example.com', 'Greetings', 'Greetings Step 3', 'in_progress', 8],
  ['carol@example.com', 'Asking for Directions', 'Asking for Directions Step 2', 'completed', 9]
];
for (const [email, lessonName, stepName, statusName, offset] of stepSeeds) {
  upsertStepProgress(email, lessonName, stepName, statusName, offset);
}

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